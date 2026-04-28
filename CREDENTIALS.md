# DROPKAST — Credentials Checklist

The app **runs without any keys** thanks to graceful fallbacks (in-memory DB, mock auth, fake AI responses), but each key you add unlocks a real feature. Add them in order of impact.

For Vercel: **Project Settings → Environment Variables**. For local dev: copy `.env.example` to `.env`.

---

## 1. Anthropic (Claude) — Highest impact

Without this key the AI assistant returns "AI not configured", A&R critique returns a placeholder, and campaign strategy uses static fallbacks. **Add this first.**

| Variable | Where | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys | Server-only. Put it in Vercel and your local `.env`. |

After adding: A&R submissions get real critiques, the floating chat assistant streams Claude responses with tool use over your real data.

**Cost expectation** with prompt caching enabled (already wired):
- Sonnet 4.6 chat: ~$0.02–0.05 per 10-message session
- Haiku 4.5 viral ideas: ~$0.001 per call
- Sonnet A&R critique: ~$0.05 per submission

---

## 2. Supabase — Auth + database

Replaces the localStorage mock auth and the in-memory `db` that resets on every Vercel cold start.

1. Create a project at https://supabase.com/dashboard
2. Wait for the database to provision (~1 minute)
3. Go to **Project Settings → API**

| Variable | Where in Supabase | Exposed to browser? |
|---|---|---|
| `VITE_SUPABASE_URL` | Project Settings → API → Project URL | Yes (safe) |
| `VITE_SUPABASE_ANON_KEY` | Project Settings → API → `anon public` key | Yes (safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` key | **No — server only** |
| `DATABASE_URL` | Project Settings → Database → Connection String → URI (use the **Pooled connection** for serverless) | No |

After adding `VITE_SUPABASE_*`, real signup/login replaces the mock. After adding `DATABASE_URL`, Drizzle takes over from in-memory storage.

### First time: run the migrations

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

This creates all the tables defined in `db/schema.ts`.

---

## 3. Cloudinary — Audio + artwork uploads

Optional. Without it, uploaded files use in-memory storage that vanishes when the function cools down.

| Variable | Where |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | https://cloudinary.com/console → Dashboard |
| `CLOUDINARY_API_KEY` | Same dashboard |
| `CLOUDINARY_API_SECRET` | Same dashboard (server-only) |

---

## 4. Stripe — Splits payouts (Phase 3)

Not yet wired into the UI; add when you start Phase 3 of `IMPLEMENTATION_PLAN.md`.

| Variable | Where |
|---|---|
| `STRIPE_SECRET_KEY` | https://dashboard.stripe.com/apikeys |
| `STRIPE_WEBHOOK_SECRET` | https://dashboard.stripe.com/webhooks → Add endpoint pointing at `/api/stripe/webhook` |

---

## 5. RouteNote — Real DSP delivery (Phase 1)

Apply for the partner program — takes a few business days for approval.

| Variable | Where |
|---|---|
| `ROUTENOTE_API_KEY` | https://routenote.com/distribution-partners (B2B onboarding) |

---

## 6. Sentry — Error tracking (Phase 6)

Free tier covers most early-stage projects.

| Variable | Where |
|---|---|
| `SENTRY_DSN` | https://sentry.io → Project Settings → Client Keys (DSN) — server projects |
| `VITE_SENTRY_DSN` | Same — but for the React/browser project |

---

## What works WITHOUT any keys

- Full UI navigation
- Welcome flow + portal selection
- Mock auth (localStorage)
- All API endpoints (in-memory data, lost on cold start)
- Fake AI responses (placeholder text returned)

So you can demo the whole flow before adding a single key. Add keys when you need the real thing.
