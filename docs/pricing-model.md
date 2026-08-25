# Deliverable 6 — Seat-Based SaaS Pricing Model

**All figures in Indian rupees.** NEXORA is priced for an India-first
go-to-market, so the currency is not a converted afterthought — the price
points, the acquisition costs, and the value calculations are all built on
Indian salary and vendor rates. Where a cost is genuinely billed in dollars
(Google, MongoDB), that is stated and converted at an assumed **₹85 = $1**.

---

## Pricing Philosophy

NEXORA's pricing is tied to the **value delivered**, not the volume of data
processed. The value is preventing costly policy contradictions — each
contradiction that reaches an employee costs far more in trust damage, HR
escalation, and legal exposure than the annual cost of the software.

---

## Three Tiers

| | **Starter** | **Professional** | **Enterprise** |
|---|---|---|---|
| **Price** | **₹499 / seat / month** | **₹999 / seat / month** | **Custom (~₹1,800 / seat)** |
| **Billed** | Monthly or annually (20% discount) | Monthly or annually (20% discount) | Annual contract |
| **Target** | 200–500 employees | 500–2,000 employees | 2,000+ employees |
| **Document limit** | Up to 50 documents | Up to 200 documents | Unlimited |
| **AI Workspace queries** | 100 / month per seat | Unlimited | Unlimited |
| **Conflict detection** | ✅ Cross-document | ✅ Cross-document + cross-department | ✅ + custom rules |
| **Knowledge health monitoring** | ❌ | ✅ Staleness alerts | ✅ + SLA-based monitoring |
| **AI Agents** | 2 pre-built agents | 8 agents + custom builder | Unlimited + custom |
| **Integrations** | Google Drive, SharePoint | + Slack, Confluence, Jira | + SSO, SCIM, custom |
| **Audit trail** | 30-day retention | 1-year retention | Unlimited retention |
| **Support** | Email (48h response) | Priority email + chat (4h) | Dedicated CSM + SLA |
| **Deployment** | Shared cloud | Shared cloud | Dedicated / on-premise option |

### Why not simply convert a dollar price?

A US-priced product converted at ₹85 would land at ₹680 and ₹1,275 per seat.
That is close to where we landed, but arriving there by conversion would be an
accident. The Indian numbers are set against Indian alternatives: an HR or
legal hour costs ₹4,000–8,000 fully loaded here, not $200–500. Pricing above
what the saved hour is worth locally is how imported SaaS pricing fails in
this market.

---

## The Seat Model

Not every employee needs a seat. The primary users are:

- **Department Owners** who review conflicts and approve resolutions (5–15 seats)
- **Directors** who see cross-department issues (3–5 seats)
- **Power users** (legal analysts, HR coordinators) who query policies daily (5–20 seats)

A typical 800-person company needs **15–30 seats**, not 800. Everyone in the
company can still *read* every document — the open-knowledge model is the
product — but a seat is what you buy to review, approve, and be accountable.

---

## Why These Prices? The Cost Comparison

| Scenario | Cost without NEXORA | Cost with NEXORA |
|----------|-------------------|-----------------|
| **One policy contradiction reaches an employee** | ₹75,000–3,00,000 (HR escalation, legal review, remediation, trust damage) | ₹0 (caught before it reaches anyone) |
| **Annual manual policy review** | ₹1.6–6.4 lakh (40–80 hours × ₹4,000–8,000/hr fully loaded) | Continuous, automated |
| **Audit finding for inconsistent policies** | ₹2–15 lakh (remediation + compliance penalties) | Prevented |
| **GRC platform (ServiceNow, Workiva)** | ₹40 lakh+/year + 6–12 month implementation | ₹1.9–3.6 lakh/year for a 20-seat team |

### The number that actually sells this

The largest single exposure in our own demo corpus is not an HR inconvenience.
It is the **vendor liability cap**: one document said 1× annual contract value,
another said 2×. On a ₹5 crore contract, signing the wrong one is a **₹5 crore
difference in exposure** — roughly 260× the annual cost of the Professional
tier for that entire company.

Hours saved is the comfortable argument. Risk avoided is the real one.

---

## Worked Example: Acme Corp (800 employees)

### Professional tier, 20 seats

