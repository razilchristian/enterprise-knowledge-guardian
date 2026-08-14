"""HTTP layer over the working backend.

The browser talks only to this. It never holds the MongoDB URI or the Gemini
key, and never calls either service directly -- that separation is the whole
of the secret-handling story, and it is why this file exists at all rather
than the frontend calling Gemini itself.

Run it:

    ./.venv/Scripts/python.exe -m uvicorn app.api:app --reload --port 8000

Interactive docs at http://localhost:8000/docs
"""

from contextlib import asynccontextmanager
from typing import Any

from bson import ObjectId
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app import conflicts, config, db, gemini, guardian

@asynccontextmanager
async def lifespan(_: FastAPI):
    """Open the outbound connections before the first question arrives.

    Without this the first request pays a TLS handshake to Google and a cold
    MongoDB connection that every later request avoids -- and the first request
    is the one a judge watches.
    """
    gemini.warm()
    try:
        db.ping()
        conflicts.ensure_indexes()
    except Exception:  # noqa: BLE001 - health endpoint reports this properly
        pass
    yield


app = FastAPI(
    title="Nexora Guardian API",
    description="Enterprise knowledge intelligence. Answers are evidence-backed, "
                "and contradictions are reported rather than resolved.",
    version="1.0.0",
    lifespan=lifespan,
)

# The Next.js dev server. Widen this list when deploying somewhere else.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def _clean(doc: dict) -> dict:
    """MongoDB ObjectIds are not JSON-serializable; turn them into strings."""
    return {k: (str(v) if isinstance(v, ObjectId) else v) for k, v in doc.items()}


class AskRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=500)


@app.get("/")
def root() -> dict[str, Any]:
    """Signpost for anyone who opens the base URL in a browser.

    Without this, visiting http://localhost:8000 returns a bare 404 that reads
    like the server is broken when it is running perfectly.
    """
    return {
        "service": "Nexora Guardian API",
        "status": "running",
        "ui": "http://localhost:3000/workspace",
        "docs": "http://localhost:8000/docs",
        "endpoints": {
            "POST /api/ask": "Ask a question; returns the answer and any conflict",
            "GET /api/health": "Dependency status",
            "GET /api/documents": "The document library",
            "GET /api/conflicts": "Persisted conflicts",
        },
    }


@app.get("/api/health")
def health() -> dict[str, Any]:
    """Is everything the demo depends on actually up?

    Checked before a demo, so it reports each dependency separately rather than
    a single unhelpful boolean.
    """
    status: dict[str, Any] = {"ok": True}

    try:
        db.ping()
        status["mongodb"] = "connected"
        status["documents"] = db.collection(config.DOCUMENTS).count_documents({})
        status["chunks"] = db.collection(config.CHUNKS).count_documents({})
    except Exception as exc:  # noqa: BLE001 - health checks report, never raise
        status["ok"] = False
        status["mongodb"] = f"unreachable: {exc}"
        return status

    try:
        indexes = list(db.collection(config.CHUNKS).list_search_indexes())
        vector = next((i for i in indexes if i["name"] == config.VECTOR_INDEX), None)
        if vector and vector.get("queryable"):
            status["vectorIndex"] = "queryable"
        else:
            status["ok"] = False
            status["vectorIndex"] = "not queryable - run scripts.create_index"
    except Exception as exc:  # noqa: BLE001
        status["ok"] = False
        status["vectorIndex"] = f"error: {exc}"

    status["embedModel"] = f"{config.EMBED_MODEL} @ {config.EMBED_DIM}d"
    status["chatModels"] = list(config.CHAT_MODELS)
    status["apiKeys"] = gemini.key_status()
    return status


@app.post("/api/ask")
def ask(request: AskRequest) -> dict[str, Any]:
    """Answer a question, and report any contradiction in the evidence.

    Note what is absent: no user, no role, no permission filter. Every person
    searching gets the same corpus and the same answer. That is the product
    decision, not an oversight -- cross-department conflict detection depends
    on it.
    """
    try:
        answer = guardian.ask(request.question)
    except guardian.GuardianError as exc:
        # The model provider being down is a 503, not a bug in this service.
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    payload = guardian.to_dict(answer)

    # A contradiction found here is a real problem in the customer's documents,
    # so it outlives the question that surfaced it. Persisting failures must not
    # break the answer -- the user asked a question, not to file a ticket.
    if answer.has_conflict and answer.conflict:
        try:
            key, is_new = conflicts.record(answer.conflict, request.question)
            payload["conflict_id"] = key
            payload["conflict_is_new"] = is_new
        except Exception:  # noqa: BLE001
            payload["conflict_id"] = None

    return payload


@app.get("/api/documents")
def list_documents(department: str | None = None) -> dict[str, Any]:
    """The whole library. `department` narrows the view; it is never a permission."""
    query = {"department": department} if department else {}
    documents = [
        _clean(d)
        for d in db.collection(config.DOCUMENTS)
        .find(query, {"embedding": 0})
        .sort("title", 1)
    ]
    return {
        "documents": documents,
        "total": len(documents),
        "openToEveryone": True,
    }


@app.get("/api/documents/{document_id}")
def get_document(document_id: str) -> dict[str, Any]:
    try:
        oid = ObjectId(document_id)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail="Malformed document id") from exc

    document = db.collection(config.DOCUMENTS).find_one({"_id": oid})
    if not document:
        raise HTTPException(status_code=404, detail="No document with that id")

    sections = [
        _clean(c)
        for c in db.collection(config.CHUNKS)
        .find({"documentId": oid}, {"embedding": 0})
        .sort("chunkIndex", 1)
    ]
    return {"document": _clean(document), "sections": sections}


@app.get("/api/conflicts")
def list_conflicts(status: str | None = None) -> dict[str, Any]:
    """Every contradiction found so far, newest severity first."""
    return {"conflicts": conflicts.listing(status), "summary": conflicts.summary()}


@app.get("/api/conflicts/{conflict_id}")
def get_conflict(conflict_id: str) -> dict[str, Any]:
    found = conflicts.get(conflict_id)
    if not found:
        raise HTTPException(status_code=404, detail="No conflict with that id")
    return found


class StatusRequest(BaseModel):
    status: str


@app.post("/api/conflicts/{conflict_id}/status")
def update_conflict_status(conflict_id: str, request: StatusRequest) -> dict[str, Any]:
    """Move a conflict through review. This is the human half of the governance
    model -- the AI detects and recommends, a person decides."""
    try:
        changed = conflicts.set_status(conflict_id, request.status)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if not changed:
        raise HTTPException(status_code=404, detail="No conflict with that id")
    return {"conflict_id": conflict_id, "status": request.status}
