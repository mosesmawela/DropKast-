/**
 * In-app subscription page — current plan + upgrade flow.
 *
 * Shows the artist's current tier, usage vs limits, billing history,
 * and lets them upgrade via Stripe Checkout (when keys wired) or the
 * local-demo simulator.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  CreditCard,
  Check,
  Sparkles,
  ArrowRight,
  Star,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Receipt,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { useSubscription } from '../context/SubscriptionContext';
import {
  TIERS,
  TIER_BY_ID,
  priceText,
  type TierId,
  type BillingPeriod,
} from '../lib/pricing';

export default function Subscription() {
  const sub = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [period, setPeriod] = useState<BillingPeriod>(sub.period);
  const [loading, setLoading] = useState<TierId | null>(null);

  // Toast on returning from Stripe Checkout
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      toast.success('Subscription active', {
        description: 'Welcome to DropKast Pro. Every studio is uncapped.',
      });
    } else if (searchParams.get('checkout') === 'cancelled') {
      toast.message('Checkout cancelled — your plan is unchanged.');
    }
  }, [searchParams]);

  // Auto-trigger upgrade flow if ?upgrade=xxx
  useEffect(() => {
    const target = searchParams.get('upgrade') as TierId | null;
    if (target && TIER_BY_ID[target] && target !== sub.tierId) {
      handleUpgrade(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpgrade = async (targetTier: TierId) => {
    if (targetTier === sub.tierId) {
      toast.message(`You're already on ${TIER_BY_ID[targetTier].name}.`);
      return;
    }

    setLoading(targetTier);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId: targetTier, period }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }
      toast.message('Online payments coming soon.');
    } catch {
      toast.message('Online payments coming soon.');
    } finally {
      setLoading(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }
      toast.message('Stripe customer portal not configured yet.');
    } catch {
      toast.error('Couldn\'t open billing portal');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] italic">
            <CreditCard className="w-3 h-3" /> Subscription
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
            Your <span className="text-primary">plan</span>
          </h1>
          <p className="text-white/40 text-sm italic max-w-xl">
            Manage your subscription, see usage, upgrade or downgrade. Changes apply instantly on
            upgrade, prorate at next cycle on downgrade.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">
            Currently on
          </div>
          <div className="text-2xl font-black italic text-white flex items-center gap-2">
            {sub.tier.popular && <Star className="w-4 h-4 text-primary fill-primary" />}
            {sub.tier.name}
          </div>
          <div className="text-[10px] text-white/40 italic">
            {sub.isPaid ? priceText(sub.period === 'yearly' ? sub.tier.yearlyCents : sub.tier.monthlyCents, sub.period) : 'No charge'}
          </div>
        </div>
      </div>

      {/* Trial banner */}
      {sub.isTrial && (
        <div className="mb-8 p-4 border border-primary/30 bg-primary/5 flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <div className="text-sm text-white italic">
            You're on a free trial. Trial ends{' '}
            <span className="font-black text-primary">
              {sub.trialEndsAt && new Date(sub.trialEndsAt).toLocaleDateString()}
            </span>
            . Add a card before then to keep your plan active.
          </div>
        </div>
      )}

      {/* Period toggle */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center bg-white/5 border border-white/10 p-1">
          {(['yearly', 'monthly'] as BillingPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'h-10 px-6 text-[10px] font-black uppercase italic tracking-widest transition-all',
                period === p ? 'bg-white text-black' : 'text-white/50 hover:text-white',
              )}
            >
              {p === 'yearly' ? 'Yearly · save 30%' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      {/* Tier grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {TIERS.map((t, idx) => {
          const cents = period === 'yearly' ? t.yearlyCents : t.monthlyCents;
          const isCurrent = t.id === sub.tierId;
          const isUpgrade =
            TIERS.findIndex((x) => x.id === sub.tierId) <
            TIERS.findIndex((x) => x.id === t.id);
          const tierBtnLabel =
            isCurrent ? 'Current plan'
              : isUpgrade ? `Upgrade to ${t.name}`
              : `Switch to ${t.name}`;

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                'manifest-card p-5 bg-dark border flex flex-col gap-3',
                isCurrent ? 'border-primary' : t.popular ? 'border-primary/40' : 'border-white/10',
              )}
            >
              <div>
                <div className={cn(
                  'text-[10px] font-black uppercase tracking-[0.3em] italic',
                  isCurrent ? 'text-primary' : 'text-white/40',
                )}>
                  {t.name}
                  {isCurrent && ' · Active'}
                </div>
                <div className="text-3xl font-black italic text-white mt-1">
                  {priceText(cents, period)}
                </div>
              </div>
              <p className="text-[11px] text-white/50 italic leading-relaxed">{t.tagline}</p>

              <div className="border-t border-white/5 pt-3 space-y-1.5 flex-1 text-[11px] text-white/60 italic">
                <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" />
                  {t.maxArtists ? `${t.maxArtists} artist${t.maxArtists > 1 ? 's' : ''}` : 'Unlimited artists'}
                </div>
                <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" />
                  {t.maxReleasesPerYear ? `${t.maxReleasesPerYear} releases/yr` : 'Unlimited releases'}
                </div>
                <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" />
                  {t.uncappedAi ? 'AI studios · uncapped' : `AI · ${t.aiRunsPerMonth} runs/mo`}
                </div>
                <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" />
                  {t.royaltyCutPct === 0 ? 'Keep 100% royalties' : `${100 - t.royaltyCutPct}% to you`}
                </div>
              </div>

              <button
                onClick={() => handleUpgrade(t.id)}
                disabled={isCurrent || loading === t.id}
                className={cn(
                  'h-11 text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-2',
                  isCurrent
                    ? 'bg-white/5 text-white/40 border border-white/10 cursor-default'
                    : t.popular
                    ? 'bg-primary text-white hover:bg-white hover:text-black'
                    : 'bg-white text-black hover:bg-primary hover:text-white',
                )}
              >
                {loading === t.id ? 'Working...' : tierBtnLabel}
                {!isCurrent && <ArrowRight className="w-3 h-3" />}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Billing actions */}
      {sub.isPaid && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <button
            onClick={handleManageBilling}
            className="manifest-card p-5 bg-dark border border-white/10 hover:border-primary transition-all flex items-center justify-between text-left group"
          >
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-1">
                <Receipt className="w-3 h-3" /> Billing
              </div>
              <div className="text-base font-black italic text-white">Manage payment + invoices</div>
              <div className="text-[11px] text-white/40 italic mt-1">
                Update card, change email, download receipts
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white" />
          </button>

          <button
            onClick={() => {
              if (!confirm('Cancel your subscription? You\'ll keep access through your current period.')) return;
              sub.setLocalPlan('free', sub.period);
              toast.message('Subscription cancelled — back on Free tier.');
            }}
            className="manifest-card p-5 bg-dark border border-white/10 hover:border-red-500/40 transition-all flex items-center justify-between text-left"
          >
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black text-red-400 uppercase tracking-[0.3em] italic mb-1">
                <AlertTriangle className="w-3 h-3" /> Danger zone
              </div>
              <div className="text-base font-black italic text-white">Cancel subscription</div>
              <div className="text-[11px] text-white/40 italic mt-1">
                Downgrades to Free at next cycle. Your music stays live.
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/30" />
          </button>
        </div>
      )}

      {/* Compare link */}
      <div className="text-center">
        <a
          href="/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-black text-primary hover:underline italic uppercase tracking-widest"
        >
          See full feature comparison →
        </a>
      </div>
    </div>
  );
}