| Line item | Calculation | Amount |
|-----------|------------|--------|
| Monthly cost | 20 seats × ₹999 | **₹19,980 / month** |
| Annual cost (monthly billing) | ₹19,980 × 12 | **₹2,39,760 / year** |
| Annual cost (annual billing, 20% off) | ₹2,39,760 × 0.80 | **₹1,91,808 / year** |

### Value delivered

| Metric | Without NEXORA | With NEXORA |
|--------|---------------|-------------|
| Policy contradictions discovered per year | 2 (by accident) | 8+ (proactively) |
| Time to discover a contradiction | 3–14 months | < 1 day |
| Annual policy review cost | ₹3,00,000 (legal + HR hours) | ₹50,000 (review findings only) |
| Cost of one escalated contradiction | ~₹1,50,000 | ₹0 (prevented) |

### ROI calculation

```
Annual savings:
  Policy review time saved:               ₹2,50,000
  Prevented escalations (2 × ₹1,50,000):  ₹3,00,000
  Total quantified savings:               ₹5,50,000

Annual NEXORA cost (annual billing):      ₹1,91,808

ROI: (₹5,50,000 − ₹1,91,808) / ₹1,91,808 = 1.9x return
Payback period: ~4 months
```

This deliberately excludes the vendor-liability figure above. Including even
one avoided contract error would make the ROI look implausible, and an ROI a
judge does not believe is worth less than a smaller one they do.

---

## Revenue Projections

| Year | Customers | Avg. seats | Avg. tier | MRR | ARR |
|------|-----------|-----------|-----------|-----|-----|
| Year 1 | 20 | 15 | Starter (₹499) | ₹1.50 lakh | **₹18 lakh** |
| Year 2 | 80 | 20 | Professional (₹999) | ₹15.98 lakh | **₹1.92 crore** |
| Year 3 | 200 | 25 | Professional (₹999) | ₹49.95 lakh | **₹5.99 crore** |

Conservative: organic growth, no enterprise deals, no price increases.

---

## Free Trial & Onboarding

- **14-day free trial** of the Professional tier, no credit card required.
- Bring 5 documents; see your first contradiction in under 10 minutes.
- Guided onboarding: upload → ingest → ask a question → see a conflict.
- The "aha moment" is the first time the system catches a contradiction the
  customer didn't know existed.

---

## Unit Economics — ARPA, LTV, CAC

Every figure below is derived from the tiers above, not asserted. The
assumptions are stated so a judge can challenge any one of them and see what
moves.

### Average Revenue Per Account (ARPA)

ARPA is per *account*, not per seat, because a company buys a block of seats.

| Tier | Price / seat / mo | Typical seats | **ARPA / month** | ARPA / year |
|---|---|---|---|---|
| Starter | ₹499 | 15 | **₹7,485** | ₹89,820 |
| Professional | ₹999 | 20 | **₹19,980** | ₹2,39,760 |
| Enterprise | ~₹1,800 negotiated | 40 | **₹72,000** | ₹8,64,000 |

**Blended ARPA (Year 2 mix: 60% Starter, 35% Professional, 5% Enterprise):**

```
(0.60 × ₹7,485) + (0.35 × ₹19,980) + (0.05 × ₹72,000)
=    ₹4,491     +      ₹6,993      +      ₹3,600      =  ₹15,084 / month
```

### Gross margin

A seat-based AI product only works if inference cost stays far below price.
Ours does, and it is worth showing the arithmetic because judges expect AI
startups to be quietly unprofitable.

**These costs are billed in US dollars.** Google and MongoDB do not invoice in
rupees, so this is the one place the exchange rate genuinely matters.

| Cost line | USD / account / mo | ₹ at ₹85 | Basis |
|---|---|---|---|
| LLM inference | $4.00 | ₹340 | 20 seats × 100 queries × 2 calls, at flash-lite rates |
| Embeddings | $0.40 | ₹34 | Re-embedding on document updates only; ingestion is one-time |
| Vector DB + storage | $12.00 | ₹1,020 | Allocated share of a shared Atlas cluster |
| Support & success | $18.00 | ₹1,530 | Blended, weighted to onboarding months |
| **Total COGS** | **$34.40** | **₹2,924** | |

```
Gross margin at Professional ARPA:  (₹19,980 − ₹2,924) / ₹19,980  =  85%
Gross margin at blended ARPA:       (₹15,084 − ₹2,924) / ₹15,084  =  81%
Conservative blended figure used below:                              80%
```

