# Nexora — Enterprise Knowledge Guardian

**Master context document.** Paste this whole file into a new AI session to restore
full project context, or read it to get oriented. Keep it updated as things change.

---

## 1. What this is

An AI platform that answers questions from a company's policy documents — and, when
those documents contradict each other, **refuses to pick a winner** and reports the
conflict instead.

The one-sentence pitch: *"Search finds a passage. It doesn't tell you whether that
passage is still true."*

**The demo that carries everything:** ask "how many casual leave days do I get?" The
Employee Handbook says 10, the HR Leave Policy says 12, the Manager Guide says 15.
A normal chatbot confidently picks one. Nexora reports all three with citations and
opens a review task for the document owner.

### Competition context

Startup & Innovation Expo, **Problem 03 — Enterprise Workflow Automation, Document
Analysis & RAG AI Agents**. Deadline **24 August 2026**.

Six graded deliverables. Only the first is code:

| # | Deliverable | Status |
|---|---|---|
| 1 | Working RAG document Q&A demo | **Done** (backend; not yet wired to UI) |
| 2 | Vector DB & LLM pipeline architecture diagram | Not started |
| 3 | Enterprise security & secret key handling plan | Partly done in code, not written up |
| 4 | Target customer definition | Implied by deck, not written up |
| 5 | Data privacy & compliance plan | Not started |
| 6 | Pitch covering seat-based SaaS pricing | Deck says "proposed", no numbers |

Because five of six are documents, do not let backend polish consume the remaining
time. The working demo is one deliverable, not the whole grade.

---

## 2. Non-negotiable product decisions

### Open knowledge — no access control

The mentor directed that **every department can read every other department's
policies**, and that this be one uniform platform for all roles. This is not a
shortcut, it is the architecture:

> Cross-document conflict detection only has value if people can see across
> documents. Hiding HR's handbook from Legal hides the contradiction too.

Concretely:

- **Read** — open to everyone. No permission filter on retrieval, ever.
- **Write** — restricted to the owning department.
- **Approve** — owner, or Director for org-wide changes.

`retrieval.search()` deliberately has no user parameter. If you find yourself adding
one to decide what someone may *see*, the answer is: they may see everything.
`department` exists as a display filter only.

Scope note: the platform indexes **policy documents only** — no salaries, no
performance reviews, no personnel files. That is what makes open read defensible,
and it is the answer to "isn't that a security risk?"

### Roles are lenses, not gates

| Role | Covers | Reads | Approves |
|---|---|---|---|
| Employee | Support staff, associates, engineers, new hires | Everything | Nothing |
| Department Owner | HR lead, General Counsel, Eng lead, Security lead | Everything | Own department |
| Director | CEO, Director, VP | Everything | Org-wide |

Switching role changes what surfaces first, never what is visible. The top-bar role
switcher exists to demonstrate exactly this on stage.

### AI recommends, humans approve

Nothing is ever auto-changed. A detected conflict becomes a review task with
evidence attached, which a named human accepts, edits, or rejects.

---

## 3. Architecture

```
Browser (Next.js)  ->  FastAPI  ->  MongoDB Atlas  (documents + vectors)
                                ->  Gemini API     (embeddings + reasoning)
```

**The browser never talks to MongoDB or Gemini directly.** All secrets stay
server-side in `backend/.env`. This is deliberate and is also deliverable #3.

### The pipeline

Setup, once:
1. **Extract** — pypdf pulls text from each PDF
2. **Chunk** — split on the documents' own headings (`§4.2 — Casual Leave
   Entitlement`), not a fixed character count, so each chunk is one coherent idea
   and its heading becomes the citation
3. **Embed** — each chunk becomes a 768-number vector via Gemini
4. **Store** — chunk text + vector into MongoDB

Per question:
5. **Embed the question** (with `RETRIEVAL_QUERY` task type, not `RETRIEVAL_DOCUMENT`)
6. **Vector search** — Atlas `$vectorSearch` returns the 8 closest chunks
7. **Answer** — Gemini answers using only those chunks, with citations
8. **Conflict check** — *the differentiator*. Do these chunks contradict each other
   on the point asked? If so, report every claim tied to its source.

Step 8 is one extra LLM call with a different prompt. The differentiator is not
technically hard — it is that nobody else thought to do it.

---

## 4. Current state — verified working

### Backend: complete and tested

```
backend/
  .env                     SECRETS, gitignored. Mongo URI + GEMINI_API_KEY
  .env.example             committed template, no values
  requirements.txt
  app/
    config.py              env loading, collection names, model names, EMBED_DIM
    db.py                  shared MongoClient
    extract.py             PDF -> text -> heading-aware chunks
    embeddings.py          Gemini embeddings + L2 normalization
    retrieval.py           Atlas $vectorSearch
    catalog.py             filename -> (department, owner)
    guardian.py            answer generation + conflict detection
  scripts/
    check_connection.py    verify Atlas reachable
    validate_corpus.py     verify PDFs extractable + clauses present
    ingest.py              extract -> chunk -> embed -> store
    create_index.py        create the Atlas vector index
    search.py              CLI semantic search
    ask.py                 CLI full pipeline
    seed_documents.py      fallback corpus content
    make_seed_pdfs.py      renders fallback corpus to PDF
  data/seed/               6 generated fallback PDFs
