# DropKast — Budget & Operations Plan

How much it costs to **build, launch, and run** DropKast at various scales. All numbers are USD, current as of April 2026, and assume you're following the architecture in this repo (Vercel + Supabase + Anthropic + Stripe + RouteNote).

> **Audience:** non-technical leadership making a build/buy/scale decision. If you want the engineering breakdown of WHAT to integrate, see [`CONNECTIONS_NEEDED.md`](./CONNECTIONS_NEEDED.md).

---

## TL;DR — The numbers you'll be asked

| Scenario | Monthly cost | Per active artist | Notes |
|---|---|---|---|
| **Soft launch** (50 artists, demo mode) | **~$80/mo** | $1.60 | Free Vercel/Supabase tiers + small Anthropic spend |
| **Real product** (500 artists, real distro) | **~$1,200/mo** | $2.40 | Supabase Pro, Vercel Pro, Stripe Connect, RouteNote partner |
| **Growth** (5,000 artists) | **~$8,500/mo** | $1.70 | Supabase Team, Vercel Pro at scale, more AI spend |
| **Scaled** (50,000 artists, à la DistroKid) | **~$60,000/mo** | $1.20 | Enterprise plans, dedicated DSP infra, SOC2, support team |

The per-artist cost goes **down** with scale because most fixed costs (database, distribution agreements, support tooling) don't grow linearly with users. Variable costs (AI calls, payouts, audio storage) do grow but stay predictable.

---

## Phase 1 — Build & launch ($0 → first 50 artists)

### One-time costs
| Item | Cost | Notes |
|---|---|---|
| RIAA ISRC registrant | $95 | One-time. Mints unlimited ISRCs forever. |
| GS1 UPC company prefix | ~$250 + ~$50/yr | Annual renewal scales with company revenue. |
| Domain (e.g. `dropkast.com`) | $12/yr | Cloudflare Registrar at cost. |
| Legal — Terms, Privacy, DPA | $1,500–$5,000 | Use a SaaS-tailored lawyer (Latham, etc.) |
| Trademark filing | $250 | DIY USPTO. $1,500 with attorney. |
| **Total one-time** | **~$2,000** | Bare minimum to launch legitimately. |

### Monthly recurring (soft launch tier)
| Item | Cost | Notes |
|---|---|---|
| Vercel Pro | $20/seat/mo | 1 seat at launch. |
| Supabase Free | $0 | Up to 500MB DB, 50K MAU — fine for first ~50 artists. |
| Anthropic API | $20–50/mo | Assuming ~50 active users with ~10 AI sessions each. |
| Cloudflare DNS + WAF | $0 | Free tier covers DDoS + basic WAF. |
| Email (Resend or Postmark) | $0–$15/mo | Free up to 3K emails. |
| **Monthly total** | **~$40–80/mo** | Cheap. |

### Engineering effort
| Phase | Time | Status |
|---|---|---|
| Phase 0 (auth + DB + Zod) | 5 days | ✅ Code ready, need Supabase project |
| Phase 1 (DSP delivery + ISRC + state machine) | 2 weeks | 🚧 Code ready except RouteNote integration |
| Phase 2 (AI everywhere) | 1 week | ✅ Done |
| Phase 3 (Stripe Connect splits) | 1 week | 🟡 Schema ready, needs onboarding flow |
| Phase 5 (polish layer) | 5 days | ✅ Done |

**Real elapsed time** assuming external blockers: 6–8 weeks (RouteNote partnership is the long pole).

---

## Phase 2 — Real product (50 → 500 artists)

You're charging money. SLAs matter. Splits actually pay out. DSP delivery is real.

### Monthly recurring
| Item | Cost | Why |
|---|---|---|
| Vercel Pro | $20/mo | Bandwidth + functions still under 1TB / 1M invocations. |
| Supabase Pro | $25/mo | 8GB DB + 100GB storage + 100K MAU. |
| Anthropic API | $200–500/mo | 500 users × ~$0.40–1 of AI use/mo. Prompt caching keeps it down. |
| Cloudflare R2 (audio storage) | $50/mo | ~3TB stored at $0.015/GB-month. Zero egress is the win. |
| RouteNote partner share | 0–10% of distributed royalties | They take a cut, not a flat fee. |
| Stripe Connect | $2/active payee/mo + 2.9%+30¢ per txn | If 250 active payees: $500/mo platform fee. |
| Sentry Team | $26/mo | 50K errors/mo. |
| PostHog (free tier) | $0 | First 1M events free. |
| Resend (transactional email) | $20/mo | 50K emails. |
| Domain + Cloudflare | $1/mo amortized | Negligible. |
| **Monthly subtotal** | **~$850–1,100** | Plus payment processing on transfers. |
| **+ Stripe processing fees** | ~3% of GMV | If $50K royalties moved through: ~$1,500. |
| **Monthly total** | **~$1,000–2,500** | Most variability is Stripe fees. |

