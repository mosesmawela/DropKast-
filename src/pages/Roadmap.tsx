/**
 * Roadmap — a real, visitable page inside DropKast (/roadmap).
 *
 * Public route so the team can open it directly. Styled to match the app:
 * dark ground, orange primary, mono/italic uppercase headings, manifest cards.
 * Content = the 24-month PRD + roadmap, built around one idea: sequence over
 * surface area — don't overwhelm the artist.
 */
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PRINCIPLES: [string, string, string][] = [
  ['P1', 'Progressive disclosure', 'Start every artist with one job done well. Unlock capability as they grow into needing it — never show a tool they can\'t yet use.'],
  ['P2', 'Distribution is the foundation', 'Everything else earns its place on top of a delivery pipeline that just works. If distribution isn\'t flawless, nothing else matters.'],
  ['P3', 'One release, many outputs', 'The release is the unit of work. Cover, promo, video, links, splits and campaigns hang off a single project — not scattered tools.'],
  ['P4', 'Honest AI', 'Every AI feature is labelled: an editable draft, an insight, or human-reviewed work. A&R judgment stays human.'],
  ['P5', 'No dead ends', 'Every button does what it says and gives feedback. One theme, one type system. If a surface isn\'t ready, it isn\'t shipped — it\'s marked.'],
  ['P6', 'Get the artist paid', 'Transparent earnings, fast payouts, no rights grabs. Money is the trust anchor of the whole platform.'],
];

const PERSONAS: [string, string, string, string][] = [
  ['Primary · now', 'Independent artist', 'Makes and releases music. Wants it live everywhere, promoted, and paid — without a manager.', 'Phase 1'],
  ['Growth · yr 1', 'Influencer / creator', 'Gets paid to post. Needs briefs, deliverable tracking, and clean payouts.', 'Phase 3'],
  ['Growth · yr 1', 'DJ / curator', 'Breaks records. Wants early packs, stems, and a channel to send feedback.', 'Phase 3'],
  ['Scale · yr 2', 'Label / manager', 'Runs a roster. Needs catalogue-wide oversight, team seats, and mass payouts.', 'Phase 4'],
];

const PILLARS: [string, string][] = [
  ['Distribute', 'Deliver releases to every DSP with correct metadata, ISRCs/UPCs, scheduling and status tracking. The non-negotiable core.'],
  ['Grow', 'Smart links, pre-release seeding, AI-made assets, campaigns and the creator economy — everything that turns a release into an audience.'],
  ['Monetize', 'Transparent royalty accounting, fast payouts, splits, advances and publishing administration.'],
  ['Collaborate', 'Roster management, team seats, contributor splits and the community layer connecting artists, creators and labels.'],
];

const TIERS: { price: string; name: string; lead?: boolean; items: string[] }[] = [
  { price: '$0 · Free', name: 'Starter', items: ['Distribute singles', 'Smart link per release', 'Basic streams & earnings', 'Minimal workspace by default'] },
  { price: '$19.99 · Indie', name: 'Indie', lead: true, items: ['Unlimited releases', 'Pre-release seeding', 'AI cover & promo art (credits)', 'Full analytics'] },
  { price: '$49.99 · Pro', name: 'Pro', items: ['Creator campaigns', 'DJ packs & reactions', 'Advances & splits', 'Bring-your-own AI keys'] },
  { price: '$149 · Label', name: 'Label', items: ['Roster & team seats', 'Catalogue-wide reporting', 'Mass payouts', 'Publishing admin'] },
];

interface Quarter { q: string; title: string; items: string[]; dod: string; }
interface Phase { tag: string; name: string; span: string; color: string; goal: string; quarters: Quarter[]; }

