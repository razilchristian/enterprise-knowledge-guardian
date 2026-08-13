"""PDF -> text, and text -> chunks.

Chunking is the step people get wrong. You do not embed a whole document,
because a 3,000-word file has one averaged "meaning" and matches nothing well.
You embed passages.

We split on the documents' own headings -- "4. Casual Leave" and
"§4.2 - Casual Leave Entitlement" -- rather than on a fixed character count.
Two reasons:

  - A section is a coherent idea, so its embedding is coherent too.
  - The heading becomes the citation. When the UI says "HR Leave Policy §4.2",
    that string came from here.

Sections longer than MAX_CHARS are split further on paragraph boundaries, with
the heading repeated so every chunk stays attributable.
"""

import re
from dataclasses import dataclass
from pathlib import Path

from pypdf import PdfReader

MAX_CHARS = 1400
MIN_CHARS = 80

# "§4.2 — Casual Leave Entitlement" or "4. Casual Leave"
HEADING = re.compile(
    r"^\s*(?:§\s*(?P<sec>\d+(?:\.\d+)*)\s*[—\-–]\s*(?P<title>.+)"
    r"|(?P<num>\d+(?:\.\d+)*)\.\s+(?P<name>[A-Z][^\n]{2,60}))\s*$"
)

VERSION = re.compile(r"Version\s+([\d.]+)", re.I)
DOC_ID = re.compile(r"Document\s+([A-Z]{2,}-[A-Z]{2,}-\d+)", re.I)


@dataclass
class Chunk:
    section: str        # "§4.2 — Casual Leave Entitlement", used as the citation
    text: str
    index: int


@dataclass
class ExtractedDoc:
    filename: str
    title: str
    version: str | None
    doc_id: str | None
    page_count: int
    full_text: str
    chunks: list[Chunk]


def read_pdf(path: Path) -> tuple[str, int]:
    reader = PdfReader(path)
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(pages), len(reader.pages)


def _heading_label(match: re.Match) -> str:
    if match.group("sec"):
        return f"§{match.group('sec')} — {match.group('title').strip()}"
    return f"{match.group('num')}. {match.group('name').strip()}"


def _split_long(section: str, body: str, start_index: int) -> list[Chunk]:
    """Break an over-long section on paragraph boundaries, keeping the heading."""
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", body) if p.strip()]
    chunks: list[Chunk] = []
    buffer = ""

    for para in paragraphs:
        if buffer and len(buffer) + len(para) + 1 > MAX_CHARS:
            chunks.append(Chunk(section, f"{section}\n{buffer.strip()}", start_index + len(chunks)))
            buffer = para
        else:
            buffer = f"{buffer}\n{para}" if buffer else para

    if buffer.strip():
        chunks.append(Chunk(section, f"{section}\n{buffer.strip()}", start_index + len(chunks)))
    return chunks


def chunk_text(text: str) -> list[Chunk]:
    lines = text.split("\n")
    sections: list[tuple[str, list[str]]] = []
    current_heading = "Preamble"
    current_lines: list[str] = []

    for line in lines:
        match = HEADING.match(line)
        if match:
            if current_lines:
                sections.append((current_heading, current_lines))
            current_heading = _heading_label(match)
            current_lines = []
        else:
            current_lines.append(line)

    if current_lines:
        sections.append((current_heading, current_lines))

    chunks: list[Chunk] = []
    for heading, body_lines in sections:
        body = "\n".join(body_lines).strip()
        if len(body) < MIN_CHARS:
            continue  # heading with no real content
        if len(body) <= MAX_CHARS:
            # Prepend the heading so the embedding carries the section's topic.
            chunks.append(Chunk(heading, f"{heading}\n{body}", len(chunks)))
        else:
            chunks.extend(_split_long(heading, body, len(chunks)))

    return chunks


def extract(path: Path) -> ExtractedDoc:
    text, page_count = read_pdf(path)
    version = VERSION.search(text)
    doc_id = DOC_ID.search(text)

    return ExtractedDoc(
        filename=path.name,
        title=path.stem,
        version=version.group(1) if version else None,
        doc_id=doc_id.group(1) if doc_id else None,
        page_count=page_count,
        full_text=text,
        chunks=chunk_text(text),
    )
