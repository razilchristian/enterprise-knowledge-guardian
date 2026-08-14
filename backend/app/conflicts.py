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

    # Exact-match deduplication is not enough on its own. The model does not
    # always extract the same set of sources for the same contradiction, and
    # ingesting a new document can add a source to a contradiction already on
    # file. Both produce a different fingerprint for what a person would call
    # the same problem, and two near-identical rows read as double-counting.
    #
    # So: compare document sets. A conflict covering a superset of another's
    # documents is the same problem seen more completely, and supersedes it.
    incoming_docs = set(documents)
    superseded: list[dict[str, Any]] = []

    for candidate in collection.find({"documents": {"$in": documents}}):
        candidate_docs = set(candidate.get("documents", []))
        if not candidate_docs:
            continue
        if candidate_docs > incoming_docs:
            # An existing record already covers more sources. Keep it, and
            # record that this phrasing reached the same problem.
            collection.update_one(
                {"fingerprint": candidate["fingerprint"]},
                {
                    "$set": {"lastSeenAt": now},
                    "$inc": {"timesSurfaced": 1},
                    "$addToSet": {"questions": question},
                },
            )
            return str(candidate["fingerprint"]), False
        if candidate_docs < incoming_docs or candidate_docs == incoming_docs:
            superseded.append(candidate)

    # Carry the humans' work forward rather than resetting it: a conflict a
    # person already moved to In Review must not silently reopen because a new
    # document widened it.
    inherited_status = OPEN
    inherited_questions: list[str] = []
    inherited_count = 0
    first_seen = now

    for old in superseded:
        if old.get("status") != OPEN:
            inherited_status = old["status"]
        inherited_questions.extend(old.get("questions", []))
        inherited_count += int(old.get("timesSurfaced", 0))
        first_seen = min(first_seen, float(old.get("detectedAt", now)))
        collection.delete_one({"fingerprint": old["fingerprint"]})

    collection.insert_one(
        {
            "fingerprint": key,
            "title": conflict.topic,
            "severity": conflict.severity,
            "status": inherited_status,
            "explanation": conflict.explanation,
            "recommendedAction": conflict.recommended_action,
            "claims": [asdict(c) for c in conflict.claims],
            "departments": departments,
            "owners": owners,
            "documents": documents,
            "claimCount": len(conflict.claims),
            "crossDepartment": len(departments) > 1,
            "detectedAt": first_seen,
            "lastSeenAt": now,
            "timesSurfaced": inherited_count + 1,
            "questions": sorted({*inherited_questions, question}),
            "supersededCount": len(superseded),
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
