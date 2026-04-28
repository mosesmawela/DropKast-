import { useState } from 'react';
import { motion } from 'motion/react';
import {
  MessageSquare,
  ImageIcon,
  Video,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  TEXT_PROVIDERS,
  IMAGE_PROVIDERS,
  VIDEO_PROVIDERS,
  providersByKind,
  type ProviderKind,
  type ProviderModel,
  type Tier,
} from '../lib/ai-providers';

const TABS: { id: ProviderKind; label: string; icon: any; count: number }[] = [
  { id: 'text', label: 'Text / Chat', icon: MessageSquare, count: TEXT_PROVIDERS.length },
  { id: 'image', label: 'Image', icon: ImageIcon, count: IMAGE_PROVIDERS.length },
  { id: 'video', label: 'Video', icon: Video, count: VIDEO_PROVIDERS.length },
];

const TIER_BADGE: Record<Tier, { label: string; color: string }> = {
  free: { label: 'Free', color: 'text-green-500 border-green-500/30 bg-green-500/5' },
  freemium: { label: 'Freemium', color: 'text-blue-400 border-blue-400/30 bg-blue-400/5' },
  paid: { label: 'Paid', color: 'text-primary border-primary/30 bg-primary/5' },
};

export default function AIProviders() {
  const [active, setActive] = useState<ProviderKind>('text');
  const items = providersByKind(active);
  const free = items.filter((p) => p.tier === 'free');
  const freemium = items.filter((p) => p.tier === 'freemium');
  const paid = items.filter((p) => p.tier === 'paid');

  return (
    <div className="space-y-6 pb-12">
      <header className="border-b border-[var(--border-main)] pb-5">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-primary italic">
            AI Provider Catalog
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-mono font-black tracking-tighter text-[var(--text-main)] italic uppercase">
          Models, Prices, Free Tiers
        </h1>
        <p className="text-[var(--text-main)]/40 mt-1 text-xs max-w-2xl">
          Every model DropKast can route through, ranked by tier. Add an API key to enable a provider and use it anywhere
          inside the app — chat, A&R critique, cover art, video teasers.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 border transition-all text-[11px] font-mono font-black uppercase italic tracking-widest',
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-[var(--border-main)] text-[var(--text-main)]/50 hover:text-[var(--text-main)] hover:border-white/20',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
              <span className="text-[9px] opacity-60">({t.count})</span>
            </button>
          );
        })}
      </div>

      <Section title="Free" subtitle="No card required. Use these as the default for prototyping or zero-cost workflows." items={free} accent="text-green-500" />
      <Section title="Freemium" subtitle="Free starter tier with caps; paid plans unlock the higher quality outputs." items={freemium} accent="text-blue-400" />
      <Section title="Paid" subtitle="Pay-per-use APIs. Use the right tool for the right job — premium quality where it matters." items={paid} accent="text-primary" />

      <CompareTable kind={active} />
    </div>
  );
}

function Section({ title, subtitle, items, accent }: { title: string; subtitle: string; items: ProviderModel[]; accent: string }) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-3">
      <header className="flex items-end justify-between">
        <div>
          <h2 className={cn('text-sm font-mono font-black uppercase tracking-[0.3em] italic', accent)}>{title}</h2>
          <p className="text-[10px] text-[var(--text-main)]/40 mt-1">{subtitle}</p>
        </div>
        <span className="text-[9px] font-mono font-black uppercase tracking-[0.3em] text-[var(--text-main)]/30 italic">
          {items.length} models
        </span>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {items.map((m) => (
          <ProviderCard key={m.id} m={m} />
        ))}
      </div>
    </section>
  );
}

