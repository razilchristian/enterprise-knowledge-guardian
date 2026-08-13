"""Step 5: run a semantic search from the command line.

    python -m scripts.search "how many casual leave days do I get"
"""

import sys

from app import retrieval


def main() -> int:
    if len(sys.argv) < 2:
        print('Usage: python -m scripts.search "your question"')
        return 2

    query = " ".join(sys.argv[1:])
    hits = retrieval.search(query)

    print(f'\nQuery: "{query}"')
    print(f"{len(hits)} chunks retrieved, best first\n")

    for i, hit in enumerate(hits, 1):
        body = " ".join(hit.text.split())
        print(f"  {i}. [{hit.score:.4f}] {hit.citation()}")
        print(f"     {hit.department} - {hit.owner}")
        print(f"     {body[:150]}...")
        print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
