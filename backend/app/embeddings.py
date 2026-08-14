"""Turning text into vectors, via Gemini.

An embedding is a list of numbers describing what a piece of text *means*.
Texts with similar meaning get similar numbers, which is why searching by
embedding finds "employees are entitled to ten (10) days of casual leave"
when you asked "how many leave days do I get" -- despite sharing almost no
words. Keyword search cannot do that.

Two details that silently break retrieval if ignored:

1. Normalization. We request 768 dimensions instead of the default 3072, and
   Gemini truncates rather than re-normalizing, so vectors arrive with an L2
   norm around 0.59. We normalize here so cosine similarity behaves.

2. Task type. Gemini embeds documents and queries differently on request.
   Passing RETRIEVAL_DOCUMENT when storing and RETRIEVAL_QUERY when searching
   measurably improves matching, so the two helpers below are separate.
"""

import math
from typing import Literal

from app import config, gemini

TaskType = Literal["RETRIEVAL_DOCUMENT", "RETRIEVAL_QUERY"]


class EmbeddingError(RuntimeError):
    pass


def _normalize(vector: list[float]) -> list[float]:
    norm = math.sqrt(sum(x * x for x in vector))
    if norm == 0:
        raise EmbeddingError("Got a zero vector back; the input text was probably empty.")
    return [x / norm for x in vector]


def embed(text: str, task_type: TaskType) -> list[float]:
    """Embed one string, returning a normalized EMBED_DIM-length vector."""
    text = text.strip()
    if not text:
        raise EmbeddingError("Cannot embed empty text.")

    try:
        data = gemini.call(
            f"models/{config.EMBED_MODEL}:embedContent",
            {
                "model": f"models/{config.EMBED_MODEL}",
                "content": {"parts": [{"text": text}]},
                "taskType": task_type,
                "outputDimensionality": config.EMBED_DIM,
            },
            timeout=20,
        )
    except gemini.GeminiError as exc:
        raise EmbeddingError(str(exc)) from exc

    values = data.get("embedding", {}).get("values")
    if not values:
        raise EmbeddingError(f"No embedding in response: {str(data)[:200]}")
    if len(values) != config.EMBED_DIM:
        raise EmbeddingError(
            f"Expected {config.EMBED_DIM} dimensions, got {len(values)}. "
            "EMBED_DIM and the Atlas index must agree, or every search returns nothing."
        )
    return _normalize(values)


def embed_document(text: str) -> list[float]:
    """Embed a chunk that will be stored and searched over."""
    return embed(text, "RETRIEVAL_DOCUMENT")


def embed_query(text: str) -> list[float]:
    """Embed a user question used to search."""
    return embed(text, "RETRIEVAL_QUERY")


def cosine(a: list[float], b: list[float]) -> float:
    """Similarity between two normalized vectors. 1.0 = identical meaning."""
    return sum(x * y for x, y in zip(a, b))