### Revenue model assumptions
Three ways DropKast can make money — in order of how repeatable they are:

1. **Premium subscription** — $15/mo per artist. 500 artists × 50% conversion × $15 = $3,750/mo MRR. Covers the entire monthly stack.
2. **Per-release fee** — $9.99/release like RouteNote Premium. 500 artists × 1.5 releases/yr avg × $9.99 = $7,500/yr.
3. **Royalty share** — 10% of artist royalties (RouteNote-style). Best long-term, hardest to pitch. If platform GMV is $200K/yr: $20K/yr revenue.

**Hybrid pricing** (recommended): free tier with 10% royalty share + $15/mo premium that drops the share to 0%. Mirrors RouteNote → DistroKid migration path.

---

## Phase 3 — Growth (500 → 5,000 artists)

| Item | Cost | Why |
|---|---|---|
| Vercel Pro | $40–80/mo | 2–4 seats; usage may push you toward Enterprise convo. |
| Supabase Team | $599/mo base | Higher caps, daily backups, point-in-time recovery. |
| Anthropic API | $1,500–4,000/mo | 5K users × ~$0.30–0.80 AI use. Heavy use of Haiku for cheap tasks. |
| Free chat providers (NVIDIA / Groq / Cerebras) | $0 | Free tier covers fallback. |
| Cloudflare R2 | $200/mo | ~13TB stored. |
| Stripe Connect platform fees | $2K/mo | ~1K active payees. |
| Sentry Business | $80/mo | More errors, more retention. |
| PostHog (paid) | $200/mo | ~600M events at $0.00031/event. |
| Customer support tool (Intercom / Crisp) | $200/mo | You'll need this. |
| **Monthly subtotal** | **~$5K** | |
| Stripe processing | ~$3.5K/mo | At $120K GMV. |
| **Monthly total** | **~$8.5K** | |

### When to hire
- **First eng hire** at ~500 paying artists. Senior full-stack, $150K–200K base + equity.
- **First support hire** at ~1,000 paying artists. Part-time → full-time at 5K. ~$60K base.
- **Eng #2 (backend / infra)** at ~5K artists. Same range as #1.
- **A&R coordinator** (the human side of A&R) at ~2K artists. ~$80K.

---

## Phase 4 — Scaled (5K → 50K artists, DistroKid territory)

This is where you stop being a startup and start being an infrastructure company.

| Item | Cost | Why |
|---|---|---|
| Vercel Enterprise | $5K–15K/mo | Custom SLA, higher concurrency caps, dedicated support. |
| Supabase Team / Enterprise | $599–$2K/mo | Or self-hosted Postgres on AWS RDS with Read Replicas (~$1K/mo). |
| Anthropic API | $10K–25K/mo | At scale, negotiate volume contracts with Anthropic. |
| Cloudflare Stream + R2 | $1K–3K/mo | Audio CDN delivery scales linearly with plays. |
| Stripe Connect | $20K–50K/mo | Per-account fees + processing fees on volume. |
| SOC2 audit (first time) | $20K–50K (one-time) + $15K/yr | Required for B2B contracts. |
| Pen test | $15K/yr | At minimum annually, more often pre-launch. |
| Engineering team (5–8 people) | $1M–1.5M/yr in salary | Senior eng is $200K base avg. |
| Support team (3–5 people) | $250K/yr | At $50–80K each. |
| **Monthly platform total** | **~$45K–80K/mo** | Plus salaries. |

