# Tasks 10 & 11 — Deck Edits & Demo Script

---

## Part A: Pending Deck Edits

### Slide 13 — Replace entirely

**Old:** (whatever was there)

**New:**

> ## One Company, One Truth
>
> Your Employee Handbook says 10 casual leave days.
> Your HR Leave Policy says 12.
> Your Manager Guide says 15.
>
> A normal chatbot confidently picks one.
> **NEXORA reports all three — and opens a review task for the document owner.**
>
> Search finds a passage. It doesn't tell you whether that passage is still true.

### Slide 14 — Line edit

Add after the current content:

> Every answer includes the exact section citations it was drawn from. Every
> conflict includes the specific claim from each source. AI recommends; humans
> approve. Nothing is ever auto-changed.

### Slide 15 — Line edit

Replace the "seat-based SaaS, tiers proposed" placeholder with:

> **Starter:** $8/seat/month (up to 50 docs, 2 agents)
> **Professional:** $15/seat/month (200 docs, unlimited queries, 8 agents)
> **Enterprise:** Custom (unlimited, SSO, dedicated deployment)
>
> A 20-seat Professional deployment costs $2,880/year — less than one policy incident.

### Slide 6 — Line edit

Remove any language implying per-user access control or role-based document
filtering. Replace with:

> Every role reads every document. Roles are lenses, not gates — they change
> what surfaces first, never what is visible. This is what makes cross-department
> conflict detection possible.

### Full deck review checklist

After applying edits, scan the entire deck for:
- [ ] Any slide still implying document-level access control
- [ ] Any slide promising features that are not in the demo
- [ ] Any pricing without actual numbers
- [ ] Any architecture description that contradicts PROJECT.md §3

---

## Part B: Demo Script

### Setup (Before Going on Stage)

1. Open **Terminal 1** and start the backend:
   ```
   cd nexora/backend
   .\.venv\Scripts\python.exe -m uvicorn app.api:app --port 8000
   ```
2. Open **Terminal 2** and start the frontend:
   ```
   cd nexora
   npm run dev
   ```
3. Open Chrome to `http://localhost:3000/workspace`
4. Verify the green **"All departments searched"** badge appears in the header
5. If it shows **"Backend offline"** in red, the backend didn't start — fix before going on

### Fallback Plan

If the network is dead or Gemini is down:
- Have **screenshots** of each demo step saved as a PDF
- Narrate over the screenshots: "Here is what the system returns when connected"
- The screenshots should show the actual three-way conflict result

---

### Script: 5 minutes

#### Opening (30 seconds)

> "Let me show you a real problem. Your Employee Handbook says employees get 10
> casual leave days. Your HR Leave Policy says 12. Your Manager Guide says 15.
> A new hire asks their manager, the manager checks one document, and gives a
> confident wrong answer. NEXORA catches that before it happens."

#### Demo Step 1: The Headline (90 seconds)

**Type into the workspace:** `How many casual leave days do I get?`

**Wait for the result.** Talk while it loads:

> "The system is now searching every department's documents simultaneously — HR,
> Legal, Engineering, Security, all of them. It's not just finding an answer;
> it's checking whether the sources agree with each other."

**When the result appears:** Point out:

1. The **"Conflict Detected"** badge in red (not "Sources agree" in green)
2. The **three source cards** showing 10 / 12 / 15 days, each with the exact
   document name and section number
3. The **severity** (High Risk) and **recommended resolution**
4. The **citations** in the right Evidence panel

> "Three documents, three different numbers. A normal chatbot would confidently
> say one of these. NEXORA refuses to guess — it reports all three and tells you
> which documents need to be reconciled."

#### Demo Step 2: Cross-Department (60 seconds)

**Type:** `What is our data retention period?`

**When the result appears:**

> "This one is harder to catch manually. Legal's Data Processing Agreement says
> 36 months. Security's Incident Response Playbook says 60 months. Two different
> departments, two different retention periods. Under GDPR, that's not just
> inconsistent — it's a compliance risk. NEXORA finds it automatically because
> it searches across departments, not within one."

#### Demo Step 3: No Conflict (45 seconds)

**Type:** `How do I request time off?`

**When the result appears:**

> "Not everything is a conflict. Here, all sources agree on the process — submit
> through the HR portal, get manager approval. The green 'Sources agree' badge
> means you can trust this answer. The difference is: NEXORA earned that trust by
> checking, instead of assuming."

#### Demo Step 4: Role Switcher (45 seconds)

**Click the role switcher** in the top bar. Switch from Employee to Department Owner
to Director.

> "Notice what changes and what doesn't. The dashboard prioritizes different
> departments. But the answer to the same question is identical — because in
> NEXORA, roles are lenses, not gates. Every person and the CEO get the same
> truth. That's what makes conflict detection work."

#### Close (30 seconds)

> "Search finds a passage. It doesn't tell you whether that passage is still
> true. NEXORA does — and when it isn't, it tells you exactly which documents
> disagree and who needs to fix them. One company, one truth."

---

### Anticipated Judge Questions & Answers

| Question | Answer |
|----------|--------|
| **"Isn't open access a security risk?"** | "Only policy documents are indexed — no salaries, no personnel files, no personal data. Within a company, everyone should be able to read the policies that apply to them. The risk is in *not* sharing: hidden policies mean hidden contradictions." |
| **"What stops someone editing a policy?"** | "Write access requires the Department Owner role. Approval requires the owner or a Director. AI recommends resolutions; humans approve. Nothing is ever auto-changed." |
| **"How is this different from ChatGPT with file upload?"** | "ChatGPT gives you a confident answer. If the sources disagree, it picks one and doesn't tell you. NEXORA checks whether the sources agree with each other *before* answering. That one extra step — the conflict check — is the entire product." |
| **"What happens when it's wrong?"** | "Every answer includes the exact citations it was drawn from. You can click through to the source section and verify. If the AI misidentifies a conflict, the human reviewer dismisses it. The system is designed to over-report conflicts rather than miss them." |
| **"Can it handle more than PDFs?"** | "The extraction layer is modular. Today it uses pypdf for PDFs. Adding DOCX, Markdown, or Confluence page extraction is straightforward — the chunking, embedding, and conflict detection pipeline is format-agnostic." |
| **"What about scale?"** | "MongoDB Atlas vector search is designed for millions of vectors. Our 768-dimension embeddings are deliberately compact. The bottleneck at scale would be LLM rate limits, which we handle with retry logic and backoff." |
| **"Why not use a commercial RAG platform?"** | "Commercial RAG platforms answer questions. They don't check whether the answer is internally consistent. The conflict detection layer is what makes NEXORA a product, not just a pipeline." |
