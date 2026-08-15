/**
 * Client for the Nexora Guardian backend.
 *
 * The browser talks only to FastAPI. It never holds the MongoDB URI or the
 * Gemini key and never calls either service directly — that boundary is the
 * secret-handling story, so keep all provider calls behind this API.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** One source's position on a contested point. */
export interface ConflictClaim {
  document: string;
  section: string;
  department: string;
  owner: string;
  /** The specific contested value, e.g. "10 days". */
  value: string;
  /** Verbatim sentence from the source supporting it. */
  quote: string;
}

/**
 * A contradiction across documents.
 *
 * Claims is a list, not a pair. The headline case has three sources
 * (10 / 12 / 15 days) and a two-sided shape cannot represent it.
 */
export interface DetectedConflict {
  topic: string;
  severity: "High" | "Medium" | "Low";
  explanation: string;
  recommended_action: string;
  claims: ConflictClaim[];
}

export interface AskResponse {
  question: string;
  has_conflict: boolean;
  answer: string;
  conflict: DetectedConflict | null;
  citations: string[];
  hits_considered: number;
}

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function ask(question: string): Promise<AskResponse> {
  let response: Response;

  try {
    response = await fetch(`${BASE}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
  } catch {
    // fetch only rejects on network-level failure, which here almost always
    // means the backend is not running. Say that, rather than "failed to fetch".
    throw new ApiError(
      `Cannot reach the Guardian backend at ${BASE}. Start it with:  ` +
        `cd backend && ./.venv/Scripts/python.exe -m uvicorn app.api:app --port 8000`
    );
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    if (response.status === 503) {
      throw new ApiError(
        "The AI model is temporarily unavailable. It retried and still failed — wait a moment and ask again.",
        503
      );
    }
    throw new ApiError(detail || `Request failed (HTTP ${response.status})`, response.status);
  }

  return response.json();
}

export type ConflictStatus = "Open" | "In Review" | "Resolved" | "Dismissed";

/** A conflict as stored, after being detected while answering some question. */
export interface StoredConflict {
  /** Stable id derived from the documents and sections involved. */
  fingerprint: string;
  title: string;
  severity: "High" | "Medium" | "Low";
  status: ConflictStatus;
  explanation: string;
  recommendedAction: string;
  claims: ConflictClaim[];
  departments: string[];
  owners: string[];
  documents: string[];
  claimCount: number;
  /** True when the disagreeing documents belong to different departments. */
  crossDepartment: boolean;
  detectedAt: number;
  lastSeenAt: number;
  /** How many distinct questions surfaced this same contradiction. */
  timesSurfaced: number;
  questions: string[];
}

export interface ConflictSummary {
  total: number;
  active: number;
  high: number;
  medium: number;
  low: number;
  crossDepartment: number;
}

export async function listConflicts(): Promise<{
  conflicts: StoredConflict[];
  summary: ConflictSummary;
}> {
  const response = await fetch(`${BASE}/api/conflicts`).catch(() => null);
  if (!response) {
    throw new ApiError(`Cannot reach the Guardian backend at ${BASE}.`);
  }
  if (!response.ok) {
    throw new ApiError(`Could not load conflicts (HTTP ${response.status})`, response.status);
  }
  return response.json();
}

export async function getConflict(id: string): Promise<StoredConflict> {
  const response = await fetch(`${BASE}/api/conflicts/${id}`).catch(() => null);
  if (!response) {
    throw new ApiError(`Cannot reach the Guardian backend at ${BASE}.`);
  }
  if (response.status === 404) {
    throw new ApiError("That conflict no longer exists.", 404);
  }
  if (!response.ok) {
    throw new ApiError(`Could not load the conflict (HTTP ${response.status})`, response.status);
  }
  return response.json();
}

export async function setConflictStatus(
  id: string,
  status: ConflictStatus,
  actor?: string
): Promise<void> {
  const response = await fetch(`${BASE}/api/conflicts/${id}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, actor }),
  }).catch(() => null);
  if (!response?.ok) {
    throw new ApiError("Could not update the status.");
  }
}

// ── Documents ──

export interface DocumentRecord {
  _id: string;
  filename: string;
  title: string;
  department: string;
  owner: string;
  version: string | null;
  docId: string | null;
  pageCount: number;
  charCount: number;
  chunkCount: number;
  ingestedAt: number;
}

export interface DocumentSection {
  section: string;
  text: string;
  chunkIndex: number;
}

export async function listDocuments(): Promise<{
  documents: DocumentRecord[];
  total: number;
  openToEveryone: boolean;
}> {
  return get("/api/documents");
}

export async function getDocument(id: string): Promise<{
  document: DocumentRecord;
  sections: DocumentSection[];
}> {
  return get(`/api/documents/${id}`);
}