### What scaled product looks like
- **Self-hosted Postgres** with read replicas in 2 regions. ~$2K/mo on AWS RDS.
- **Dedicated DSP delivery infra** — own DDEX pipeline, no longer dependent on RouteNote/SonoSuite. ~$5K/mo infra + 6 months engineering.
- **24/7 on-call rotation** for the eng team.
- **SOC2 Type II + ISO 27001** for B2B contracts.

---

## AI maintenance costs — projected

The user asked specifically about AI cost at scale. This is the most variable line item. Worth understanding deeply.

### Per-user cost breakdown at typical use

A typical artist's AI usage in a month:

| Action | Frequency | Model | Tokens (cached) | Cost |
|---|---|---|---|---|
| 5 AI assistant chat sessions @ 10 messages each | 50 messages | Sonnet | ~80K input (cached) + 30K output | $0.74 |
| 2 A&R critiques | 2 | Sonnet | ~5K input + 2K output | $0.06 |
| 1 campaign strategy generation | 1 | Sonnet | ~3K input + 1K output | $0.03 |
| 5 viral idea generations | 5 | Haiku | ~5K input + 4K output | $0.01 |
| 10 image generations (Flux Schnell) | 10 | Flux | n/a | $0.03 |
| **Per-artist monthly AI cost** | | | | **~$0.87** |

With prompt caching the input cost is dramatically lower (90% discount on cached reads). Without caching: ~$2.50/artist/month.

### Cost guardrail (already built)
DropKast enforces a **$1/day per-user** AI budget by default (`AI_DAILY_BUDGET_CENTS=100`). Anyone exceeding gets a 429 with a friendly "budget reset at midnight UTC" message. This caps your worst-case exposure to **$30/artist/month** even if a user goes wild.

### Switching to free providers
If your premium tier doesn't take off, route artists to free providers (NVIDIA/Groq/Cerebras) by default. This drops AI cost from $0.87/artist to **near-zero** at the cost of:
- No tool use (assistant can't read your data; it's just a chatbot).
- Lower-quality A&R critiques (Llama 3.3 < Claude Sonnet).
- Free tier rate limits sometimes hit (40 RPM on NVIDIA, etc.).

### Image / video at scale
Today these aren't wired. Once they are:
- 10 covers × $0.003 (Flux Schnell) = $0.03/artist
- 1 video × $0.029/sec × 30 sec = $0.87 for one Kling music video

If artists generate 10 videos/month each at this rate: $8.70/artist/month. **This is why image/video is the natural Premium tier feature** — it gates the highest-cost ops behind the $15/month subscription.

---

## Security & compliance budget

Don't skip these. One leaked database is a regulatory nightmare.

### Phase 2 (50–500 artists)
| Item | Cost | Frequency |
|---|---|---|
| HTTPS / TLS | $0 | Vercel handles. |
| Encryption at rest | $0 | Supabase default. |
| Backup & PITR | included in Supabase Pro | $25/mo. |
| Cloudflare WAF + DDoS | $0 free / $250 Business | Annual. |
| 2FA on admin accounts | $0 | Use Authy / 1Password. |
| **Phase 2 total** | **~$0–250/mo** | |

### Phase 3+ (real B2B contracts)
| Item | Cost | Frequency |
|---|---|---|
| SOC2 Type II audit | $20K–50K | Year 1. $15K/yr ongoing. |
| Vanta or Drata (compliance tooling) | $7K–15K/yr | Required for SOC2 prep. |
| Penetration test | $10K–20K | Annually. |
| Bug bounty (HackerOne) | $5K–20K/yr | When ready. |
| Cyber insurance | $5K–15K/yr | $1M coverage. |
| **Phase 3+ total** | **~$50K/yr** | Plus per-incident if breach. |

---

## Server / cloud plan recommendations

### Recommended stack (fits the architecture)

| Service | What it does | Why this one |
|---|---|---|
| **Vercel Pro** | Hosts the React app + serverless API | Already configured. Deploys on git push. |
| **Supabase Pro** | Postgres + Auth + Storage | Postgres native (Drizzle works), generous storage. |
| **Cloudflare R2** | Audio file storage / CDN | Zero egress. Critical for music delivery. |
| **Anthropic API** | AI brain | Tool use is the differentiator. |
| **Stripe Connect** | Payment processing | Industry standard for marketplaces. |
| **Resend** | Transactional email | Simple, dev-friendly, cheap. |
| **Sentry** | Error tracking | Catches bugs before users tweet. |
| **PostHog** | Product analytics | Funnel tracking + feature flags. |
| **Cloudflare** (free) | DNS + DDoS + WAF | Free belt-and-braces. |

