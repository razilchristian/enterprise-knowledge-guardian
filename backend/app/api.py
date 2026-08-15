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

from app import activity, agents, conflicts, config, db, gemini, guardian

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

        activity.log(
            "Flagged",
            answer.conflict.topic,
            actor="Guardian",
            is_ai=True,
            details=f"{len(answer.conflict.claims)} sources disagree · "
                    f"{answer.conflict.severity.lower()} severity",
        )
    else:
        activity.log(
            "Analyzed",
            request.question,
            actor="Guardian",
            is_ai=True,
            details=f"{answer.hits_considered} passages, sources agreed",
        )

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


@app.get("/api/stats")
def stats() -> dict[str, Any]:
    """Real counts for the dashboard. Every number here is queried, not typed."""
    documents = db.collection(config.DOCUMENTS)
    chunks = db.collection(config.CHUNKS)
    summary = conflicts.summary()

    by_department: dict[str, int] = {}
    for row in documents.aggregate([{"$group": {"_id": "$department", "n": {"$sum": 1}}}]):
        by_department[row["_id"] or "Unassigned"] = row["n"]

    # Knowledge health per department: the share of a department's documents
    # not currently caught up in an unresolved conflict.
    in_conflict: set[str] = set()
    for conflict in conflicts.listing():
        if conflict.get("status") in ("Open", "In Review"):
            in_conflict.update(conflict.get("documents", []))

    health = []
    for department, total in sorted(by_department.items()):
        titles = {
            d["title"]
            for d in documents.find({"department": department}, {"title": 1, "_id": 0})
        }
        affected = len(titles & in_conflict)
        health.append(
            {
                "department": department,
                "documents": total,
                "inConflict": affected,
                "health": round(100 * (total - affected) / total) if total else 100,
            }
        )

    return {
        "documents": documents.count_documents({}),
        "chunks": chunks.count_documents({}),
        "departments": len(by_department),
        "documentsByDepartment": by_department,
        "conflicts": summary,
        "activityEvents": activity.count(),
        "knowledgeHealth": sorted(health, key=lambda h: h["health"]),
    }


@app.get("/api/activity")
def list_activity(limit: int = 60) -> dict[str, Any]:
    return {"events": activity.recent(min(limit, 200))}


@app.get("/api/knowledge-graph")
def knowledge_graph() -> dict[str, Any]:
    """Documents and departments as nodes; conflicts as the edges between them.

    The edges are the interesting part: a line between two documents means they
    contradict each other, which is a relationship no filesystem would show you.
    """
    documents = list(
        db.collection(config.DOCUMENTS).find(
            {}, {"_id": 0, "title": 1, "department": 1, "owner": 1, "chunkCount": 1}
        )
    )
    stored = conflicts.listing()

    conflicted: set[str] = set()
    for conflict in stored:
        if conflict.get("status") in ("Open", "In Review"):
            conflicted.update(conflict.get("documents", []))

    departments = sorted({d["department"] for d in documents})

    nodes = [
        {
            "id": f"dept::{d}",
            "label": d,
            "type": "department",
            "health": "healthy",
            "connections": sum(1 for x in documents if x["department"] == d),
        }
        for d in departments
    ] + [
        {
            "id": f"doc::{d['title']}",
            "label": d["title"],
            "type": "document",
            "department": d["department"],
            "owner": d.get("owner", ""),
            "health": "conflicting" if d["title"] in conflicted else "healthy",
            "connections": d.get("chunkCount", 0),
        }
        for d in documents
    ]

    edges = [
        {
            "id": f"owns::{d['department']}::{d['title']}",
            "source": f"dept::{d['department']}",
            "target": f"doc::{d['title']}",
            "label": "owns",
            "kind": "ownership",
        }
        for d in documents
    ]

    for conflict in stored:
        docs = conflict.get("documents", [])
        for i in range(len(docs)):
            for j in range(i + 1, len(docs)):
                edges.append(
                    {
                        "id": f"conflict::{conflict['fingerprint']}::{i}::{j}",
                        "source": f"doc::{docs[i]}",
                        "target": f"doc::{docs[j]}",
                        "label": conflict["title"],
                        "kind": "conflict",
                        "severity": conflict["severity"],
                        "conflictId": conflict["fingerprint"],
                    }
                )

    return {
        "nodes": nodes,
        "edges": edges,
        "conflictEdges": sum(1 for e in edges if e["kind"] == "conflict"),
    }


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
    # Who decided. The governance model says a named human approves, so the
    # audit trail records the name rather than "someone".
    actor: str | None = None


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

    found = conflicts.get(conflict_id)
    activity.log(
        "Reviewed" if request.status == "In Review" else
        "Resolved" if request.status == "Resolved" else
        "Dismissed" if request.status == "Dismissed" else "Modified",
        found["title"] if found else conflict_id,
        actor=request.actor or "A reviewer",
        details=f"Status set to {request.status}",
    )
    return {"conflict_id": conflict_id, "status": request.status}


class RunRequest(BaseModel):
    actor: str | None = None


class CreateAgentRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: str = Field(..., min_length=5, max_length=300)
    department: str = Field(..., min_length=2, max_length=50)
    owner: str | None = "Dev Anand"


@app.get("/api/agents")
def list_agents_route() -> dict[str, Any]:
    """List all AI agents and their execution stats from MongoDB."""
    return {"agents": agents.list_agents()}


@app.post("/api/agents")
def create_agent_route(request: CreateAgentRequest) -> dict[str, Any]:
    """Deploy a new custom AI agent to MongoDB."""
    new_agent = agents.create_agent(
        name=request.name,
        description=request.description,
        department=request.department,
        owner=request.owner or "Dev Anand",
    )
    return {"agent": new_agent}



@app.post("/api/agents/{agent_id}/run")
def run_agent_route(agent_id: str, request: RunRequest | None = None) -> dict[str, Any]:
    """Execute a real AI agent pass over the enterprise corpus."""
    actor = request.actor if request and request.actor else "Sarah Chen"
    result = agents.run_agent(agent_id, actor=actor)
    return result


@app.get("/api/workflows")
def list_workflows_route() -> dict[str, Any]:
    """List all pipeline workflows from MongoDB."""
    return {"workflows": agents.list_workflows()}


@app.post("/api/workflows/{workflow_id}/run")
def run_workflow_route(workflow_id: str, request: RunRequest | None = None) -> dict[str, Any]:
    """Execute a pipeline workflow pass."""
    actor = request.actor if request and request.actor else "Alex Morgan"
    result = agents.run_workflow(workflow_id, actor=actor)
    return result
