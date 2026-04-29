# Connections & API Integrations Required

Every external service DropKast depends on, ranked by **how soon you need it**. Pricing is current as of April 2026. Confirm before signing — contracts change.

---

## 🚨 Tier 0: Need to ship a real product (do these next 2 weeks)

These four are non-negotiable. Without them DropKast is a great UI on top of fake data. With them, it's a real distro.

### 1. Anthropic (Claude) — AI brain
- **What it powers:** Chat assistant with tool use, A&R critique, campaign strategy.
- **Where to get:** https://console.anthropic.com/settings/keys
- **Setup time:** 10 minutes (sign up, generate key, paste in Vercel env).
- **Cost:** Pay-as-you-go. ~$0.02–0.05 per 10-message session with prompt caching. See `BUDGET_PLAN.md` for projections.
- **Status:** Code wired, just add `ANTHROPIC_API_KEY` env var.

### 2. Supabase — Auth + Postgres + Storage
- **What it powers:** Real user accounts, persistent database (replaces in-memory `db`), uploaded file storage (replaces Cloudinary if desired).
- **Where to get:** https://supabase.com — sign up, create project. You'll get a URL, anon key, and service role key.
- **Setup time:** 1 hour for project setup + Drizzle migration push.
- **Cost:** Pro plan $25/month (8 GB database, 100 GB storage, 100K MAU). Free tier covers up to 500 MB DB / 50K MAU for testing.
- **Status:** Drizzle schema already written (`db/schema.ts`); just create the project and set `DATABASE_URL` + `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.

### 3. RouteNote (or SonoSuite) — Real DSP delivery
- **What it powers:** The actual distribution to Spotify, Apple Music, YouTube Music, Tidal, etc. Without this the "deliver" step is a `setTimeout` that pretends.
- **Where to get:** RouteNote partner program https://routenote.com (B2B); SonoSuite https://sonosuite.com (white-label). Both require sales contact + DDEX approval.
- **Setup time:** 2–6 weeks (legal + DDEX onboarding).
- **Cost (RouteNote):**
  - Free tier: keep 90% of royalties (RouteNote takes 10%). $0/release.
  - Premium: $10/single, $20/EP, $30/album, $9.99/yr renewal. Artist keeps 100%.
  - Partner API: contact for B2B rates.
- **Cost (SonoSuite):** Custom pricing — contact sales. Typical white-label setup runs $1K–$5K/month base + per-release fees.
- **Recommendation:** Start with RouteNote API (cheaper to validate). Move to SonoSuite if you outgrow it.
- **Alternative:** Build DDEX delivery direct to each DSP. ~6 months of engineering. Not recommended for v1.
- **Status:** Need partnership; code ready to plug in (`api/_app.ts:processRelease`).

### 4. Stripe Connect — Royalty splits payouts
- **What it powers:** Pays artists, producers, featured artists, and influencers from the splits page automatically. Without this, splits get recorded but nobody gets paid.
- **Where to get:** https://dashboard.stripe.com — enable Connect platform.
- **Setup time:** 2–3 days. Express accounts are the fastest onboarding path.
- **Cost:**
  - Standard payment processing: 2.9% + $0.30 per transaction (US).
  - Express/Custom Connect accounts: $2/month per active account.
  - Payouts: 0.25% + $0.25 per payout (capped at $25).
  - Instant payouts (optional): 1% of payout.
- **Status:** Schema has `stripeAccountId` field on users + `splits` table. Need to wire onboarding flow + `transfer.paid` webhook.

---

## 🟡 Tier 1: Need before mass launch (next 4–8 weeks)

### 5. RIAA — ISRC registrant code
- **What it powers:** Real ISRC codes that DSPs accept (current code uses a placeholder `DKT` registrant).
- **Where to get:** https://usisrc.org (US ISRC Agency / RIAA).
- **Setup time:** 1–3 weeks.
- **Cost:** ~$95 one-time admin fee for a registrant prefix that lets you mint unlimited ISRCs yourself.
- **Status:** Code already mints valid-format ISRCs; just set `ISRC_REGISTRANT=YOURPREFIX` env var.

### 6. GS1 US — UPC company prefix
- **What it powers:** Real UPC barcodes for releases. Required for retailers + some streaming platforms.
- **Where to get:** https://www.gs1us.org
- **Setup time:** 1–2 weeks.
- **Cost:**
  - Initial fee: ~$250 for 10–100,000 codes (depends on annual revenue).
  - Annual renewal: ~$50–$2,100 depending on tier.
- **Status:** Code mints valid UPC-A with mod-10 check digits; just set `UPC_COMPANY_PREFIX=YOURPREFIX`.

### 7. Cloudinary OR Cloudflare R2 — Audio + artwork storage/CDN
- **What it powers:** Where uploaded audio masters and cover art actually live. Multer in-memory works for demo; not for production.
- **Recommendation: Cloudflare R2** — same price as S3 with **zero egress fees** (huge for audio CDN). Or stay with Cloudinary if you want image transformations baked in.
- **Cost (R2):** $0.015/GB-month storage + $0/GB egress (free).
- **Cost (Cloudinary):** Free tier = 25GB; paid plans from $89/month.
- **Setup time:** 4 hours.
- **Status:** Cloudinary already wired with optional fallback. R2 needs an adapter swap.

### 8. Sentry — Error tracking
- **What it powers:** Catches frontend + backend exceptions in production before users tweet about them.
- **Where to get:** https://sentry.io
- **Setup time:** 30 minutes.
- **Cost:** Free tier (5K errors/month). Team plan $26/month for 50K errors. Business $80/month.
- **Status:** Not wired. Add `@sentry/react` + `@sentry/node`.

### 9. Cloudflare — DDoS / WAF / DNS
- **What it powers:** Free DDoS protection, WAF (rate limit abuse, block bots), CDN for static assets, DNS.
- **Where to get:** https://dash.cloudflare.com — point your domain at Cloudflare.
- **Setup time:** 1 hour.
- **Cost:** Free for the basics. Business plan $250/month for SOC2 reports + advanced WAF.
- **Status:** Not configured. Vercel handles DDoS in front of you, but Cloudflare in front of Vercel adds belt-and-braces.

### 10. PostHog — Product analytics
- **What it powers:** Track signup, upload, deliver, payout funnels. Way more useful than Google Analytics for a SaaS.
- **Where to get:** https://posthog.com
- **Setup time:** 30 minutes.
- **Cost:** Free up to 1M events/month. Then $0.00031/event.
- **Status:** Not wired.

---

## 🟢 Tier 2: Nice-to-have (next 2–3 months)

### 11. TikTok / Meta Graph API — Influencer post verification
- **What it powers:** When an influencer submits a post URL claiming "I posted your campaign," the API confirms the audio in their video matches the release. Without it, you have to trust them or manually verify.
- **Where to get:**
  - TikTok: https://developers.tiktok.com — apply for Marketing API access.
  - Meta: https://developers.facebook.com — apply for Instagram Graph API + Reels access.
- **Setup time:** 4–8 weeks each (platform review).
- **Cost:** Free APIs, but app-review approval can take a month.
- **Status:** Code-side adapter not built; verification button is a stub.

### 12. SoundExchange — Neighbouring rights royalties
- **What it powers:** Collects performance royalties from US digital radio + non-interactive streaming (Pandora, SiriusXM). Many artists don't even know this revenue exists.
- **Where to get:** https://www.soundexchange.com — register as a sound recording owner.
- **Setup time:** 2 weeks (verification).
- **Cost:** Free to register. They take ~5–10% of collected royalties.

### 13. ASCAP / BMI / SESAC — PRO (publishing royalties)
- **What it powers:** Performance royalties on the COMPOSITION (lyrics + melody). Different from master royalties.
- **Where to get:** Pick one PRO. ASCAP is the most artist-friendly.
- **Setup time:** 2–4 weeks.
- **Cost:** ASCAP — $50 one-time for writer, $50 for publisher.

### 14. MLC (Mechanical Licensing Collective) — Mechanical royalties
- **What it powers:** Mechanical royalties on US streaming + downloads.
- **Where to get:** https://www.themlc.com
- **Setup time:** 1 week.
- **Cost:** Free to register. They take a small admin fee.

### 15. ElevenLabs / OpenAI TTS — Optional voice for AI assistant
- **What it powers:** Read the AI assistant's responses out loud for hands-free use.
- **Where to get:** https://elevenlabs.io (best voice quality), https://platform.openai.com/audio (cheaper).
- **Cost:** ElevenLabs Pro $99/month for 100K characters. OpenAI TTS $15/1M characters.
- **Status:** Not wired.

---

## 🔵 Tier 3: AI Generation (image + video, when premium tier ships)

These are wired in the catalog but adapters need building when you're ready.

### Image
| Provider | Use case | Cost | Setup |
|---|---|---|---|
| **Flux (Black Forest Labs)** via fal.ai | Cover art (Schnell tier $0.003/img on Replicate) | https://fal.ai/dashboard/keys | 1 hour |
| **Google Nano Banana 2** | Premium covers | Free 50/day, $0.067/img after | https://aistudio.google.com | 30 min |
| **Ideogram** | Lyric cards, posters with text | $0.02–0.05/img | https://ideogram.ai/api | 30 min |
| **OpenAI DALL-E 3 / gpt-image-1** | Stylized illustration | $0.04–0.12/img | https://platform.openai.com | 30 min |

### Video
| Provider | Use case | Cost | Setup |
|---|---|---|---|
| **Kling 3.0** | Music videos (cheapest per sec, 66 free credits/day) | $0.029/sec | https://klingai.com | 1 hour |
| **Pika 2.0** | Short-form / Reels (free 80 credits/mo) | Standard $10/mo | https://pika.art | 30 min |
| **Veo 3.1 (Google)** | Premium cinematic | ~$0.40–0.50/sec | https://aistudio.google.com | 1 hour |
| **Runway Gen-4** | Director-grade control | $12/mo+ | https://app.runwayml.com | 1 hour |

---

## ⚠️ Already in place (just need keys)

These have working code adapters; you only need to add the env var to use them.

| Variable | Provider | Why use it | Free tier? |
|---|---|---|---|
| `NVIDIA_API_KEY` | NVIDIA NIM | Free chat fallback when Claude budget hits | ✅ 40 RPM indefinite |
| `GROQ_API_KEY` | Groq | Free chat — fastest inference | ✅ 1M tokens/day |
| `CEREBRAS_API_KEY` | Cerebras | Free chat — highest daily cap | ✅ 1M tokens/day, 8K ctx |
| `OPENROUTER_API_KEY` | OpenRouter | Free Llama 4 / Qwen / DeepSeek | ✅ 50 req/day free |

---

## 🛠️ Engineering integrations (no cost, just dev time)

These are software-only — no external account needed but they take engineering effort.

- **Loudness normalization** for audio uploads (LUFS analysis with `web-audio-api` or server-side `ffmpeg`). 1 day.
- **HLS/DASH streaming** for in-app track previews. 2–3 days.
- **Webhook handler hardening** — verify Stripe + RouteNote signatures. 1 day.
- **Audit logs table + middleware** for admin actions. 1 day.
- **Rate limiting** on `/api/ai/*` and `/api/auth/*` with Upstash Ratelimit. 4 hours.
- **GDPR data export + delete** endpoints. 1 day.
- **DMCA takedown flow** — admin tool to mark releases as `taken_down` with reason logging. 1 day.

---

## TL;DR: minimum to launch a paid product

If you can get these 5 things, you can charge artists money:

1. ✅ **Anthropic key** — AI features.
2. ✅ **Supabase project** — real auth + database.
3. ✅ **RouteNote partnership** — actual delivery to DSPs.
4. ✅ **Stripe Connect** — splits payouts.
5. ✅ **RIAA + GS1 codes** — legitimate ISRC/UPC.

Estimated time to full v1: **6–8 weeks** assuming nobody else's onboarding bottlenecks you.

---

## Sources

Pricing data current as of April 2026:
- [RouteNote Pricing](https://routenote.com/pricing)
- [Vercel Pricing](https://vercel.com/pricing)
- [Supabase Pricing](https://supabase.com/pricing)
- [Stripe Connect Pricing](https://stripe.com/connect/pricing)
- [Cloudflare Stream Pricing](https://developers.cloudflare.com/stream/pricing/)
- [US ISRC Agency / RIAA](https://usisrc.org)
- [GS1 US Pricing](https://www.gs1us.org)
- [DDEX Standard](https://ddex.net)
- [Anthropic API Pricing](https://www.anthropic.com/pricing)