The margin holds because retrieval is cheap and the expensive step — the LLM
call — happens once per question, not once per document. Cost scales with
questions asked, not with corpus size.

**FX exposure, stated plainly:** revenue is in rupees, roughly 19% of cost is
in dollars. A rupee depreciation to ₹95 raises COGS to ₹3,268 and drops the
blended margin from 81% to 78%. Material, but not structural.

### Lifetime Value (LTV)

```
LTV = ARPA × Average customer lifetime × Gross margin
```

**Lifetime assumption:** 36 months, from an assumed 2.3% monthly logo churn
(~24% annually). That is deliberately pessimistic for mid-market B2B, where
15–20% annual churn is typical. Policy documents are sticky — once a company's
corpus is indexed and its conflicts are in a review queue, leaving means
re-inheriting the problem.

| Tier | ARPA | Lifetime | Margin | **LTV** |
|---|---|---|---|---|
| Starter | ₹7,485 | 36 mo | 80% | **₹2.16 lakh** |
| Professional | ₹19,980 | 36 mo | 85% | **₹6.11 lakh** |
| Enterprise | ₹72,000 | 48 mo | 85% | **₹29.38 lakh** |
| **Blended** | ₹15,084 | 36 mo | 80% | **₹4.34 lakh** |

### Customer Acquisition Cost (CAC)

Built bottom-up from how the first hundred customers are actually reached
(see `go-to-market.md`), on Indian cost basis — not converted from a US figure.

| Cost line | Per customer | Basis |
|---|---|---|
| Founder sales time | ₹21,600 | 18 hours × ₹1,200/hr loaded, across demo, trial support, close |
| Content & SEO | ₹30,000 | Allocated cost of content producing inbound leads |
| Outbound tooling & lists | ₹15,000 | Email tooling, data enrichment |
| Trial infrastructure | ₹8,400 | Compute for trials that do not convert |
| **Founder-led CAC** | **₹75,000** | |

**This number does not survive scale, and we say so.** Founder-led selling is
cheap because founder time is priced at cost, not at what a salesperson costs.
Once acquisition moves to a hired AE plus paid channels, CAC rises to roughly
**₹1,25,000**. Both are shown below.

### The health check

The event guide sets one explicit bar: **LTV / CAC > 3**.

| Metric | Founder-led (₹75,000 CAC) | Scaled (₹1,25,000 CAC) | Bar | Verdict |
|---|---|---|---|---|
| **LTV / CAC (blended)** | **5.8×** | **3.5×** | > 3 | ✅ Healthy |
| **LTV / CAC (Professional)** | **8.2×** | **4.9×** | > 3 | ✅ Healthy |
| **CAC payback period** | **6.2 months** | **10.4 months** | < 12 | ✅ Healthy |

The honest reading is the right-hand column. The 5.8× is what the business
looks like while the founders are the sales team; 3.5× is what it looks like
as a company.

### What breaks this

Stated plainly, because a judge will look for it:

- **If churn is worse than 24% annually**, LTV falls fast. At 40% annual churn
  the lifetime drops to 30 months, blended LTV falls to ₹3.62 lakh, and scaled
  LTV/CAC drops to **2.9× — below the bar**. Retention is the assumption this
  model is most exposed to, not price.
- **If scaled CAC exceeds ₹1,45,000**, blended LTV/CAC drops below 3× and the
  model stops working. This is why the first hundred customers are founder-led
  and inbound-heavy rather than bought through paid acquisition.
- **The Starter tier alone does not sustain the business** at ₹2.16 lakh LTV
  against ₹75,000 CAC (2.9×), and it goes underwater entirely at scaled CAC.
  Starter is a land-and-expand entry point; the model depends on upgrade to
  Professional, not on Starter volume.

### For international comparison

At ₹85 = $1, for a judge benchmarking against US SaaS:

| Metric | INR | USD equivalent |
|---|---|---|
| Professional price / seat / month | ₹999 | ~$11.75 |
| Professional ARPA / month | ₹19,980 | ~$235 |
| Blended LTV | ₹4.34 lakh | ~$5,110 |
| Scaled CAC | ₹1.25 lakh | ~$1,470 |
| Year 3 ARR | ₹5.99 crore | ~$705,000 |
