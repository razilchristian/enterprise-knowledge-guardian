# Tasks 10 & 11 — Deck Edits & Master Demo Script

---

## Part A: Pending Deck Edits

### Slide 13 — Replace entirely

> ## One Company, One Truth
>
> Legal says retain data for 36 months.
> Operations says retain for 5 years.
> Security says retain for 60 months.
> HR says retain for 7 years.
>
> A normal chatbot confidently picks one.
> **NEXORA reports all four — and opens a review task for the document owners.**
>
> Search finds a passage. It doesn't tell you whether that passage is still true.

### Slide 14 — Line edit

> Every answer includes the exact section citations it was drawn from. Every
> conflict includes the specific claim from each source. AI recommends; humans
> approve. Nothing is ever auto-changed.

### Slide 15 — Line edit

> **Starter:** $8/seat/month (up to 50 docs, 2 agents)
> **Professional:** $15/seat/month (200 docs, unlimited queries, 8 agents)
> **Enterprise:** Custom (unlimited, SSO, dedicated deployment)
>
> A 20-seat Professional deployment costs $2,880/year — less than one policy incident.

### Slide 6 — Line edit

> Every role reads every document. Roles are lenses, not gates — they change
> what surfaces first, never what is visible. This is what makes cross-department
> conflict detection possible.

---

## Part B: Master Demo Script (5 Minutes)

### Setup (Before Going on Stage)

1. Open **Terminal 1** and start the backend:
   ```bash
   cd nexora/backend
   .\.venv\Scripts\python.exe -m uvicorn app.api:app --port 8000
   ```
2. Open **Terminal 2** and start the frontend:
   ```bash
   cd nexora
   npm run dev
   ```
3. Open Chrome to `http://localhost:3000/workspace`
4. Verify the green **"All departments searched"** badge appears in the header.
5. Check backend health at `http://localhost:8000/api/health` (`ok: true`, 5/5 API keys ready).

---

### Demo Flow Script

#### Opening (30 seconds)

> "Let me show you a real enterprise problem. A customer asks how long their personal data is retained. 
> Legal checks the Data Processing Agreement (36 months). 
> Operations checks the Enterprise Security Policy (5 years). 
> Security checks the Incident Playbook (60 months). 
> HR checks the Separation Policy (7 years). 
> A traditional chatbot picks one at random and gives a confident, legally risky answer. 
> NEXORA catches the contradiction before it becomes a GDPR fine."

---

#### Demo Step 1: The 4-Department Cross-Dept Conflict (90 seconds)

**Type into the workspace:** `how long do we retain personal data`

**When the result appears:** Point out:
1. The 🔴 **"Conflict Detected"** badge in red.
2. The **4 source cards** across 4 distinct departments: Legal (36 mo), Operations (5 yrs), Security (60 mo), HR (7 yrs).
3. The **High Risk** severity and **recommended resolution**.
4. The exact section citations in the Evidence panel.

> "Four departments, four different policies. No single department head could have caught this because nobody reads other departments' docs. NEXORA finds it automatically because it operates on an open-knowledge model — searching across departments, not within silos."

---

#### Demo Step 2: The Employee Eligibility Scenario (60 seconds)

**Type into the workspace:** `I worked here 500 days and left. When do I get my experience letter?`

**When the result appears:**

> "Here is an employee who worked 500 days. NEXORA correctly confirms eligibility (>90 days service required), but flags an unresolved operational conflict: 
> The Employee Separation Policy promises issuance within **7 working days**, while HR Service Standards specifies **15 working days**. 
> NEXORA answers the employee while opening a cleanup task for HR."

---

#### Demo Step 3: Conflict Lifecycle & Policy Supersession (45 seconds)

**Type into the workspace:** `How many casual leave days do I get?`

**When the result appears:** Point out the 🟢 **"Sources agree"** green badge and the **12 Days** answer.

> "This is what happens after an enterprise fixes a conflict. When a company issues the new 2026 Unified HR Policy, NEXORA automatically recognizes that it explicitly supersedes old legacy handbooks (which said 10 or 15 days). It delivers a clean, authoritative answer to the employee while queuing a **SUPERSEDED RISK** cleanup card for HR."

---

#### Demo Step 4: Role Switcher & Human-in-the-Loop Governance (45 seconds)

**Click the role switcher** in the top navigation bar. Switch from **Employee** to **Sarah Chen (Department Owner)** and navigate to `http://localhost:3000/conflicts`.

> "Notice how roles work: roles are lenses, not gates. Everyone sees the exact same corporate truth. As HR Lead, Sarah Chen can review the conflict, click **Accept Change**, or upload a new master PDF. Everything is logged in an immutable audit trail."

---

#### Close (30 seconds)

> "Standard enterprise search finds a passage — it doesn't tell you if that passage is still true or contradicts another department's policy. NEXORA does. One company, one truth."

---

## Anticipated Mentor / Judge Q&A

| Question | Answer |
|----------|--------|
| **"Isn't open access a security risk?"** | "Only policy documents are indexed — no salaries, no personnel files, no personal data. Within a company, everyone should be able to read the policies that apply to them. Hidden policies mean hidden contradictions." |
| **"What stops someone editing a policy?"** | "Write access requires the Department Owner role. Approval requires the owner or a Director. AI recommends resolutions; humans approve. Nothing is ever auto-changed." |
| **"How is this different from ChatGPT with file upload?"** | "ChatGPT gives you a confident answer. If sources disagree, it picks one silently. NEXORA checks whether sources agree with each other *before* answering. That conflict detection layer is the entire product." |
| **"What happens when a document supersedes an old one?"** | "NEXORA's reasoning prompt detects explicit supersession clauses in newer 2026 master policies, resolves the user query cleanly with 🟢 'Sources agree', and logs a 'Superseded Risk' card for document archival." |
| **"What about scale?"** | "MongoDB Atlas vector search is built for millions of 768-dim embeddings. We maintain a pool of 5 API keys with exponential backoff for high throughput." |
