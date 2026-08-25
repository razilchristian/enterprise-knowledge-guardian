# Deck Edits & Master Demo Script

**Every question in this script was run against the live deployment on
26 August 2026 and the stated result is what actually came back.** Do not
change a question without re-running it — the previous version of this file
opened with a data-retention question that had since been resolved by a
unified policy, and would have shown a green "sources agree" answer at the
exact moment the script promised a red four-way conflict.

---

## Part A: Pending Deck Edits

### Slide 13 — Replace entirely

> ## One Company, One Truth
>
> The Employee Handbook says return your laptop within 5 business days.
> IT Procurement says the final day of employment — with a payroll deduction
> after 24 hours.
>
> A normal chatbot confidently picks one.
> **NEXORA reports both — and opens a review task for the document owners.**
>
> Search finds a passage. It doesn't tell you whether that passage is still true.

### Slide 14 — Line edit

> Every answer includes the exact section citations it was drawn from. Every
> conflict includes the specific claim from each source. AI recommends; humans
> approve. Nothing is ever auto-changed.

### Slide 15 — Line edit

> **Starter:** ₹499/seat/month (up to 50 docs, 2 agents)
> **Professional:** ₹999/seat/month (200 docs, unlimited queries, 8 agents)
> **Enterprise:** Custom (unlimited, SSO, dedicated deployment)
>
> A 20-seat Professional deployment costs ₹1.92 lakh/year — less than one
> policy incident, and about 5% of a GRC platform.

### Slide 6 — Line edit

> Every role reads every document. Roles are lenses, not gates — they change
> what surfaces first, never what is visible. This is what makes cross-department
> conflict detection possible.

---

## Part B: Setup (Before Going on Stage)

The system is deployed. There is nothing to start.

| | URL |
|---|---|
| Frontend (Vercel) | https://enterprise-knowledge-guardian.vercel.app |
| Backend (Render) | https://nexora-guardian-api.onrender.com |

**T-minus 10 minutes — wake the backend.** Render's free tier sleeps a service
after 15 minutes with no traffic, and the first request after that takes
roughly 50–60 seconds. During that window the dashboard reads "Backend
unavailable", which looks like a crash and is not.

1. Open `https://nexora-guardian-api.onrender.com/api/health`.
   Wait for it. Confirm `"ok": true`, `"mongodb": "connected"`,
   `"vectorIndex": "queryable"`, and that the API keys read `ready`.
2. Open the workspace and ask one throwaway question so the whole path is warm.
3. Leave the tab open. Any request inside 15 minutes keeps it awake, and during
   the demo the frontend itself supplies that traffic.
4. Confirm the green **"All departments searched"** badge in the workspace header.

**Backup:** if the venue's network fails, play the recorded 2-minute demo video.
Do not attempt to run the backend locally on stage.

---

## Part C: Master Demo Script (5 Minutes)

The arc is deliberate: **problem → scale → resolution → honesty → daily use.**
Two red conflicts remain open on purpose. A knowledge base with nothing wrong
in it proves nothing.

### Opening (30 seconds)

> "An employee is leaving. They ask a simple question: when do I have to return
> my laptop? HR's handbook says one thing. IT's procurement policy says
> another — and one of them attaches a payroll deduction. Nobody has ever read
> both documents side by side, because nobody reads other departments' policies.
> Let me show you what our system does with that."

---

### Step 1 — The live conflict (75 seconds) 🔴 HIGH

**Ask:** `What is the equipment return deadline when I leave?`

**Actual result:** High-severity conflict. Employee Handbook v3.2 says *within
five business days of the last working day*; IT Procurement Policy says *no
later than the final day of employment*, with payroll deduction if not returned
within 24 hours. Two departments — Human Resources and Operations.

Point at:
1. The red **conflict** badge and **High** severity.
2. The **two source cards**, each with its department, owner, and a verbatim quote.
3. The citations — every claim traceable to a section.

> "It did not pick one. It cannot pick one — deciding which policy is correct
> has consequences, and that decision belongs to the document's owner. What it
> does is put both claims in front of a named human with the evidence attached."

---

### Step 2 — Not a one-off (60 seconds) 🟡 MEDIUM

**Ask:** `I worked here 500 days and left. When do I get my experience letter?`

**Actual result:** Confirms eligibility (500 days exceeds the 90-day minimum),
then reports the conflict: Employee Separation and Documentation Policy says
**7 working days**, HR Service Standards says **15 working days**.

> "Notice it still answered the employee's question — eligibility confirmed —
> and *then* flagged that the two HR documents disagree on when. This is the
> scenario my mentor described: someone worked here, left, and the new employer
> is waiting on that letter. Which number does HR tell them?"

*(This is the moment the room recognises the problem as real. Take the beat.)*

---

### Step 3 — What resolution looks like (60 seconds) 🟢

**Ask:** `How many casual leave days do I get?`

**Actual result:** Clean answer — **12 days**, citing HR Leave Policy 2026
Unified, and stating that it explicitly supersedes legacy documentation.

