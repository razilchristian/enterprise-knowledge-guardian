"""Step 5: semantic search over the chunks.

Embed the question, then ask Atlas for the chunks whose vectors sit closest to
it. Closeness in vector space means closeness in meaning, so this finds the
right passage even when it shares no words with the question.

Nothing here filters by who is asking. Every role searches the whole corpus --
that is the product decision, and cross-department conflict detection depends
on it. `department` exists only as an optional display filter for the UI's
department view.
"""

from dataclasses import dataclass

from app import config, db, embeddings


@dataclass
class Hit:
    text: str
    section: str
    document: str
    department: str
    owner: str
    score: float

    def citation(self) -> str:
        return f"{self.document} {self.section}"


def search(query: str, *, limit: int = 8, department: str | None = None) -> list[Hit]:
    vector = embeddings.embed_query(query)

    stage: dict = {
        "index": config.VECTOR_INDEX,
        "path": "embedding",
        "queryVector": vector,
        # Scan more candidates than we return; Atlas recommends roughly
        # 10-20x limit for good recall on an approximate search.
        "numCandidates": max(limit * 15, 100),
        "limit": limit,
    }
    if department:
        stage["filter"] = {"department": {"$eq": department}}

    pipeline = [
        {"$vectorSearch": stage},
        {
            "$project": {
                "_id": 0,
                "text": 1,
                "section": 1,
                "documentTitle": 1,
                "department": 1,
                "owner": 1,
                "score": {"$meta": "vectorSearchScore"},
            }
        },
    ]

    return [
        Hit(
            text=row["text"],
            section=row.get("section", ""),
            document=row.get("documentTitle", ""),
            department=row.get("department", ""),
            owner=row.get("owner", ""),
            score=row.get("score", 0.0),
        )
        for row in db.collection(config.CHUNKS).aggregate(pipeline)
    ]
