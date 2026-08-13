"""Validate a corpus folder before ingesting it.

    python -m scripts.validate_corpus <folder>

Two failure modes this catches, both of which are silent otherwise:

1. Image-only PDFs. A scanned or exported-as-image PDF yields no text, so the
   document is invisible to retrieval and nothing tells you why.
2. Drifted clause values. Conflict detection compares specific numbers across
   documents. If a document says "twelve days" where the spec said "twelve
   (12) days", the detector finds nothing and reports no error.
"""

import re
import sys
from pathlib import Path

from pypdf import PdfReader

# The clauses conflict detection depends on. Each entry is
#   (filename, human label, list of alternative spellings that count as a match)
REQUIRED_CLAUSES = [
    ("Employee Handbook v3.2.pdf", "casual leave = 10",
     ["ten (10) days of casual leave", "10 days of casual leave"]),
    ("Employee Handbook v3.2.pdf", "PTO = 15",
     ["15 days of PTO", "fifteen (15) days of PTO"]),
    ("Employee Handbook v3.2.pdf", "equipment return = 5 business days",
     ["five (5) business days", "5 business days"]),
    ("Employee Handbook v3.2.pdf", "reviews = annual",
     ["annually during Q4", "annually"]),
    ("HR Leave Policy.pdf", "casual leave = 12",
     ["twelve (12) days", "12 days"]),
    ("Manager Guide.pdf", "casual leave = 15",
     ["fifteen (15) days", "15 days"]),
    ("IT Procurement Policy.pdf", "equipment return = final day / 24h",
     ["final day of employment", "24 hours"]),
    ("Employee Onboarding Checklist.pdf", "PTO = 18",
     ["18 days of PTO", "eighteen (18) days"]),
    ("Annual Performance Review Framework.pdf", "reviews = twice yearly",
     ["two formal evaluation periods", "mid-year", "twice"]),
    ("Engineering Standards & Best Practices.pdf", "code review = 2 reviewers",
     ["two (2) peer reviews", "2 peer reviews"]),
    ("Security Incident Response Playbook.pdf", "ack = 15 minutes",
     ["15 minutes", "fifteen (15) minutes"]),
    ("Data Processing Agreement.pdf", "retention = 36 months",
     ["thirty-six (36) months", "36 months"]),
    ("Vendor Master Agreement.pdf", "liability = 2x",
     ["two times (2x)", "2x", "(2x)"]),
    ("Vendor Risk Assessment Matrix.pdf", "liability = 1x",
     ["(1x)", "1x"]),
]

MIN_CHARS = 200  # below this, assume the PDF has no real text layer


def read_text(path: Path) -> str:
    try:
        return "\n".join(page.extract_text() or "" for page in PdfReader(path).pages)
    except Exception as exc:  # noqa: BLE001
        return f"__READ_ERROR__{exc}"


def main() -> int:
    folder = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    if not folder or not folder.is_dir():
        print("Usage: python -m scripts.validate_corpus <folder>")
        return 2

    pdfs = sorted(folder.glob("*.pdf"))
    print(f"\nValidating {len(pdfs)} PDFs in {folder}\n")

    texts: dict[str, str] = {}
    extractable = 0

    print("--- Text extraction ---")
    for pdf in pdfs:
        text = read_text(pdf)
        if text.startswith("__READ_ERROR__"):
            print(f"  [FAIL]  {pdf.name:<48} unreadable: {text[14:60]}")
            continue
        texts[pdf.name] = text
        pages = len(PdfReader(pdf).pages)
        if len(text.strip()) < MIN_CHARS:
            print(f"  [EMPTY] {pdf.name:<48} {len(text):>6} chars - scanned image?")
        else:
            extractable += 1
            print(f"  [OK]    {pdf.name:<48} {len(text):>6} chars, {pages} pages")

    print(f"\n{extractable}/{len(pdfs)} have a usable text layer.")

    print("\n--- Required clauses ---")
    missing = []
    for filename, label, variants in REQUIRED_CLAUSES:
        text = texts.get(filename)
        if text is None:
            print(f"  [NO FILE] {label:<38} ({filename})")
            missing.append((filename, label))
            continue
        haystack = re.sub(r"\s+", " ", text).lower()
        if any(re.sub(r"\s+", " ", v).lower() in haystack for v in variants):
            print(f"  [OK]      {label:<38} {filename}")
        else:
            print(f"  [MISSING] {label:<38} {filename}")
            missing.append((filename, label))

    print()
    if missing:
        print(f"{len(missing)} required clause(s) not found. Conflict detection")
        print("will silently find nothing for these. Check the wording in the PDF")
        print("against the corpus build list before ingesting.\n")
        return 1

    print("All required clauses present. Corpus is ready to ingest.\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
