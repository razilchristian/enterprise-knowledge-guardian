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

# --- Gemini ---
# Several keys, tried in rotation. One key's free-tier quota is not enough for
# a day of rehearsal plus a live demo, and a spent key returns 429 for hours.
def _keys() -> tuple[str, ...]:
    raw = os.getenv("GEMINI_API_KEYS", "") or os.getenv("GEMINI_API_KEY", "")
    keys = tuple(k.strip() for k in raw.split(",") if k.strip())
    if not keys:
        raise ConfigError(
            "No Gemini API keys set.\n"
            "  Fix: set GEMINI_API_KEYS in backend/.env to one or more keys,\n"
            "  comma-separated. Create them free at https://aistudio.google.com/apikey"
        )
    return keys


GEMINI_API_KEYS = _keys()

# Kept for anything still reading a single key.
GEMINI_API_KEY = GEMINI_API_KEYS[0]

GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta"
EMBED_MODEL = "gemini-embedding-001"

# Deliberately an alias, not a pinned version. Google retired gemini-2.5-flash
# for new API keys mid-build; the alias tracks whatever is current, which is
# the safer failure mode when a demo date is fixed. gemini-3-flash-preview
# also works if the alias ever misbehaves.
# Tried in order until one answers. Three deep, not two, because the free tier
# fails in two different ways and both were hit during development:
#
#   429  daily quota exhausted on that model, and it stays exhausted for hours
#   503  the model is temporarily overloaded, clears in seconds
#
# A 429 is the dangerous one for a fixed demo date: retrying the same model does
# not help, so the chain has to move on. Aliases rather than pinned versions
# because Google retired gemini-2.5-flash for new API keys mid-build.
# Lite first: it is the fastest of the three and has the most generous free
# quota, which is what keeps answers under five seconds and keeps working after
# a day of rehearsal. The heavier models sit behind it as fallbacks.
#
# Measured lesson: extra API keys do NOT buy extra quota. Quota is per Google
# account per model, so five keys from one account all hit 429 together. Model
# choice is the lever; a second account would be the only way to add headroom.
CHAT_MODELS = (
    "gemini-flash-lite-latest",
    "gemini-3-flash-preview",
    "gemini-flash-latest",
)

# The name shown in /api/health. The chain above is what actually runs.
CHAT_MODEL = CHAT_MODELS[0]

# gemini-embedding-001 returns 3072 dimensions by default. We request 768:
# a quarter of the storage on a 512 MB free cluster, faster search, and ample
# quality for a corpus this size.
#
# Reduced-dimension output is truncated rather than re-normalized, so vectors
# come back with an L2 norm well under 1 (~0.59 at 768). We normalize in
# app/embeddings.py before storing. EMBED_DIM must equal numDimensions in the
# Atlas vector index -- if they disagree, every search returns nothing.
EMBED_DIM = 768
