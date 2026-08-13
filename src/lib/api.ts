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
