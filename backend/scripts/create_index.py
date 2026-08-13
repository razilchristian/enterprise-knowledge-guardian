"""Step 5a: create the Atlas Vector Search index.

    python -m scripts.create_index

Without this index, $vectorSearch has nothing to search and every query comes
back empty -- with no error, which is the confusing part.

numDimensions must equal config.EMBED_DIM exactly. Atlas rejects mismatched
vectors at query time rather than at insert time, so a wrong number here shows
up as "no results" rather than as an error.

Index builds are asynchronous. This script waits until Atlas reports it
queryable, which on a free cluster usually takes under a minute.
"""

import sys
import time

from pymongo.operations import SearchIndexModel

from app import config, db


def main() -> int:
    chunks = db.collection(config.CHUNKS)

    stored = chunks.count_documents({})
    if stored == 0:
        print("\nNo chunks in the database. Run scripts.ingest first.\n")
        return 1

    existing = {idx["name"] for idx in chunks.list_search_indexes()}
    if config.VECTOR_INDEX in existing:
        print(f"\nIndex '{config.VECTOR_INDEX}' already exists. Dropping and recreating.")
        chunks.drop_search_index(config.VECTOR_INDEX)
        # Atlas needs a moment before the name can be reused.
        for _ in range(30):
            time.sleep(2)
            if config.VECTOR_INDEX not in {i["name"] for i in chunks.list_search_indexes()}:
                break

    definition = {
        "fields": [
            {
                "type": "vector",
                "path": "embedding",
                "numDimensions": config.EMBED_DIM,
                "similarity": "cosine",
            },
            # Filterable metadata. Declared so the API can narrow by department
            # for the UI's department view -- a display filter, never a
            # permission boundary; every role may query every department.
            {"type": "filter", "path": "department"},
            {"type": "filter", "path": "filename"},
        ]
    }

    print(f"\nCreating '{config.VECTOR_INDEX}' on {config.CHUNKS}")
    print(f"  dimensions: {config.EMBED_DIM}   similarity: cosine   vectors: {stored}")

    chunks.create_search_index(
        SearchIndexModel(definition=definition, name=config.VECTOR_INDEX, type="vectorSearch")
    )

    print("\nWaiting for Atlas to build it...")
    for attempt in range(60):
        time.sleep(5)
        info = next(
            (i for i in chunks.list_search_indexes() if i["name"] == config.VECTOR_INDEX),
            None,
        )
        if info and info.get("queryable"):
            print(f"  ready after {(attempt + 1) * 5}s\n")
            print("Next: python -m scripts.search \"how many casual leave days do I get\"\n")
            return 0
        status = info.get("status", "?") if info else "not found"
        print(f"  {(attempt + 1) * 5}s  status={status}")

    print("\nStill not queryable after 5 minutes. Check Atlas -> Search & Vector Search.\n")
    return 1


if __name__ == "__main__":
    sys.exit(main())
