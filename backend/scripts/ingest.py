"""Step 4: ingest a folder of PDFs into MongoDB.

    python -m scripts.ingest ../../enterprisepdf

For each PDF: extract text -> split into sections -> embed each section ->
store the chunk and its vector. After this, the corpus is searchable.

Re-running replaces a document's chunks rather than duplicating them, so it is
safe to run repeatedly while iterating.
"""

import sys
import time
from pathlib import Path

from pymongo import ASCENDING

from app import activity, catalog, config, db, embeddings, extract


def ingest_file(path: Path) -> tuple[int, int]:
    """Returns (chunks_stored, chunks_failed)."""
    doc = extract.extract(path)
    department, owner = catalog.lookup(path.stem)

    documents = db.collection(config.DOCUMENTS)
    chunks = db.collection(config.CHUNKS)

    record = {
        "filename": doc.filename,
        "title": doc.title,
        "department": department,
        "owner": owner,
        "version": doc.version,
        "docId": doc.doc_id,
        "pageCount": doc.page_count,
        "charCount": len(doc.full_text),
        "chunkCount": len(doc.chunks),
        "ingestedAt": time.time(),
    }
    documents.update_one({"filename": doc.filename}, {"$set": record}, upsert=True)
    document_id = documents.find_one({"filename": doc.filename}, {"_id": 1})["_id"]

    # Replace rather than append, so re-ingesting cannot duplicate chunks.
    chunks.delete_many({"documentId": document_id})

    stored = 0
    failed = 0
    batch = []
    for chunk in doc.chunks:
        try:
            vector = embeddings.embed_document(chunk.text)
        except embeddings.EmbeddingError as exc:
            print(f"      [skip] chunk {chunk.index}: {exc}")
            failed += 1
            continue

        batch.append({
            "documentId": document_id,
            "documentTitle": doc.title,
            "filename": doc.filename,
            "department": department,
            "owner": owner,
            "section": chunk.section,
            "chunkIndex": chunk.index,
            "text": chunk.text,
            "embedding": vector,
        })
        stored += 1

    if batch:
        chunks.insert_many(batch)

    activity.log(
        "Uploaded",
        doc.title,
        actor=owner,
        details=f"{doc.page_count} pages, {stored} sections indexed · {department}",
    )
    return stored, failed


def main() -> int:
    folder = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    if not folder or not folder.is_dir():
        print("Usage: python -m scripts.ingest <folder-of-pdfs>")
        return 2

    pdfs = sorted(folder.glob("*.pdf"))
    if not pdfs:
        print(f"No PDFs found in {folder}")
        return 1

    print(f"\nIngesting {len(pdfs)} documents from {folder}")
    print(f"Embedding model: {config.EMBED_MODEL} at {config.EMBED_DIM} dimensions\n")

    total_chunks = 0
    total_failed = 0
    started = time.time()

    for pdf in pdfs:
        print(f"  {pdf.name}")
        stored, failed = ingest_file(pdf)
        total_chunks += stored
        total_failed += failed
        print(f"      {stored} chunks stored" + (f", {failed} failed" if failed else ""))

    # Ordinary indexes for the metadata filters the UI uses. These are separate
    # from the Atlas vector index, which is created by scripts.create_index.
    db.collection(config.CHUNKS).create_index([("documentId", ASCENDING)])
    db.collection(config.DOCUMENTS).create_index([("department", ASCENDING)])

    elapsed = time.time() - started
    print(f"\nDone in {elapsed:.1f}s")
    print(f"  documents: {db.collection(config.DOCUMENTS).count_documents({})}")
    print(f"  chunks:    {db.collection(config.CHUNKS).count_documents({})}")
    if total_failed:
        print(f"  failed:    {total_failed}")
    print("\nNext: python -m scripts.create_index\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
