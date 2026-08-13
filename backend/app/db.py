"""MongoDB Atlas connection.

One client for the whole process. PyMongo pools connections internally, so
creating the client once and reusing it is both correct and fastest.
"""

from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database

from app import config

_client: MongoClient | None = None


def get_client() -> MongoClient:
    """Return the shared MongoClient, creating it on first use."""
    global _client
    if _client is None:
        _client = MongoClient(
            config.MONGODB_URI,
            # Fail fast with a clear error instead of hanging for 30s when the
            # cluster is asleep or the IP is not allowlisted.
            serverSelectionTimeoutMS=10_000,
            appname="nexora-backend",
        )
    return _client


def get_db() -> Database:
    """Return the Nexora database handle."""
    return get_client()[config.MONGODB_DB]


def collection(name: str) -> Collection:
    """Return a collection by name. Use the constants in config, not literals."""
    return get_db()[name]


def ping() -> dict:
    """Verify the connection is alive. Raises if it is not."""
    return get_client().admin.command("ping")
