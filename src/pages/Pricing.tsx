/**
 * Public pricing page — drives conversion. Linked from Landing CTA.
 *
 * Three sections:
 *   1. Tier cards with CTA buttons
 *   2. Full feature comparison matrix
 *   3. "Vs the competition" comparison
 *
 * No auth required. Clicking "Get Indie/Pro/Label" routes to /signup
 * (or to the in-app /subscription page if already logged in).
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, X, Sparkles, ArrowRight, Zap, Shield, ChevronLeft, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  TIERS,
  FEATURE_MATRIX,
  COMPETITORS,
  priceText,
  yearlySavingsCents,
  type Tier,
  type BillingPeriod,
} from '../lib/pricing';
import { useAuth } from '../context/AuthContext';

export default function Pricing() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<BillingPeriod>('yearly');

  return (
    <div className="min-h-screen bg-black text-white technical-grid">
      {/* Top nav */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span className="text-[11px] font-black tracking-widest uppercase italic">DropKast</span>
        </Link>
        {user ? (
          <Link
            to="/dashboard"
            className="text-[10px] font-black tracking-widest uppercase italic text-white/50"
          >
            Dashboard →
          </Link>
        ) : (
          <Link
            to="/login"
            className="text-[10px] font-black tracking-widest uppercase italic text-white/50"
          >
            Sign in →
          </Link>
        )}
      </div>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-12 md:py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] italic mb-6">
          <Sparkles className="w-3 h-3" /> Pricing
        </div>
        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-6">
          Every AI tool.<br />
          <span className="text-primary">No per-track fees.</span>
        </h1>
        <p className="text-white/50 text-base md:text-lg italic max-w-2xl mx-auto leading-relaxed">
          DistroKid charges $5/track for Mixea. Amuse charges $5.99/track for mastering.
          UnitedMasters $4.99. We bundle <span className="text-white">all 10 AI studios</span> — mastering, mixing, artwork,
          video, lyrics — into a flat subscription. No upsells. No nickel-and-dime.
        </p>

        {/* Period toggle */}
        <div className="inline-flex items-center bg-white/5 border border-white/10 p-1 mt-10">
          {(['yearly', 'monthly'] as BillingPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'h-10 px-6 text-[10px] font-black uppercase italic tracking-widest transition-all',
                period === p ? 'bg-white text-black' : 'text-white/50',
              )}
            >
              {p === 'yearly' ? 'Yearly · Save 30%' : 'Monthly'}
            </button>
          ))}
        </div>
      </section>

      {/* Tier cards */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TIERS.map((t, idx) => (
            <TierCard key={t.id} tier={t} period={period} idx={idx} loggedIn={!!user} />
          ))}
        </div>
      </section>

      {/* Feature matrix */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-3">
            What's <span className="text-primary">in</span> each tier
          </h2>
          <p className="text-white/40 italic">Full feature comparison.</p>
        </div>

        <div className="manifest-card p-0 bg-dark border-white/10 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest italic">
                  Feature
                </th>
                {TIERS.map((t) => (
                  <th
                    key={t.id}
                    className={cn(
                      'px-6 py-4 text-[10px] font-black uppercase tracking-widest italic text-center',
                      t.popular ? 'text-primary' : 'text-white/60',
                    )}
                  >
                    {t.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_MATRIX.map((row) => (
                <tr key={row.key} className="border-b border-white/5">
                  <td className="px-6 py-3.5 text-sm text-white/80 italic">{row.label}</td>
                  {TIERS.map((t) => {
                    const v = row.values[t.id];
                    return (
                      <td key={t.id} className="px-6 py-3.5 text-center">
                        {typeof v === 'boolean' ? (
                          v ? (
                            <Check className="w-4 h-4 text-green-400 mx-auto" strokeWidth={3} />
                          ) : (
                            <X className="w-3.5 h-3.5 text-white/15 mx-auto" />
                          )
                        ) : (
                          <span
                            className={cn(
                              'text-[12px] font-black italic',
                              t.popular ? 'text-white' : 'text-white/70',
                            )}
                          >
                            {String(v)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Vs competition */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-3">
            How we <span className="text-primary">stack up</span>
          </h2>
          <p className="text-white/40 italic">2026 distro market — base paid tier vs DropKast Indie.</p>
        </div>

        <div className="manifest-card p-0 bg-dark border-white/10 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest italic">Distro</th>
                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest italic">Cheapest paid</th>
                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest italic">Top tier</th>
                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest italic">Royalty cut</th>
                <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest italic">Bundled features</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-primary/5 border-b border-primary/30 font-black">
                <td className="px-6 py-4 text-white italic">
                  <span className="text-primary">★ DropKast</span>
                </td>
                <td className="px-6 py-4 text-white">$19.99/yr</td>
                <td className="px-6 py-4 text-white">$149/yr</td>
                <td className="px-6 py-4 text-green-400">0%</td>
                <td className="px-6 py-4 text-primary">10 / 10 + advances + smart-links + splits</td>
              </tr>
              {COMPETITORS.map((c) => (
                <tr key={c.name} className="border-b border-white/5">
                  <td className="px-6 py-3.5 text-white/80 italic">{c.name}</td>
                  <td className="px-6 py-3.5 text-white/60 text-sm">
                    {c.cheapestPaidYearlyCents === 0
                      ? 'Invite-only'
                      : `$${(c.cheapestPaidYearlyCents / 100).toFixed(2)}/yr`}
                  </td>
                  <td className="px-6 py-3.5 text-white/60 text-sm">
                    {c.topTierYearlyCents === 0
                      ? '—'
                      : `$${(c.topTierYearlyCents / 100).toFixed(2)}/yr`}
                  </td>
                  <td className={cn('px-6 py-3.5 text-sm', c.royaltyCutPct === 0 ? 'text-green-400' : 'text-yellow-300')}>
                    {c.royaltyCutPct === 0 ? '0%' : `${c.royaltyCutPct}%`}
                  </td>
                  <td className="px-6 py-3.5 text-white/50 text-sm">
                    {c.bundledScore} / 10 features
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter mb-10 text-center">
          Real questions, real answers
        </h2>
        <div className="space-y-4">
          {[
            {
              q: 'Do I keep my masters?',
              a: 'Always. We never touch ownership of your music. Cancel anytime, you keep everything.',
            },
            {
              q: 'Why is the Indie tier cheaper than DistroKid?',
              a: 'Because we don\'t charge per-track AI fees. DistroKid Mixea is $5/track, Vizy is $5/track. We bundle every AI studio into the subscription.',
            },
            {
              q: 'What\'s the catch with the Free tier?',
              a: 'No catch — but limited. 2 releases/year, 15% royalty cut (we cover delivery costs), 1 AI studio, no advances. Great to test the platform. Most artists upgrade to Indie within a month.',
            },
            {
              q: 'How do royalty advances work?',
              a: 'After 3 months of earnings on Indie+, we auto-calculate an offer of up to 4× your trailing monthly earnings. 0% APR, 80% recoupment from forward statements until paid back. We never take ownership.',
            },
            {
              q: 'Can I switch tiers anytime?',
              a: 'Yes. Upgrade kicks in instantly. Downgrade prorates at next billing cycle.',
            },
            {
              q: 'What if I want more than 10 artists on Label?',
              a: '$12/yr per additional artist. So 25 artists is $149 + (15 × $12) = $329/yr. Still cheaper than Ditto Label ($319 for 20).',
            },
          ].map((f, i) => (
            <details key={i} className="manifest-card p-5 bg-dark border-white/10 cursor-pointer group">
              <summary className="text-base font-black italic text-white flex items-center justify-between list-none">
                {f.q}
                <ArrowRight className="w-4 h-4 text-white/30 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="mt-3 text-sm text-white/60 italic leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-24 text-center">
        <div className="manifest-card p-12 bg-gradient-to-br from-primary/15 via-dark to-dark border border-primary/30">
          <Sparkles className="w-10 h-10 text-primary mx-auto mb-5" />
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
            Start free. Upgrade when you ship.
          </h2>
          <p className="text-white/60 italic mb-8 max-w-xl mx-auto">
            14-day free trial on Indie and Pro. No card required for Free. Cancel anytime.
          </p>
          <Link
            to={user ? '/subscription' : '/signup'}
            className="beam inline-flex items-center gap-3 h-14 px-10 bg-white text-black text-[12px] font-black uppercase italic tracking-widest transition-all"
          >
            Get started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-[10px] font-black text-white/30 uppercase tracking-widest italic">
        DropKast · Music distribution that pays you back
      </footer>
    </div>
  );
}

/* =========================================================================
 * Tier card
 * ========================================================================= */
function TierCard({ tier, period, idx, loggedIn }: { tier: Tier; period: BillingPeriod; idx: number; loggedIn: boolean }) {
  const cents = period === 'yearly' ? tier.yearlyCents : tier.monthlyCents;
  const savings = yearlySavingsCents(tier);

  // Highlights — short bullet list shown on the card
  const highlights = (() => {
    const f = tier.features;
    if (tier.id === 'free') {
      return [
        '2 releases per year',
        '1 AI studio · 3 runs/mo',
        '15% royalty cut',
        'Smart links + splits',
      ];
    }
    if (tier.id === 'indie') {
      return [
        'Unlimited releases · 165+ DSPs',
        'All 10 AI studios · 50 runs/mo',
        '0% royalty cut',
        'Royalty advances eligible',
        'YouTube Content ID',
      ];
    }
    if (tier.id === 'pro') {
      return [
        '3 artists',
        'AI studios · uncapped',
        'Custom label name',
        'Hi-res / Dolby Atmos',
        'Sync licensing pitch queue',
        '24h priority support',
      ];
    }
    return [
      '10 artists ($12/yr each more)',
      'Multi-user accounts + roles',
      'White-label artist dashboards',
      'API access + webhooks',
      'Bulk catalogue migration',
      'Dedicated A&R / account manager',
    ];
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06 }}
      className={cn(
        'manifest-card p-6 bg-dark border flex flex-col gap-4',
        tier.popular ? 'border-primary relative' : 'border-white/10',
      )}
    >
      {tier.popular && (
        <div className="absolute -top-3 left-6 px-3 py-1 bg-primary text-white text-[9px] font-black uppercase italic tracking-widest flex items-center gap-1.5">
          <Star className="w-2.5 h-2.5 fill-white" /> Most popular
        </div>
      )}

      <div>
        <div className={cn('text-[10px] font-black uppercase tracking-[0.3em] italic mb-1', tier.popular ? 'text-primary' : 'text-white/40')}>
          {tier.name}
        </div>
        <div className="text-3xl md:text-4xl font-black italic tracking-tighter text-white mb-1">
          {priceText(cents, period)}
        </div>
        {period === 'yearly' && savings > 0 && (
          <div className="text-[10px] text-green-400 italic">
            Save ${(savings / 100).toFixed(0)} vs monthly
          </div>
        )}
        {tier.id === 'free' && <div className="text-[10px] text-white/30 italic">Forever. No card.</div>}
      </div>

      <p className="text-[12px] text-white/50 italic leading-relaxed">{tier.tagline}</p>

      <div className="border-t border-white/5 pt-4 space-y-2 flex-1">
        {highlights.map((h, i) => (
          <div key={i} className="flex items-start gap-2 text-[12px] text-white/70 italic">
            <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <span>{h}</span>
          </div>
        ))}
      </div>

      <Link
        to={loggedIn ? `/subscription?upgrade=${tier.id}` : `/signup?tier=${tier.id}`}
        className={cn(
          'beam w-full h-12 flex items-center justify-center gap-2 text-[10px] font-black uppercase italic tracking-widest transition-all',
          tier.popular
            ? 'bg-primary text-white'
            : tier.id === 'free'
            ? 'border border-white/20 text-white'
            : 'bg-white text-black',
        )}
      >
        {tier.id === 'free' ? 'Start free' : `Get ${tier.name}`}
        <ArrowRight className="w-3 h-3" />
      </Link>
    </motion.div>
  );
}