const PHASES: Phase[] = [
  {
    tag: 'Phase 1', name: 'Foundation', span: 'Months 1–6', color: '#FF4D00',
    goal: 'Make distribution flawless and the first-run experience calm. Fix what\'s broken before adding anything new.',
    quarters: [
      { q: 'Q1 · M1–3', title: 'Rebuild the base', items: [
        'Real auth (Supabase) — retire the dev bypass',
        'Design-system pass: one theme, one type scale, kill dead-end & duplicate buttons',
        'Release wizard end-to-end: audio → art → metadata → schedule',
        'Onboarding with workspace modes so new artists start Minimal',
        'Full UI audit — every side-panel page reviewed, no repeats',
      ], dod: 'A new artist ships a release to Spotify & Apple in under 10 minutes, with zero broken buttons on the core path.' },
      { q: 'Q2 · M4–6', title: 'Deliver & track', items: [
        'DSP delivery to majors + status tracking (received → live)',
        'Smart Links: pre-save before drop, listen-now after',
        'Baseline analytics from Spotify / Apple for Artists',
        'Profile, account, and a Help / Academy that actually works',
        'Reliability + error states across the app',
      ], dod: '500 releases delivered; delivery success >99%; a measured D30 retention baseline exists.' },
    ],
  },
  {
    tag: 'Phase 2', name: 'Grow', span: 'Months 7–12', color: '#FF8A3D',
    goal: 'Real AI that ships assets, plus the tools to get a release discovered — then open the doors publicly.',
    quarters: [
      { q: 'Q3 · M7–9', title: 'AI Studios, for real', items: [
        'Cover & promo art generation wired to a live engine',
        'Captions & bio drafts (clearly labelled AI drafts)',
        'Credits + bring-your-own-key, honest per-generation cost',
        'Pre-release seeding + a release-centric content calendar',
        'Studios organised around the release, not scattered tools',
      ], dod: '40% of new releases use at least one AI-generated asset; generation succeeds >95% of runs.' },
      { q: 'Q4 · M10–12', title: 'Launch & charge', items: [
        'Public marketing site + waitlist conversion',
        'Stripe subscriptions live across all four tiers',
        'Referral loop for artists',
        'Performance, polish, accessibility pass',
        'First paid cohort onboarded',
      ], dod: 'Public launch shipped; first recurring revenue; free-to-paid conversion measured and >3%.' },
    ],
  },
  {
    tag: 'Phase 3', name: 'Monetize', span: 'Months 13–18', color: '#E7B24A',
    goal: 'Get artists paid, then open the creator economy that connects them to the people who grow their reach.',
    quarters: [
      { q: 'Q5 · M13–15', title: 'Money that moves', items: [
        'Earnings + payouts via Stripe Connect (KYC, global)',
        'Royalty accounting & statements',
        'Splits automation to collaborators',
        'Advances against future royalties — no rights handover',
      ], dod: 'First payouts and first advance processed cleanly; statements reconcile to the cent.' },
      { q: 'Q6 · M16–18', title: 'Creator economy v1', items: [
        'Influencer marketplace: discovery → brief → deliverable → escrow',
        'DJ packs (stems/edits) + reaction-channel pitching',
        'Campaign engine tying creators to a specific release',
        'Fake-follower / authenticity screening',
      ], dod: 'First paid creator campaigns run end-to-end with tracked deliverables and released escrow.' },
    ],
  },
  {
    tag: 'Phase 4', name: 'Scale', span: 'Months 19–24', color: '#7FA6C9',
    goal: 'Become label-grade and platform-shaped — multi-artist operations, community, and reach beyond one market.',
    quarters: [
      { q: 'Q7 · M19–21', title: 'Label-grade', items: [
        'Roster management + per-artist context switching',
        'Catalogue-wide analytics & earnings rollups',
        'Team seats & permissions; bulk release / campaign ops',
        'Mass payouts; publishing administration & sync',
      ], dod: 'First labels running a whole roster on DropKast; one payout in, distributed to many artists out.' },
      { q: 'Q8 · M22–24', title: 'Platform & reach', items: [
        'Community layer (peers, collabs, opportunities)',
        'Lyric-video & motion studio (LYRC-class)',
        'Mobile app for the core artist loop',
        'Localization + language selector; international payouts',
      ], dod: 'Mobile live; product localized for 2+ regions; expansion revenue from existing accounts growing.' },
    ],
  },
];

