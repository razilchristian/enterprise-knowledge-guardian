"""Sweep the corpus for conflicts and persist them.

    python -m scripts.detect_all

Runs a set of probe questions covering the areas where policies tend to
disagree, and records every conflict found. Run this before a demo so the
conflicts page has real detections rather than an empty state -- an empty
queue is a bad first impression even when the engine works.

Safe to re-run. Conflicts deduplicate on the documents and sections involved,
so a second sweep updates sighting counts instead of creating duplicates.
"""

import sys
import time

from app import conflicts, guardian

# Probes, not an exhaustive crawl. Each targets a topic that appears in more
# than one document, which is where contradictions live.
PROBES = [
    "how many casual leave days are employees entitled to",
    "how much paid time off do employees accrue",
    "when must company equipment be returned after termination",
    "how often are performance reviews conducted",
    "how long is personal data retained",
    "what is the vendor liability cap",
    "how many reviewers must approve a code change",
    "how quickly must a security incident be acknowledged",
    "what are the expense approval thresholds",
    "how many software licence seats are permitted",
    "when will I receive my experience letter after leaving",
    "who signs an experience letter",
]


def main() -> int:
    conflicts.ensure_indexes()

    print(f"\nSweeping {len(PROBES)} probe questions\n")
    started = time.time()
    new_count = 0
    repeat_count = 0
    failures = 0

    for probe in PROBES:
        try:
            answer = guardian.ask(probe)
        except guardian.GuardianError as exc:
            print(f"  [fail] {probe[:52]:<52} {str(exc)[:60]}")
            failures += 1
            continue

        if not answer.has_conflict or not answer.conflict:
            print(f"  [ok  ] {probe[:52]:<52} no conflict")
            continue

        key, is_new = conflicts.record(answer.conflict, probe)
        values = " / ".join(c.value for c in answer.conflict.claims)
        marker = "NEW " if is_new else "seen"
        print(f"  [{marker}] {probe[:52]:<52} {answer.conflict.severity}: {values[:48]}")
        new_count += int(is_new)
        repeat_count += int(not is_new)

    stats = conflicts.summary()
    print(f"\nDone in {time.time() - started:.0f}s")
    print(f"  new conflicts recorded : {new_count}")
    print(f"  already known          : {repeat_count}")
    if failures:
        print(f"  probes failed          : {failures}")
    print(
        f"\nStored: {stats['total']} total, {stats['active']} active "
        f"({stats['high']} high, {stats['medium']} medium, {stats['low']} low), "
        f"{stats['crossDepartment']} cross-department\n"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
