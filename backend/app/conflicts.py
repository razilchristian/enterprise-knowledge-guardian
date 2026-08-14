"""Persisting detected conflicts.

A conflict found while answering a question is worth keeping: it is a real
problem in the customer's documents that outlives the question that surfaced
it. Storing it turns a one-off answer into a work queue for the owners.

Deduplication matters more than it looks. The same contradiction surfaces from
many different questions -- "how many leave days", "what is my casual leave
entitlement", "can I take 12 days off" all reach the same three clauses. Each
would otherwise create another row until the conflicts page is unusable. We
key on the set of (document, section) pairs involved, which is stable across
phrasings because it describes the contradiction rather than the question.
"""

import hashlib
import time
from dataclasses import asdict
from typing import Any

from pymongo import ASCENDING

from app import config, db, guardian

OPEN = "Open"
VALID_STATUSES = (OPEN, "In Review", "Resolved", "Dismissed")


def fingerprint(conflict: guardian.Conflict) -> str:
    """Stable id for a contradiction, independent of how it was asked.

    Sorted so that the same sources in a different retrieval order collapse to
    one record.
    """
    parts = sorted(f"{c.document}|{c.section}" for c in conflict.claims)
    return hashlib.sha256("||".join(parts).encode()).hexdigest()[:16]


def ensure_indexes() -> None:
    collection = db.collection(config.CONFLICTS)
    collection.create_index([("fingerprint", ASCENDING)], unique=True)
    collection.create_index([("status", ASCENDING)])
    collection.create_index([("detectedAt", ASCENDING)])


def record(conflict: guardian.Conflict, question: str) -> tuple[str, bool]:
    """Store a conflict, or note another sighting of a known one.

    Returns (fingerprint, is_new).
    """
    collection = db.collection(config.CONFLICTS)
    key = fingerprint(conflict)
    now = time.time()

    departments = sorted({c.department for c in conflict.claims if c.department})
    owners = sorted({c.owner for c in conflict.claims if c.owner})
    documents = sorted({c.document for c in conflict.claims if c.document})

    existing = collection.find_one({"fingerprint": key})
    if existing:
        # Known contradiction. Record that it surfaced again, but never
        # overwrite a human's status decision.
        collection.update_one(
            {"fingerprint": key},
            {
                "$set": {"lastSeenAt": now},
                "$inc": {"timesSurfaced": 1},
                "$addToSet": {"questions": question},
            },
        )
        return key, False

    collection.insert_one(
        {
            "fingerprint": key,
            "title": conflict.topic,
            "severity": conflict.severity,
            "status": OPEN,
            "explanation": conflict.explanation,
            "recommendedAction": conflict.recommended_action,
            "claims": [asdict(c) for c in conflict.claims],
            "departments": departments,
            "owners": owners,
            "documents": documents,
            "claimCount": len(conflict.claims),
            "crossDepartment": len(departments) > 1,
            "detectedAt": now,
            "lastSeenAt": now,
            "timesSurfaced": 1,
            "questions": [question],
        }
    )
    return key, True


def set_status(key: str, status: str) -> bool:
    if status not in VALID_STATUSES:
        raise ValueError(f"status must be one of {VALID_STATUSES}")
    result = db.collection(config.CONFLICTS).update_one(
        {"fingerprint": key}, {"$set": {"status": status, "updatedAt": time.time()}}
    )
    return result.matched_count > 0


def listing(status: str | None = None) -> list[dict[str, Any]]:
    query = {"status": status} if status else {}
    return list(
        db.collection(config.CONFLICTS)
        .find(query, {"_id": 0})
        .sort([("severity", ASCENDING), ("detectedAt", ASCENDING)])
    )


def get(key: str) -> dict[str, Any] | None:
    return db.collection(config.CONFLICTS).find_one({"fingerprint": key}, {"_id": 0})


def summary() -> dict[str, Any]:
    collection = db.collection(config.CONFLICTS)
    active = {"status": {"$in": [OPEN, "In Review"]}}
    return {
        "total": collection.count_documents({}),
        "active": collection.count_documents(active),
        "high": collection.count_documents({**active, "severity": "High"}),
        "medium": collection.count_documents({**active, "severity": "Medium"}),
        "low": collection.count_documents({**active, "severity": "Low"}),
        "crossDepartment": collection.count_documents({**active, "crossDepartment": True}),
    }
