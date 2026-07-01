import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Wallet,
  Globe2,
  Terminal,
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  BarChart3,
  Layers,
  ArrowUpRight,
  MessageSquare,
  Radio,
  Users,
  Target,
  Download,
  Star,
  Link as LinkIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import ClaimArtistProfile from '../components/ClaimArtistProfile';
import { useAuth } from '../context/AuthContext';
import { useReleases } from '../context/ReleaseContext';
import { useCampaigns } from '../context/CampaignContext';
import { useNotify } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { StatSkeleton } from '../components/Skeleton';
import ScrollReveal from '../components/animations/ScrollReveal';
import AnimatedBeam from '../components/animations/AnimatedBeam';
import CircularPulse from '../components/animations/CircularPulse';

const DashboardChart = lazy(() => import('../components/DashboardChart'));

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { releases } = useReleases();
  const { campaigns } = useCampaigns();
  const { notify } = useNotify();
  const { role } = useTheme();
  const [overview, setOverview] = useState<{ counts: any; revenue: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [signalFeed, setSignalFeed] = useState<{ msg: string; time: string; icon: typeof Cpu }[]>([]);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then(r => r.json())
      .then(d => { setOverview(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const activeCampaignsCount = campaigns.filter(c => c.status === 'ACTIVE').length;
  const preReleaseCount = releases.filter(r => !['live', 'released', 'delivering', 'taken_down'].includes((r.status || '').toLowerCase())).length;
  const releaseCount = overview?.counts?.releases ?? releases.length;
  const influencerCount = overview?.counts?.influencers ?? 0;
  const revenueCents = overview?.revenue?.totalRoyaltyLineCents ?? 0;
  const rosterCount = (() => {
    try { return (JSON.parse(localStorage.getItem('dropkast.label.roster') || '[]') as any[]).length; }
    catch { return 0; }
  })();

  const handleQuickCommand = (proto: string) => {
    notify('ai', 'Working on it', `Starting ${proto}...`);
  };

  const getRoleConfig = () => {
    switch (role) {
      case 'INFLUENCER':
        return {
          title: 'Influencer dashboard',
          greeting: `HELLO, ${user?.artistName?.split(' ')[0] || 'CREATOR'}`,
          metrics: [
            { label: 'Total Engagement', value: '—', trend: '', color: 'text-primary', icon: Users },
            { label: 'Pending Missions', value: '—', trend: '', color: 'text-emerald-400', icon: Target },
            { label: 'Active Campaigns', value: activeCampaignsCount.toString().padStart(2, '0'), trend: 'Protocols Ready', color: 'text-white', icon: Layers },
            { label: 'Est. Earnings', value: `$${(revenueCents / 100).toFixed(1)}K`, trend: 'Global Reach', color: 'text-white/40', icon: Wallet },
          ],
          actions: [
            { title: 'Find Missions', icon: Target, path: '/influencer/missions', desc: 'Browse and accept new campaign directives.' },
            { title: 'Social Connect', icon: LinkIcon, path: '/influencer/socials', desc: 'Sync your social nodes for tracking.' },
            { title: 'Earnings Hub', icon: Wallet, path: '/influencer/earnings', desc: 'Review finalized payment clearings.' },
            { title: 'Creator Kit', icon: Sparkles, path: '/influencer/missions', desc: 'Access high-res assets for your content.' },
          ],
          chartLabel: 'Engagement Velocity',
          chartUnit: 'Interactions'
        };
      case 'DJ':
        return {
          title: 'VIBE_DISTRIBUTOR',
          greeting: `HELLO, ${user?.artistName?.split(' ')[0] || 'SELECTA'}`,
          metrics: [
            { label: 'Pack Downloads', value: '—', trend: '', color: 'text-primary', icon: Download },
            { label: 'Direct Feedbacks', value: '—', trend: '', color: 'text-emerald-400', icon: MessageSquare },
            { label: 'Promo Loops', value: '—', trend: '', color: 'text-white', icon: Radio },
            { label: 'Elite Rank', value: '—', trend: '', color: 'text-white/40', icon: Star },
          ],
          actions: [
            { title: 'Promo Packs', icon: Download, path: '/dj/packs', desc: 'Download exclusive pre-release audio buffers.' },
            { title: 'Submit Feedback', icon: MessageSquare, path: '/dj/feedback', desc: 'Send direct telemetry to artists and labels.' },
            { title: 'Sonic Charts', icon: BarChart3, path: '/dj/packs', desc: 'View global club and radio transmission rankings.' },
            { title: 'Relay Nodes', icon: Globe2, path: '/dj/packs', desc: 'Connect with other broadcast professionals.' },
          ],
          chartLabel: 'Audience reach',
          chartUnit: 'Listeners'
        };
      case 'LABEL':
        return {
          title: 'Label HQ',
          greeting: `HELLO, ${user?.label || user?.artistName?.split(' ')[0] || 'LABEL'}`,
          metrics: [
            { label: 'Artists on roster', value: String(rosterCount), trend: rosterCount > 0 ? 'Active' : 'Add your first', color: 'text-primary', icon: Users },
            { label: 'Catalogue releases', value: String(releaseCount), trend: 'All artists', color: 'text-white', icon: TrendingUp },
            { label: 'Active campaigns', value: activeCampaignsCount.toString().padStart(2, '0'), trend: 'Across roster', color: 'text-emerald-400', icon: Layers },
            { label: 'Label earnings', value: `$${(revenueCents / 100).toFixed(0)}`, trend: 'Catalogue-wide', color: 'text-white/40', icon: Wallet },
          ],
          actions: [
            { title: 'Manage roster', icon: Users, path: '/roster', desc: 'Add artists, switch into any artist to manage their releases and campaigns.' },
            { title: 'Catalogue', icon: TrendingUp, path: '/releases', desc: 'Every release across every artist on your label, in one place.' },
            { title: 'Label analytics', icon: BarChart3, path: '/analytics', desc: 'Catalogue-wide streams, earnings and top territories.' },
            { title: 'Studios', icon: Sparkles, path: '/studios', desc: 'Generate covers, promo art and video for any artist on the roster.' },
          ],
          chartLabel: 'Catalogue growth',
          chartUnit: 'plays'
        };
      default:
        return {
          title: 'Artist Hub',
          greeting: `HELLO, ${user?.artistName?.split(' ')[0] || 'ARTIST'}`,
          metrics: [
            { label: 'Total releases', value: String(releaseCount), trend: 'Catalogue', color: 'text-primary', icon: TrendingUp },
            { label: 'Upcoming releases', value: String(preReleaseCount).padStart(2, '0'), trend: preReleaseCount > 0 ? 'Scheduled' : 'None pending', color: 'text-emerald-400', icon: Zap },
            { label: 'Active campaigns', value: activeCampaignsCount.toString().padStart(2, '0'), trend: 'Running', color: 'text-white', icon: Layers },
            { label: 'Creator network', value: `${influencerCount || 0}+`, trend: 'Reach', color: 'text-white/40', icon: Globe2 },
          ],
          actions: [
            { title: 'Plan a pre-release', icon: Zap, path: '/pre-release', desc: 'Build hype before drop day with teasers and creator briefs.' },
            { title: 'Find creators', icon: MessageSquare, path: '/influencers', desc: 'Browse and brief vetted creators for paid posts.' },
            { title: 'DJ packs', icon: Radio, path: '/djs', desc: 'Send stems and edits to DJs.' },
            { title: 'Studios', icon: Sparkles, path: '/studios', desc: 'Cover art, video, captions and more — all in one place.' },
          ],
          chartLabel: 'Streams over time',
          chartUnit: 'plays'
        };
    }
  };

  const config = getRoleConfig();

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-8">
      {/* Balance + payout strip — front-and-center money view */}
      <BalanceStrip />

      <ClaimArtistProfile artistName={user?.artistName || 'your project'} />
      <ScrollReveal direction="down" variant="blur">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border-main)] pb-10 relative">
          <div className="flex items-start gap-8">
            <CircularPulse 
              size={64} 
              className="manifest-card flex items-center justify-center"
              color="var(--color-primary)"
            >
               <Terminal className="w-8 h-8 text-primary z-10" />
            </CircularPulse>
            <div>
              <div className="flex items-center gap-3 mb-3 font-mono">
                <span className="text-[10px] font-bold text-[var(--text-main)]/30 tracking-[0.2em] font-mono uppercase italic">{config.title}</span>
                <div className="w-8 h-[1px] bg-[var(--border-main)]"></div>
                <span className="text-[10px] font-bold text-primary tracking-[0.2em] font-mono italic animate-pulse">Online</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-main)] leading-none uppercase italic font-mono">
                {config.greeting}
              </h1>
            </div>
          </div>
          <div className="flex flex-col items-end gap-5">
             <div className="flex items-center gap-4 font-mono">
                {role === 'ARTIST' && (
                  <>
                    <AnimatedBeam containerClassName="w-full sm:w-auto">
                      <button 
                        onClick={() => navigate('/campaigns/new')}
                        className="primary-button h-12 flex items-center px-10 bg-primary text-white border-none relative overflow-hidden group shadow-[0_0_20px_rgba(255,77,0,0.15)] transition-all hover:scale-105 active:scale-95"
                      >
                        <Sparkles className="w-4 h-4 mr-3" />
                        New campaign
                      </button>
                    </AnimatedBeam>
                    <button 
                      onClick={() => navigate('/releases/new')}
                      className="secondary-button h-12 flex items-center px-10 border-white/10 text-white hover:border-white bg-white/5 transition-all hover:scale-105 active:scale-95"
                    >
                      Upload music
                    </button>
                  </>
                )}
                {role === 'INFLUENCER' && (
                  <button 
                    onClick={() => navigate('/influencer/missions')}
                    className="primary-button h-12 flex items-center px-10 bg-primary text-white border-none transition-all hover:scale-105 active:scale-95"
                  >
                    <Target className="w-4 h-4 mr-3" />
                    Browse campaigns
                  </button>
                )}
                {role === 'DJ' && (
                  <button 
                    onClick={() => navigate('/dj/packs')}
                    className="primary-button h-12 flex items-center px-10 bg-primary text-white border-none transition-all hover:scale-105 active:scale-95"
                  >
                    <Download className="w-4 h-4 mr-3" />
                    Open DJ packs
                  </button>
                )}
             </div>
          </div>
        </header>
      </ScrollReveal>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-[var(--border-main)] bg-[var(--card-bg)]">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-10 border-r last:border-r-0 border-[var(--border-main)]">
              <StatSkeleton />
            </div>
          ))
        ) : (
          config.metrics.map((stat, i) => (
          <div key={i}>
            <ScrollReveal delay={i * 0.1} direction="up" variant="blur">
              <div 
                onClick={() => {
    const routeMap: Record<string, string> = {
      'Total Releases': '/releases',
      'Pre-Release Signals': '/pre-release',
      'Active Campaigns': '/campaigns',
      'Node Network': '/influencers',
      'Total Engagement': '/analytics',
      'Pending Missions': '/influencer/missions',
      'Est. Earnings': '/earnings',
      'Pack Downloads': '/analytics',
      'Direct Feedbacks': '/dj/feedback',
      'Promo Loops': '/dj/packs',
      'Elite Rank': '/analytics',
    };
    navigate(routeMap[stat.label] || '/analytics');
  }}
                className="p-10 relative group border-r last:border-r-0 border-[var(--border-main)] hover:bg-[var(--text-main)]/[0.04] transition-all hover-parallax cursor-pointer h-full"
              >
                <div className="text-[var(--text-main)]/20 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 font-mono flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary"></div>
                  {stat.label}
                </div>
                <div className="text-4xl font-black text-white mb-4 tracking-tighter leading-none font-mono italic group-hover:text-primary transition-colors uppercase">{stat.value}</div>
                <div className={cn("text-[10px] flex items-center gap-2 font-bold tracking-widest font-mono uppercase transition-all group-hover:translate-x-2 italic", stat.color)}>
                   {stat.icon && <stat.icon className="w-3.5 h-3.5" />}
                  {stat.trend}
                </div>
              </div>
            </ScrollReveal>
          </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-12 gap-8">
       <div className="col-span-12 lg:col-span-8 space-y-8">
            <Suspense fallback={<div className="manifest-card p-12 h-[400px] flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
              <DashboardChart label={config.chartLabel} unit={config.chartUnit} />
            </Suspense>

           {/* Quick Actions / Modules */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {config.actions.map((n, i) => (
                <ScrollReveal key={i} delay={0.1 * i} direction="up">
                  <button 
                    onClick={() => navigate(n.path)}
                    className="manifest-card p-8 text-left flex items-start gap-6 group w-full"
                  >
                    <div className="w-12 h-12 border border-white/10 flex items-center justify-center bg-white/5 group-hover:bg-primary/10 transition-colors">
                      <n.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-lg font-black italic font-mono uppercase tracking-tight text-white group-hover:text-primary transition-colors">{n.title}</h4>
                      <p className="text-[10px] text-white/30 italic font-medium leading-relaxed font-sans">{n.desc}</p>
                    </div>
                  </button>
                </ScrollReveal>
              ))}
           </div>
        </div>

        {/* Sidebar Activity */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="manifest-card p-10 space-y-8">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] font-mono italic">AI Signal Feed</h3>
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div className="space-y-6">
                  {signalFeed.length === 0 && (
                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic font-mono text-center py-6">No signals yet</div>
                  )}
                  {signalFeed.map((log, i) => (
                   <div key={i} className="flex gap-4 items-start group">
                      <div className="w-8 h-8 flex-shrink-0 border border-white/5 flex items-center justify-center bg-white/5 text-primary">
                        <log.icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[11px] text-white/50 leading-relaxed italic font-medium font-sans mb-1 group-hover:text-white transition-colors">{log.msg}</p>
                        <span className="text-[9px] font-bold text-white/20 font-mono italic">{log.time}</span>
                      </div>
                   </div>
                 ))}
              </div>
              <button 
                onClick={() => { setSignalFeed([]); notify('info', 'BUFFER_CLEARED', 'Signal buffer flushed.'); }}
                className="w-full py-4 border border-white/5 text-[10px] font-black font-mono tracking-widest text-white/20 hover:text-white transition-all uppercase"
              >
                Clear notifications
              </button>
           </div>

           <div className="manifest-card p-10 !border-primary/20 bg-primary/5 space-y-6 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-8 opacity-5 -mr-10 -mt-10">
                 <Zap className="w-32 h-32 text-primary" />
              </div>
              <div className="relative z-10">
                 <div className="text-[10px] text-primary font-bold uppercase tracking-[0.3em] font-mono italic mb-4">Next Step</div>
                 <h4 className="text-2xl font-black italic font-mono uppercase tracking-tight text-white mb-2 leading-none">Ship your next release</h4>
                 <p className="text-xs text-white/40 italic font-medium leading-relaxed font-sans mb-8">
                   Upload audio + artwork, pick your stores, and schedule a drop date — DropKast handles delivery to every DSP.
                 </p>
                  <button
                    onClick={() => navigate('/releases/new')}
                    className="primary-button w-full h-14 flex items-center justify-center gap-3 bg-primary text-white border-none"
                 >
                   <ArrowUpRight className="w-4 h-4" />
                   START_A_RELEASE
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Identity Switcher - Immediate Portal Access */}
      <ScrollReveal direction="up" delay={0.6}>
        <div className="mt-24 p-1 bg-gradient-to-r from-primary/40 via-primary/10 to-primary/40 border border-primary/40 rounded-sm shadow-[0_0_50px_rgba(255,77,0,0.1)]">
          <button 
            onClick={() => {
              localStorage.removeItem('dropkast_welcome_seen');
              window.location.reload();
            }}
            className="w-full h-40 bg-black hover:bg-black/90 flex flex-col items-center justify-center gap-6 group transition-all relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-8 text-primary relative z-10">
              <div className="w-16 h-16 border-2 border-primary/40 flex items-center justify-center group-hover:border-primary transition-colors">
                <Users className="w-10 h-10 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-left">
                <span className="text-4xl font-black italic font-mono uppercase tracking-[0.2em] group-hover:tracking-[0.3em] transition-all block text-white">Switch portal</span>
                <span className="text-[10px] text-primary font-bold uppercase tracking-[0.5em] font-mono mt-2 block">Change your account type</span>
              </div>
            </div>
            <div className="text-[9px] text-white/20 font-bold uppercase tracking-[0.6em] font-mono relative z-10">Signed in as: {role}</div>
          </button>
        </div>
      </ScrollReveal>
    </div>
  );
}

/* =========================================================================
 * BalanceStrip — withdrawable balance + quick payout button on Dashboard
 * ========================================================================= */
function BalanceStrip() {
  const [data, setData] = useState<{ balanceCents: number; lifetimeCents: number; nextPayoutDate?: string } | null>(null);

  useEffect(() => {
    fetch('/api/earnings')
      .then((r) => r.json())
      .then((d) => {
        const totalCents = d?.summary?.totalCents ?? 0;
        const lifetimeCents = d?.summary?.totalCents ?? totalCents;
        setData({ balanceCents: totalCents, lifetimeCents });
      })
      .catch(() => setData({ balanceCents: 0, lifetimeCents: 0 }));
  }, []);

  const balance = (data?.balanceCents || 0) / 100;
  const lifetime = (data?.lifetimeCents || 0) / 100;

  return (
    <Link
      to="/earnings"
      className="manifest-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-gradient-to-r from-primary/[0.08] via-dark to-dark border border-primary/30 p-6 hover:border-primary transition-all group"
    >
      <div className="flex items-center gap-6">
        <Wallet className="w-7 h-7 text-primary" />
        <div>
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-1">
            Available balance
          </div>
          <div className="text-4xl md:text-5xl font-black italic text-white tabular-nums">
            ${balance.toFixed(2)}
          </div>
          <div className="text-[10px] text-white/40 italic mt-1">
            Lifetime · ${lifetime.toLocaleString()} · USD
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden md:block">
          <div className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">Next payout</div>
          <div className="text-sm font-black italic text-white">
            {data?.nextPayoutDate || 'On demand'}
          </div>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); window.location.href = '/earnings?action=withdraw'; }}
          className="h-12 px-6 bg-white text-black hover:bg-primary hover:text-white text-[10px] font-black uppercase italic tracking-widest transition-all flex items-center gap-2"
        >
          Withdraw
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </Link>
  );
}