function ProviderCard({ m }: { m: ProviderModel }) {
  const tier = TIER_BADGE[m.tier];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="manifest-card border border-[var(--border-main)] p-4 bg-[var(--card-bg)] flex flex-col gap-3 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-[8px] font-mono font-black uppercase tracking-widest italic px-1.5 py-0.5 border', tier.color)}>
              {tier.label}
            </span>
            <span className="text-[9px] font-mono font-black uppercase tracking-[0.3em] text-[var(--text-main)]/40 italic">
              {m.vendor}
            </span>
          </div>
          <h3 className="text-sm font-mono font-black italic text-[var(--text-main)] truncate">{m.name}</h3>
        </div>
        {m.implemented ? (
          <span title="Adapter implemented" className="text-green-500 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </span>
        ) : (
          <span title="Not yet wired — add API key + adapter" className="text-[var(--text-main)]/30 shrink-0">
            <AlertCircle className="w-4 h-4" />
          </span>
        )}
      </div>

      <p className="text-xs text-[var(--text-main)]/60 leading-relaxed">{m.blurb}</p>

      <div className="space-y-1">
        <div className="text-[9px] font-mono font-black uppercase tracking-widest text-[var(--text-main)]/40 italic">
          Pricing
        </div>
        {m.pricing.map((p, i) => (
          <div key={i} className="text-[11px] text-[var(--text-main)]/80 font-medium">
            {p}
          </div>
        ))}
      </div>

      {m.freeTier && (
        <div className="text-[10px] text-green-500/80 italic border-l-2 border-green-500/30 pl-2">
          Free: {m.freeTier}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {m.bestFor.map((b) => (
          <span
            key={b}
            className="text-[9px] font-mono uppercase tracking-widest text-[var(--text-main)]/50 px-1.5 py-0.5 bg-white/[0.03] border border-[var(--border-main)]"
          >
            {b}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-main)]">
        <code className="text-[9px] font-mono text-[var(--text-main)]/40">{m.envVar}</code>
        <a
          href={m.signupUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[10px] font-mono font-black uppercase tracking-widest italic text-primary hover:text-primary/70 transition-colors"
        >
          Get Key
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </motion.div>
  );
}

function CompareTable({ kind }: { kind: ProviderKind }) {
  const items = providersByKind(kind);
  return (
    <section className="space-y-3">
      <header className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <h2 className="text-sm font-mono font-black uppercase tracking-[0.3em] text-primary italic">
              At-a-glance
            </h2>
          </div>
          <p className="text-[10px] text-[var(--text-main)]/40 mt-0.5">
            Same data, sorted. Use the search bar in your editor (Ctrl/Cmd-F) to find a specific provider.
          </p>
        </div>
      </header>
      <div className="overflow-x-auto manifest-card border border-[var(--border-main)] bg-[var(--card-bg)]">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--border-main)] text-[9px] font-mono font-black uppercase tracking-widest text-[var(--text-main)]/40 italic">
              <th className="text-left px-3 py-2.5">Model</th>
              <th className="text-left px-3 py-2.5">Vendor</th>
              <th className="text-left px-3 py-2.5">Tier</th>
              <th className="text-left px-3 py-2.5">Free?</th>
              <th className="text-left px-3 py-2.5">Cost</th>
              <th className="text-left px-3 py-2.5">Wired</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id} className="border-b border-[var(--border-main)]/40 last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-3 py-2.5 font-mono font-black text-[var(--text-main)] uppercase italic tracking-tight">{m.name}</td>
                <td className="px-3 py-2.5 text-[var(--text-main)]/60">{m.vendor}</td>
                <td className="px-3 py-2.5">
                  <span className={cn('text-[9px] font-mono font-black uppercase tracking-widest italic px-1.5 py-0.5 border', TIER_BADGE[m.tier].color)}>
                    {TIER_BADGE[m.tier].label}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-[var(--text-main)]/50 text-[10px] italic">{m.freeTier ?? '—'}</td>
                <td className="px-3 py-2.5 text-[var(--text-main)]/60 text-[10px]">{m.pricing[0]}</td>
                <td className="px-3 py-2.5">
                  {m.implemented ? (
                    <span className="text-green-500 text-[10px] font-mono font-black italic">YES</span>
                  ) : (
                    <span className="text-[var(--text-main)]/30 text-[10px] font-mono font-black italic">SOON</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
