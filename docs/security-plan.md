# Deliverable 3 — Enterprise Security & Secret Key Handling Plan

## Executive Summary

NEXORA Guardian enforces a strict trust boundary: **the browser never holds a
secret.** All API keys and database credentials remain server-side in a
gitignored `.env` file, and the frontend communicates exclusively through
FastAPI HTTP endpoints. This document describes what the system does today, what
we would add for production, and where the gap between demo and production is.

---

## 1. Current Security Architecture (Demo)

### 1.1 Secret Isolation

| Secret | Stored in | Committed? | Visible to browser? |
|--------|----------|------------|-------------------|
| `MONGODB_URI` (Atlas connection string) | `backend/.env` | ❌ Gitignored | ❌ Never |
| `GEMINI_API_KEY` (Google AI key) | `backend/.env` | ❌ Gitignored | ❌ Never |
| `.env.example` (template, no values) | `backend/.env.example` | ✅ Committed | N/A (empty template) |

**How this works:**

1. `backend/.env` is listed in `.gitignore` with the pattern `.env*` and a
   `!.env.example` exception. The real secrets never enter version control.
2. `app/config.py` loads the `.env` file at startup using `python-dotenv`. If a
   required key is missing, the server refuses to start with an actionable
   error message explaining how to fix it.
3. The Next.js frontend knows only `NEXT_PUBLIC_API_URL` (default:
   `http://localhost:8000`). Extracting the entire frontend bundle reveals zero
   credentials.

### 1.2 Network Architecture

```
Browser (localhost:3000)
    │
    │  HTTP (CORS: localhost:3000 only)
    ▼
FastAPI (localhost:8000)     ── holds GEMINI_API_KEY ──►  Gemini API
    │
    │  holds MONGODB_URI
    ▼
MongoDB Atlas (cloud)
```

The browser talks to FastAPI. FastAPI talks to Gemini and MongoDB. The browser
never talks to either external service. This is the entire secret-handling story.

### 1.3 CORS Policy

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

Only the known frontend origins are permitted. In production, this would be
narrowed to the deployed domain.

### 1.4 Database Security

- **Atlas M0 cluster** with a single dedicated database user. That user currently
  holds `atlasAdmin` on `admin` — broader than the application needs, and listed
  as a known gap in §2. A production deployment would grant `readWrite` on the
  `nexora` database only.
- **Connection via SRV URI** over TLS (Atlas enforces TLS; unencrypted
  connections are rejected).
- **Data at rest** is encrypted by Atlas using AES-256 (enabled by default on
  all Atlas clusters).

---

## 2. Known Gaps (Honest Disclosure)

We distinguish between "acceptable for a demo with fake data" and "acceptable
for production with real enterprise documents."

| Gap | Risk Level | Status |
|-----|-----------|--------|
| Atlas Network Access set to `0.0.0.0/0` (open to all IPs) | Medium | Acceptable for demo; must be IP-restricted in production |
| Gemini API key was exposed in a chat transcript during development | Low | Key will be rotated immediately after the expo |
| Database password is weak | Low | Fake data only; rotated after exposure, and again before any real deployment |
| The Atlas user holds `atlasAdmin` on `admin` rather than a role scoped to one database | Medium | Over-privileged. Production would grant `readWrite` on `nexora` only |
| No rate limiting on the FastAPI endpoints | Low | Demo scale; add middleware for production |
| No authentication on API endpoints | By design | Open-knowledge model means no read-side access control (see §3) |

**Why we disclose these:** Judges respect a team that knows the gap between demo
and production more than one that claims perfection. Every item above has a
known fix; none affects the demo with synthetic data.

---

## 3. Open Knowledge — Not a Security Gap

The platform has no read-side access control, and this is deliberate:

> Cross-document conflict detection only has value if people can see across
> documents. Hiding HR's handbook from Legal hides the contradiction too.

**Boundary:** Only policy documents are indexed — no salaries, performance
reviews, or personnel files. That scope decision is what makes open read
defensible. Write access and approval are restricted by role.

---

## 4. Production Security Roadmap

What we would add before handling real enterprise documents:

### 4.1 Secrets Management
- Move from `.env` files to a proper secrets manager (AWS Secrets Manager,
  Google Secret Manager, or HashiCorp Vault).
- Per-environment keys: separate credentials for dev, staging, and production.
- Short-lived credentials with automatic rotation.

### 4.2 Network Hardening
- Replace Atlas `0.0.0.0/0` with IP allowlisting restricted to the production
  server's static IP.
- Deploy FastAPI behind a reverse proxy (nginx or a cloud load balancer) with
  TLS termination.
- Add rate limiting middleware (e.g., `slowapi`) to prevent abuse.

### 4.3 Authentication & Authorization
- Add tenant-scoped authentication (Clerk, Auth0, or Supabase Auth).
- Enforce write/approve permissions per role while keeping read open within each
  tenant.
- Audit-log every write and approval action.

### 4.4 Key Rotation Procedure
1. Generate a new API key in Google AI Studio.
2. Update `backend/.env` on the server.
3. Restart Uvicorn (zero-downtime with a process manager).
4. Revoke the old key in the provider console.
5. Verify with `GET /api/health` that the new key works.

### 4.5 Monitoring
- Application-level logging for all API calls (who asked what, when).
- Alert on 503/429 responses from Gemini (rate limit or outage).
- Atlas monitoring for connection pool exhaustion and slow queries.

---

## 5. Key Rotation Timeline

| When | Action |
|------|--------|
| **During expo** | Current demo key is acceptable (synthetic data) |
| **After expo** | Rotate Gemini API key (exposed in transcript) |
| **Before pilot** | Rotate MongoDB password, restrict Network Access, move to secrets manager |
| **Before production** | Full implementation of §4 above |
