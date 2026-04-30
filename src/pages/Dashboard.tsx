import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Disc,
  Wallet,
  Globe2,
  Terminal,
  Activity,
  Sparkles,
  Zap,
  ChevronRight,
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
  Link
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import ClaimArtistProfile from '../components/ClaimArtistProfile';
import { 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useReleases } from '../context/ReleaseContext';
import { useCampaigns } from '../context/CampaignContext';
import { useNotify } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import ScrollReveal from '../components/animations/ScrollReveal';
import AnimatedBeam from '../components/animations/AnimatedBeam';
import CircularPulse from '../components/animations/CircularPulse';

const mockChartData = [
  { name: '01', value: 4000 },
  { name: '02', value: 3000 },
  { name: '03', value: 5000 },
  { name: '04', value: 2780 },
  { name: '05', value: 1890 },
  { name: '06', value: 10390 },
  { name: '07', value: 8490 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { releases } = useReleases();
  const { campaigns } = useCampaigns();
  const { notify } = useNotify();
  const { role } = useTheme();

  const activeCampaignsCount = campaigns.filter(c => c.status === 'ACTIVE').length;

  const handleQuickCommand = (proto: string) => {
    notify('ai', 'PROTO_ACTIVE', `Initializing ${proto} emergency directive...`);
  };

  const getRoleConfig = () => {
    switch (role) {
      case 'INFLUENCER':
        return {
          title: 'Influencer dashboard',
          greeting: `HELLO, ${user?.artistName?.split(' ')[0] || 'CREATOR'}`,
          metrics: [
            { label: 'Total Engagement', value: '450K', trend: '+8.2% Velo', color: 'text-primary', icon: Users },
            { label: 'Pending Missions', value: '03', trend: 'High Priority', color: 'text-emerald-400', icon: Target },
            { label: 'Active Campaigns', value: '12', trend: 'Protocols Ready', color: 'text-white', icon: Layers },
            { label: 'Est. Earnings', value: '$2.4K', trend: 'Global Reach', color: 'text-white/40', icon: Wallet },
          ],
          actions: [
            { title: 'Find Missions', icon: Target, path: '/influencer/missions', desc: 'Browse and accept new campaign directives.' },
            { title: 'Social Connect', icon: Link, path: '/influencer/socials', desc: 'Sync your social nodes for tracking.' },
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
            { label: 'Pack Downloads', value: '1.2K', trend: '+15.5% Velo', color: 'text-primary', icon: Download },
            { label: 'Direct Feedbacks', value: '42', trend: 'Awaiting', color: 'text-emerald-400', icon: MessageSquare },
            { label: 'Promo Loops', value: '08', trend: 'Active Sync', color: 'text-white', icon: Radio },
            { label: 'Elite Rank', value: '#12', trend: 'Station Master', color: 'text-white/40', icon: Star },
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
      default:
        return {
          title: 'DROPKAST_CORE',
          greeting: `HELLO, ${user?.artistName?.split(' ')[0] || 'ARTIST'}`,
          metrics: [
            { label: 'Total Catalog Streams', value: '12.5M', trend: '+12.5% Velo', color: 'text-primary', icon: TrendingUp },
            { label: 'Pre-Release Signals', value: '04', trend: 'Activated', color: 'text-emerald-400', icon: Zap },
            { label: 'Active Campaigns', value: activeCampaignsCount.toString().padStart(2, '0'), trend: 'Protocols Ready', color: 'text-white', icon: Layers },
            { label: 'Node Network', value: '840+', trend: 'Global Reach', color: 'text-white/40', icon: Globe2 },
          ],
          actions: [
            { title: 'Global Pre-Release', icon: Zap, path: '/pre-release', desc: 'Break songs before they drop with viral activation.' },
            { title: 'Influencer Outreach', icon: MessageSquare, path: '/influencers', desc: 'Deploy personalized AI pitches to creator nodes.' },
            { title: 'DJ Propagation', icon: Radio, path: '/djs', desc: 'Distribute DJ Packs to regional broadcast hubs.' },
            { title: 'A&R Protocol', icon: ShieldCheck, path: '/anr', desc: 'Submit tracks for editorial analysis and label review.' },
          ],
          chartLabel: 'Sonic Trajectory Telemetry',
          chartUnit: 'Signal Frequency'
        };
    }
  };

  const config = getRoleConfig();

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-8">
      <ClaimArtistProfile artistName={user?.label || 'your project'} />
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
                <span className="text-[10px] font-bold text-primary tracking-[0.2em] font-mono italic animate-pulse">All systems live</span>
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
                        NEW_CAMPAIGN
                      </button>
                    </AnimatedBeam>
                    <button 
                      onClick={() => navigate('/releases/new')}
                      className="secondary-button h-12 flex items-center px-10 border-white/10 text-white hover:border-white bg-white/5 transition-all hover:scale-105 active:scale-95"
                    >
                      INGEST_ASSET
                    </button>
                  </>
                )}
                {role === 'INFLUENCER' && (
                  <button 
                    onClick={() => navigate('/influencer/missions')}
                    className="primary-button h-12 flex items-center px-10 bg-primary text-white border-none transition-all hover:scale-105 active:scale-95"
                  >
                    <Target className="w-4 h-4 mr-3" />
                    BROWSE_MISSIONS
                  </button>
                )}
                {role === 'DJ' && (
                  <button 
                    onClick={() => navigate('/dj/packs')}
                    className="primary-button h-12 flex items-center px-10 bg-primary text-white border-none transition-all hover:scale-105 active:scale-95"
                  >
                    <Download className="w-4 h-4 mr-3" />
                    OPEN_PROMO_STACK
                  </button>
                )}
             </div>
          </div>
        </header>
      </ScrollReveal>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-[var(--border-main)] bg-[var(--card-bg)]">
        {config.metrics.map((stat, i) => (
          <div key={i}>
            <ScrollReveal delay={i * 0.1} direction="up" variant="blur">
              <div 
                onClick={() => notify('info', 'SURVEILLANCE_NODE', `${stat.label} synchronized.`)}
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
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
           {/* Chart Node */}
           <ScrollReveal direction="up" delay={0.4}>
              <div className="manifest-card p-12 relative overflow-hidden group">
                 <div className="flex items-start justify-between mb-12">
                   <div className="space-y-4">
                      <div className="flex items-center gap-3 text-primary">
                        <Activity className="w-4 h-4 animate-pulse" />
                        <span className="text-[11px] font-black tracking-[0.3em] font-mono uppercase italic">{config.chartLabel}</span>
                      </div>
                      <p className="text-xs text-white/40 italic font-medium leading-relaxed max-w-sm">Global ingestion analysis across DSP nodes.</p>
                   </div>
                   <div className="text-right">
                      <div className="text-4xl font-black text-white italic font-mono tracking-tighter uppercase leading-none">+2.4kh</div>
                      <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.4em] font-mono mt-2 italic">{config.chartUnit}</div>
                   </div>
                 </div>
                 <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockChartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF4D00" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#FF4D00" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#ffffff10', fontSize: 10, fontStyle: 'italic' }} />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', fontSize: '11px', fontFamily: 'monospace' }}
                          itemStyle={{ color: '#FF4D00' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#FF4D00" strokeWidth={3} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </ScrollReveal>

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
                 {[
                   { msg: 'Ad Set ADS-001 rebalancing budget to IG Stories node.', time: '2m ago', icon: Cpu },
                   { msg: 'Luna Beats accepted DJ Pack transmission.', time: '14m ago', icon: Radio },
                   { msg: 'A&R Review AI-204 protocol completed.', time: '1h ago', icon: ShieldCheck },
                 ].map((log, i) => (
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
                onClick={() => handleQuickCommand('LOG_WIPE')}
                className="w-full py-4 border border-white/5 text-[10px] font-black font-mono tracking-widest text-white/20 hover:text-white transition-all uppercase"
              >
                Clear Signal Buffer
              </button>
           </div>

           <div className="manifest-card p-10 !border-primary/20 bg-primary/5 space-y-6 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-8 opacity-5 -mr-10 -mt-10">
                 <Zap className="w-32 h-32 text-primary" />
              </div>
              <div className="relative z-10">
                 <div className="text-[10px] text-primary font-bold uppercase tracking-[0.3em] font-mono italic mb-4">Urgent Directive</div>
                 <h4 className="text-2xl font-black italic font-mono uppercase tracking-tight text-white mb-2 leading-none">Global Launch Buffer Peaking</h4>
                 <p className="text-xs text-white/40 italic font-medium leading-relaxed font-sans mb-8">
                   Metadata sync required for 'Night Drive' before EU jurisdiction rollout in 4h.
                 </p>
                 <button 
                   onClick={() => handleQuickCommand('METADATA_SYNC')}
                   className="primary-button w-full h-14 flex items-center justify-center gap-3 bg-primary text-white border-none"
                 >
                   <ArrowUpRight className="w-4 h-4" />
                   SYNC_PROTCOLS
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
                <span className="text-4xl font-black italic font-mono uppercase tracking-[0.2em] group-hover:tracking-[0.3em] transition-all block text-white">REBOOT_IDENTITY_PORTAL</span>
                <span className="text-[10px] text-primary font-bold uppercase tracking-[0.5em] font-mono mt-2 block">Switch_Authorized_Access_Node</span>
              </div>
            </div>
            <div className="text-[9px] text-white/20 font-bold uppercase tracking-[0.6em] font-mono relative z-10">Current_Protocol: {role}</div>
          </button>
        </div>
      </ScrollReveal>
    </div>
  );
}
