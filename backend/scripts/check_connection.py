"""Step 1: prove we can reach MongoDB Atlas.

Run from the backend directory:

    python -m scripts.check_connection

Every failure below prints what to actually do about it, because the raw
PyMongo errors do not tell you which of the three usual causes you hit.
"""

import sys

from pymongo.errors import OperationFailure, ServerSelectionTimeoutError

# Import inside try so a missing .env prints a readable message, not a traceback.
try:
    from app import config, db
except Exception as exc:  # noqa: BLE001 - top-level script, we want the message
    print(f"\n[FAIL] Configuration problem\n\n{exc}\n")
    sys.exit(1)


def main() -> int:
    # Never print the password. Show only the host so the user can confirm
    # they are pointed at the right cluster.
    host = config.MONGODB_URI.split("@")[-1].split("/")[0]
    print(f"\nCluster : {host}")
    print(f"Database: {config.MONGODB_DB}")
    print("\nConnecting...")

    try:
        db.ping()
    except ServerSelectionTimeoutError:
        print(
            "\n[FAIL] Could not reach the cluster.\n\n"
            "  Almost always one of these three:\n"
            "  1. Your IP is not allowlisted.\n"
            "     Atlas -> Network Access -> Add IP Address -> Allow access from anywhere\n"
            "  2. The cluster is paused after inactivity.\n"
            "     Atlas -> Clusters -> Resume\n"
            "  3. The hostname in MONGODB_URI is wrong.\n"
        )
        return 1
    except OperationFailure as exc:
        if exc.code == 8000 or "auth" in str(exc).lower():
            print(
                "\n[FAIL] Authentication rejected.\n\n"
                "  The username or password in backend/.env is wrong.\n"
                "  Atlas -> Database Access -> Edit -> Edit Password -> Autogenerate,\n"
                "  then paste the new password into backend/.env.\n"
                "  Note: <angle brackets> around the password must be deleted too.\n"
            )
        else:
            print(f"\n[FAIL] MongoDB rejected the command:\n\n  {exc}\n")
        return 1

    print("[OK] Connected.\n")

    database = db.get_db()
    existing = database.list_collection_names()
    if existing:
        print("Collections already present:")
        for name in sorted(existing):
            print(f"  - {name} ({database[name].estimated_document_count()} docs)")
    else:
        # Plain ASCII: the Windows console default codepage mangles em-dashes.
        print("No collections yet - expected, nothing has been ingested.")

    print(
        "\nCollections this project will create:\n"
        f"  {config.DOCUMENTS:<14} one record per uploaded PDF\n"
        f"  {config.CHUNKS:<14} chunk text + embedding vector (the RAG core)\n"
        f"  {config.CONFLICTS:<14} detected contradictions\n"
        f"  {config.REVIEW_TASKS:<14} human approval queue\n"
        f"  {config.USERS:<14} the three personas\n"
        f"  {config.ACTIVITY:<14} audit log\n"
    )
    print("Step 1 complete. Next: extract text from a PDF.\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
