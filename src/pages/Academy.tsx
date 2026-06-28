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

Your account can have multiple roles — switch via "Portal Reboot" in the sidebar footer. Notifications cross over: an artist sending a campaign creates a "NEW_MISSION" event in the influencer's inbox, etc.`,
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
        id: 'splits',
        title: 'Split sheets are non-negotiable',
        duration: '3 min',
        body: `If you don't have a written split agreement BEFORE the song is released, you don't have a song — you have a future lawsuit.

Standard splits for a vocal-led song:
- Artist (vocals + topline): 30-50%
- Producer (beat + production): 30-50%
- Featured artist: 5-15%
- Co-writer / additional production: 5-10%

Two common mistakes:
1. "We'll figure it out later." Translate: "I'll figure it out in court."
2. "I produced it AND wrote it" — combine the share but be explicit. Producers without contracts often claim 50% post-success.

DropKast's Split Sheet page generates a written agreement, signed by all parties via email, stored on file. When royalties land, Stripe Connect (Phase 3) splits them automatically — no quarterly reconciliation, no fights.`,
        cta: { label: 'Open Split Sheets', href: '/splits' },
      },
      {
        id: 'royalty-types',
        title: 'The 4 types of royalties (and where they come from)',
        duration: '5 min',
        body: `Most artists only know about streaming royalties. There are four:

1. **Master royalties** — paid by DSPs for streams of YOUR recording. Distributed via your distro (DropKast → you/your splits). ~$0.003-$0.005 per stream on Spotify.

2. **Publishing royalties** — paid for the COMPOSITION (lyrics + melody) being used. Two halves:
   - **Performance royalties** (BMI/ASCAP/SESAC) when the song is played publicly — radio, streams, live, in stores.
   - **Mechanical royalties** (Harry Fox / MLC) when the song is reproduced — physical sales, downloads, on-demand streams.
   Sign up with a PRO + register the composition. DropKast doesn't auto-do this yet (Phase 4 plan).

3. **Sync royalties** — paid when your music is in TV, film, ads, video games. Pitch through a sync agent or directly. Single placements = $1K-$50K. The EPK you build in DropKast is what sync agents review.

4. **Neighbouring rights** — paid for the master being played publicly (separate from publishing). Especially big in Europe. Sign up with SoundExchange (US) and a neighbouring rights org (PPL/UK, GVL/DE etc).

Bottom line: registering your song in 4 places minimum is the difference between earning $X/year and $5X/year on the same release.`,
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
              Six modules. {totalLessons} lessons total, ~60 minutes end-to-end. Built for indie artists who want to
              run their career like a label without hiring one.
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
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.03] transition-colors"
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
                                isActive ? 'bg-primary/10 text-primary' : 'text-[var(--text-main)]/60 hover:bg-white/[0.03] hover:text-[var(--text-main)]',
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
              : 'bg-primary text-white hover:scale-[1.03] active:scale-95',
          )}
        >
          {isComplete ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          {isComplete ? 'Lesson complete' : 'Mark as complete'}
        </button>
        {lesson.cta && (
          <button
            onClick={() => onCta(lesson.cta!.href)}
            className="flex items-center gap-2 px-4 py-2 border border-primary/40 text-primary text-[10px] font-mono font-black uppercase italic tracking-widest hover:bg-primary/10 transition-colors"
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
