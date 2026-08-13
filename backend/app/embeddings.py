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
import time
from typing import Literal

import requests

from app import config

TaskType = Literal["RETRIEVAL_DOCUMENT", "RETRIEVAL_QUERY"]


class EmbeddingError(RuntimeError):
    pass


def _normalize(vector: list[float]) -> list[float]:
    norm = math.sqrt(sum(x * x for x in vector))
    if norm == 0:
        raise EmbeddingError("Got a zero vector back; the input text was probably empty.")
    return [x / norm for x in vector]


def embed(text: str, task_type: TaskType, *, retries: int = 3) -> list[float]:
    """Embed one string, returning a normalized EMBED_DIM-length vector."""
    text = text.strip()
    if not text:
        raise EmbeddingError("Cannot embed empty text.")

    url = f"{config.GEMINI_BASE}/models/{config.EMBED_MODEL}:embedContent"
    payload = {
        "model": f"models/{config.EMBED_MODEL}",
        "content": {"parts": [{"text": text}]},
        "taskType": task_type,
        "outputDimensionality": config.EMBED_DIM,
    }
    headers = {
        "x-goog-api-key": config.GEMINI_API_KEY,
        "Content-Type": "application/json",
    }

    last_error = ""
    for attempt in range(retries):
        response = requests.post(url, json=payload, headers=headers, timeout=60)

        if response.status_code == 200:
            values = response.json().get("embedding", {}).get("values")
            if not values:
                raise EmbeddingError(f"No embedding in response: {response.text[:200]}")
            if len(values) != config.EMBED_DIM:
                raise EmbeddingError(
                    f"Expected {config.EMBED_DIM} dimensions, got {len(values)}. "
                    "EMBED_DIM and the Atlas index must agree."
                )
            return _normalize(values)

        # 429 = rate limited, 5xx = transient. Both are worth retrying.
        if response.status_code == 429 or response.status_code >= 500:
            last_error = f"HTTP {response.status_code}: {response.text[:160]}"
            time.sleep(2 ** attempt)
            continue

        if response.status_code in (401, 403):
            raise EmbeddingError(
                f"Gemini rejected the API key (HTTP {response.status_code}).\n"
                "  Check GEMINI_API_KEY in backend/.env.\n"
                "  Create a new one at https://aistudio.google.com/apikey"
            )

        raise EmbeddingError(f"HTTP {response.status_code}: {response.text[:300]}")

    raise EmbeddingError(f"Gave up after {retries} attempts. Last error: {last_error}")


def embed_document(text: str) -> list[float]:
    """Embed a chunk that will be stored and searched over."""
    return embed(text, "RETRIEVAL_DOCUMENT")


def embed_query(text: str) -> list[float]:
    """Embed a user question used to search."""
    return embed(text, "RETRIEVAL_QUERY")


def cosine(a: list[float], b: list[float]) -> float:
    """Similarity between two normalized vectors. 1.0 = identical meaning."""
    return sum(x * y for x, y in zip(a, b))
