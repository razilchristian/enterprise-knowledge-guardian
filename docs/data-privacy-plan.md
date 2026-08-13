# Deliverable 5 — Data Privacy & Compliance Plan

## Executive Summary

NEXORA Guardian deliberately removes read-side access control within a tenant.
This document explains why that is a privacy feature rather than a privacy risk,
defines the boundaries that make it defensible, and describes the compliance
posture for GDPR and enterprise data handling.

---

## 1. The Open-Knowledge Architecture — A Deliberate Choice

### What we do

Every user in a tenant can read every indexed document. The AI searches across
all departments for every question. There is no permission filter on retrieval.

### Why we do it

> Cross-document conflict detection only has value if people can see across
> documents. Hiding HR's handbook from Legal hides the contradiction too.

If the system cannot see both the Employee Handbook (HR) and the Data Processing
Agreement (Legal) at the same time, it cannot detect that one says "retain for
36 months" while the other says "retain for 60 months." The open-knowledge
model is not a shortcut — it is the architecture that makes the product's core
value possible.

### What makes it defensible

**Scope restriction:** NEXORA indexes **policy documents only.** The following
categories are explicitly excluded from ingestion:

| ✅ Indexed (policy documents) | ❌ Never indexed (personal data) |
|------------------------------|--------------------------------|
| Employee handbooks | Individual salaries |
| Leave policies | Performance reviews |
| Vendor contracts | Personnel files |
| Security playbooks | Medical records |
| Engineering standards | Individual employment contracts |
| Compliance reports | Email or chat transcripts |

This boundary is enforced at ingestion time. The `scripts/ingest.py` pipeline
only processes documents placed in the designated corpus directory by an
administrator. There is no user-facing upload that could introduce personal data.

### The privacy argument

NEXORA makes organizations **more** compliant, not less:

- It **finds** retention contradictions (36 vs 60 months) that are themselves
  GDPR violations — different departments applying different retention periods
  to the same data.
- It **detects** when a policy promises something (e.g., "data deleted after 36
  months") that another policy contradicts — exposing gaps before a regulator
  does.
- It **attributes** every change to a named human who must approve it, creating
  the audit trail that regulators expect.

---

## 2. Access Control Model

Access control exists — it governs **write** and **approve**, not **read.**

| Action | Employee | Department Owner | Director |
|--------|----------|-----------------|----------|
| **Read** any document | ✅ | ✅ | ✅ |
| **Ask** any question | ✅ | ✅ | ✅ |
| **See** any conflict | ✅ | ✅ | ✅ |
| **Edit** own department's docs | ❌ | ✅ | ✅ |
| **Approve** own department | ❌ | ✅ | ✅ |
| **Approve** org-wide changes | ❌ | ❌ | ✅ |

This model means switching roles changes what surfaces first (the dashboard
prioritizes your department), but never what is visible.

---

## 3. Tenant Isolation

Each customer organization is a separate tenant with complete data isolation:

| Layer | Isolation mechanism |
|-------|-------------------|
| **Database** | Separate MongoDB database per tenant (no shared collections) |
| **Vector index** | Per-tenant vector search index (queries never cross tenants) |
| **API keys** | Per-tenant Gemini API key (usage tracking and billing isolation) |
| **Application** | Tenant ID scoped at the API layer; no request can access another tenant's data |

**Within a tenant, read is open.** This is the explicit design: one company's
policies are visible to everyone in that company, because that is what makes
conflict detection work.

**Between tenants, isolation is absolute.** Company A's documents are invisible
to Company B at every layer — database, vector search, and API.

---

## 4. Encryption

| State | Method | Detail |
|-------|--------|--------|
| **In transit** | TLS 1.2+ | Atlas enforces TLS on all connections; unencrypted connections are rejected. FastAPI ↔ Gemini uses HTTPS. |
| **At rest** | AES-256 | Atlas encrypts all data at rest by default using AES-256. No opt-in required. |
| **Backups** | Encrypted | Atlas backups inherit the same encryption. |

---

## 5. GDPR Compliance

### 5.1 Lawful Basis

Processing of policy documents falls under **legitimate interest** (Article
6(1)(f)) — the organization has a legitimate interest in maintaining consistent
internal policies, and this processing does not override employee rights because
only policy documents (not personal data) are processed.

### 5.2 Data Minimization

- Only policy documents are ingested — no personal data.
- Embeddings are mathematical representations of text meaning, not reversible
  to personal information.
- The system stores only what is necessary: document text, section headings,
  department/owner metadata, and vector embeddings.

### 5.3 Right to Erasure

If a document is removed from the corpus:
1. Re-run the ingestion pipeline without that document.
2. The corresponding chunks and embeddings are removed from MongoDB.
3. The vector index automatically reflects the change.

### 5.4 Data Retention

NEXORA does not impose its own retention period on customer data. Documents
remain indexed as long as the customer wants them indexed. The irony is that
NEXORA is specifically designed to **detect** when an organization's own
retention policies contradict each other — this is a compliance feature.

### 5.5 Cross-Border Data Transfer

- MongoDB Atlas cluster region is configurable per tenant.
- Gemini API calls are made to Google's API endpoints; data processing
  agreements with Google cover this transfer.
- For EU-only deployments, the Atlas cluster would be in an EU region, and
  Gemini API calls routed to EU endpoints when available.

---

## 6. Audit Trail

Every action in NEXORA is logged:

| Event | What is recorded |
|-------|-----------------|
| Question asked | Timestamp, question text, sources retrieved, whether a conflict was detected |
| Conflict detected | Timestamp, documents involved, claims, severity, AI explanation |
| Conflict resolved | Timestamp, resolver identity, resolution decision, evidence |
| Document ingested | Timestamp, document name, chunk count, department, owner |
| Policy approved | Timestamp, approver identity, document, change description |

The audit trail supports compliance requirements for SOC 2, ISO 27001, and GDPR
accountability obligations.

---

## 7. What a Judge Might Ask

**"Isn't open access a security risk?"**

No. Only policy documents are indexed — no salaries, no personnel files, no
personal data. Within a company, everyone should be able to read the policies
that apply to them. The risk is in *not* sharing: hidden policies mean hidden
contradictions.

**"What stops someone editing a policy?"**

Write access requires the Department Owner role. Approval requires the owner
(for department changes) or a Director (for org-wide changes). AI recommends;
humans approve. Nothing is auto-changed.

**"What about GDPR?"**

NEXORA processes policy documents, not personal data. More importantly, it
*finds* GDPR-relevant contradictions (like conflicting retention periods) that
would otherwise go undetected. It is a compliance tool, not a compliance risk.
