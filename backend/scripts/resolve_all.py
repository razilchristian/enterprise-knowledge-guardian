"""Mark every conflict Resolved. Destructive; requires confirmation.

    python -m scripts.resolve_all --yes

This exists for resetting the board after a rehearsal, not for normal use.
Running it clears the conflicts page, which is the demo — so it will not run
without --yes, and it prints what it is about to change first.

The original version of this script was a five-line file with no guard. One
absent-minded run the morning of a demo would have emptied the queue with
nothing to undo it.
"""

import sys

from app import conflicts


def main() -> int:
    active = [c for c in conflicts.listing() if c["status"] in ("Open", "In Review")]

    if not active:
        print("\nNothing to do: no Open or In Review conflicts.\n")
        return 0

    print(f"\nAbout to mark {len(active)} conflict(s) Resolved:\n")
    for c in active:
        print(f"  {c['severity']:<7} {c['title'][:56]}")

    if "--yes" not in sys.argv:
        print(
            "\nRefusing to run without confirmation."
            "\n  This empties the conflicts page, which is the demo."
            "\n  Re-run with --yes if you are certain.\n"
        )
        return 1

    for c in active:
        conflicts.set_status(c["fingerprint"], "Resolved")

    print(f"\nMarked {len(active)} conflict(s) Resolved.")
    print("Rebuild the board with: python -m scripts.detect_all\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