export async function uploadDocument(
  file: File,
  department: string,
  owner?: string
): Promise<{ ok: boolean; filename: string; chunks_stored: number; document: DocumentRecord }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("department", department);
  if (owner) formData.append("owner", owner);

  const response = await fetch(`${BASE}/api/documents/upload`, {
    method: "POST",
    body: formData,
  }).catch(() => null);

  if (!response?.ok) {
    throw new ApiError("Failed to upload and ingest document.");
  }
  return response.json();
}


// ── Stats, activity, graph ──

export interface KnowledgeHealth {
  department: string;
  documents: number;
  inConflict: number;
  health: number;
}

export interface Stats {
  documents: number;
  chunks: number;
  departments: number;
  documentsByDepartment: Record<string, number>;
  conflicts: ConflictSummary;
  activityEvents: number;
  knowledgeHealth: KnowledgeHealth[];
}

export async function getStats(): Promise<Stats> {
  return get("/api/stats");
}

export interface ActivityEventRecord {
  who: string;
  isAI: boolean;
  action: string;
  resource: string;
  result: string;
  details: string | null;
  timestamp: number;
}

export async function listActivity(limit = 60): Promise<{ events: ActivityEventRecord[] }> {
  return get(`/api/activity?limit=${limit}`);
}

export interface GraphNode {
  id: string;
  label: string;
  type: "department" | "document";
  department?: string;
  owner?: string;
  health: "healthy" | "conflicting";
  connections: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  kind: "ownership" | "conflict";
  severity?: string;
  conflictId?: string;
}

export async function getKnowledgeGraph(): Promise<{
  nodes: GraphNode[];
  edges: GraphEdge[];
  conflictEdges: number;
}> {
  return get("/api/knowledge-graph");
}

/** Shared GET with the same error handling as the rest of this module. */
async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE}${path}`).catch(() => null);
  if (!response) {
    throw new ApiError(`Cannot reach the Guardian backend at ${BASE}.`);
  }
  if (!response.ok) {
    throw new ApiError(`Request failed (HTTP ${response.status})`, response.status);
  }
  return response.json();
}

export interface HealthResponse {
  ok: boolean;
  mongodb?: string;
  documents?: number;
  chunks?: number;
  vectorIndex?: string;
  embedModel?: string;
  chatModel?: string;
}

export async function health(): Promise<HealthResponse> {
  try {
    const response = await fetch(`${BASE}/api/health`);
    if (!response.ok) return { ok: false };
    return response.json();
  } catch {
    return { ok: false };
  }
}

// ── Agents & Workflows ──

export interface AgentRecord {
  id: string;
  name: string;
  description: string;
  owner: string;
  runs: number;
  successRate: number;
  lastRun: string;
  status: "Active" | "Idle" | "Running" | "Error" | "Paused";
  icon: string;
  department: string;
  avgDuration: string;
  documentsProcessed: number;
}

export interface RunAgentResult {
  ok: boolean;
  agent_id: string;
  agent_name: string;
  department: string;
  documents_scanned: number;
  scanned_titles: string[];
  chunks_analyzed: number;
  status: string;
  duration: string;
  summary: string;
  executed_at: string;
}

export async function listAgents(): Promise<{ agents: AgentRecord[] }> {
  return get("/api/agents");
}

export async function createAgent(
  name: string,
  description: string,
  department: string,
  owner?: string
): Promise<{ agent: AgentRecord }> {
  const response = await fetch(`${BASE}/api/agents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description, department, owner }),
  }).catch(() => null);
  if (!response?.ok) {
    throw new ApiError("Failed to deploy custom AI agent.");
  }
  return response.json();
}


export async function runAgent(agentId: string, actor?: string): Promise<RunAgentResult> {
  const response = await fetch(`${BASE}/api/agents/${agentId}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actor }),
  }).catch(() => null);
  if (!response?.ok) {
    throw new ApiError("Failed to execute agent.");
  }
  return response.json();
}

export interface WorkflowRecord {
  id: string;
  name: string;
  description: string;
  status: string;
  runs: number;
  lastRun: string;
  owner: string;
  department: string;
  nodes: number;
  successRate: number;
}

export async function listWorkflows(): Promise<{ workflows: WorkflowRecord[] }> {
  return get("/api/workflows");
}

/** What a workflow run reports back. Mirrors agents.run_workflow in the backend. */
export interface RunWorkflowResult {
  ok: boolean;
  workflow_id: string;
  workflow_name: string;
  status: string;
  duration: string;
  summary: string;
  executed_at: string;
  steps?: { name: string; status: string; detail?: string }[];
  documents_scanned?: number;
  conflicts_found?: number;
}

export async function runWorkflow(
  workflowId: string,
  actor?: string
): Promise<RunWorkflowResult> {
  const response = await fetch(`${BASE}/api/workflows/${workflowId}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actor }),
  }).catch(() => null);
  if (!response?.ok) {
    throw new ApiError("Failed to execute workflow.");
  }
  return response.json();
}

