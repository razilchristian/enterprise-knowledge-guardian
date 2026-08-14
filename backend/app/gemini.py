"""One place that talks to Gemini, for both embeddings and reasoning.

Two failure modes on the free tier, and they need opposite handling:

    429  the key's daily quota is spent. It stays spent for hours, so retrying
         the same key is wasted time -- rotate to another key immediately.
    503  the model is briefly overloaded. It clears in seconds, so a short
         backoff on the same key is the right move.

Getting that backwards is what turned a 66-second sweep into a 532-second one
earlier: the code kept politely backing off against a key that was never going
to answer.

Keys are tried in rotation rather than always starting from the first, so load
spreads instead of burning key one's quota before touching key two.
"""

import itertools
import threading
import time

import requests

from app import config

# A key that returns 429 is parked for this long before being tried again.
# Google's quota resets on its own clock; this only stops us hammering a key
# we know is spent within a single session.
COOLDOWN_SECONDS = 900

_lock = threading.Lock()
_cooling: dict[str, float] = {}          # key -> timestamp when it may be retried
_rotation = itertools.cycle(range(max(len(config.GEMINI_API_KEYS), 1)))

# One pooled session for the process. Without this every call pays for a fresh
# TCP connect and TLS handshake to Google -- roughly a quarter-second each, and
# a question makes two calls, so it was a measurable slice of the response time.
_session = requests.Session()
_session.mount(
    "https://",
    requests.adapters.HTTPAdapter(pool_connections=4, pool_maxsize=8, max_retries=0),
)


def warm() -> None:
    """Open the TLS connection ahead of the first real request.

    Called at API startup so the first user question does not pay the handshake
    that every later one avoids -- which is exactly the question a judge asks.
    """
    try:
        _session.get(f"{config.GEMINI_BASE}/models", timeout=5,
                     headers={"x-goog-api-key": config.GEMINI_API_KEYS[0]})
    except requests.RequestException:
        pass  # best-effort; a cold first call is not worth failing startup over


class GeminiError(RuntimeError):
    pass


def _available_keys() -> list[str]:
    """Keys not currently parked, in rotated order so load spreads."""
    now = time.time()
    with _lock:
        live = [k for k in config.GEMINI_API_KEYS if _cooling.get(k, 0) <= now]
        if not live:
            # Everything is parked. Rather than fail outright, try them all
            # again -- a cooldown is a heuristic, not a fact about the quota.
            _cooling.clear()
            live = list(config.GEMINI_API_KEYS)
        start = next(_rotation) % len(live)
    return live[start:] + live[:start]


def _park(key: str) -> None:
    with _lock:
        _cooling[key] = time.time() + COOLDOWN_SECONDS


def key_status() -> list[dict]:
    """For /api/health, so a spent key is visible before a demo, not during."""
    now = time.time()
    return [
        {
            "key": f"...{k[-6:]}",
            "state": "cooling" if _cooling.get(k, 0) > now else "ready",
            "readyInSeconds": max(0, int(_cooling.get(k, 0) - now)),
        }
        for k in config.GEMINI_API_KEYS
    ]


def call(path: str, payload: dict, *, models: tuple[str, ...] | None = None,
         timeout: int = 30) -> dict:
    """POST to a Gemini endpoint, rotating keys and models until one answers.

    `path` is formatted with the model name, e.g. "models/{model}:embedContent".
    """
    models = models or (None,)  # embeddings pin their model inside the payload
    last = "no attempt made"

    for key in _available_keys():
        for model in models:
            url = f"{config.GEMINI_BASE}/{path.format(model=model)}"
            for attempt in range(3):
                try:
                    response = _session.post(
                        url,
                        headers={"x-goog-api-key": key, "Content-Type": "application/json"},
                        json=payload,
                        timeout=timeout,
                    )
                except requests.RequestException as exc:
                    last = f"network error: {exc}"
                    break

                if response.status_code == 200:
                    return response.json()

                last = f"{model or 'embed'} HTTP {response.status_code}: {response.text[:120]}"

                if response.status_code == 429:
                    _park(key)
                    break  # this key is done; move to the next key

                if response.status_code in (401, 403):
                    _park(key)
                    break  # bad or revoked key; try another

                if response.status_code in (500, 502, 503, 504):
                    time.sleep(0.6 * (attempt + 1))
                    continue  # transient, same key

                break  # anything else is not worth retrying here

    raise GeminiError(
        f"All {len(config.GEMINI_API_KEYS)} keys failed.\n  Last error: {last}\n"
        "  A 429 across every key means the free-tier quota is spent on all of "
        "them; they reset on Google's clock."
    )