const METRICS: [string, string, string, boolean][] = [
  ['★', 'North star', 'Releases delivered per active artist, per quarter — proof the core loop works.', true],
  ['<10min', 'Time to first release', 'Signup → live on DSPs. The activation moment.', false],
  ['>99%', 'Delivery success', 'Releases delivered without error.', false],
  ['D30', 'Retention', 'Artists active 30 days after first release.', false],
  ['>3%', 'Free → paid', 'Conversion into a paid tier.', false],
  ['50%+', 'Gross margin', 'Protected against AI & payout costs.', false],
];

const NONGOALS: string[] = [
  'A streaming service — we deliver to DSPs, we don\'t replace them.',
  'A full DAW or in-browser production suite.',
  'A general social network — community is scoped to careers, not feeds.',
  'AI that pretends to be an A&R verdict — judgment stays human.',
  'Every AI model wired at once — one reliable engine before breadth.',
  'Label features before the solo-artist loop is loved.',
];

const EYEBROW = 'text-[11px] font-mono font-black uppercase tracking-[0.3em] text-primary';
const H2 = 'text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white';
const CARD = 'bg-dark border border-white/10 rounded p-6';

export default function Roadmap() {
  return (
    <div className="min-h-screen bg-black text-white font-sans technical-grid">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-primary" />
            <span className="font-black italic tracking-tighter">DROPKAST</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 hidden sm:inline">· Product Roadmap</span>
          </div>
          <Link to="/dashboard" className="text-[10px] font-mono font-black uppercase tracking-widest text-white/50 hover:text-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-3 h-3" /> Back to app
          </Link>
        </div>
      </div>

      {/* Hero */}
      <header className="max-w-5xl mx-auto px-6 pt-20 pb-14 border-b border-white/10">
        <div className={EYEBROW}>Product Requirements &amp; Roadmap</div>
        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.95] mt-5">
          Build the career,<br />not the dashboard.
        </h1>
        <p className="text-lg md:text-xl text-white/70 italic max-w-2xl mt-6 leading-relaxed">
          A 24-month plan to turn DropKast from an everything-at-once app into the operating system
          for a music career — introduced to each artist one earned step at a time.
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-2 mt-8 font-mono text-xs text-white/40">
          <span><b className="text-white">Version</b> 1.0 — draft</span>
          <span><b className="text-white">Horizon</b> 24 months · 8 quarters</span>
          <span><b className="text-white">Owner</b> DropKast / LVRN</span>
          <span><b className="text-white">Status</b> For team review</span>
        </div>
      </header>

      {/* Summary */}
      <Section eyebrow="01 — Executive summary" title="The thesis">
        <p className="text-lg text-white/70 italic max-w-3xl leading-relaxed">
          DropKast is a distribution platform with a creator-economy and AI layer on top. The product is
          strong — but today it shows an artist <span className="text-white">everything</span> on day one, before
          they've shipped a single release. That's the core problem to solve.
        </p>
        <p className="text-white/50 mt-5 max-w-3xl leading-relaxed">
          The bet across the next 24 months is <span className="text-white font-semibold">sequence over surface area</span>.
          We nail one job — getting music out and getting paid — then reveal each capability only when the artist
          has grown into needing it. Distribution earns AI tools; AI tools earn the creator economy; traction earns
          the label back-office. Every phase ships something real and consistent, instead of many things that half-work.
        </p>
      </Section>

      {/* Problem */}
      <Section eyebrow="02 — Problem" title="Two problems, one product">
        <div className="grid md:grid-cols-2 gap-4">
          <div className={CARD}>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/30 mb-3">For the artist</div>
            <h3 className="text-lg font-black italic uppercase mb-2">The stack is fragmented</h3>
            <p className="text-sm text-white/50 leading-relaxed">A distributor, a link-in-bio, a promo tool, a splits spreadsheet, a designer, three analytics dashboards. Nothing talks to each other, and most distributors stop caring after delivery.</p>
          </div>
          <div className={CARD}>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/30 mb-3">For DropKast today</div>
            <h3 className="text-lg font-black italic uppercase mb-2">Everything, all at once</h3>
            <p className="text-sm text-white/50 leading-relaxed">We built the opposite of fragmented — but overcorrected into overwhelming. A new artist lands in a cockpit of 20+ tools, many still shallow. Power has to be revealed, not dumped.</p>
          </div>
        </div>
      </Section>

      {/* Principles */}
      <Section eyebrow="03 — Product principles" title="How we keep it calm">
        <div className="border border-white/10 rounded overflow-hidden divide-y divide-white/10">
          {PRINCIPLES.map(([n, title, body]) => (
            <div key={n} className="grid grid-cols-[52px_1fr] bg-dark">
              <div className="font-mono text-sm text-primary font-bold p-5">{n}</div>
              <div className="py-5 pr-6">
                <b className="block text-[15px] mb-1">{title}</b>
                <span className="text-sm text-white/50 leading-relaxed">{body}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Users */}
      <Section eyebrow="04 — Who it's for" title="Four sides, phased in">
        <p className="text-white/50 mb-7 max-w-2xl">DropKast serves four roles — but not on day one. We earn each side of the marketplace in order, so the product deepens instead of sprawling.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PERSONAS.map(([ord, name, body, when]) => (
            <div key={name} className={CARD}>
              <div className="font-mono text-[11px] text-primary tracking-widest">{ord}</div>
              <h3 className="text-base font-black italic uppercase mt-3 mb-1.5">{name}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{body}</p>
              <span className="inline-block mt-3 text-[10px] font-mono uppercase tracking-widest text-white/40 border border-white/10 rounded-full px-2 py-1">{when}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Pillars */}
      <Section eyebrow="05 — Product pillars" title="Four things DropKast does">
        <div className="grid md:grid-cols-2 gap-x-10 gap-y-7">
          {PILLARS.map(([name, body]) => (
            <div key={name} className="border-l-2 border-primary pl-5">
              <h3 className="text-base font-black italic uppercase">{name}</h3>
              <p className="text-sm text-white/50 mt-1.5 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Anti-overwhelm */}
      <Section eyebrow="06 — Anti-overwhelm model" title="Reveal power by tier & milestone">
        <p className="text-white/50 mb-6 max-w-2xl">The same product, unfolded. A free artist sees a focused workspace; each tier and milestone unlocks the next layer. Workspace modes (Minimal / Creator / Full) let users opt into density on their own terms.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {TIERS.map((t) => (
            <div key={t.name} className={`bg-dark border rounded p-5 flex flex-col gap-3 ${t.lead ? 'border-primary/40 shadow-[0_0_0_1px_rgba(255,77,0,0.15)]' : 'border-white/10'}`}>
              <div>
                <div className="font-mono text-xs text-white/40">{t.price}</div>
                <div className="font-black italic uppercase text-lg">{t.name}</div>
              </div>
              <ul className="flex flex-col gap-2">
                {t.items.map((i) => (
                  <li key={i} className="text-[12.5px] text-white/50 pl-4 relative leading-snug before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-primary">{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Roadmap timeline */}
      <Section eyebrow="07 — 24-month roadmap" title="Four phases, eight quarters">
        <p className="text-white/50 mb-2 max-w-2xl">Read the colour as heat: near-term quarters run hot and foundational; later quarters cool as they build on settled ground. Every quarter has a definition of done — we don't move on until it's true.</p>
        <div className="space-y-12 mt-8">
          {PHASES.map((p) => (
            <div key={p.tag}>
              <div className="flex items-baseline gap-4 flex-wrap pt-4 border-t border-white/20">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] font-black text-black px-2.5 py-1 rounded" style={{ background: p.color }}>{p.tag}</span>
                <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">{p.name}</h2>
                <span className="font-mono text-xs text-white/40 ml-auto">{p.span}</span>
              </div>
              <p className="text-white/50 text-[15px] mt-3 mb-5 max-w-3xl"><span className="text-white font-semibold">Goal:</span> {p.goal}</p>
              <div className="grid md:grid-cols-2 gap-4">
                {p.quarters.map((q) => (
                  <div key={q.q} className="bg-dark border border-white/10 rounded p-5 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: p.color }} />
                    <div className="font-mono text-xs text-white/40 tracking-widest">{q.q}</div>
                    <div className="font-black italic uppercase text-base mt-1 mb-3">{q.title}</div>
                    <ul className="flex flex-col gap-2">
                      {q.items.map((i) => (
                        <li key={i} className="text-[13.5px] text-white/70 pl-5 relative before:content-['→'] before:absolute before:left-0 before:text-primary before:text-xs">{i}</li>
                      ))}
                    </ul>
                    <div className="mt-4 pt-3.5 border-t border-dashed border-white/15">
                      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-green-400 mb-1.5">Definition of done</div>
                      <p className="text-[12.5px] text-white/50 leading-relaxed">{q.dod}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Metrics */}
      <Section eyebrow="08 — Success metrics" title="What we watch">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {METRICS.map(([v, n, d, star]) => (
            <div key={n} className={`bg-dark border rounded p-5 ${star ? 'border-primary/40' : 'border-white/10'}`}>
              <div className={`text-2xl font-black italic tracking-tighter tabular-nums ${star ? 'text-primary' : 'text-white'}`}>{v}</div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-white/50 mt-1.5">{n}</div>
              <div className="text-[12.5px] text-white/40 mt-2 leading-relaxed">{d}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Non-goals */}
      <Section eyebrow="09 — Non-goals" title="What we won't build (yet)">
        <div className="grid md:grid-cols-2 gap-x-10">
          {NONGOALS.map((g) => (
            <div key={g} className="flex gap-3 items-start py-2.5 text-sm text-white/50">
              <span className="text-primary font-mono shrink-0">✕</span>
              <span className="leading-relaxed">{g}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Do first */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="rounded-md border border-primary/30 p-7" style={{ background: 'linear-gradient(180deg, rgba(255,77,0,0.10), rgba(255,77,0,0.02))' }}>
          <div className={EYEBROW}>10 — Immediate priorities</div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter mt-2.5 mb-2.5">Before anything new: earn the base</h2>
          <p className="text-white/60 max-w-3xl leading-relaxed">The honest starting point. The current build loads but feels unfinished — inconsistent theme, repeated pages, dead-end buttons, a broken Academy link, and too much surfaced at once. Q1 is a cleanup quarter, not a feature quarter.</p>
          <ol className="mt-4 pl-5 list-decimal text-white/70 space-y-2 marker:text-primary marker:font-mono">
            <li className="text-[14.5px]">Full click-through UI audit — every side-panel item and button, verified working.</li>
            <li className="text-[14.5px]">One theme &amp; type system applied everywhere; remove duplicate / dead surfaces.</li>
            <li className="text-[14.5px]">Default new artists to the Minimal workspace; gate advanced tools behind tier &amp; milestone.</li>
            <li className="text-[14.5px]">Replace the dev login bypass with real authentication.</li>
            <li className="text-[14.5px]">Mark anything not truly ready as "coming soon" — never ship a button that does nothing.</li>
          </ol>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3 mt-12 font-mono text-xs text-white/30">
          <span>DROPKAST · Product Requirements &amp; 24-Month Roadmap · v1.0 draft</span>
          <span>Sequence over surface area.</span>
        </div>
      </section>
    </div>
  );
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="max-w-5xl mx-auto px-6 py-14 border-b border-white/10">
      <div className={EYEBROW}>{eyebrow}</div>
      <h2 className={`${H2} mt-3 mb-8`}>{title}</h2>
      {children}
    </section>
  );
}
