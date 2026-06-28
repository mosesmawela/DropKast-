import { useParams, Link } from 'react-router-dom';
import {
  Target,
  Calendar,
  Users,
  ChevronLeft,
  Sparkles,
  Radio,
  Share2,
  Cpu,
  Globe2,
  BarChart2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import ScrollReveal from '../components/animations/ScrollReveal';
import { useCampaigns } from '../context/CampaignContext';

const CHANNEL_ICON: Record<string, React.ElementType> = {
  INFLUENCERS: Users,
  DJ_PACKS: Radio,
  SOCIAL_ADS: Share2,
};

export default function CampaignDetails() {
  const { id } = useParams();
  const { campaigns, isLoading } = useCampaigns();
  const campaign = campaigns.find((c) => c.id === id);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-24 text-center">
        <div className="text-white/20 font-mono text-sm uppercase tracking-widest italic animate-pulse">
          Loading campaign…
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-6 text-center">
        <Target className="w-10 h-10 text-white/15 mx-auto mb-4" />
        <h1 className="text-2xl font-black italic text-white mb-2 font-mono uppercase">Campaign not found</h1>
        <p className="text-sm text-white/40 italic mb-6">
          This campaign doesn't exist or was deleted.
        </p>
        <Link
          to="/campaigns"
          className="inline-flex items-center gap-2 h-11 px-5 bg-primary text-white text-[10px] font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all font-mono"
        >
          <ChevronLeft className="w-3 h-3" /> Back to campaigns
        </Link>
      </div>
    );
  }

  const statusLabel =
    campaign.status === 'ACTIVE' ? 'Active'
    : campaign.status === 'SCHEDULED' ? 'Scheduled'
    : 'Completed';

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-8 font-sans">
      <ScrollReveal direction="down">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div className="flex items-center gap-6">
            <Link
              to="/campaigns"
              className="w-12 h-12 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-primary mb-2 font-mono">
                <Target className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-widest italic font-mono">Campaign: {campaign.id}</span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-white italic font-mono uppercase">{campaign.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'px-4 py-2 text-[10px] font-black font-mono tracking-widest uppercase italic border',
                campaign.status === 'ACTIVE'
                  ? 'bg-primary/10 border-primary/20 text-primary animate-pulse'
                  : campaign.status === 'SCHEDULED'
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  : 'bg-green-500/10 border-green-500/20 text-green-400',
              )}
            >
              {statusLabel}
            </div>
            <Link
              to="/campaigns"
              className="secondary-button h-14 px-8 text-[11px] font-bold uppercase tracking-widest font-mono italic flex items-center"
            >
              Manage
            </Link>
          </div>
        </header>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: performance + channels */}
        <div className="lg:col-span-8 space-y-12">
          <section className="bg-dark border border-white/5 p-12 space-y-12 shadow-2xl">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div>
                <h3 className="text-xl font-bold text-white italic font-mono uppercase tracking-tight mb-2">All-Channel Traction</h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-white/30 font-mono tracking-widest uppercase">
                    {campaign.status === 'ACTIVE' ? 'Live data' : 'Awaiting data'}
                  </span>
                  <span className={cn('w-1.5 h-1.5 rounded-full', campaign.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-white/20')} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-12 text-right">
                <Stat label="Reach" value={campaign.metrics?.reach || '—'} />
                <Stat label="Engagement" value={campaign.metrics?.engagement || '—'} />
                <Stat label="Budget spent" value={`${campaign.spent || '$0'} / ${campaign.budget || '$0'}`} accent />
              </div>
            </div>

            {/* Analytics chart — empty until real per-day data flows in */}
            <div className="h-[300px] w-full border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center gap-3">
              <BarChart2 className="w-8 h-8 text-white/15" />
              <div className="text-white/20 font-mono text-[11px] uppercase tracking-widest italic text-center px-6">
                {campaign.status === 'ACTIVE'
                  ? 'Per-day stream + reach analytics appear here once the first 24h of data lands.'
                  : 'Analytics begin once this campaign goes live.'}
              </div>
            </div>
          </section>

          {/* Channels — derived from the real campaign */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white/30 tracking-[0.3em] font-mono italic uppercase">Channels</h3>
              <div className="h-[1px] flex-1 ml-12 bg-white/5" />
            </div>

            {(!campaign.channels || campaign.channels.length === 0) ? (
              <div className="py-16 text-center border-2 border-dashed border-white/5 bg-white/[0.01]">
                <div className="text-white/15 font-mono text-sm uppercase tracking-widest italic">No channels configured for this campaign</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {campaign.channels.map((ch, i) => {
                  const Icon = CHANNEL_ICON[ch] || Target;
                  return (
                    <ScrollReveal key={ch} delay={i * 0.1}>
                      <div className="p-8 bg-dark border border-white/5 hover:border-primary/20 transition-all space-y-6">
                        <div className="flex items-center justify-between font-mono">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-xl font-bold italic text-white uppercase font-mono">{ch}</div>
                        <div className="text-[10px] font-bold font-mono text-white/20 uppercase tracking-widest">
                          Awaiting first results
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right: details + AI hub */}
        <div className="lg:col-span-4 space-y-12">
          <section className="p-10 bg-dark border border-white/5 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-[0.2em] font-mono uppercase italic">Campaign Brief</h3>
              <Calendar className="w-4 h-4 text-white/20" />
            </div>
            <div className="space-y-5">
              <DetailRow label="Goal" value={campaign.goal || '—'} />
              <DetailRow label="Start date" value={campaign.startDate || '—'} />
              <DetailRow label="Budget" value={campaign.budget || '—'} />
              <DetailRow label="Spent" value={campaign.spent || '$0'} />
              <DetailRow label="Progress" value={`${campaign.progress ?? 0}%`} />
            </div>
            <div className="space-y-2">
              <div className="h-1 bg-white/5">
                <div className="h-full bg-primary transition-all" style={{ width: `${campaign.progress ?? 0}%` }} />
              </div>
            </div>
          </section>

          <section className="p-10 bg-primary/5 border border-primary/20 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Sparkles className="w-16 h-16 text-primary" />
            </div>
            <div className="relative z-10 space-y-5">
              <div className="flex items-center gap-3 text-primary font-mono font-black italic text-[11px] uppercase tracking-widest">
                <Cpu className="w-4 h-4" />
                AI Strategy
              </div>
              <p className="text-sm font-sans text-white/40 leading-relaxed italic font-medium">
                AI optimization suggestions appear here once the campaign has enough live performance data to analyze.
              </p>
              <Link
                to="/studios"
                className="block w-full text-center primary-button py-4 text-[10px] uppercase font-mono italic tracking-widest"
              >
                Open Strategy Studio
              </Link>
            </div>
          </section>

          <section className="p-10 border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-widest font-mono italic">Global Hotspots</h4>
              <Globe2 className="w-4 h-4 text-white/10" />
            </div>
            <div className="text-white/15 font-mono text-[11px] uppercase tracking-widest italic py-6 text-center">
              Geographic breakdown populates once streams come in.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest font-mono">{label}</div>
      <div className={cn('text-2xl font-bold font-mono italic', accent ? 'text-primary' : 'text-white')}>{value}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-[11px] font-mono italic">
      <span className="text-white/30 uppercase tracking-widest font-bold">{label}</span>
      <span className="text-white font-bold">{value}</span>
    </div>
  );
}
