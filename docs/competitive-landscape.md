# Competitive Landscape

Slide 8 of the elimination deck, and the evidence for Pillar 1
("Divergence from Alternatives"). Judges will push on this, so the weaknesses
are stated as plainly as the advantages.

---

## The positioning matrix

The market splits on two axes. Everyone competes on the first. Almost nobody
competes on the second.

```
                    ACROSS THE WHOLE CORPUS
                              ▲
                              │
     Glean                    │              ★ NEXORA GUARDIAN
     Microsoft Copilot        │                (compares sources
     Confluence search        │                 against each other)
     Notion AI                │
                              │
  RETRIEVES ────────────────── ┼ ────────────────── VERIFIES
   an answer                  │                   consistency
                              │
     ChatGPT + file upload    │              (nobody here — verifying
     Claude Projects          │               one document against
     "Chat with your PDF"     │               itself has little value)
     tools                    │
                              │
                              ▼
                    ONE DOCUMENT AT A TIME
```

**The whole product is the top-right quadrant.** Every competitor optimises for
producing a confident answer. We optimise for producing a *trustworthy* one,
which sometimes means producing no single answer at all.

---

## Feature comparison

| | ChatGPT + files | Glean / Copilot | GRC platforms | SharePoint / Confluence | **Nexora Guardian** |
|---|---|---|---|---|---|
| Answers questions from documents | ✅ | ✅ | ❌ | Keyword only | ✅ |
| Searches across all departments | ❌ manual upload | ✅ | ❌ | ✅ | ✅ |
| Citations to exact section | Partial | ✅ | N/A | ❌ | ✅ |
| **Detects contradictions between documents** | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Refuses to answer when sources disagree** | ❌ picks one | ❌ picks one | N/A | N/A | **✅** |
| Recognises a superseding policy | ❌ | ❌ | Manual versioning | Manual | ✅ |
| Routes findings to a named owner | ❌ | ❌ | ✅ | ❌ | ✅ |
| Time to first value | Minutes | Weeks | 6–12 months | N/A | **Under 10 minutes** |
| Annual cost (20 users) | ~$4,800 | ~$12,000+ | $100,000+ | Bundled | **$3,600** |

---

## The competitors, honestly assessed

### 1. ChatGPT / Claude with file upload — the real threat

**Why it is dangerous:** it is excellent, nearly free, and already inside every
company. A judge will ask this first, and they should.

**Where it fails:** ask it *"how many casual leave days do I get?"* with three
contradicting handbooks attached and it gives you **one number, confidently**.
It is optimised to be helpful, and picking a plausible answer feels more helpful
than reporting a mess. In an enterprise, that confident wrong number is the
entire failure mode we exist to prevent.

**It also does not persist.** Every conversation starts over. There is no queue
of open contradictions, no owner assigned, no record that anyone was told.

### 2. Enterprise search — Glean, Microsoft Copilot, Notion AI

**Why it is dangerous:** they already search across departments, they have
distribution, and they are far better funded.

**Where it fails:** they are ranking engines. They return the *most relevant*
passage. Relevance is not consistency — the top-ranked passage can be the
outdated one, and nothing in a ranking model notices that passage two
contradicts passage one. Disagreement between sources is not a signal they
compute.

### 3. GRC platforms — ServiceNow, Workiva, LogicGate

**Why it is dangerous:** they own the compliance budget and the CISO
relationship.

**Where it fails:** they track *whether a control exists*, not whether the
documents describing it agree. They are workflow and attestation systems, priced
at $100,000+ with 6–12 month implementations. Our target customer — 200 to 5,000
employees — cannot buy one and does not need one.

### 4. Doing nothing — the actual incumbent

**Most companies have no tool at all.** Contradictions are found when an
employee acts on the wrong policy and someone escalates. Our real competitor is
a Head of HR who believes their documents are consistent because nobody has
proved otherwise.

This is why the demo matters more than the deck: we find a contradiction in a
real corpus in seconds, and the response is not "interesting product" but
"wait, do *we* have that problem?"

---

## Three unfair advantages

1. **We built the verification step, and it costs nothing extra.** Answer and
   contradiction check return in a single model call. Anyone adding this to an
   existing product must re-architect around the idea that the right output is
   sometimes "no answer" — which cuts against everything a chat product is
   optimised for.

2. **Open knowledge is a design decision our competitors cannot copy cheaply.**
   Every enterprise tool ships permission-filtered retrieval because buyers ask
   for it. Permission filtering makes cross-department contradiction detection
   structurally impossible — you cannot compare two documents you cannot see
   together. Retrofitting this means unwinding their security model.

3. **Supersession handling.** When a newer policy explicitly retires older ones,
   Guardian recognises it and stops flagging — while still keeping the stale
   documents queued for cleanup. That is the difference between a tool that gets
   switched off after a month and one that stays useful.

## Three competitor weaknesses to name on stage

1. **Confident single answers over contradictory evidence** — demonstrable live,
   side by side, in under a minute.
2. **No memory of what was found** — a contradiction discovered in a chat window
   dies when the tab closes.
3. **Nobody is accountable** — no owner, no status, no audit trail of who was
   told what and when.

---

## Where a competitor genuinely beats us

Stating this first is stronger than being caught by it.

- **ChatGPT is better at general reasoning** over a document. We are narrower
  by design.
- **Glean has far better connectors.** They index Slack, email, tickets and
  wikis. We currently ingest a folder of PDFs.
- **GRC platforms carry certifications** — SOC 2, ISO 27001 — that we do not
  have and will not have for a year.
- **We have no customers yet.** Every competitor here has real deployments.

Our answer is not that we are better at everything. It is that we are the only
one doing the one thing that makes enterprise knowledge trustworthy: checking
whether the organisation agrees with itself.