```

**Database state:** 21 documents, 120 chunks, vector index
`chunk_embedding_index` live and queryable. `conflicts`, `review_tasks`, `users`,
`activity` collections are declared but still empty — nothing persists conflicts yet.

**Corpus:** `../enterprisepdf/` (outside the repo) holds all 21 real PDFs, written
by a teammate. All 21 have extractable text layers; all 14 conflict-critical clauses
verified present with exact wording.

### Frontend: complete but disconnected

Next.js 16 app, 16 pages, all building clean. **Every number in it is mock data
from `src/data/index.ts`.** Nothing calls the backend yet.

Key files: `src/lib/persona.tsx` (role context), `src/components/layout/persona-switcher.tsx`,
`src/app/(dashboard)/workspace/page.tsx` (the chat UI to wire up first),
`src/app/(dashboard)/security/page.tsx` (Trust Center).

---

## 5. Commands that work

All backend commands run from `nexora/backend/` using the venv Python:

```bash
./.venv/Scripts/python.exe -m scripts.check_connection
./.venv/Scripts/python.exe -m scripts.validate_corpus "../../enterprisepdf"
./.venv/Scripts/python.exe -m scripts.ingest "../../enterprisepdf"
./.venv/Scripts/python.exe -m scripts.create_index
./.venv/Scripts/python.exe -m scripts.search "how many casual leave days do I get"
./.venv/Scripts/python.exe -m scripts.ask "how many casual leave days do I get"
```

Frontend, from `nexora/`:

```bash
npm run dev        # localhost:3000
npm run build
```

### Verified behaviour

| Question | Result |
|---|---|
| "how many casual leave days do I get" | 3-way conflict: 10 / 12 / 15 |
| "what is the vendor liability cap" | conflict: 2x vs 1x (Legal) |
| "what is our data retention period" | cross-dept conflict: 36 vs 60 months (Legal vs Security) |
| "how do I request time off" | answered, correctly no conflict |
| "what is the company code of conduct" | answered, correctly no conflict |

---

## 6. Decisions with non-obvious reasons

**Embeddings at 768 dimensions, not the default 3072.** A quarter of the storage on
a 512 MB free cluster, ample quality at this corpus size. Critically, Gemini
*truncates* rather than re-normalizing for reduced dimensions, so vectors arrive
with an L2 norm around 0.59 — `embeddings.py` normalizes before storing.
**`config.EMBED_DIM` must equal `numDimensions` in the Atlas index.** If they
disagree, every search silently returns nothing, with no error.

**`CHAT_MODEL` is an alias (`gemini-flash-latest`), not a pinned version.** Google
retired `gemini-2.5-flash` for new API keys *during* this build. With a fixed demo
date, an auto-updating alias is the safer failure mode. `gemini-3-flash-preview` is
configured as fallback.

**Retries with backoff on 429/503.** The Gemini free tier returns 503 under load and
429 on quota. Both are transient and both would otherwise read as a dead demo.

**Conflicts hold a list of claims, not a pair.** The headline case has three sources;
a `documentA`/`documentB` model physically cannot represent it. *(The frontend
`Conflict` type in `src/types/index.ts` is still pairwise and needs this fix.)*

**Conflict materiality is enforced in the prompt.** An early version derailed
procedural questions — asked how to *submit* a leave request, it abandoned the
question to report the entitlement disagreement. A conflict is now only raised when
it changes the answer to what was actually asked.

**Chunking splits on document headings, not character counts.** Coherent chunks
embed better, and the heading becomes the citation string the UI displays.

---

## 7. Known issues

- **Frontend is entirely mock data.** No API calls exist yet.
- **`Conflict` type is pairwise** in `src/types/index.ts` — cannot hold the 3-way
  demo. The conflict detail page papers over this with a hardcoded "a third source
  is also affected" note.
- **Detected conflicts are not persisted.** `guardian.ask()` returns them; nothing
  writes to the `conflicts` collection.
- **Content bug:** the Employee Handbook PDF has a stray editorial parenthetical
  baked into a real heading — "§7.3 — Paid Time Off (same section, separate
  paragraph)". Cosmetic, but visible in citations.
- **Weak DB password** (`Owap0tU1yPA8bLxk`) combined with Network Access `0.0.0.0/0`.
  Fake data, so low stakes, but the practical risk is someone wiping the cluster
  before the demo.
- **Gemini API key is exposed** in a chat transcript. Rotate after the expo.
- **Pre-existing lint error** in `src/components/ui/command-palette.tsx:82`
  (setState in effect). Harmless, predates this work.
- **Repo root is `nexora/`**, so the backend lives at `nexora/backend/` while the
  frontend sits at `nexora/src/`. Slightly odd; works fine.

---

## 8. What to do next, in order

1. **FastAPI endpoints** — wrap `guardian.ask()` in `POST /api/ask`, plus
   `GET /api/documents` and `GET /api/conflicts`. Enable CORS for localhost:3000.
2. **Wire the workspace page** — replace the mock `handleSubmit` in
   `src/app/(dashboard)/workspace/page.tsx` with a real call to `/api/ask`. This
   turns a terminal demo into a clickable one.
3. **Fix the `Conflict` type** to hold N claims, then render the 3-way case properly.
4. **Persist conflicts** to MongoDB so the conflicts page shows real detections.
5. **Architecture diagram** (deliverable 2) — quick now, describes something real.
6. **The three written plans** (deliverables 3, 4, 5).
7. **Pricing model with actual numbers** (deliverable 6), and the deck edits.
8. **Rehearse.** Leave real buffer.

### Deck edits still pending

Slide 13 replaced entirely with "One Company, One Truth"; slides 14, 15, 6 have
line edits. Full copy is written up and ready to paste.

---

## 9. Working agreements

- **Commit and push after each working piece.** The whole dashboard sat uncommitted
  for a while; do not repeat that.
- **Never commit `.env`.** `.gitignore` covers `.env*` with a `!.env.example`
  exception. Verify before every commit.
- **Never paste secrets into a chat.** Put them in `backend/.env` and say "it's in."
- **Explain as you go.** The project owner is learning this stack; a working system
  they cannot explain to a judge is a failed deliverable.
