# DROPKAST — Production Implementation Plan

Ordered by **what unlocks revenue or competitive advantage**, not by "what every web app theoretically needs."

The current state: a Vite + Express demo with mock auth (`localStorage`), an in-memory database that wipes on every Vercel cold start, fake DSP delivery (`setTimeout`), and a chat assistant that returns hardcoded strings. None of that is shippable to paying artists. Everything below is what closes that gap.

---

## Phase 0 — Foundation (3–5 days)

You can't sell anything until artists can actually log in and their data survives a deploy. Do this first or nothing else matters.

- [ ] **Replace mock auth with Supabase Auth** (or Clerk)
  - Email + password, Google OAuth, magic link
  - Wire to existing `AuthContext.tsx` — keep the React API the same
  - Replace `useAuth().login()` to call Supabase, not invent a fake user
- [ ] **Replace in-memory `db` in `api/_app.ts` with Supabase Postgres**
  - Tables: `users`, `releases`, `sources` (audio/artwork URLs), `platforms`, `campaigns`, `splits`, `influencers`, `influencer_campaigns`, `dj_packs`, `analytics_events`, `anr_submissions`, `pre_releases`
  - Migration script in `/supabase/migrations/`
- [ ] **Add Drizzle ORM** between Express and Postgres (lighter than Prisma, no codegen step, edge-compatible)
- [ ] **Row-Level Security policies** so artists only see their own releases
- [ ] **Move file uploads from Cloudinary to Supabase Storage** (or keep Cloudinary if you want CDN-grade transformations — but pick one and commit)
- [ ] **Server-side env vars audit** — `ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` must NEVER appear in `vite.config.ts` `define` (currently `GEMINI_API_KEY` leaks into the client bundle — fix this now)
- [ ] **Zod schemas** for every API request body (replaces ad-hoc `req.body.foo` access)

**Why this first:** Supabase gives you auth + Postgres + storage + RLS in one signup. Replaces 14 items from the old plan in an afternoon.

---

## Phase 1 — Core Distro (1–2 weeks)

This is the part of the app that has to actually work for DropKast to be "a music distro" instead of "a UI mockup."

- [ ] **Real DSP delivery via RouteNote API** (or SonoSuite if you want white-label)
  - Replace the `setTimeout` simulation in `api/_app.ts:processRelease()`
  - Map the existing platforms array → DDEX-compliant delivery payload
  - Webhook handler for `release.live` / `release.failed` status callbacks
- [ ] **ISRC code generation** (one per track) — auto-issue from RouteNote, or buy a block from RIAA and rotate
- [ ] **UPC code per release** — same, auto-issue or RIAA block
- [ ] **Audio file validation on upload**
  - Accept: WAV / FLAC / 16-bit+ at 44.1kHz+
  - Reject: corrupted files, mp3 below 320kbps, files <30s
  - Use `music-metadata` npm package server-side
- [ ] **Loudness normalization check** (LUFS target -14 for streaming) — flag tracks that are over-compressed before delivery
- [ ] **Cover art validation** — 3000×3000px minimum, RGB, no copyright keywords in metadata
- [ ] **Release lifecycle state machine** — replace the ad-hoc `status` strings with explicit states: `draft → submitted → in_review → approved → delivering → live | rejected`
- [ ] **Takedown / metadata edit flow** for already-live releases (DDEX update message)
- [ ] **Release scheduling** (release_date in the future, not just "live now")

**Why this matters:** DistroKid charges $20/year for exactly this. It's the table-stakes feature. Without it DropKast is a campaign tool, not a distro.

---

## Phase 2 — AI as the Differentiator (1 week)

The thing that makes DropKast different from DistroKid/TuneCore. Build the AI layer once the foundation is real (so the assistant can read real data via tool use).

- [ ] **Swap Gemini → Claude (Anthropic) in `src/services/aiService.ts`**
  - `@anthropic-ai/sdk` (server-side only)
  - Sonnet 4.6 for strategy + A&R critique
  - Haiku 4.5 for cheap stuff (viral ideas, captions)