> "Three documents used to disagree here: 10 days, 12 days, 15 days. HR issued a
> unified 2026 policy. Nobody told the system which document now wins — it read
> the supersession clause and worked it out. That is the difference between
> a search index and something that understands what it retrieved."

Optionally open **Conflicts** and show the board: **7 resolved, 2 still open.**

> "Nine contradictions found. Seven closed by their owners. Two still open, and
> the system knows whose they are."

---

### Step 4 — Honesty (45 seconds) ⚪

**Ask:** `What is our maternity leave policy?`

**Actual result:** *"Based on the provided policy documents, there is no mention
of a maternity leave policy."* Citations: **empty**.

> "This is the answer most AI tools get wrong. Ask a general-purpose assistant
> about a policy that doesn't exist and it will write you a plausible one.
> Ours returns nothing, and cites nothing, because there was nothing to cite."

**Invite the challenge:** *"Ask it anything you like — including something
completely outside our documents."*

Verified refusals, all with empty citations: capital of France · write a Python
function · annual bonus amount · permanent work from another country · pet
adoption policy.

---

### Step 5 — Everyday use (30 seconds) 🟢

**Ask:** `How do I request time off?`

**Actual result:** Straight procedural answer — submit through the HR portal at
least five business days in advance, routed to your direct manager.

> "And most days, it is simply this. A question, an answer, and the sections it
> came from. The conflict detection runs whether or not there is a conflict —
> you just don't see it when there isn't one."

---

### Close (30 seconds)

> "Enterprise search finds a passage. It does not tell you whether that passage
> is still true, or whether another department contradicts it. That gap is where
> policy incidents come from, and it is the entire product.
> One company, one truth."

---

## Part D: Anticipated Judge Q&A

| Question | Answer |
|----------|--------|
| **"Did you train a model on your documents?"** | "No — and that's the advantage. It's retrieval-augmented: the question is embedded, the closest passages are pulled from the vector index, and the model answers using only those. Adding a policy takes 30 seconds. Fine-tuning would mean retraining every time a document changes." |
| **"Isn't open access a security risk?"** | "Only policy documents are indexed — no salaries, no personnel files, no personal data. Within a company, everyone should be able to read the policies that apply to them. Hidden policies mean hidden contradictions, and cross-department detection is impossible if departments can't see each other." |
| **"What stops someone editing a policy?"** | "Reading is open; writing and approving are not. Write access requires the Department Owner role, approval requires the owner or a Director. AI recommends resolutions; humans approve. Nothing is ever auto-changed." |
| **"How is this different from ChatGPT with file upload?"** | "ChatGPT gives you a confident answer. If your sources disagree, it silently picks one. We check whether the sources agree with each other *before* answering, and report the disagreement instead of hiding it. That layer is the product." |
| **"What if a question is outside your documents?"** | "It says so and cites nothing — we tested that. Honest caveat: there's no similarity threshold in retrieval, so the vector search always returns its top 8 passages. The grounding comes from the prompt instruction, and it held on every off-corpus question we tried. A score threshold is the next hardening step." |
| **"How does it know a policy superseded another?"** | "The newer master policies carry an explicit supersession clause. When one is retrieved alongside the documents it replaces, the system treats it as authoritative, answers cleanly, and keeps the legacy contradiction on the board as cleanup work rather than pretending it vanished." |
| **"What about scale?"** | "Atlas vector search handles millions of 768-dimension embeddings, and cost scales with questions asked, not corpus size — the LLM call happens once per question, not once per document. Honest limit today: we're on free tiers. The Gemini keys are pooled with backoff for resilience, but they're on one Google account, so they share a quota — that's redundancy against a failing key, not extra throughput." |
| **"Why is it slow the first time?"** | "Render's free tier sleeps idle services. A paid instance removes it entirely — it's a hosting-plan limitation, not an architecture one." |

---

## Part E: Verified Question Bank

Safe to use live. Every one confirmed on the deployed system, 26 August 2026.

**Open conflicts — will show red:**
- What is the equipment return deadline when I leave? → 🔴 High
- When will I receive my experience letter? → 🟡 Medium
- I worked here 500 days and left. When do I get my experience letter? → 🟡 Medium

**Resolved by a unified policy — will show green:**
- How many casual leave days do I get? → 12 days
- How many paid time off days do I get? → 12 CL + 15 PTO
- What is our data retention period? → 36 months
- What is the vendor liability cap? → 2× annual contract value
- How often are performance reviews conducted? → semi-annual
- How quickly must a security incident be reported? → 15 minutes (P1/P2)

**Plain answers, no conflict:**
- How do I request time off?
- What is the company code of conduct?

**Correctly refused, empty citations:**
- What is our maternity leave policy?
- How much annual bonus do employees get?
- Can I work permanently from another country?
- What is our company pet adoption policy?
- What is the capital of France?
- Write me a Python function to sort a list
