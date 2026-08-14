"""The audit trail.

Every question asked, conflict found, document ingested, and status decision
lands here. Open knowledge raises the stakes on accountability: if everyone can
read every answer, then who asked what, and who decided what, has to be on the
record.

Writes are best-effort. Failing to log must never fail the operation being
logged -- a user asked a question, not to file a record.
"""

import time
from typing import Any

from pymongo import DESCENDING

from app import config, db

# Kept small so the free cluster's 512 MB is never at risk from logging.
MAX_EVENTS = 2000


def log(
    action: str,
    resource: str,
    *,
    actor: str = "System",
    is_ai: bool = False,
    result: str = "Success",
    details: str | None = None,
) -> None:
    try:
        collection = db.collection(config.ACTIVITY)
        collection.insert_one(
            {
                "who": actor,
                "isAI": is_ai,
                "action": action,
                "resource": resource,
                "result": result,
                "details": details,
                "timestamp": time.time(),
            }
        )
        # Trim occasionally rather than on every write.
        if collection.estimated_document_count() > MAX_EVENTS * 1.2:
            cutoff = list(
                collection.find({}, {"timestamp": 1})
                .sort("timestamp", DESCENDING)
                .skip(MAX_EVENTS)
                .limit(1)
            )
            if cutoff:
                collection.delete_many({"timestamp": {"$lt": cutoff[0]["timestamp"]}})
    except Exception:  # noqa: BLE001 - logging must never break the caller
        pass


def recent(limit: int = 60) -> list[dict[str, Any]]:
    return list(
        db.collection(config.ACTIVITY)
        .find({}, {"_id": 0})
        .sort("timestamp", DESCENDING)
        .limit(limit)
    )


def count() -> int:
    try:
        return db.collection(config.ACTIVITY).estimated_document_count()
    except Exception:  # noqa: BLE001
        return 0
