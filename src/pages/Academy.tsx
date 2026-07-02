import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ChevronRight,
  ChevronDown,
  Check,
  Lock,
  Play,
  Music,
  Megaphone,
  Target,
  MessageSquare,
  BarChart,
  Wallet,
  Users,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Lesson {
  id: string;
  title: string;
  duration: string; // e.g. "5 min"
  body: string; // markdown-lite — paragraphs separated by \n\n
  cta?: { label: string; href: string };
}

interface Module {
  id: string;
  title: string;
  blurb: string;
  icon: any;
  level: 'foundation' | 'intermediate' | 'advanced';
  lessons: Lesson[];
}

const MODULES: Module[] = [
  {
    id: 'foundations',
    title: 'Foundations: How DropKast Works',
    blurb: 'Get the lay of the land in 10 minutes. Then everything else clicks.',
    icon: Cpu,
    level: 'foundation',
    lessons: [
      {
        id: 'overview',
        title: 'What DropKast actually does',
        duration: '3 min',
        body: `DropKast is a "vertical stack" for independent music: one tool that handles distribution to DSPs (Spotify, Apple, etc.), AI-generated marketing assets, a verified influencer network, DJ servicing, and direct A&R submission to the LVRN inner circle.

Most artists today juggle 5-7 tools — DistroKid for distribution, Linkfire for smart links, ToneDen for ads, an agent's email list for influencers, a separate Stripe Connect for splits. DropKast collapses all of that into a single dashboard with one billing relationship and one source of truth.

The "trick" is that the AI assistant in the bottom-right has live tool access to your real catalog data. So when you ask "how is my last release doing?" it actually pulls the analytics — not just hallucinates.`,
        cta: { label: 'Open Dashboard', href: '/dashboard' },
      },
      {
        id: 'portals',
        title: 'Three portals: Artist / Creator / DJ',
        duration: '2 min',
        body: `DropKast has three sides:

**Artist Core** — you make music. Distribution, campaigns, splits, AI assets, A&R submission.
**Creator Relay** — you make content. Accept paid missions from artists, post, get paid.
**Vibe Selecta (DJ)** — you spin. Get exclusive packs, send feedback, shape what charts.

Your account can have multiple roles — switch via "Switch Role" in the sidebar footer. Notifications cross over: an artist sending a campaign creates a "New Mission" alert in the creator's inbox, etc.`,
      },
      {
        id: 'navigation',
        title: 'Sidebar map: every feature in one breath',
        duration: '5 min',
        body: `The sidebar lists every major feature top-to-bottom in the order you'd actually use them across a release lifecycle:

1. **Home** — overview / current activity
2. **Pre-Release** — plan the launch (hooks, creators, drop-day strategy)
3. **Campaigns** — running marketing campaigns with budgets + plans
4. **Influencers** — verified creator roster, send paid briefs
5. **Promo Packs** — AI-generated meme/TikTok asset bundles
6. **UGC Studio** — lipsync videos, lyric clips, remix templates
7. **DJ Packs** — stems/edits/instrumentals for the DJ network
8. **Reactions** — track first-listen reactions across platforms
9. **Social Ads** — paid Meta/TikTok/YouTube ad campaigns
10. **Split Sheets** — royalty splits for collaborators
11. **A&R Feedback** — submit for Claude critique + LVRN review
12. **Analytics** — plays, clicks, reach per release
13. **Treasury** — earnings, payouts, royalty statements
14. **Assets** — cover art, video teasers, mood boards
15. **AI Models** — tier list of every model the platform can route through
16. **Settings** — appearance, AI engine config, account, billing

Hit the tutorial button in Settings to spotlight each one in sequence.`,
        cta: { label: 'Replay tutorial', href: '/settings' },
      },
    ],
  },
  {
    id: 'release',
    title: 'How To Release A Song (The Right Way)',
    blurb: 'A 14-day rollout calendar, hook timing, and the metadata that actually matters.',
    icon: Music,
    level: 'foundation',
    lessons: [
      {
        id: 'timeline',
        title: 'The 14-day rollout calendar',
        duration: '6 min',
        body: `Most distros let you release "tomorrow." That's a mistake. You need at least 14 days for the playlist editors and algorithmic systems to register your release as a real launch.

**T-14 days:** Submit to DropKast. Audio masters, cover art, metadata locked. Your release is in 'submitted' state.
**T-10:** Pitch tracks to Spotify editorial via Spotify for Artists (DropKast surfaces the link).
**T-7:** Drop a 15-second hook teaser on TikTok + Reels. Watch which version gets engagement.
**T-3:** Lock the winning teaser, push it to your Promo Pack queue. Send influencer briefs.
**T-1:** Final cross-check on metadata. Any typo on the artist name and DSPs treat it as a different artist.
**T-0 (release day):** Auto-deployed by DropKast. Push the link in stories, your assistant tracks playback.
**T+3:** First analytics check. Drop additional content for tracks that are getting traction.
**T+14:** Mid-cycle review. Refresh ad creative, send to a second wave of influencers.

The campaign system in DropKast can auto-generate this calendar from a release ID — go to Campaigns → New.`,
        cta: { label: 'Plan a campaign', href: '/campaigns/new' },
      },
      {
        id: 'metadata',
        title: 'Metadata that actually moves the needle',
        duration: '4 min',
        body: `Sloppy metadata is the #1 reason releases get rejected or under-performed. The fields that matter:

**Title** — exactly as it should appear. No "(Official)", no "[HD]", no "(prod. by ...)". Producers go in the credits, not the title.

**Artist name** — match your prior releases EXACTLY. "Buddy Kay" and "Buddy.Kay" are two different artists to Spotify's algorithm.

**Featured artists** — list as proper "feat." in the artist field, not in the title. Tag their Spotify URI in the credits.

**ISRC** — DropKast auto-mints this. Don't reuse from a previous version.

**Genre + sub-genre** — pick two. Mass-market labels overpick "Pop" and miss algorithmic playlists. The right sub-genre opens niche playlists.

**Mood + energy** — Spotify uses these for recommendation. Don't lie. A "chill" track tagged "high-energy" gets de-prioritized fast.

**Lyrics** — upload them. Lyric searches drive 12-15% of new listens.

**Release date** — set 14+ days out for the editorial pitch window.`,
      },
      {
        id: 'hook',
        title: 'The hook test (and why most releases fail it)',
        duration: '4 min',
        body: `Spotify's recommendation engine pays attention to the first 30 seconds and the 30-60 second segment. If listeners skip in the first 7 seconds, your track is permanently de-prioritized.

The hook test:
1. Pick the most identifiable 8-second segment.
2. Loop it three times back-to-back. Does it still feel good?
3. If not, that's not your hook. Try another segment.

In DropKast, set hook timing in Pre-Release. The Promo Pack system uses those timestamps when generating teasers. Influencer briefs include the hook so creators don't pick a random clip.

Common failures:
- Hook starts at 1:00. Most listeners never get there.
- Hook is the chorus, but the chorus is generic. Strong verses + weak hook = skip.
- "The whole song is the hook" — pick one. The algorithm needs a single repeatable moment.`,
      },
    ],
  },
  {
    id: 'ar',
    title: 'A&R Skills (Talking To Your Own Music)',
    blurb: "Listen like an A&R, not like the artist who made it. Most people can't.",
    icon: MessageSquare,
    level: 'intermediate',
    lessons: [
      {
        id: 'ar-mindset',
        title: 'The A&R mindset switch',
        duration: '5 min',
        body: `An A&R doesn't ask "is this good?". They ask "who is this FOR, and is THAT person already buying tickets?"

Three filters every A&R applies in 30 seconds:
1. **Lane clarity** — can I name 2 comparable artists in <5 seconds? If not, the marketing department can't either.
2. **Hook density** — at least one moment in the first 90 seconds I want to hear again immediately.
3. **Replay floor** — would I voluntarily play it again right now? Not "is it pleasant", but "do I REACH for it?"

Most artists fail filter #1 because they think "originality" means avoiding comps. It doesn't. Originality lives inside a clear lane — Tyler the Creator is unmistakably his lane, but he's still on a lane (alt-rap-pop). "Genre-bending" without a clear primary lane = playlist nowhere-land.

Use the A&R Feedback page to get a Claude critique scored 1-10 on these filters. Score below 6? Edit. Don't release.`,
        cta: { label: 'Open Studio', href: '/studio' },
      },
      {
        id: 'comp-artists',
        title: 'How to pick comp artists (without sounding delusional)',
        duration: '4 min',
        body: `"Sounds like Drake meets Frank Ocean" → instant ignore from any A&R. Comps are positioning tools, not aspirations.

Rules for honest comps:
1. **Tier-match.** If you have <10K monthly listeners, your comps should have 50K-500K monthly listeners. Not 5M+.
2. **Sonic-match, not aspiration-match.** Not "who I want to BE" — "who fans of my music ALREADY listen to."
3. **Three comps minimum.** One comp is a Spotify pitch. Three is a positioning. "If you like X, Y, and Z — try this."
4. **Specific tracks, not whole catalogs.** Say "the production on Snoh Aalegra's 'Whoa'" not "Snoh Aalegra in general."

Plug your three best comps into the A&R submission form. Claude uses them to position you against the right playlists and influencer clusters in your campaign plan.`,
      },
      {
        id: 'feedback',
        title: 'Reading feedback without ego (the hardest skill)',
        duration: '4 min',
        body: `Every A&R critique you'll ever read says one of three things in different words:

1. **"This isn't differentiated enough"** → fix: pick a riskier production decision, a more specific lyrical lens.
2. **"This is differentiated but not commercial"** → fix: tighten the hook, shorten the intro, fix the structure.
3. **"This is commercial but the artist identity is muddy"** → fix: brand work — visuals, bio, comp positioning, content strategy.

When you read a critique, identify which of those three buckets it falls into. Don't fight the bucket; just decide if you'll work on it.

DropKast's A&R Feedback page returns a markdown critique with a numerical score. The score is just a heuristic — the lessons are in "What To Fix First". Read that section three times before deciding to release.`,
      },
    ],
  },
  {
    id: 'campaign',
    title: 'Planning A Campaign That Actually Works',
    blurb: "Budget, channels, and the order operations matter in.",
    icon: Target,
    level: 'intermediate',
    lessons: [
      {
        id: 'budget',
        title: 'Budget allocation: the 60/30/10 rule',
        duration: '4 min',
        body: `Whatever you have to spend on a release campaign, allocate roughly:

**60% to discovery channels** — paid social ads + influencer placements. This is what generates new listeners.
**30% to content production** — covers, video teasers, UGC kits. Without content the discovery spend has nothing to push.
**10% to retargeting + optimization** — re-engage people who pre-saved, who watched the teaser but didn't stream, who saved the track. This is the highest-ROAS spend if you have it.

A $1,000 indie campaign:
- $600 paid ads + 2-3 micro-influencer placements
- $300 cover variants + 3 short-form video edits + 1 lyric video
- $100 retargeting on Day 7+

DropKast's campaign generator can produce this allocation automatically. Adjust the budget slider; it scales linearly.`,
        cta: { label: 'New campaign', href: '/campaigns/new' },
      },
      {
        id: 'channels',
        title: 'Channels in the right order',
        duration: '5 min',
        body: `Don't spread thin. The order:

1. **TikTok (or Reels) first.** Short-form is the only channel where a no-name artist can blow up organically in 2026. One clip catching = 100K+ free listens.
2. **Spotify editorial pitch.** Done from your Spotify for Artists page; aim for ≥7 days out from release.
3. **Influencer relays.** Pay 3-5 micro-creators (10-100K followers) — they outperform one mega-influencer 5x for music discovery.
4. **DJ servicing.** Send the pack to 10-15 trusted DJs in the relevant genre. Their feedback alone is data; their plays are bonus.
5. **Paid social ads.** ONLY after the organic content has settled — you'll know which clip performs best, run paid amplification on that one.
6. **Retargeting wave.** Day 7+, re-engage your saves and watchers.
7. **Press/review pitches.** Last, not first. A blog write-up does almost nothing for streams in 2026 — but it builds your EPK for sync placements.`,
      },
      {
        id: 'metrics',
        title: 'The only 4 metrics that matter',
        duration: '3 min',
        body: `Ignore monthly listeners. Track these instead:

**Skip rate (first 30 sec)** — if >40%, the intro is too long or the hook is wrong. Edit and re-release as a remix.

**Save-to-stream ratio** — should be >5%. Below that, the listener got there but didn't think it was worth keeping. Identity issue.

**Cost per save** — for paid campaigns, $0.20-$0.50 per save is healthy. Higher = wrong targeting or wrong creative.

**Editorial-to-algorithmic ratio** — once on Spotify, 30/70 editorial/algorithmic is healthy. 90/10 means you got a placement but didn't earn algorithmic momentum (the placement will end and you'll fall off).

DropKast Analytics tracks all four per-release. Chat with Claude in the assistant — it can compare these across your catalog automatically.`,
        cta: { label: 'Open Analytics', href: '/analytics' },
      },
    ],
  },
  {
    id: 'monetize',
    title: 'Monetization: Splits, Royalties, Sync',
    blurb: 'How money actually flows from a stream to your bank account.',
    icon: Wallet,
    level: 'advanced',
    lessons: [
      {
        id: 'two-copyrights',
        title: 'The two copyrights in every song',
        duration: '5 min',
        body: `Here's the single most important fact in the entire music business: every song is actually **two separate copyrights**, owned separately, that earn money separately.

**1. The composition (the "song" / "musical work")** — this is the underlying songwriting: the melody, the chords, the lyrics. It exists before anyone records anything. If ten artists cover it, it's still one composition. Owned by the **songwriter(s)** and their **publisher(s)**. Its earnings are called **publishing royalties**.

**2. The master (the "sound recording" / "master recording")** — this is the specific recorded performance you actually hear. Owned by whoever paid for / made the recording — historically the record label, but for an independent artist, **you**. Its earnings are called **master royalties**.

A quick way to remember it: on a vinyl label, the composition is the song credit ("written by…") and the master is the ℗ (phonogram) line ("℗ 2026 Your Label"). The composition uses the © symbol; the master uses the ℗ symbol.

**Why this matters for your money:** when your song streams on Spotify, BOTH copyrights get paid, through completely different pipes:
- The **master** side is paid to your distributor (DropKast) → you.
- The **composition** side is paid to your PRO and mechanical collector → your publisher → you.

If you only set up the master side (distribution) and skip the composition side (publishing registration), you are literally leaving the second cheque uncollected. Most independent artists collect 100% of their master money and 0% of their publishing money for years without realizing it.`,
      },
      {
        id: 'splits',
        title: 'Split sheets are non-negotiable',
        duration: '3 min',
        body: `If you don't have a written split agreement BEFORE the song is released, you don't have a song — you have a future lawsuit.

Standard splits for a vocal-led song:
- Artist (vocals + topline): 30-50%
- Producer (beat + production): 30-50%
- Featured artist: 5-15%
- Co-writer / additional production: 5-10%

A split sheet is the one-page document that records this. It should name every contributor and their **role** — composer (melody/chords), lyricist (words), producer (beat/production), performer (vocals/instrumentation), publisher, and master owner — and the exact percentage each holds. Critically: **all percentages must total 100%.** A split sheet that adds up to 90% or 110% will bounce when you try to register the work with a PRO. Note too that splits can differ across the two copyrights — the composition split (writers) and the master split (recording owners) don't have to match.

Sign it **before release**, while everyone is still friendly and remembers who did what. Chasing a signature after a song blows up is how careers end in lawsuits.

Two common mistakes:
1. "We'll figure it out later." Translate: "I'll figure it out in court."
2. "I produced it AND wrote it" — combine the share but be explicit. Producers without contracts often claim 50% post-success.

DropKast's Split Sheet page (\`/splits\`) generates a written agreement, signed by all parties via email, stored on file, and enforces the 100% total for you. When royalties land, Stripe Connect (Phase 3) splits them automatically — no quarterly reconciliation, no fights.`,
        cta: { label: 'Open Split Sheets', href: '/splits' },
      },
      {
        id: 'royalty-types',
        title: 'The 5 types of royalties (and where they come from)',
        duration: '6 min',
        body: `Most artists only know about streaming royalties. There are five distinct income streams:

1. **Master streaming/sales royalties** — paid by DSPs for streams of YOUR recording. Collected by your distributor (DropKast → you / your splits). On Spotify the payout works out to roughly **$0.003-$0.005 per stream** (Spotify does not pay a fixed per-stream rate — it's a pro-rata share of the revenue pool, so the effective rate moves). Apple Music runs a bit higher (~$0.007-$0.01), YouTube much lower.

2. **Performance royalties** — part of the COMPOSITION side. Paid whenever the song is *performed publicly*: terrestrial/online radio, streaming, live venues, bars, TV, in-store music. Collected by a **PRO** (Performing Rights Org): ASCAP, BMI, SESAC or GMR in the US; PRS for Music in the UK; SAMRO in South Africa. Split into a writer's share (paid straight to you, always) and a publisher's share.

3. **Mechanical royalties** — the other half of the COMPOSITION side. Paid whenever the song is *reproduced*: physical (vinyl/CD), permanent downloads, and interactive streams. In the US the **statutory mechanical rate** for physical + downloads is **12.4¢ per copy** for a song of 5 minutes or less (this is the 2023-2027 rate set by the Copyright Royalty Board); longer songs are 2.39¢ per minute. Streaming mechanicals in the US are collected by **The MLC** (The Mechanical Licensing Collective); physical/download mechanicals via **HFA** (Harry Fox Agency). UK/most of the world: MCPS (via PRS), CAPASSO in South Africa.

4. **Neighbouring / needletime rights** — paid for the MASTER being *performed publicly* (radio play, TV, venues) — completely separate from publishing, and separate from streaming. Split between the master owner and the featured/session performers. Collected by **SoundExchange** in the US (digital radio only, e.g. SiriusXM, Pandora), **PPL** in the UK, and **SAMPRA** in South Africa. This is big money in Europe and routinely missed by US-focused artists.

5. **Sync royalties** — a negotiated fee (not a pooled royalty) paid when your music is placed in TV, film, ads, trailers, or video games. A sync deal licenses BOTH copyrights, so you typically get a **master fee + a publishing (sync) fee**. Range is enormous: a small indie-film placement might be a few hundred dollars; a national ad or major-film spot can be **$5,000-$50,000+**. The EPK you build in DropKast is what sync agents review.

Bottom line: a single release can be earning in **all five** places at once. Registering the master (distribution) only captures #1. Setting up publishing (#2, #3) and neighbouring rights (#4) is the difference between collecting one cheque and collecting four.`,
      },
    ],
  },
  {
    id: 'rights',
    title: 'Publishing, PROs & Getting Paid',
    blurb: 'Set up the collection side once. Collect for the rest of your life.',
    icon: Wallet,
    level: 'advanced',
    lessons: [
      {
        id: 'publishing-explained',
        title: 'Publishing explained: writer share vs publisher share',
        duration: '5 min',
        body: `"Publishing" scares people because it sounds like something only rich people have. It isn't — if you wrote the song, you already own the publishing. The question is just whether you're *collecting* it.

The composition's earnings are split into two classic halves:

**Writer's share (50%)** — belongs to the human songwriter(s), forever. It cannot be signed away in most deals; your PRO pays it directly to you. If you and a co-writer split the writing 50/50, you each own half of this 50%.

**Publisher's share (50%)** — belongs to whoever "publishes" the work. If you have no publisher, **you own this too** (you're self-published). A traditional publishing deal is essentially you giving up some/all of this half in exchange for advances and admin work.

So the phrase "a 50/50 publishing deal" means: the publisher takes the publisher's share (50% of the composition), you keep the writer's share (the other 50%).

**Who does what:**
- **Publishing administrator (admin deal)** — the light-touch option. They register your works everywhere, chase down royalties globally, and collect for a fee of roughly **10-25%**. You keep ownership of your copyrights. Best for most indies. Examples: Songtrust, Sentric, CD Baby Pro, TuneCore Publishing.
- **Co-publishing deal** — you and a publisher co-own the publisher's share (often 75/25 in your favour after the writer's share) in exchange for an advance and active song-plugging/sync-pitching.
- **Full publishing deal** — the publisher takes the whole publisher's share (and sometimes more). Big advance, least ownership. Rare for new artists and usually not worth it unless the advance is life-changing.

Rule of thumb for a new artist: start with a **publishing admin** (or self-administer via a PRO + The MLC). Don't sign a co-pub/full deal until a publisher is offering real money for a real reason.`,
      },
      {
        id: 'pros-cmos',
        title: 'PROs & CMOs by region — who to register with',
        duration: '6 min',
        body: `Collection societies (PROs for performance, CMOs generally) are non-profit-ish organizations that license your music to businesses and pay you. You register **once per society**, then every registered work earns automatically. You generally join the society in your home country; they have reciprocal deals to collect worldwide.

**United States**
- **ASCAP** and **BMI** — the two big performing rights orgs. Free (BMI) or low one-time fee (ASCAP) to join as a writer. Pick one; you can't be in both simultaneously as a writer.
- **SESAC** and **GMR** — invite-only boutique PROs. You don't apply here as a newcomer.
- **The MLC** — collects US *streaming mechanical* royalties. Free to join, and if you self-publish you MUST register here or that money sits unclaimed.
- **HFA (Harry Fox Agency)** — handles physical/download mechanical licensing.
- **SoundExchange** — collects *digital performance / neighbouring* royalties for the master (SiriusXM, Pandora, webcasters). Free. Register as both the recording artist AND the rights owner if you own your masters.

**United Kingdom**
- **PRS for Music** — performance royalties (the ASCAP/BMI equivalent).
- **MCPS** — mechanical royalties (usually joined together with PRS).
- **PPL** — neighbouring rights for the master (the SoundExchange equivalent) plus session-musician payments.

**South Africa**
- **SAMRO** — performance royalties for the composition (the PRO). Register here as a songwriter.
- **CAPASSO** — mechanical royalties (streaming + reproduction) for the composition.
- **SAMPRA** — needletime / neighbouring rights for the master recording (the PPL/SoundExchange equivalent).

**Who should register with what:**
- Wrote the song? → your local **PRO** (ASCAP/BMI, PRS, SAMRO) for performance, **+ a mechanical collector** (The MLC, MCPS, CAPASSO) for mechanicals.
- Own the master? → a **neighbouring-rights org** (SoundExchange, PPL, SAMPRA).
- Most indies end up registered with 3 organizations minimum. A publishing admin (previous lesson) can register you with most of these in one go instead of doing each manually.`,
      },
      {
        id: 'getting-paid',
        title: 'Getting paid: ISRC, ISWC & registering your works',
        duration: '5 min',
        body: `Royalties don't find you — they're matched to codes and registrations. Miss the setup and the money literally cannot be routed to you. It piles up in a "black box" and is eventually redistributed to *other* rightsholders. Billions of dollars sit unmatched globally every year.

**The two codes you must know (one per copyright):**

**ISRC — International Standard Recording Code.** Identifies the **master** (the specific recording). Format looks like \`US-ABC-25-00001\`. A brand-new ISRC is minted for every distinct recording (a remix or a re-record needs its own). DropKast / your distributor auto-assigns this at upload — never reuse an old one.

**ISWC — International Standard Musical Work Code.** Identifies the **composition** (the underlying song). Format looks like \`T-123.456.789-0\`. It's assigned by your PRO when you register the work. One composition = one ISWC, even across covers, live versions and remixes.

Easy way to keep them straight: **ISRC = the Recording, ISWC = the Written work.**

**The registration checklist for every release:**
1. **Distribute the master** (DropKast) → gets ISRC, starts master streaming royalties.
2. **Register the composition with your PRO** (ASCAP/BMI/PRS/SAMRO) → gets ISWC, starts performance royalties. Add all co-writers with their exact splits — splits must total **100%**.
3. **Register mechanicals** (The MLC / MCPS / CAPASSO, or let a publishing admin do it) → starts streaming + reproduction mechanicals.
4. **Register the master for neighbouring rights** (SoundExchange / PPL / SAMPRA) → starts digital-radio + public-performance master money.

**Why unregistered works lose money — a concrete example:** a self-published track does 1,000,000 Spotify streams. The master side pays out via the distributor no matter what. But the **streaming mechanical** portion (paid via The MLC) and the **performance** portion (paid via your PRO) only pay if the composition is registered and the writer splits are on file. Skip those and you can silently forfeit a meaningful slice of the total earnings on that same million streams — money that was generated but never claimed.

The fix is boring and permanent: register once, per work, before or right at release. Do it every time and the pipes stay connected for the life of the copyright.`,
        cta: { label: 'Set up your splits', href: '/splits' },
      },
    ],
  },
  {
    id: 'platform',
    title: 'Master The Platform',
    blurb: 'Power-user tricks for DropKast specifically.',
    icon: Sparkles,
    level: 'intermediate',
    lessons: [
      {
        id: 'ai-models',
        title: 'Pick the right AI model for the job',
        duration: '4 min',
        body: `DropKast routes through 21 different AI models across text, image, and video. Most people use the default. Smart users pick per task:

**Text/chat:**
- Catalog-aware questions ("how is X doing?") → Claude (only one with tool use).
- Bulk metadata, captions, viral ideas → Cerebras or Groq (free, fast).
- A&R critique → Claude Sonnet (higher reasoning).

**Image (cover art):**
- Album art final → Flux Pro or Nano Banana Pro ($0.05-$0.13/image, looks pro).
- Quick concepts → Flux Schnell ($0.003/image on Replicate, generate 50 in a minute).
- Lyric cards / posters → Ideogram (best in-image text accuracy).

**Video (teasers):**
- Music video draft → Kling 3.0 ($0.029/sec, free tier 66 credits/day).
- Cinematic shots → Veo 3 (best output, premium).
- Stylized short-form → Pika or Hailuo (free with watermark).

Tier list: /ai-providers. Switch model in the chat header dropdown live.`,
        cta: { label: 'See models', href: '/ai-providers' },
      },
      {
        id: 'tutorial-replay',
        title: 'Re-enable the tutorial / replay any time',
        duration: '1 min',
        body: `Skipped the tour? Want to redo it after a UI update? Settings → Tutorial → "Replay tour" walks every feature again with spotlights.

Same panel toggles "Tutorial enabled" off if you never want to see it again, even after a fresh login.`,
        cta: { label: 'Open Settings → Tutorial', href: '/settings' },
      },
      {
        id: 'tour-now',
        title: 'Run the live spotlight tour now',
        duration: '3 min',
        body: `If you'd rather see the spotlight version of the navigation, run the in-app tour. It overlays each sidebar item with a popup explaining what it does and how it fits the workflow.

Open Settings → Tutorial → click "Start tour" and walk through it.`,
        cta: { label: 'Start spotlight tour', href: '/settings' },
      },
    ],
  },
];

