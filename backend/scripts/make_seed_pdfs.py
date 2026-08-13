"""Generate the Tier-1 demo PDFs from scripts/seed_documents.py.

    python -m scripts.make_seed_pdfs

Writes real text-layer PDFs (not images) into backend/data/seed/, so the
extractor can read them. Safe to re-run; it overwrites.
"""

import sys
from pathlib import Path

from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer

from scripts.seed_documents import DOCUMENTS

OUT_DIR = Path(__file__).resolve().parent.parent / "data" / "seed"


def _styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "DocTitle", parent=base["Title"], fontName="Times-Bold",
            fontSize=22, leading=26, spaceAfter=6,
        ),
        "meta": ParagraphStyle(
            "Meta", parent=base["Normal"], fontName="Helvetica",
            fontSize=9, leading=13, textColor="#555555", spaceAfter=2,
        ),
        "heading": ParagraphStyle(
            "SectionHeading", parent=base["Heading2"], fontName="Times-Bold",
            fontSize=13, leading=16, spaceBefore=16, spaceAfter=6,
        ),
        "body": ParagraphStyle(
            "Body", parent=base["BodyText"], fontName="Times-Roman",
            fontSize=11, leading=16, alignment=TA_JUSTIFY, spaceAfter=9,
        ),
    }


def build(doc_spec: dict, styles: dict) -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / doc_spec["filename"]

    pdf = SimpleDocTemplate(
        str(path),
        pagesize=A4,
        leftMargin=2.5 * cm, rightMargin=2.5 * cm,
        topMargin=2.5 * cm, bottomMargin=2.5 * cm,
        title=doc_spec["title"],
        author="Acme Corporation",
    )

    flow = [
        Paragraph("ACME CORPORATION", styles["meta"]),
        Paragraph(doc_spec["title"], styles["title"]),
        Paragraph(f"Version {doc_spec['version']}", styles["meta"]),
        Paragraph(f"Owner: {doc_spec['owner']}", styles["meta"]),
        Paragraph(f"Department: {doc_spec['department']}", styles["meta"]),
        Paragraph("Internal document. Readable by all employees.", styles["meta"]),
        Spacer(1, 0.8 * cm),
    ]

    for number, heading, paragraphs in doc_spec["sections"]:
        # The section label must survive into the extracted text -- citations
        # in the UI point at these, e.g. "Employee Handbook v3.2 §7.3".
        flow.append(Paragraph(f"&sect;{number} &mdash; {heading}", styles["heading"]))
        for text in paragraphs:
            flow.append(Paragraph(text, styles["body"]))

    pdf.build(flow)
    return path


def main() -> int:
    styles = _styles()
    print(f"\nWriting to {OUT_DIR}\n")

    for spec in DOCUMENTS:
        path = build(spec, styles)
        size_kb = path.stat().st_size / 1024
        print(f"  [OK] {path.name:<45} {size_kb:6.1f} KB")

    print(f"\n{len(DOCUMENTS)} documents written.")
    print("These carry the contradictions the conflict engine must find:")
    print("  casual leave     10 (Handbook) vs 12 (Leave Policy) vs 15 (Manager Guide)")
    print("  equipment return 5 days (Handbook) vs same-day (IT Procurement)")
    print("  PTO              15 (Handbook) vs 18 (Onboarding Checklist)")
    print("  review cadence   annual (Handbook) vs twice yearly (Review Framework)\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
