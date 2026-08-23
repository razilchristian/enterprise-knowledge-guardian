# Go-to-Market — Sales, Distribution & Traction

Covers components 4 and 5 of the mandatory business model section, and
Slide 7 of the elimination deck ("how do you get your first 100 users?").

---

## 1. Sales & Distribution

### Why not paid acquisition

Our unit economics survive only while CAC stays under ~$2,300
(see `pricing-model.md`). Paid search for enterprise software keywords runs
$15–40 per click at single-digit conversion, which would put CAC past $3,000
before a demo is even booked. So the first hundred customers come from
channels where our cost is time rather than ad spend.

### The four channels, in the order we use them

**Channel 1 — Founder-led direct sales (customers 1–30)**

The buyer is reachable by name. A company of 200–5,000 employees has exactly
one Head of Operations, one General Counsel, one Head of HR, and all three are
findable on LinkedIn.

- Target list: 200 companies matching the profile in `target-customer.md`
- Approach: a specific opening, not a pitch. We run their *public* policy
  documents — careers page, published code of conduct, public handbook — through
  Guardian first, and lead with what we found.
- That is the entire pitch: *"Your published leave policy and your careers page
  disagree about notice periods. We found that in nine seconds. Want to see what
  else is in there?"*
- Expected conversion: ~200 contacted → 40 replies → 20 demos → 8 trials → 3 customers

**Channel 2 — Content and search (customers 30–70)**

The buyer searches for the symptom, not the product. Nobody googles "policy
conflict detection"; they google *"employee handbook contradicts HR policy"*.

- Publish against symptom queries: conflicting leave policies, handbook vs
  policy discrepancies, data-retention mismatches between Legal and Security
- Free public tool: upload two documents, get a contradiction report, no signup.
  It costs us pennies per run and is the cheapest qualified-lead source we have.
- Long-tail keywords, low competition, buyer intent already high

**Channel 3 — Partnerships (customers 70–100)**

Firms that already sit inside the customer's policy set and are trusted there:

| Partner type | Why they refer us | What they get |
|---|---|---|
| HR consultancies | They are hired to fix handbooks; we find what needs fixing | Faster audits, referral margin |
| Compliance & audit advisors | Contradictions are audit findings they must document | Evidence-gathering in minutes not weeks |
| Legal ops consultants | Contract-vs-policy conflicts are billable work | A tool that scopes the work for them |

A consultant running a policy audit is doing manually what Guardian does in a
sweep. They are the sharpest referral channel available to us, because their
client already believes they have a problem.

**Channel 4 — Marketplace and product-led (ongoing)**

- Atlassian Marketplace (Confluence) and Microsoft AppSource — the customer's
  documents already live there
- 14-day self-serve trial, no credit card, no sales contact required
- The activation moment is precise and measurable: **first conflict detected**.
  Every onboarding step exists to reach it inside ten minutes.

### Retention

Churn is the number our whole LTV rests on, so it gets an explicit plan:

- **Weekly digest** to document owners: what changed, what now contradicts
- Value compounds with corpus size — each added document raises the chance of
  catching the next contradiction, so leaving costs more the longer they stay
- **Onboarding target:** first conflict surfaced within 10 minutes of first
  upload. Trials that see a real conflict convert; trials that see an empty
  queue do not.

---

## 2. Pipeline & Traction

> **Honest current status: pre-revenue, pre-customer.**
>
> We have a working MVP, a 27-document test corpus, and a functioning conflict
> engine. We have **zero paying customers, zero signed LOIs, and zero completed
> customer interviews.** Every number in this section is a target, not a result.
>
> This is stated plainly because the alternative — inventing a quote from an
> imaginary HR manager — is the one thing that would genuinely disqualify us if
> a judge probed it. An honest "not yet, and here is the plan" survives
> scrutiny. A fabricated testimonial does not.

### The evidence we can realistically gather before 30 August

Twelve days is not enough to close a paying customer. It is enough to prove
that the problem is real to people who have it. That is what the guide asks
for.

| Day | Action | Evidence produced |
|---|---|---|
| 1–2 | Build a list of 25 reachable HR / Legal / Ops people — alumni, family contacts, local companies, LinkedIn 2nd-degree | A named target list |
| 3–6 | Run 8–10 conversations, 15 minutes each. Not a pitch — a question | Recorded pain, in their words |
| 7–8 | For 3 companies, run their **public** documents through Guardian and send what we found | A concrete finding per company |
| 9–10 | Ask the 2 warmest: *"if this existed, would you pilot it?"* Request a one-line email | A written expression of interest |
| 11–12 | Compile into the pipeline slide | Slide 7 backed by real names |

### The interview script

Four questions. No product mention until the fourth.

1. How many policy documents does your organisation maintain, roughly?
2. Has an employee ever acted on a policy that turned out to be outdated or
   contradicted somewhere else? What happened?
3. How would you find out today if two of your policies disagreed?
4. *(only now)* If a tool told you every contradiction across every department,
   what would that be worth to you?

Question 3 is the one that matters. The honest answer is almost always
"someone would have to notice," and that answer *is* our market.

### Template — fill with real data, never invent

```
Pipeline as of [DATE]

  Conversations completed:     [N]
  Organisations profiled:      [N]
  Contradictions found in
    prospects' public docs:    [N]
  Expressions of interest:     [N]

  Named prospects:
    1. [Organisation] — [size] — [contact role] — [status]
    2. ...

  What they actually said:
    "[verbatim quote]" — [role], [organisation type]
```

### What "gold standard" would look like for us

The guide names a Letter of Intent as the strongest evidence. Ours would be a
single line by email from any organisation with a real policy library:

> *"We would run a pilot of this against our policy set once it is available."*

Even one, from one company, from a real named person, is worth more in the
final round than a page of projections.

### If we reach 30 August with no interviews completed

Then we say exactly that, and we show the product finding a real contradiction
in a *real* company's published documents live on stage. A demonstrated
capability against public data is weaker than a customer quote — but it is
true, and it is checkable, and it is the honest floor we can always stand on.