const ICON_BY_MODULE: Record<string, any> = {
  foundations: Cpu,
  release: Music,
  ar: MessageSquare,
  campaign: Target,
  monetize: Wallet,
  rights: Wallet,
  platform: Sparkles,
};

const PROGRESS_KEY = 'dropkast_academy_progress_v1';

function loadProgress(): Set<string> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveProgress(s: Set<string>): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify([...s]));
  } catch {
    // ignore
  }
}

export default function Academy() {
  const navigate = useNavigate();
  const [open, setOpen] = useState<string | null>('foundations');
  const [completed, setCompleted] = useState<Set<string>>(loadProgress);
  const [activeLesson, setActiveLesson] = useState<{ moduleId: string; lessonId: string } | null>(null);

  const totalLessons = MODULES.reduce((sum, m) => sum + m.lessons.length, 0);
  const pct = Math.round((completed.size / totalLessons) * 100);

  const markComplete = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveProgress(next);
      return next;
    });
  };

  const lesson = activeLesson
    ? MODULES.find((m) => m.id === activeLesson.moduleId)?.lessons.find((l) => l.id === activeLesson.lessonId)
    : null;

  return (
    <div className="space-y-6 pb-12">
      <header className="border-b border-[var(--border-main)] pb-5">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-primary italic">
            DropKast Academy
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-mono font-black tracking-tighter text-[var(--text-main)] italic uppercase">
              Mini-Course: Release, A&R, Campaign, Platform
            </h1>
            <p className="text-[var(--text-main)]/40 mt-1 text-xs max-w-2xl">
              {MODULES.length} modules. {totalLessons} lessons total, ~75 minutes end-to-end. Built for indie artists who
              want to run their career like a label without hiring one.
            </p>
          </div>
          <div className="manifest-card border border-[var(--border-main)] bg-[var(--card-bg)] px-4 py-2 min-w-[180px]">
            <div className="text-[9px] font-mono font-black uppercase tracking-[0.3em] text-[var(--text-main)]/40 italic mb-1">
              Your progress
            </div>
            <div className="text-base font-mono font-black uppercase italic tracking-tight">
              {completed.size}/{totalLessons} <span className="text-primary">({pct}%)</span>
            </div>
            <div className="mt-1 h-1 bg-white/5 overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        {/* Module list */}
        <aside className="space-y-2">
          {MODULES.map((m) => {
            const Icon = ICON_BY_MODULE[m.id] || GraduationCap;
            const isOpen = open === m.id;
            const moduleProgress = m.lessons.filter((l) => completed.has(`${m.id}/${l.id}`)).length;
            return (
              <div key={m.id} className="manifest-card border border-[var(--border-main)] bg-[var(--card-bg)]">
                <button
                  onClick={() => setOpen(isOpen ? null : m.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                >
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono font-black uppercase italic tracking-tight text-[var(--text-main)] truncate">
                      {m.title}
                    </div>
                    <div className="text-[9px] font-mono text-[var(--text-main)]/40 uppercase tracking-widest italic">
                      {moduleProgress}/{m.lessons.length} lessons · {m.level}
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-3 h-3 text-[var(--text-main)]/40 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-[var(--text-main)]/40 shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-[var(--border-main)]"
                    >
                      {m.lessons.map((l) => {
                        const isDone = completed.has(`${m.id}/${l.id}`);
                        const isActive = activeLesson?.moduleId === m.id && activeLesson?.lessonId === l.id;
                        return (
                          <li key={l.id}>
                            <button
                              onClick={() => setActiveLesson({ moduleId: m.id, lessonId: l.id })}
                              className={cn(
                                'w-full flex items-center gap-2 px-3 py-2 text-left transition-colors text-[11px]',
                                isActive ? 'bg-primary/10 text-primary' : 'text-[var(--text-main)]/60',
                              )}
                            >
                              {isDone ? (
                                <Check className="w-3 h-3 text-green-500 shrink-0" />
                              ) : (
                                <Play className="w-3 h-3 shrink-0" />
                              )}
                              <span className="flex-1 italic">{l.title}</span>
                              <span className="text-[9px] font-mono text-[var(--text-main)]/30 shrink-0">{l.duration}</span>
                            </button>
                          </li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </aside>

        {/* Lesson reader */}
        <main className="manifest-card border border-[var(--border-main)] bg-[var(--card-bg)] p-6 min-h-[480px]">
          {lesson && activeLesson ? (
            <LessonView
              lesson={lesson}
              moduleId={activeLesson.moduleId}
              isComplete={completed.has(`${activeLesson.moduleId}/${activeLesson.lessonId}`)}
              onMarkComplete={() => markComplete(`${activeLesson.moduleId}/${activeLesson.lessonId}`)}
              onCta={(href) => navigate(href)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <GraduationCap className="w-10 h-10 text-[var(--text-main)]/20 mb-4" />
              <p className="text-sm font-mono font-black italic uppercase tracking-widest text-[var(--text-main)]/50 mb-2">
                Pick a lesson to start
              </p>
              <p className="text-xs text-[var(--text-main)]/40 max-w-md">
                Modules unlock progressively but you can read them in any order. Your progress is saved locally.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function LessonView({
  lesson,
  moduleId,
  isComplete,
  onMarkComplete,
  onCta,
}: {
  lesson: Lesson;
  moduleId: string;
  isComplete: boolean;
  onMarkComplete: () => void;
  onCta: (href: string) => void;
}) {
  return (
    <article className="space-y-5">
      <header className="space-y-2">
        <div className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-primary italic">
          Module: {moduleId.replace(/-/g, ' ')} · {lesson.duration}
        </div>
        <h2 className="text-xl sm:text-2xl font-mono font-black uppercase italic tracking-tighter text-[var(--text-main)]">
          {lesson.title}
        </h2>
      </header>

      <div className="prose-academy text-sm text-[var(--text-main)]/80 leading-relaxed space-y-4">
        {lesson.body.split('\n\n').map((para, i) => (
          <p key={i} dangerouslySetInnerHTML={{ __html: renderInline(para) }} />
        ))}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--border-main)]">
        <button
          onClick={onMarkComplete}
          disabled={isComplete}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-[10px] font-mono font-black uppercase italic tracking-widest transition-all',
            isComplete
              ? 'border border-green-500/40 text-green-500'
              : 'bg-primary text-white active:scale-95',
          )}
        >
          {isComplete ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          {isComplete ? 'Lesson complete' : 'Mark as complete'}
        </button>
        {lesson.cta && (
          <button
            onClick={() => onCta(lesson.cta!.href)}
            className="flex items-center gap-2 px-4 py-2 border border-primary/40 text-primary text-[10px] font-mono font-black uppercase italic tracking-widest transition-colors"
          >
            {lesson.cta.label}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </footer>
    </article>
  );
}

/**
 * Tiny markdown-lite renderer: **bold** and `code` only. Keeps things safe.
 */
function renderInline(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-[var(--text-main)]">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="font-mono text-primary text-xs">$1</code>');
}