### Don't do these (common mistakes)

- ❌ **AWS from scratch** — you'll spend 3 months on devops before shipping a feature.
- ❌ **Self-host Postgres at small scale** — backups + monitoring is more work than it saves.
- ❌ **Build your own DDEX delivery in v1** — 6 months of engineering to replicate what RouteNote/SonoSuite has.
- ❌ **Use Firebase** — vendor lock-in plus painful migration if you outgrow it.
- ❌ **Skip Cloudflare** — even at small scale, free DDoS protection is worth setting up.
- ❌ **Run your own email server** — deliverability is a full-time job.

---

## "How much for AI to maintain most of this site?"

Here's the answer to the specific question.

### What "AI maintaining the site" means concretely

If you mean **"can Claude Code (or similar) handle ongoing engineering tasks like adding features, fixing bugs, updating deps?"** — yes, with these caveats:

**Things AI can do well today:**
- Add new pages / forms / features (90%+ correctness)
- Update libraries to new versions
- Write tests
- Fix UI bugs visible in screenshots
- Generate marketing copy / docs / lesson content
- Refactor code with clear specifications

**Things AI cannot do alone:**
- Negotiate the RouteNote partnership
- Sign a SOC2 contract
- Decide product direction
- Talk to a real artist about why a feature is broken
- Approve a database migration that drops a column

### Cost projection for AI-assisted maintenance

Assuming Claude Code as the primary tool with a human (you or a contractor) reviewing/approving:

| Activity | Hours/week | AI cost |
|---|---|---|
| Bug fixes + small features | 5 hours | $25–50/week ($100–200/mo) |
| Larger features (1 new page, deeper integration) | 5 hours | $50–100/week ($200–400/mo) |
| Dependency updates + housekeeping | 1 hour | $5/week ($20/mo) |
| Code reviews + planning | 2 hours | $20/week ($80/mo) |
| **Monthly AI cost for maintenance** | ~13 hours | **~$400–700/mo** |

**Plus a part-time human reviewer** (you or contractor) at ~10 hours/week = $1,500–4,000/mo depending on rate.

**Total for AI-assisted maintenance:** ~$2K–5K/mo through Phase 2. At Phase 3+ you need real engineers, not AI.

### The honest bound

AI cannot maintain a SaaS that takes payments, processes royalties, and serves DSPs without **at least one human responsible**. Auditors won't accept it. Stripe won't accept it. Spotify won't accept it. Treat AI as a 10× productivity multiplier on a human, not a replacement.

---

## Recommended decision framework

When your boss asks "should we go ahead?" — here's the math:

**Break-even analysis** (Phase 2 — 500 artists):
- Monthly cost: ~$1,200
- Per-artist revenue at $15/mo: $15
- **Break-even at 80 paying artists** ($15 × 80 = $1,200)

**Conservative funding ask** (12 months runway through Phase 2):
- Monthly burn (no salaries): $1,200
- One-time setup: $2,000
- 12 months × $1,200 + $2,000 + ~$30K eng contract budget = **~$50K**

**With one part-time engineer** (you + AI + 1 contractor at $5K/mo):
- 12 months × $6,200 + $2K = **~$76K**

**With one full engineer** ($15K/mo all-in):
- 12 months × $16K + $2K = **~$194K**

---

## Sources

Pricing data current as of April 2026. Always reconfirm before signing:
- [Vercel Pricing](https://vercel.com/pricing)
- [Supabase Pricing](https://supabase.com/pricing)
- [Stripe Connect Pricing](https://stripe.com/connect/pricing)
- [RouteNote Pricing](https://routenote.com/pricing)
- [Anthropic API Pricing](https://www.anthropic.com/pricing)
- [Cloudflare Stream Pricing](https://developers.cloudflare.com/stream/pricing/)
- [US ISRC Agency](https://usisrc.org)
- [GS1 US Pricing](https://www.gs1us.org)

For the engineering breakdown (which API, what env var, where to sign up), see [`CONNECTIONS_NEEDED.md`](./CONNECTIONS_NEEDED.md). For the implementation phases, see [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).