- [ ] **Streaming chat endpoint** — `POST /api/ai/chat` (SSE response)
- [ ] **Tool definitions for the assistant** so it can read the artist's actual data:
  - `get_my_releases()`, `get_release_analytics(id)`, `get_active_campaigns()`, `get_influencer_matches(release_id)`, `get_pending_splits()`, `get_anr_feedback(release_id)`
- [ ] **Replace `setTimeout` mock in `AIAssistant.tsx`** — wire it to the streaming endpoint, render tokens as they arrive
- [ ] **Prompt caching on the artist's catalog/profile** (Anthropic cache_control) — keeps cost per chat session under $0.05
- [ ] **Real A&R critique on `/anr` page**
  - Input: track audio, lyrics (from track metadata or transcribed via Whisper), artist bio
  - Claude returns: positioning, hook strength, lyrical themes, sonic comp artists, target playlists, weaknesses, fixable issues
  - Save the critique as a markdown blob attached to the submission
- [ ] **Real campaign strategy generation** — replace the JSON template in `generateStrategy()` with a Claude call that reads the release + artist's prior campaign performance
- [ ] **Cost guardrails**
  - Per-user daily token budget in Postgres (`ai_usage` table)
  - Block when exceeded; return friendly UI message
  - Admin dashboard to see top spenders

**Why this works:** Tool use + streaming = the assistant can answer "how's Buddy Kay doing on TikTok this week?" with real numbers. Without tool use it's just another chatbot.

---

## Phase 3 — Money Flow (1 week)

If artists upload music and the splits never pay, you have a lawsuit, not a product.

- [ ] **Stripe Connect onboarding** for every payee (artists, producers, featured artists, influencers)
  - Express accounts (lightest onboarding)
  - W-9 / W-8BEN collection handled by Stripe
- [ ] **Royalty split sheets become real** — the existing `/api/splits` endpoint stores percentages but pays nobody. Wire it to:
  - Stripe Transfers from platform balance to each Connect account
  - Webhook `transfer.paid` → mark split row as `paid`
- [ ] **Royalty ingestion pipeline** — RouteNote (or whoever) returns CSV statements monthly. Parse → write to `royalty_lines` table → roll up to splits → trigger transfers
- [ ] **Artist payout dashboard** (the current `/earnings` page) shows real numbers, not mocks
- [ ] **Influencer / DJ payouts** — same Stripe Connect plumbing, paid per verified post (Phase 4 verifies the post)
- [ ] **Tax document generation** — Stripe handles 1099-K and 1042-S automatically; just expose the download link

---

## Phase 4 — Creator Economy (1 week)

The Influencer / DJ portals exist as UI shells but don't connect to anything. Make them real.

- [ ] **Real influencer matching algorithm** — currently `db.influencers.slice(0, 2)`. Replace with:
  - Embedding match between release tags + influencer genres (use OpenAI embeddings or Voyage AI; cheaper than Claude for this)
  - Reach × engagement rate × match score → ranked list
- [ ] **Influencer post verification**
  - User submits TikTok / Reel URL after posting
  - Backend pulls metadata via TikTok / Meta Graph API to confirm the audio matches the release
  - On match → trigger payout (Phase 3)
- [ ] **DJ pack delivery** — currently `db.djSends.push()` with no actual file delivery. Generate a signed URL per DJ with stems/edits, log download
- [ ] **DJ feedback loop** — DJs rate tracks they receive (1–5 + comment); aggregate becomes a chart-readiness signal artists can see
- [ ] **Influencer / DJ Connect onboarding** (uses Phase 3 plumbing)

---

## Phase 5 — Polish & Type Safety (3–5 days)

Now that the product does something real, make it not feel like a beta.

- [ ] **Loading skeletons** for every list/chart route (release list, analytics, campaigns)
- [ ] **Toast notifications** (use `sonner` — clean, small)
- [ ] **Error boundaries** at route level — show a "something broke" card instead of white screen
- [ ] **Form validation with Zod + react-hook-form** — replaces ad-hoc state
- [ ] **TanStack Query** for all data fetching (cache, refetch, optimistic updates)
- [ ] **Remove every `any` from the codebase** — generate types from Drizzle schema, share between client/server
- [ ] **Strict tsconfig** (`strict: true`, `noUncheckedIndexedAccess: true`)
- [ ] **Disabled-button states everywhere** (currently most submit buttons let you double-click)
- [ ] **Empty states** for every list view (no releases yet, no campaigns yet, etc.)

