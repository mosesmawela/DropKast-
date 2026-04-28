import { useParams, Link } from 'react-router-dom';
import { 
  Target, 
  Calendar, 
  Users, 
  TrendingUp, 
  PieChart, 
  ChevronLeft, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Radio, 
  Share2,
  ArrowUpRight,
  MessageSquare,
  Cpu,
  BarChart2,
  Globe2
} from 'lucide-react';
import { cn } from '../lib/utils';
import ScrollReveal from '../components/animations/ScrollReveal';
import AnimatedBeam from '../components/animations/AnimatedBeam';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const dummyData = [
  { name: 'Day 01', streams: 4000, reach: 2400 },
  { name: 'Day 05', streams: 3000, reach: 1398 },
  { name: 'Day 10', streams: 12000, reach: 9800 },
  { name: 'Day 15', streams: 2780, reach: 3908 },
  { name: 'Day 20', streams: 1890, reach: 4800 },
  { name: 'Day 25', streams: 2390, reach: 3800 },
  { name: 'Day 30', streams: 3490, reach: 4300 },
];

export default function CampaignDetails() {
  const { id } = useParams();

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
                <span className="text-[11px] font-bold uppercase tracking-widest italic font-mono">Mission: {id}</span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-white italic font-mono uppercase">Night Drive - Global Alpha</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black font-mono tracking-widest uppercase italic animate-pulse">
               Deployment Active
             </div>
             <button className="secondary-button h-14 px-8 text-[11px] font-bold uppercase tracking-widest font-mono italic">
               Modify Tactics
             </button>
          </div>
        </header>
      </ScrollReveal>

      {/* Campaign Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Performance & Channels */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Realtime Performance Visualization */}
          <section className="bg-dark border border-white/5 p-12 space-y-12 shadow-2xl">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-xl font-bold text-white italic font-mono uppercase tracking-tight mb-2">Omni-Channel Traction</h3>
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-bold text-primary font-mono tracking-widest uppercase">Live Ingestion</span>
                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  </div>
               </div>
               <div className="grid grid-cols-3 gap-12 text-right">
                  <div>
                    <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest font-mono">Daily Streams</div>
                    <div className="text-2xl font-bold text-white font-mono italic">+12,402</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest font-mono">Daily Reach</div>
                    <div className="text-2xl font-bold text-white font-mono italic">+45.2K</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest font-mono">Daily ROI</div>
                    <div className="text-2xl font-bold text-primary font-mono italic">4.8x</div>
                  </div>
               </div>
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dummyData}>
                  <defs>
                    <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF4D00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FF4D00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={{stroke: '#ffffff1a'}} 
                    tickLine={false} 
                    tick={{fill: '#ffffff33', fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono'}} 
                  />
                  <YAxis 
                    axisLine={{stroke: '#ffffff1a'}} 
                    tickLine={false} 
                    tick={{fill: '#ffffff33', fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono'}} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #FF4D00', borderRadius: '0px', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'JetBrains Mono' }}
                  />
                  <Area type="monotone" dataKey="streams" stroke="#FF4D00" fillOpacity={1} fill="url(#colorStreams)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Promotion Channels Tracking */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-bold text-white/30 tracking-[0.3em] font-mono italic uppercase">Active Deployment Channels</h3>
               <div className="h-[1px] flex-1 ml-12 bg-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { channel: 'INFLUENCERS', status: '45 ACTIVE', progress: 85, icon: Users },
                 { channel: 'DJ_PACKS', status: '120 SPINS', progress: 62, icon: Radio },
                 { channel: 'SOCIAL_ADS', status: '$50/DAY', progress: 40, icon: Share2 }
               ].map((ch, i) => (
                 <ScrollReveal key={ch.channel} delay={i * 0.1}>
                    <div className="p-8 bg-dark border border-white/5 hover:border-primary/20 transition-all space-y-6">
                       <div className="flex items-center justify-between font-mono">
                          <ch.icon className="w-4 h-4 text-primary" />
                          <span className="text-[9px] font-black text-primary tracking-widest uppercase italic">{ch.status}</span>
                       </div>
                       <div className="text-xl font-bold italic text-white uppercase font-mono">{ch.channel}</div>
                       <div className="space-y-2">
                          <div className="h-1 bg-white/5">
                             <div className="h-full bg-primary" style={{ width: `${ch.progress}%` }} />
                          </div>
                          <div className="flex justify-between text-[10px] font-bold font-mono text-white/20">
                             <span>REACH: 450K</span>
                             <span>{ch.progress}%</span>
                          </div>
                       </div>
                    </div>
                 </ScrollReveal>
               ))}
            </div>
          </section>
        </div>

        {/* Right Column: Timeline & AI Insights */}
        <div className="lg:col-span-4 space-y-12">
          
          {/* Tactical Timeline */}
          <section className="p-10 bg-dark border border-white/5 space-y-8">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white tracking-[0.2em] font-mono uppercase italic">Rollout Timeline</h3>
                <Calendar className="w-4 h-4 text-white/20" />
             </div>
             <div className="space-y-10 relative">
                <div className="absolute top-2 bottom-2 left-3.5 w-[1px] bg-white/5" />
                {[
                  { day: 'DAY 01', label: 'INCEPTION', status: 'COMPLETED' },
                  { day: 'DAY 05', label: 'NODE_DISTRIBUTION', status: 'ACTIVE' },
                  { day: 'DAY 10', label: 'VELOCITY_PEAK', status: 'PENDING' },
                  { day: 'DAY 15', label: 'MARKET_STABILIZE', status: 'PENDING' },
                ].map((step, i) => (
                  <div key={step.day} className="flex gap-8 items-start relative z-10">
                     <div className={cn(
                       "w-7 h-7 border-4 border-black flex items-center justify-center shrink-0",
                       step.status === 'COMPLETED' ? "bg-green-500" : step.status === 'ACTIVE' ? "bg-primary" : "bg-white/5"
                     )}>
                       {step.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3 text-white" />}
                     </div>
                     <div className="space-y-1">
                        <div className="text-[10px] font-bold text-white/20 font-mono tracking-widest">{step.day} : {step.status}</div>
                        <div className={cn(
                          "text-lg font-bold italic uppercase font-mono tracking-tight",
                          step.status === 'ACTIVE' ? "text-primary" : "text-white/60"
                        )}>
                          {step.label}
                        </div>
                     </div>
                  </div>
                ))}
             </div>
             <button className="w-full border border-white/5 bg-white/5 py-4 text-[10px] font-black font-mono tracking-widest uppercase hover:bg-white/10 transition-all">
               View Full Calendar
             </button>
          </section>

          {/* AI Intelligence Hub */}
          <section className="p-10 bg-primary/5 border border-primary/20 space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5">
                <Sparkles className="w-16 h-16 text-primary" />
             </div>
             <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 text-primary font-mono font-black italic text-[11px] uppercase tracking-widest">
                   <Cpu className="w-4 h-4" />
                   AI_STRATEGY_PULSE
                </div>
                <p className="text-sm font-sans text-white/60 leading-relaxed italic font-medium">
                  "Night Drive is currently overperforming in the German electronic market. Our AI suggests a 20% budget reallocation from Meta to TikTok Discovery specifically targeting Berlin users."
                </p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-black border border-white/5">
                      <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest font-mono">Suggested Adjust</div>
                      <div className="text-lg font-bold text-primary font-mono italic">+$1,200.00</div>
                   </div>
                   <div className="p-4 bg-black border border-white/5">
                      <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest font-mono">New Exp. Reach</div>
                      <div className="text-lg font-bold text-white font-mono italic">1.8M</div>
                   </div>
                </div>
                <button className="w-full primary-button py-4 text-[10px] uppercase font-mono italic tracking-widest">Execute Re-Optimization</button>
             </div>
          </section>

          {/* Engagement Nodes */}
          <section className="p-10 border border-white/5 space-y-6">
             <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-widest font-mono italic">Global Hotspots</h4>
                <Globe2 className="w-4 h-4 text-white/10" />
             </div>
             <div className="space-y-4">
                {[
                  { region: 'GERMANY / BERLIN', growth: '+24%', color: 'text-primary' },
                  { region: 'SOUTH AFRICA / JOBURG', growth: '+18%', color: 'text-white' },
                  { region: 'UK / LONDON', growth: '+12%', color: 'text-white' },
                ].map(r => (
                  <div key={r.region} className="flex justify-between items-center text-[10px] font-bold font-mono italic">
                    <span className="text-white/40 uppercase tracking-widest">{r.region}</span>
                    <span className={r.color}>{r.growth}</span>
                  </div>
                ))}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
