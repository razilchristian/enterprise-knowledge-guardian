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
from dataclasses import asdict, dataclass, field

from app import config, gemini, retrieval


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


def _call_gemini(prompt: str, *, temperature: float = 0.1) -> str:
    """Ask Gemini for the answer and the verification in one response.

    Key rotation and model fallback live in app/gemini.py; this only shapes the
    request and pulls the text out.
    """
    try:
        payload = gemini.call(
            "models/{model}:generateContent",
            {
                "contents": [{"parts": [{"text": prompt}]}],
                # No thinkingConfig here: gemini-flash-lite-latest rejects it
                # with a 400, and lite is the model we most want to reach.
                "generationConfig": {
                    "temperature": temperature,
                    "responseMimeType": "application/json",
                    # Bounded so a rambling response cannot stall the UI. The
                    # reply is structured JSON, not prose, so this is ample.
                    "maxOutputTokens": 2048,
                },
            },
            models=config.CHAT_MODELS,
            timeout=25,
        )
    except gemini.GeminiError as exc:
        raise GuardianError(str(exc)) from exc

    try:
        return payload["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError) as exc:
        raise GuardianError(f"Unexpected Gemini response shape: {str(payload)[:300]}") from exc


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

CRITICAL RULE FOR SUPERSEDED & UNIFIED POLICIES:
If one of the retrieved sources is a newer Master/Unified Policy (e.g. "HR Leave Policy 2026 Unified" or a document stating "explicitly supersedes all legacy documentation"), then that Unified Policy IS the authoritative corporate answer. In this case:
- Set `has_conflict` to `false`.
- In `answer`, state the definitive rule from the 2026 Unified Policy clearly (e.g., "Employees are entitled to 12 paid casual leave days under the 2026 Unified Policy").
- Note in the answer that it supersedes legacy documentation (like Employee Handbook 10 days or Manager Guidelines 15 days).
- Set `conflict` to `null`.

Otherwise, if there are active conflicting policies without a clear 2026 superseding document, set `has_conflict` to `true` and report the claims.

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
