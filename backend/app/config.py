"""Configuration loaded from environment variables.

Secrets live in `backend/.env`, which is gitignored. Nothing in this file
belongs in the frontend bundle — the browser never sees these values, it only
ever talks to FastAPI, which holds the keys server-side.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")


class ConfigError(RuntimeError):
    """Raised when required configuration is missing, with a fix in the message."""


def _required(name: str, hint: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise ConfigError(
            f"{name} is not set.\n"
            f"  Fix: open backend/.env and set {name}.\n"
            f"  {hint}"
        )
    return value


MONGODB_URI = _required(
    "MONGODB_URI",
    "Get it from Atlas -> Database -> Connect -> Drivers -> Python, "
    "and replace <db_password> with the real password.",
)

MONGODB_DB = os.getenv("MONGODB_DB", "nexora").strip() or "nexora"

# Collection names, in one place so a typo can't silently create a second
# collection with a slightly different name.
DOCUMENTS = "documents"
CHUNKS = "chunks"
CONFLICTS = "conflicts"
REVIEW_TASKS = "review_tasks"
USERS = "users"
ACTIVITY = "activity"

# Name of the Atlas vector search index on the chunks collection.
VECTOR_INDEX = "chunk_embedding_index"
