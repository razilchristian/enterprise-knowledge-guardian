# Master prompt — remaining work

Paste this into a session to continue. It assumes `PROJECT.md` is loaded
(Claude Code loads it automatically via `CLAUDE.md`; elsewhere, paste that first).

---

## Instructions

You are continuing the Nexora / Enterprise Knowledge Guardian project. The RAG
backend works end to end; the frontend is still mock data. Deadline is
**24 August 2026** and five of six graded deliverables are documents, not code.

Work through the tasks below **in order**. For each one:

1. Do the whole task, including its acceptance check.
2. Run the acceptance check and show me the real output. Do not claim something
   works without running it.
3. Commit and push with a message explaining *why*, not just what.
4. Tell me plainly what you did and anything you found that I should know.

Rules that hold throughout:

- **Never add read-side access control.** Every role reads every document. If a
  change would filter documents by who is asking, that is wrong — see PROJECT.md §2.
- **Never commit `.env` or paste secrets into chat.**
- **Explain as you go.** I need to be able to answer a judge's questions about
  how this works; a system I cannot explain is a failed deliverable.
- If a task turns out to be larger than it looks, say so and propose a cut rather
  than silently expanding scope.

---

## TASK 1 — FastAPI endpoints

Create `backend/app/api.py` exposing the working backend over HTTP.

- `POST /api/ask` — body `{"question": str}`, returns `guardian.ask()` as JSON
  including `has_conflict`, `answer`, `citations`, and the full `conflict.claims` list
- `GET /api/documents` — all 21 documents with department, owner, version, page count
- `GET /api/documents/{id}` — one document with its chunk sections
- `GET /api/conflicts` — detected conflicts from MongoDB (empty until Task 4)
- `GET /api/health` — verifies Atlas reachable and the vector index is queryable
- CORS enabled for `http://localhost:3000`

Return proper status codes. A Gemini outage should surface as 503 with a readable
message, not a 500 stack trace.

**Acceptance:** start the server, `curl` each endpoint, show me the real JSON for
`POST /api/ask` with the casual-leave question showing all three claims.

---

## TASK 2 — Wire the workspace page to the real backend

`src/app/(dashboard)/workspace/page.tsx` currently fakes its response in
`handleSubmit`. Replace that with a real `fetch` to `/api/ask`.

- Show a loading state while the request is in flight — it takes several seconds
- Render the real conflict card from `conflict.claims`, not the hardcoded pair
- Render real citations in the evidence panel from the API response
- Handle errors visibly: a failed request must say so, never silently show nothing
- Put the API base URL in `NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:8000`

**Acceptance:** run both servers, ask the casual-leave question in the browser,
screenshot or describe the rendered three-source conflict card. This is the moment
the demo becomes clickable — treat it as the milestone it is.

---

## TASK 3 — Fix the pairwise Conflict type

`src/types/index.ts` has `Conflict` with `documentA`/`documentB`. The headline demo
has **three** sources, so this type cannot represent it. The conflict detail page
currently papers over this with a hardcoded "a third source is also affected" note.

Replace with a `claims: ConflictClaim[]` array matching the backend's shape
(`document`, `section`, `department`, `owner`, `value`, `quote`). Update
`src/data/index.ts` mock conflicts and every page that reads them. Remove the
hardcoded third-source note.

**Acceptance:** `npx tsc --noEmit` and `npx next build` both clean; the conflicts
detail page renders three claims for the casual-leave conflict.

---

## TASK 4 — Persist detected conflicts

`guardian.ask()` returns conflicts but nothing writes them to MongoDB, so the
conflicts page has nothing real to show.

- Write to the `conflicts` collection on detection
- Deduplicate: the same contradiction asked twice must not create two records.
  Key on the sorted set of (document, section) pairs
- Add `status` (`Open` / `In Review` / `Resolved` / `Dismissed`) and `detectedAt`
- Add a `scripts/detect_all.py` that sweeps a list of probe questions to
  pre-populate conflicts before a demo
- Wire `GET /api/conflicts` and the conflicts page to real data

