# Deployment — Render (backend) + Vercel (frontend)

The final-round checklist requires a live URL, not localhost. This is how.

```
  Browser
     │  https
     ▼
  Vercel  ── Next.js frontend, no secrets in the bundle
     │  https  (NEXT_PUBLIC_API_URL)
     ▼
  Render  ── FastAPI, holds MONGODB_URI + GEMINI_API_KEYS
     ├────────────► MongoDB Atlas
     └────────────► Gemini API
```

---

## ⚠️ Read this before anything else

**Render's free tier spins a service down after 15 minutes without traffic.**
The next request pays a **cold start of roughly 50 seconds.**

Picture the failure: a judge types a question, and the screen sits there for
most of a minute. They will assume it is broken, and they will be right to.

Three ways to handle it, in order of what we should actually do:

1. **Keep it warm (free).** Point a free uptime monitor — UptimeRobot or
   cron-job.org — at `https://<your-service>.onrender.com/api/health` every
   10 minutes. The service never idles long enough to sleep. Cost: nothing.
2. **Warm it manually before the demo.** Open the health URL five minutes
   before going on stage and confirm it returns `"ok": true`. Do this even
   with a monitor running.
3. **Pay $7/month for the Starter plan.** Removes the behaviour entirely. For
   a competition worth ₹1,00,000, this is a rounding error and the safest
   option of the three.

Localhost has no cold start, which is exactly why this problem is invisible
until demo day.

---

## Part 1 — Backend on Render

**1. New Web Service** → connect the GitHub repo
`razilchristian/enterprise-knowledge-guardian`

**2. Settings** — the repo root is the Next.js app, so point Render at the
backend folder:

| Field | Value |
|---|---|
| Root Directory | `backend` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.api:app --host 0.0.0.0 --port $PORT` |
| Health Check Path | `/api/health` |

`--host 0.0.0.0` is not optional. Bind to localhost and the service starts
cleanly, reports healthy, and is unreachable from outside — which reads as a
crash and is not one.

**3. Environment variables** (Environment tab — never in the repo):

```
MONGODB_URI       mongodb+srv://razilchristian_db_user:<password>@cluster0.ieltdg8.mongodb.net
MONGODB_DB        nexora
GEMINI_API_KEYS   <key1>,<key2>,<key3>,<key4>,<key5>
PYTHON_VERSION    3.12.10
ALLOWED_ORIGINS   (leave blank for now — filled in after Vercel deploys)
```

**4. Deploy**, then check `https://<service>.onrender.com/api/health`.
Expect `"ok": true`, 27 documents, `vectorIndex: queryable`, 5 keys ready.

MongoDB Atlas is already set to allow `0.0.0.0/0`, so Render connects without
further changes. That decision pays off here.

---

## Part 2 — Frontend on Vercel

**1. New Project** → same repo. Vercel detects Next.js automatically.

**2. Root Directory:** leave as the repo root — the Next.js app is already
there.

**3. Environment variable:**

```
NEXT_PUBLIC_API_URL = https://<your-service>.onrender.com
```

No trailing slash. This is public by design — it is only a URL, and the API
behind it holds the secrets.

**4. Deploy.** Vercel gives you `https://<project>.vercel.app`.

---

## Part 3 — Close the loop

The frontend cannot call the backend until CORS knows about it.

Back in **Render → Environment**, set:

```
ALLOWED_ORIGINS = https://<project>.vercel.app
```

Then **Manual Deploy → Restart service**. Environment changes do not apply to
a running process.

Add preview URLs comma-separated if you want branch deploys to work too.

---

## Post-deploy checklist

Run every one of these against the **live URLs**, not localhost:

- [ ] `https://<service>.onrender.com/api/health` returns `"ok": true`
- [ ] `https://<project>.vercel.app/dashboard` loads with real numbers
- [ ] Ask "how many casual leave days do I get?" — resolves green
- [ ] Ask "when will I receive my experience letter?" — shows the conflict
- [ ] `/conflicts` lists real conflicts
- [ ] No CORS errors in the browser console (F12)
- [ ] Uptime monitor is pinging `/api/health` every 10 minutes
- [ ] Someone else opens the URL on their phone and it works

That last one matters. It proves you are serving the internet, not your own
machine's cache.

---

## Demo-day pre-flight

Five minutes before presenting, in this order:

1. Open `/api/health` — confirm `ok: true` and that keys are `ready`
2. Open `/workspace` and ask one question — this warms every path
3. Confirm the backup video is on the laptop **and** the USB drive

If the health check shows a key `cooling`, quota is spent on it. The chain
will rotate, but know it before you are on stage rather than during.

---

## If it breaks

| Symptom | Cause | Fix |
|---|---|---|
| First request hangs ~50s | Render cold start | Warm it; set up the monitor |
| "Cannot reach the Guardian backend" | `NEXT_PUBLIC_API_URL` wrong or missing | Check Vercel env, redeploy |
| CORS error in console | `ALLOWED_ORIGINS` unset on Render | Set it, restart the service |
| `ModuleNotFoundError` in build | Missing dependency | It is in `requirements.txt`; check the build log |
| 503 from `/api/ask` | Gemini quota across all keys | Check `/api/health` → `apiKeys` |
| Health says mongodb unreachable | Atlas IP list changed | Confirm `0.0.0.0/0` still present |
