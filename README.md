<div align="center">

# 🎵 DROPKAST

**The AI-Powered Command Deck for Independent Music**

Distribute · Generate · Promote · Get Paid

[![Live demo](https://img.shields.io/badge/live-dropkast.vercel.app-FF4D00?style=for-the-badge)](https://dropkast.vercel.app)
[![Vite](https://img.shields.io/badge/vite-6.x-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![React](https://img.shields.io/badge/react-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tailwind](https://img.shields.io/badge/tailwind-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey?style=for-the-badge)](#license)

</div>

---

## What is DropKast?

DropKast is a **vertical stack** for independent music careers: one platform that handles distribution to every major DSP (Spotify, Apple, YouTube Music, Tidal), AI-generated marketing assets, a verified influencer + DJ network, royalty splits, direct A&R submission, and a live AI assistant that knows your catalog.

Most artists today juggle 5–7 tools. DropKast collapses them into one dashboard with one billing relationship and one source of truth. Every page is wired to a real backend and most of the AI flows can run on **free** providers (NVIDIA NIM, Groq, Cerebras) out of the box.

> 🚀 **Try it now:** https://dropkast.vercel.app

---

## Three Portals, One Platform

| Portal | Tagline | Tools |
|---|---|---|
| 🎙️ **Artist Core** | *I make the music* | Distribution to all DSPs · ISRC/UPC minting · campaigns · A&R submission · split sheets · royalties |
| 📸 **Creator Relay** | *I create content* | Paid mission marketplace · post verification · instant payouts · brand match scoring |
| 💿 **Vibe Selecta (DJ)** | *I move the floor* | Exclusive DJ packs · stems & edits · feedback channel · chart signal data |

All three portals share one user identity, with a cross-portal Messages inbox so an artist can DM their influencer, a DJ can DM the artist who sent a pack, etc.

---

## Feature Highlights

### 🤖 AI Assistant with Live Tool Use
A streaming chat assistant powered by Claude Sonnet 4.6 with **tool-use over your real catalog**:
- `get_my_releases`, `get_release_analytics`, `get_active_campaigns`, `get_influencers`, `get_anr_submissions`

When you ask *"how is Buddy Kay doing this week?"*, it calls the analytics endpoint and answers with real numbers — not hallucinations. Plain chatbots can also be used (NVIDIA / Groq / Cerebras / OpenRouter free tiers) when budget matters.

### 🎯 ModelPicker — pick AI per task
Every generation surface (chat, A&R critique, campaign strategy, viral ideas, cover art, video) has a picker with a sticky **Recommended** default. Free models grouped above paid. Choice persists per-task in localStorage.

See the full [tier list & pricing](https://dropkast.vercel.app/ai-providers) — 21 models across text/image/video.

### 🎓 DropKast Academy
A built-in mini-course (6 modules, 17 lessons, ~60 min total) teaching:
- Foundations: how DropKast works, navigation
- Releasing: 14-day rollout calendar, metadata that matters, the hook test
- A&R skills: positioning, comp artists, reading feedback without ego
- Campaign planning: 60/30/10 budget rule, channel order, the 4 metrics that matter
- Monetization: split sheets, the 4 royalty types, sync placements
- Platform mastery: picking the right AI model per task

### 📦 Real Release Pipeline
- Audio validation (≥30s duration, ≥44.1kHz sample rate, ≥16-bit, accepted containers, MP3 ≥320kbps)
- Cover art validation (≥3000×3000, square, JPEG/PNG/WebP)
- ISRC + UPC code generation with valid mod-10 check digits
- Release lifecycle state machine: `draft → submitted → in_review → approved → delivering → live` (+ `rejected`, `taken_down`)
- Future-dated `releaseDate` parks the release in `approved` until that date

### 💬 Cross-Portal Messages
Direct conversations between artists, influencers, and DJs. Each thread is tagged with the other person's portal so the context is unmissable — "You as Artist · talking to Alex Wave · Creator". 5 seeded demo threads on first visit.

### 🛡️ AI Cost Guardrails
Per-user daily budget enforcement (`AI_DAILY_BUDGET_CENTS`, default $1/day). Tracks Sonnet + Haiku tokens with cache-discounted pricing. Returns 429 when exceeded.

### 🎨 Customizable Theming
- 10 preset accent colors + custom hex picker
- 7 visual styles (Brutalism, Glassmorphism, Neumorphism, etc.)
- Light + dark mode
- Full-screen interactive tutorial that walks every feature with spotlight overlays

---

## Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | React 19 · Vite 6 · TypeScript · Tailwind CSS 4 · Motion (Framer Motion) · TanStack Query · sonner |
| **Backend** | Express on Vercel Serverless · Drizzle ORM (Postgres-ready) · Zod validation · multer + Cloudinary |
| **AI** | Anthropic Claude (primary) · NVIDIA NIM · Groq · Cerebras · OpenRouter (chat) · Flux / Nano Banana / Kling / Veo (image+video, adapters stubbed) |
| **Infra** | Vercel (hosting + serverless) · Supabase Auth (when configured, mock fallback otherwise) · Postgres (Supabase / Neon) |

---

## Quick Start

### Prerequisites
- Node.js 20+
- (optional) An Anthropic API key for the highest-quality AI assistant — works without it

### Install + run
```bash
git clone https://github.com/mosesmawela/DropKast-.git
cd DropKast-
npm install
cp .env.example .env
npm run dev
```

The app runs at http://localhost:4002. **It works with zero API keys** — it falls back to in-memory storage and friendly "AI not configured" messages.

### Add keys to unlock features

| Add | Unlocks |
|---|---|
| `ANTHROPIC_API_KEY` | Claude Sonnet 4.6 chat with tool use over your catalog |
| `NVIDIA_API_KEY` / `GROQ_API_KEY` / `CEREBRAS_API_KEY` | Free chat fallback (1M tokens/day) |
| `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` + `DATABASE_URL` | Real auth + persistent Postgres |
| `CLOUDINARY_*` | Audio + artwork upload storage |
| `STRIPE_*` | Splits payouts (Phase 3) |
| `ROUTENOTE_API_KEY` | Real DSP delivery (Phase 1) |

See [`CREDENTIALS.md`](./CREDENTIALS.md) for the full breakdown of each provider, where to get keys, and what they cost.

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Browser (React SPA)                 │
│   • Welcome flow / portal selector / tutorial overlay    │
│   • AIAssistant (streaming SSE chat)                     │
│   • ModelPicker — sticky "Recommended" per task          │
│   • TanStack Query for data, sonner for toasts           │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│              Vercel Serverless Function (Express)        │
│   • api/_app.ts        — REST routes + Zod validation    │
│   • api/_ai-chat.ts    — streaming Claude w/ tool use    │
│   • api/_text-providers.ts — NVIDIA/Groq/Cerebras/OR     │
│   • api/_audio-validate.ts — music-metadata + LUFS       │
│   • api/_codes.ts      — ISRC + UPC generation           │
│   • api/_release-lifecycle.ts — state machine            │
│   • api/_ai-budget.ts  — per-user daily token cap        │
│   • api/_messages.ts   — cross-portal messaging          │
│   • api/_store.ts      — Drizzle when DATABASE_URL set,  │
│                          in-memory fallback otherwise    │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│   Postgres (Supabase / Neon) — db/schema.ts (Drizzle)    │
│   13 tables: users, releases, campaigns, splits, etc.    │
└──────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
DROPKAST/
├── api/                       # Vercel serverless function (Express)
│   ├── _app.ts                # All API routes
│   ├── _ai-chat.ts            # Streaming Claude + tool use
│   ├── _text-providers.ts     # NVIDIA / Groq / Cerebras / OpenRouter
│   ├── _audio-validate.ts     # Audio + cover art validation
│   ├── _codes.ts              # ISRC + UPC generators
│   ├── _release-lifecycle.ts  # State machine
│   ├── _ai-budget.ts          # Per-user AI cost guardrail
│   ├── _messages.ts           # Cross-portal messaging
│   ├── _store.ts              # DB-or-memory storage adapter
│   └── index.ts               # Vercel entry
├── db/
│   ├── schema.ts              # Drizzle schema (13 tables)
│   └── client.ts              # Drizzle client w/ fallback
├── src/
│   ├── pages/                 # Route components
│   │   ├── AIProviders.tsx    # Tier list of 21 models
│   │   ├── Academy.tsx        # 6-module mini-course
│   │   ├── Messages.tsx       # Cross-portal inbox
│   │   ├── Profile.tsx        # User profile + linked portals
│   │   └── Settings.tsx       # 9-tab settings with custom color picker
│   ├── components/
│   │   ├── ModelPicker.tsx    # Reusable AI model picker
│   │   ├── Tutorial.tsx       # Spotlight tour overlay
│   │   ├── NotificationsDropdown.tsx
│   │   └── layout/            # Sidebar, Navbar, WelcomeScreen
│   ├── context/               # Auth, Theme, AI, Tutorial, GrowSong
│   └── lib/
│       ├── ai-providers.ts    # 21-model catalog
│       └── ai-recommendations.ts  # Per-task recommended model
├── server.ts                  # Local dev entry (uses api/_app)
├── vercel.json                # Vite framework + SPA fallback
└── IMPLEMENTATION_PLAN.md     # Phased roadmap
```

---

## Deployment

### Vercel (recommended)
The repo is pre-configured for Vercel. Connect it in the dashboard, add `ANTHROPIC_API_KEY` (and any others from the table above) to **Project Settings → Environment Variables**, and deploy. The `vercel.json` ships:

- Vite framework preset (auto-detected)
- SPA fallback (`/((?!api/|assets/|.*\\.{js,css,...}$).*)` → `/index.html`)
- API routing (`/api/:path*` → `/api/index`)

### Local production build
```bash
npm run build      # Outputs to dist/
NODE_ENV=production npm run dev    # Serves dist/ via Express
```

---

## Roadmap

See [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) for the full 8-week plan, prioritized by **what unlocks revenue** (not generic "production-ready" boxes).

**Done ✅**
- Phase 0: Auth foundation (Supabase ready, mock fallback) · Drizzle schema · Zod validation
- Phase 1: ISRC/UPC generation · audio validation · release state machine · scheduling
- Phase 2: Claude integration · streaming chat with tool use · A&R critique · cost guardrails · multi-provider chat
- Phase 5: Polish layer · sonner toasts · error boundaries · TanStack Query · strict TS

**In progress 🚧**
- Phase 1 finalization: real DSP delivery via RouteNote (needs partner API approval)
- Phase 3: Stripe Connect for splits payouts
- Phase 4: Influencer post verification (TikTok / Meta Graph API approval)
- BYOK (Bring Your Own Keys) UI for image/video providers
- $15/mo Premium subscription tier

---

## Credits

- Made by [Moses Mawela](https://github.com/mosesmawela)
- Inspired by independent artists who refuse to be at the mercy of legacy tools
- Built with [Claude Code](https://claude.com/claude-code) for assistance

---

## License

MIT — see [LICENSE](./LICENSE) (add one if you want to formalize).
