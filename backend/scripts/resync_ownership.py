"""Re-apply catalog.py's department and owner to already-stored records.

Documents uploaded through the UI take their department and owner from the
upload form, so every 2026 master policy landed as "Human Resources / Dev
Anand" -- the persona that uploaded them, not the department accountable for
them. That is visible on the Documents page and, because chunks carry the same
two fields into the evidence Guardian reasons over, it also shows up inside
conflict claims.

catalog.py is the single source of truth for ownership. This walks the stored
documents and chunks and makes them agree with it.

    python -m scripts.resync_ownership          # show what would change
    python -m scripts.resync_ownership --yes    # apply it
"""

import sys

from app import catalog, config, db


def main() -> int:
    apply = "--yes" in sys.argv
    documents = db.collection(config.DOCUMENTS)
    chunks = db.collection(config.CHUNKS)

    changes = []
    for record in documents.find({}, {"_id": 0, "filename": 1, "title": 1,
                                      "department": 1, "owner": 1}):
        filename = record.get("filename") or ""
        stem = filename.rsplit(".", 1)[0]
        department, owner = catalog.lookup(stem)
        if (department, owner) == (record.get("department"), record.get("owner")):
            continue
        # An unknown filename falls back to the catalog default; rewriting a
        # record to "Unassigned" would lose information rather than fix it.
        if (department, owner) == catalog.DEFAULT and stem not in catalog.CATALOG:
            print(f"  skip (not in catalog): {record.get('title')}")
            continue
        changes.append((filename, record.get("title"), record.get("department"),
                        record.get("owner"), department, owner))

    if not changes:
        print("Nothing to change; stored ownership already matches the catalog.")
        return 0

    print(f"{len(changes)} document(s) disagree with the catalog:\n")
    for _, title, old_d, old_o, new_d, new_o in changes:
        print(f"  {title}")
        print(f"      {old_d} / {old_o}   ->   {new_d} / {new_o}")

    if not apply:
        print("\nDry run. Re-run with --yes to apply.")
        return 0

    docs_updated = chunks_updated = 0
    for filename, _, _, _, department, owner in changes:
        field = {"$set": {"department": department, "owner": owner}}
        docs_updated += documents.update_many({"filename": filename}, field).modified_count
        chunks_updated += chunks.update_many({"filename": filename}, field).modified_count

    print(f"\nUpdated {docs_updated} document(s) and {chunks_updated} chunk(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