---

## Phase 6 — Observability (1–2 days)

Catch problems before users tweet about them.

- [ ] **Sentry** for both client and server errors
- [ ] **Vercel Analytics** for Core Web Vitals (free, one line)
- [ ] **PostHog** for product analytics (events: signup, upload, deliver, payout) — way more useful than Google Analytics here
- [ ] **`/api/health` endpoint** that pings Postgres and the LLM provider
- [ ] **Structured logging** with Pino (server side) — JSON logs ship to Vercel logs free
- [ ] **Stripe webhook signature verification** (already needed for Phase 3, just don't forget it)

---

## Phase 7 — Security Hardening

Some of these belong in Phase 0; the rest can come after a paying customer or two.

- [ ] **CSRF tokens** on POST endpoints (Phase 0 — Supabase handles most of this for you)
- [ ] **Rate limiting** on `/api/ai/*` and `/api/auth/*` (Vercel Edge Middleware + Upstash, or `@upstash/ratelimit`)
- [ ] **Audio upload virus scan** (ClamAV worker or Cloudflare R2 + scanning)
- [ ] **DMCA takedown endpoint** + admin tool (you will get takedowns)
- [ ] **GDPR export + delete** endpoints for user data (one Postgres function, exposed in `/settings`)
- [ ] **Audit log** for all admin actions on user data (single `audit_log` table, one middleware)

---

## Out of scope (don't build until validated)

These were on the original 90-item plan. Skip them. Add only when something is actually slow or broken.

- ~~Docker / Kubernetes~~ — you're on Vercel, that's the deployment
- ~~Redis caching~~ — Postgres + HTTP cache headers are enough until you have 10k MAU
- ~~Service worker / offline support~~ — music *upload* tool, users are online
- ~~Virtual scrolling~~ — only needed if a single artist has 10k+ releases (no one does)
- ~~WebSockets~~ — Server-Sent Events (which you'll already have for AI streaming) cover the realtime needs
- ~~A/B testing infrastructure~~ — premature; PostHog Experiments is one toggle when you need it
- ~~Batch operations~~ — UX problem, not yet
- ~~Advanced search~~ — Postgres full-text is enough until you have 50k releases
- ~~Backup system~~ — Supabase / Neon ship daily PITR backups
- ~~Custom CI/CD pipeline~~ — Vercel Git integration handles deploy + preview envs

---

## Suggested timeline

If one engineer (or one Claude Code session per day) is working on this:

| Week | Focus |
|------|-------|
| 1 | Phase 0 — auth + DB + Zod |
| 2 | Phase 1 — DSP delivery + ISRC/UPC + audio validation |
| 3 | Phase 1 finish + Phase 2 AI integration start |
| 4 | Phase 2 finish — A&R critique, real strategy gen |
| 5 | Phase 3 — Stripe Connect + splits payouts |
| 6 | Phase 4 — influencer matching + post verification |
| 7 | Phase 5 — polish + types + skeletons |
| 8 | Phase 6 + 7 — Sentry, rate limiting, soft launch |

That's a real product in 8 weeks. The original plan would still have you in Phase 1 at that point.

---

## Definition of "shippable v1"

Before you charge anyone money, all of these must be true:

- [ ] An artist can sign up, upload audio + artwork, fill out metadata, and receive an email when the release is live on Spotify.
- [ ] That artist can see real analytics (plays, streams, top territories) on the release.
- [ ] That artist can chat with the AI assistant and get answers grounded in their own data.
- [ ] When the release earns money, the splits actually pay out via Stripe.
- [ ] An influencer can sign up, see matched campaigns, post the song, and get paid.
- [ ] If something breaks, Sentry catches it and you know before the artist tweets about it.

Everything else is nice-to-have.
