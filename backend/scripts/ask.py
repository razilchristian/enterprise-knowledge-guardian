"""Steps 6 and 7: ask a question end to end.

    python -m scripts.ask "how many casual leave days do I get"
"""

import sys

from app import guardian


def main() -> int:
    if len(sys.argv) < 2:
        print('Usage: python -m scripts.ask "your question"')
        return 2

    question = " ".join(sys.argv[1:])
    result = guardian.ask(question)

    print(f'\nQ: {question}')
    print(f'   ({result.hits_considered} passages considered)\n')

    if result.has_conflict and result.conflict:
        c = result.conflict
        print(f"  !! KNOWLEDGE CONFLICT DETECTED  [{c.severity} severity]")
        print(f"     {c.topic}\n")
        for claim in c.claims:
            print(f"     {claim.value:<28} {claim.document} {claim.section}")
            print(f"     {'':<28} {claim.department} - owner: {claim.owner}")
            print(f"     {'':<28} \"{' '.join(claim.quote.split())[:100]}\"")
            print()
        print(f"  Why it matters: {c.explanation}\n")
        print(f"  Recommended:    {c.recommended_action}\n")
    else:
        print(f"  {result.answer}\n")

    if result.citations:
        print("  Sources:")
        for cite in result.citations:
            print(f"    - {cite}")
    print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
