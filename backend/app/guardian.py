"""Steps 6 and 7: answer a question, and refuse to answer when sources disagree.

Ordinary RAG stops at step 6 -- retrieve passages, generate a confident answer.
That is the failure this product exists to fix: when the Handbook says 10 days,
the Leave Policy says 12 and the Manager Guide says 15, a confident single
number is worse than no answer, because it spreads misinformation with the
authority of a system.

So we run the check first. If the retrieved evidence contradicts itself, we
report the conflict with every claim tied to its source and open it for human
review. We never pick a winner -- choosing between two policies is a decision
with consequences, and it belongs to the document's owner, not to us.

Conflicts hold a list of claims, not a pair. The headline case has three
sources, and a two-sided model cannot represent it.
"""

import json
import time
from dataclasses import asdict, dataclass, field

import requests

from app import config, retrieval


class GuardianError(RuntimeError):
    pass


@dataclass
class Claim:
    """One source's position on the contested point."""
    document: str
    section: str
    department: str
    owner: str
    value: str          # the specific contested value, e.g. "10 days"
    quote: str          # verbatim supporting sentence


@dataclass
class Conflict:
    topic: str
    severity: str                      # High | Medium | Low
    explanation: str
    recommended_action: str
    claims: list[Claim] = field(default_factory=list)


@dataclass
class Answer:
    question: str
    has_conflict: bool
    answer: str
    conflict: Conflict | None
    citations: list[str]
    hits_considered: int


def _post(model: str, prompt: str, temperature: float) -> requests.Response:
    return requests.post(
        f"{config.GEMINI_BASE}/models/{model}:generateContent",
        headers={
            "x-goog-api-key": config.GEMINI_API_KEY,
            "Content-Type": "application/json",
        },
        json={
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": temperature,
                "responseMimeType": "application/json",
            },
        },
        timeout=90,
    )


def _call_gemini(prompt: str, *, temperature: float = 0.1) -> str:
    """Call Gemini, retrying transient failures and falling back to a second model.

    The free tier returns 503 under load and 429 when quota is tight. Both are
    temporary and both would otherwise surface as a dead demo, so we back off
    and retry, then try the fallback model before giving up.
    """
    last = ""

    for model in config.CHAT_MODELS:
        for attempt in range(3):
            response = _post(model, prompt, temperature)

            if response.status_code == 200:
                payload = response.json()
                try:
                    return payload["candidates"][0]["content"]["parts"][0]["text"]
                except (KeyError, IndexError) as exc:
                    raise GuardianError(
                        f"Unexpected Gemini response shape: {str(payload)[:300]}"
                    ) from exc

            if response.status_code in (401, 403):
                raise GuardianError(
                    f"Gemini rejected the API key (HTTP {response.status_code}).\n"
                    "  Check GEMINI_API_KEY in backend/.env, or create a new key\n"
                    "  at https://aistudio.google.com/apikey"
                )

            last = f"{model} HTTP {response.status_code}: {response.text[:140]}"

            # Quota is exhausted for hours, so retrying this model is wasted
            # time. Move to the next one immediately.
            if response.status_code == 429:
                break

            # Overload clears in seconds; a short backoff is worth it.
            if response.status_code in (500, 502, 503, 504):
                time.sleep(1.5 * (attempt + 1))
                continue

            break  # anything else is not retryable on this model

    raise GuardianError(
        f"Every model in the chain failed ({', '.join(config.CHAT_MODELS)}).\n"
        f"  Last error: {last}\n"
        "  A 429 means the free-tier daily quota is spent; it resets on Google's "
        "clock, or use a different API key."
    )


def _parse_json(raw: str) -> dict:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Models occasionally wrap JSON in a fenced block despite the mime type.
        cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```")
        try:
            return json.loads(cleaned.strip())
        except json.JSONDecodeError as exc:
            raise GuardianError(f"Model did not return valid JSON:\n{raw[:400]}") from exc


def _format_evidence(hits: list[retrieval.Hit]) -> str:
    return "\n\n".join(
        f"[SOURCE {i}]\n"
        f"document: {hit.document}\n"
        f"section: {hit.section}\n"
        f"department: {hit.department}\n"
        f"owner: {hit.owner}\n"
        f"text: {' '.join(hit.text.split())}"
        for i, hit in enumerate(hits, 1)
    )


PROMPT = """You are Nexora Guardian, an enterprise knowledge verification system.

A employee asked:
{question}

These passages were retrieved from the company's policy documents. They come
from different departments and different documents.

{evidence}

You have two jobs, in this order.

JOB 1 - Answer the question. Always. Use only the passages above. If they
genuinely do not address it, say so.

JOB 2 - Check whether the sources contradict each other ON THE POINT THE
QUESTION ASKED, and report it if they do.

A conflict means two or more sources state materially different values, limits,
deadlines, or requirements for THE SAME rule. Different rules covering
different topics are not a conflict. Neither is a source that simply omits
something.

Materiality matters. Only set has_conflict when the contradiction affects the
answer to THIS question. If someone asks how to submit a leave request, a
disagreement about how many days they are owed does not change the submission
process -- answer the process, and set has_conflict to false. Set it to true
only when the contradiction means you cannot honestly give one answer to what
was actually asked.

When there is a material conflict, you must NOT choose a winner. Report every
conflicting claim tied to the document it came from, and say in the answer
field that the company's documents disagree.

Return JSON exactly matching this shape:

{{
  "has_conflict": true or false,
  "answer": "Always answer the question from the passages. If there is a material conflict, additionally state plainly that the documents disagree and no single answer can be given.",
  "citations": ["Document Name §section", ...],
  "conflict": null, or {{
    "topic": "short name for the contested rule",
    "severity": "High" | "Medium" | "Low",
    "explanation": "what disagrees with what, and why it matters to an employee",
    "recommended_action": "concrete next step for the document owners",
    "claims": [
      {{
        "document": "exact document name from the source",
        "section": "exact section from the source",
        "department": "exact department from the source",
        "owner": "exact owner from the source",
        "value": "the specific contested value, e.g. '10 days'",
        "quote": "verbatim sentence from the passage stating it"
      }}
    ]
  }}
}}

Severity: High if an employee could act wrongly on it or it affects pay,
entitlement or legal obligation. Medium if it causes confusion. Low if minor.
"""


def ask(question: str, *, limit: int = 8) -> Answer:
    hits = retrieval.search(question, limit=limit)

    if not hits:
        return Answer(
            question=question,
            has_conflict=False,
            answer="No relevant policy documents were found for that question.",
            conflict=None,
            citations=[],
            hits_considered=0,
        )

    raw = _call_gemini(PROMPT.format(question=question, evidence=_format_evidence(hits)))
    data = _parse_json(raw)

    conflict = None
    if data.get("has_conflict") and data.get("conflict"):
        blob = data["conflict"]
        conflict = Conflict(
            topic=blob.get("topic", "Unnamed conflict"),
            severity=blob.get("severity", "Medium"),
            explanation=blob.get("explanation", ""),
            recommended_action=blob.get("recommended_action", ""),
            claims=[Claim(**{k: c.get(k, "") for k in Claim.__annotations__}) for c in blob.get("claims", [])],
        )

    return Answer(
        question=question,
        has_conflict=bool(data.get("has_conflict")),
        answer=data.get("answer", ""),
        conflict=conflict,
        citations=data.get("citations", []),
        hits_considered=len(hits),
    )


def to_dict(answer: Answer) -> dict:
    return asdict(answer)