**Acceptance:** run the sweep, show the conflicts collection count, and show the
conflicts page rendering real detections. Confirm re-running does not duplicate.

---

## TASK 5 — Architecture diagram *(deliverable 2)*

"Vector DB and LLM pipeline architecture diagram." Build it as an artifact with
an inline SVG or mermaid diagram — not a photo of a whiteboard.

Must show: browser → FastAPI → MongoDB Atlas + Gemini; the ingestion path
(extract → chunk → embed → store); the query path (embed → vector search →
answer → conflict check); and the trust boundary showing secrets never reaching
the browser.

Label real specifics — `gemini-embedding-001` at 768 dimensions, Atlas
`$vectorSearch`, `chunk_embedding_index`. Generic boxes score badly; this diagram
describes something that actually runs.

**Acceptance:** published artifact URL, readable in both light and dark themes.

---

## TASK 6 — Security & secret key handling plan *(deliverable 3)*

Write it up as an artifact. Cover what the code already does:

- Secrets in `backend/.env`, gitignored, with a committed `.env.example` template
- Browser never holds a key; all provider calls are server-side through FastAPI
- Atlas credentials scoped to one database user
- Key rotation procedure, and honest disclosure that the demo key was exposed
  in a transcript and is rotated post-expo
- What we would add for production: a secrets manager, per-environment keys,
  short-lived credentials, IP allowlisting instead of `0.0.0.0/0`

Be honest about the gap between demo posture and production posture. Judges
respect a team that knows the difference more than one that claims perfection.

---

## TASK 7 — Target customer definition *(deliverable 4)*

Artifact. Who buys this, stated concretely: company size, the departments
(corporate legal, HR, dev teams), the specific person who signs, what they use
today, and what breaks badly enough that they pay. Include the three roles from
PROJECT.md §2 as the users, and be explicit that the buyer and the user differ.

---

## TASK 8 — Data privacy & compliance plan *(deliverable 5)*

Artifact. This one needs care because the open-knowledge model looks, at a glance,
like the *opposite* of a privacy plan. Make the argument properly:

- Read is open **within one tenant**; knowledge crosses departments, never orgs
- Only policy documents are indexed — no personnel files, salaries, or reviews.
  That scope decision is what makes open read defensible
- Write and approve stay governed by named owners; every change is attributed
- Tenant isolation, encryption in transit and at rest, audit trail
- GDPR angle: the system *finds* retention contradictions (36 vs 60 months) rather
  than creating them — a compliance feature, not a risk

Do not pretend access control exists. Argue that removing it was a deliberate
architectural choice with a defined boundary.

---

## TASK 9 — Seat-based pricing *(deliverable 6)*

Slide 15 says "seat-based SaaS, tiers proposed" with no numbers. Produce actual
pricing: three tiers, per-seat monthly prices, what each includes, and the
reasoning tied to value (hours saved per employee, cost of one bad policy
decision). Include a worked example for a named company size.

---

## TASK 10 — Deck edits

Apply the pending edits: slide 13 replaced entirely with "One Company, One Truth",
plus line edits to slides 14, 15 and 6. Copy is already written. Then re-read the
whole deck for anything still implying access control.

---

## TASK 11 — Demo script and rehearsal

Write the stage script: exact questions to type, in order, with the expected
output and what to say over each.

Open with the casual-leave three-way conflict. Follow with the cross-department
retention conflict (Legal 36 months vs Security 60 months), because it proves the
open-knowledge argument. Show the role switcher changing the lens but not the
answer. Include a fallback for a dead network — a recorded clip or screenshots.

Also list the questions judges will ask, with answers: "isn't open access a
security risk", "what stops someone editing a policy", "how is this different
from ChatGPT with file upload", "what happens when it's wrong".

---

## If time runs short

Cut in this order, last first: Task 11 rehearsal is never cut. Tasks 5–9 are
graded deliverables and cannot be cut. Task 4 can be faked with seeded conflict
records. Task 3 can be worked around. **Tasks 1 and 2 are the demo — protect them.**
