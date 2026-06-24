import { useState, useMemo } from 'react';
import { 
  Target, 
  BarChart2, 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  Instagram, 
  Youtube, 
  Globe, 
  Zap, 
  Settings, 
  ArrowUpRight, 
  Sparkles,
  RefreshCw,
  Cpu,
  MonitorPlay,
  Monitor
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import ScrollReveal from '../components/animations/ScrollReveal';
import AnimatedBeam from '../components/animations/AnimatedBeam';
import { useNotify } from '../context/NotificationContext';

// Real ad-performance data populates once campaigns run and report back.
const adPerformanceStats: { day: string; spend: number; reach: number; clicks: number }[] = [];

const initialAdSets: { id: string; name: string; platform: string; spend: string; cpc: string; status: string; ctr: string }[] = [];

export default function SocialAds() {
  const { notify } = useNotify();
  const [adSets, setAdSets] = useState(initialAdSets);
  const [activePlatform, setActivePlatform] = useState('ALL');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [newAdConfig, setNewAdConfig] = useState({
    name: '',
    platform: 'INSTAGRAM',
    budget: 500,
    targetAudience: 'Music Lovers, Gen Z',
    objective: 'STREAMS'
  });

  const filteredAdSets = useMemo(() => {
    return adSets.filter(ad => activePlatform === 'ALL' || ad.platform === activePlatform);
  }, [adSets, activePlatform]);

  const handleLaunchAd = () => {
    setIsCreating(true);
    notify('ai', 'GENERATING_CREATIVES', 'Analyzing song mood to generate high-CTR video hooks...');
    setTimeout(() => {
      const newAd = {
        id: `ADS-00${adSets.length + 1}`,
        name: newAdConfig.name || 'AI Generated Discovery',
        platform: newAdConfig.platform,
        spend: `$0.00`,
        cpc: '$0.00',
        status: 'ACTIVE',
        ctr: '0.0%'
      };
      setAdSets([newAd, ...adSets]);
      notify('success', 'AD_SET_DEPLOYED', 'Meta Discovery Campaign initialized with AI creative buffer.');
      setIsCreating(false);
      setShowBuilder(false);
    }, 2500);
  };

  const handleOptimize = () => {
    setIsOptimizing(true);
    notify('ai', 'BUDGET_REBALANCING', 'Shifting budget from low-performing YouTube nodes to high-yield Instagram variants...');
    setTimeout(() => {
      notify('success', 'OPTIMIZATION_COMPLETE', 'ROAS projected to increase by 14% based on current velocity.');
      setIsOptimizing(false);
    }, 3000);
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-8 font-sans">
      <ScrollReveal direction="down">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-2 text-primary mb-3 font-mono">
              <Monitor className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-widest italic font-mono">Ad Strategy Console</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-white italic font-mono uppercase">Social Ads</h1>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={handleOptimize}
               disabled={isOptimizing}
               className="secondary-button h-14 flex items-center gap-3 px-8"
             >
               <RefreshCw className={cn("w-4 h-4", isOptimizing && "animate-spin")} />
               {isOptimizing ? 'Optimizing...' : 'Execute Re-Optimization'}
             </button>
             <AnimatedBeam containerClassName="w-fit">
               <button 
                 onClick={() => setShowBuilder(true)}
                 className="primary-button h-14 flex items-center gap-3 px-10"
               >
                 <Plus className="w-4 h-4" />
                 New Ad Set
               </button>
             </AnimatedBeam>
          </div>
        </header>
      </ScrollReveal>

      {/* Main Stats Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 p-10 border border-white/5 bg-dark">
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 border-2 border-primary flex items-center justify-center font-mono text-primary italic font-black">
                   ROAS
                 </div>
                 <div>
                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest font-mono">Return on Ad Spend</div>
                    <div className="text-3xl font-black text-white font-mono italic">—</div>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 {['ALL', 'INSTAGRAM', 'YOUTUBE', 'TIKTOK'].map(p => (
                   <button 
                      key={p} 
                      onClick={() => setActivePlatform(p)}
                      className={cn(
                        "px-3 py-1 text-[9px] font-bold font-mono tracking-widest border transition-all uppercase",
                        activePlatform === p ? "border-primary text-primary" : "border-white/5 text-white/20 hover:text-white"
                      )}
                    >
                      {p}
                    </button>
                 ))}
              </div>
           </div>

           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={adPerformanceStats}>
                 <defs>
                   <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#FF4D00" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#FF4D00" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                 <XAxis dataKey="day" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                 <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', fontSize: '10px', fontFamily: 'monospace' }}
                   itemStyle={{ color: '#FF4D00' }}
                 />
                 <Area type="monotone" dataKey="reach" stroke="#FF4D00" fillOpacity={1} fill="url(#colorReach)" strokeWidth={3} />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="p-10 border border-white/5 bg-primary/5 space-y-6">
              <div className="flex items-center gap-3 text-primary font-mono font-black italic">
                 <Sparkles className="w-5 h-5" />
                 SC_CREATIVE_REPORT
              </div>
              <p className="text-white/40 text-sm italic font-medium leading-relaxed">
                 Creative performance insights appear here once your ad sets have run long enough to gather data.
              </p>
              <button 
                onClick={() => notify('success', 'VERSION_DEPLOYED', 'Variation B-2 pushed to active ad sets.')}
                className="w-full py-4 border border-primary/20 text-primary font-mono text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/10 transition-all"
              >
                 Deploy Variation B-2
              </button>
           </div>
           <div className="p-10 border border-white/5 bg-black space-y-6">
              <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest font-mono italic">Ad Node Integrity</h3>
              <div className="space-y-4">
                 {[
                   { label: 'Pixel Status', val: 'Operational', color: 'text-green-500' },
                   { label: 'Tracking Delay', val: '< 1ms', color: 'text-white' },
                   { label: 'Cloud Buffer', val: 'Synchronized', color: 'text-white' },
                 ].map(s => (
                   <div key={s.label} className="flex justify-between items-center text-[11px] font-bold font-mono uppercase italic">
                      <span className="text-white/30">{s.label}</span>
                      <span className={s.color}>{s.val}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Ad Sets Table */}
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-[0.4em] font-mono italic">Active Ad Clusters</h2>
            <div className="flex items-center gap-4 text-[10px] font-bold text-white/20 font-mono tracking-widest">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  STABLE_NETWORK
               </div>
            </div>
         </div>

         <div className="space-y-4">
            {filteredAdSets.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-white/5 bg-white/[0.01]">
                <div className="text-white/20 font-mono text-sm uppercase tracking-widest italic">No ad sets running yet — launch one above</div>
              </div>
            )}
            {filteredAdSets.map((ad, i) => (
              <ScrollReveal key={ad.id} delay={i * 0.05} direction="up">
                 <div className="p-8 bg-dark border border-white/5 hover:border-white/20 transition-all group grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left">
                    <div className="md:col-span-4 flex items-center gap-6">
                       <div className="w-12 h-12 border border-white/5 bg-white/5 flex items-center justify-center">
                          {ad.platform === 'INSTAGRAM' ? <Instagram className="w-6 h-6 text-primary" /> : <Youtube className="w-6 h-6 text-primary" />}
                       </div>
                       <div>
                          <div className="text-[10px] font-bold text-white/20 font-mono uppercase tracking-widest mb-1">{ad.id}</div>
                          <h4 className="text-lg font-black italic font-mono uppercase text-white tracking-tight">{ad.name}</h4>
                       </div>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                       <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest font-mono">Platform</span>
                       <div className="text-xs font-black text-white uppercase italic">{ad.platform}</div>
                    </div>
                    <div className="md:col-span-2 space-y-1 text-right">
                       <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest font-mono">Spend</span>
                       <div className="text-xl font-black text-white font-mono italic">{ad.spend}</div>
                    </div>
                    <div className="md:col-span-1 space-y-1 text-right">
                       <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest font-mono">CPC</span>
                       <div className="text-xs font-black text-white italic font-mono">{ad.cpc}</div>
                    </div>
                    <div className="md:col-span-1 space-y-1 text-right">
                       <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest font-mono">CTR</span>
                       <div className="text-lg font-black text-primary italic font-mono">{ad.ctr}</div>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={() => notify('info', 'MANUAL_OVERRIDE', `Manual bias applied to node ${ad.id}.`)}
                         className="p-3 border border-white/10 hover:border-primary transition-all text-white/40 hover:text-primary"
                        >
                          <Settings className="w-4 h-4" />
                       </button>
                       <button className="p-3 border border-white/10 hover:bg-white hover:text-black transition-all">
                          <ArrowUpRight className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
              </ScrollReveal>
            ))}
         </div>
      </div>

      <AnimatePresence>
        {showBuilder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark border border-white/10 p-12 max-w-2xl w-full space-y-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Settings className="w-32 h-32 text-primary" />
              </div>

              <div className="relative z-10 space-y-8">
                <header>
                  <div className="flex items-center gap-2 text-primary mb-3 font-mono">
                    <Plus className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] font-mono">Build_Campaign_Node</span>
                  </div>
                  <h2 className="text-4xl font-black italic font-mono uppercase tracking-tighter text-white">Ad Set Builder</h2>
                </header>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest font-mono">Campaign Name</label>
                       <input 
                        type="text" 
                        value={newAdConfig.name}
                        onChange={e => setNewAdConfig({...newAdConfig, name: e.target.value})}
                        placeholder="e.g. Midnight City - Reels"
                        className="w-full bg-black border border-white/10 p-4 text-xs font-mono tracking-widest text-white outline-none focus:border-primary transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest font-mono">Platform</label>
                       <select 
                        value={newAdConfig.platform}
                        onChange={e => setNewAdConfig({...newAdConfig, platform: e.target.value})}
                        className="w-full bg-black border border-white/10 p-4 text-xs font-mono tracking-widest text-white outline-none focus:border-primary transition-all appearance-none"
                       >
                         <option value="INSTAGRAM">Instagram</option>
                         <option value="TIKTOK">TikTok</option>
                         <option value="YOUTUBE">YouTube</option>
                         <option value="META">Facebook / Meta</option>
                       </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest font-mono">Target Audience</label>
                     <input 
                      type="text" 
                      value={newAdConfig.targetAudience}
                      onChange={e => setNewAdConfig({...newAdConfig, targetAudience: e.target.value})}
                      placeholder="e.g. Gen Z, Hip Hop Listeners, Festival Goers"
                      className="w-full bg-black border border-white/10 p-4 text-xs font-mono tracking-widest text-white outline-none focus:border-primary transition-all"
                     />
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                       <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest font-mono">Daily Budget</label>
                       <div className="text-2xl font-black text-primary font-mono italic">${newAdConfig.budget}</div>
                     </div>
                     <input 
                       type="range" 
                       min="10" 
                       max="5000" 
                       step="10"
                       value={newAdConfig.budget}
                       onChange={e => setNewAdConfig({...newAdConfig, budget: parseInt(e.target.value)})}
                       className="w-full accent-primary bg-white/10 rounded-lg appearance-none cursor-pointer h-1"
                     />
                     <div className="flex justify-between text-[8px] font-bold text-white/10 uppercase tracking-widest font-mono">
                       <span>$10</span>
                       <span>$5,000</span>
                     </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    onClick={() => setShowBuilder(false)}
                    className="flex-1 py-4 border border-white/10 text-white/40 font-mono text-[10px] font-black uppercase tracking-[0.2em] hover:text-white hover:border-white/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleLaunchAd}
                    disabled={isCreating}
                    className="flex-[2] primary-button py-4 font-mono text-[10px] font-black uppercase tracking-[0.2em]"
                  >
                    {isCreating ? 'Deploying Node...' : 'Launch Ad Set'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
