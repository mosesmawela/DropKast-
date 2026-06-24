import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Send, 
  TrendingUp, 
  Globe2, 
  Zap, 
  Sparkles, 
  Cpu, 
  Music, 
  Instagram, 
  Youtube,
  SearchCheck,
  UserPlus,
  Trash2,
  CheckCircle2,
  X,
  LayoutGrid,
  LayoutList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ScrollReveal from '../components/animations/ScrollReveal';
import AnimatedBeam from '../components/animations/AnimatedBeam';
import { cn } from '../lib/utils';
import { useNotify } from '../context/NotificationContext';
import { useReleases } from '../context/ReleaseContext';

export default function Influencers() {
  const { notify } = useNotify();
  const { releases } = useReleases();
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(true);
  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [isSending, setIsSending] = useState(false);
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // Added for swipe view
  const [newInfluencer, setNewInfluencer] = useState({
    name: '',
    platform: 'TikTok',
    reach: '0',
    genre: '',
    avatar: ''
  });

  useEffect(() => {
    fetchInfluencers();
  }, []);

  const fetchInfluencers = async () => {
    setIsLoadingRoster(true);
    try {
      const res = await fetch('/api/influencers');
      const data = await res.json();
      setInfluencers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to sync with influencer network.');
      setInfluencers([]);
    } finally {
      setIsLoadingRoster(false);
    }
  };

  const handleAddInfluencer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/influencers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInfluencer)
      });
      if (res.ok) {
        notify('success', 'Creator added', `${newInfluencer.name || 'Creator'} is now on your roster.`);
        setShowAddModal(false);
        fetchInfluencers();
      }
    } catch (err) {
      notify('error', 'REGISTRATION_FAILED', 'Failed to initialize influencer node.');
    }
  };

  const filteredInfluencers = useMemo(() => {
    return influencers.filter(inf => {
      const matchesSearch = inf.name.toLowerCase().includes(searchQuery.toLowerCase()) || inf.genre.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'ALL' || (activeFilter === 'SMART_MATCH' && (inf.match ? parseInt(inf.match) > 90 : true));
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter, influencers]);

  const toggleInfluencer = (id: string, name: string) => {
    setSelectedInfluencers(prev => {
      const isSelected = prev.includes(id);
      if (isSelected) {
        return prev.filter(i => i !== id);
      } else {
        notify('info', 'NODE_SELECTED', `${name} added to outreach buffer.`);
        return [...prev, id];
      }
    });
  };

  const handleLaunchOutreach = async () => {
    setIsSending(true);
    notify('ai', 'PROTOCOLS_READY', `Injecting personalized outreach data into ${selectedInfluencers.length} nodes...`);
    
    try {
      const response = await fetch('/api/influencers/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          influencerIds: selectedInfluencers,
          timestamp: new Date(),
          campaignId: localStorage.getItem('dropkast_active_campaign') || 'direct'
        })
      });
    } catch (err) {
      console.error('Outreach failed:', err);
      notify('error', 'OUTREACH_FAILED', 'Failed to send outreach. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      const currentInf = influencers[currentIndex];
      toggleInfluencer(currentInf.id, currentInf.name);

      // Track analytics
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          releaseId: releases[0]?.id || 'demo-release',
          type: 'influencer_post',
          platform: currentInf.platform,
          value: parseInt(currentInf.reach?.replace(/[^0-9]/g, '') || '0') || 50000 
        })
      });
    }
    
    if (currentIndex < influencers.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
       notify('info', 'SECTOR_EXHAUSTED', 'All nearby discovery nodes scanned.');
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-8 font-sans">
      <ScrollReveal direction="down">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-2 text-primary mb-3 font-mono">
              <Users className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-widest italic font-mono">Influencer Network</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-white italic font-mono uppercase">Creator Nodes</h1>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setShowAddModal(true)}
               className="secondary-button h-14 flex items-center gap-3 px-8 border-white/10 hover:border-white font-mono uppercase italic tracking-widest text-[10px]"
             >
               <UserPlus className="w-4 h-4" />
               Register_Node
             </button>
             <div className="flex border border-white/10 p-1 mr-4 bg-white/5">
                <button 
                  onClick={() => setViewMode('GRID')}
                  className={cn(
                    "px-4 py-2 text-[10px] font-black uppercase tracking-widest italic font-mono transition-all",
                    viewMode === 'GRID' ? "bg-white text-black" : "text-white/40 hover:text-white"
                  )}
                >
                  Matrix
                </button>
                <button 
                  onClick={() => setViewMode('SWIPE')}
                  className={cn(
                    "px-4 py-2 text-[10px] font-black uppercase tracking-widest italic font-mono transition-all",
                    viewMode === 'SWIPE' ? "bg-white text-black" : "text-white/40 hover:text-white"
                  )}
                >
                  Discovery
                </button>
             </div>
             <AnimatedBeam containerClassName="w-fit">
              <button 
                onClick={handleLaunchOutreach}
                disabled={selectedInfluencers.length === 0 || isSending}
                className={cn(
                  "primary-button h-14 flex items-center gap-3 px-10",
                  (selectedInfluencers.length === 0 || isSending) && "opacity-50 grayscale cursor-not-allowed"
                )}
              >
                {isSending ? <Cpu className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSending ? 'Transmitting...' : `Launch Outreach (${selectedInfluencers.length})`}
              </button>
            </AnimatedBeam>
          </div>
        </header>
      </ScrollReveal>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-black/60">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-xl bg-dark border border-white/10 p-12 space-y-10 relative overflow-hidden"
            >
              <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-white/20 hover:text-white">
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-3xl font-black italic font-mono uppercase tracking-tighter text-white">Register Influencer Node</h3>
              <form onSubmit={handleAddInfluencer} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black font-mono tracking-widest uppercase text-white/20 italic">Node_Identity</label>
                  <input 
                    required
                    type="text" 
                    value={newInfluencer.name}
                    onChange={e => setNewInfluencer({...newInfluencer, name: e.target.value})}
                    placeholder="Influencer Name"
                    className="w-full bg-white/5 border border-white/10 p-4 text-white font-mono uppercase italic text-xs outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black font-mono tracking-widest uppercase text-white/20 italic">Hub_Platform</label>
                    <select 
                      value={newInfluencer.platform}
                      onChange={e => setNewInfluencer({...newInfluencer, platform: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-4 text-white font-mono uppercase italic text-xs outline-none focus:border-primary transition-all"
                    >
                      <option value="TikTok">TikTok</option>
                      <option value="Instagram">Instagram</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Twitter">Twitter</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black font-mono tracking-widest uppercase text-white/20 italic">Reach_Magnitude</label>
                    <input 
                      required
                      type="text" 
                      value={newInfluencer.reach}
                      onChange={e => setNewInfluencer({...newInfluencer, reach: e.target.value})}
                      placeholder="e.g. 500K"
                      className="w-full bg-white/5 border border-white/10 p-4 text-white font-mono uppercase italic text-xs outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black font-mono tracking-widest uppercase text-white/20 italic">Sonic_Niche</label>
                  <input 
                    required
                    type="text" 
                    value={newInfluencer.genre}
                    onChange={e => setNewInfluencer({...newInfluencer, genre: e.target.value})}
                    placeholder="e.g. Dark Pop, Electronic"
                    className="w-full bg-white/5 border border-white/10 p-4 text-white font-mono uppercase italic text-xs outline-none focus:border-primary transition-all"
                  />
                </div>
                <button type="submit" className="w-full h-14 bg-white text-black font-black uppercase font-mono italic tracking-widest hover:bg-primary hover:text-white transition-all shadow-[0_10px_40px_rgba(255,255,255,0.1)]">
                  Initialize_Node
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Matching Algorithm Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Smart Matches Available', value: influencers.length > 0 ? influencers.length.toString() : '0', icon: Cpu },
          { label: 'Avg Acceptance Rate', value: '42%', icon: TrendingUp },
          { label: 'Network Reach', value: '450M+', icon: Globe2 },
        ].map((stat, i) => (
          <ScrollReveal key={i} delay={i * 0.1} direction="up">
            <div className="manifest-card p-10 space-y-4 group">
               <div className="flex items-center gap-2 text-primary font-mono text-[10px] font-bold tracking-widest uppercase">
                 <stat.icon className="w-4 h-4" />
                 {stat.label}
               </div>
               <div className="text-5xl font-black text-white italic font-mono tracking-tighter">{stat.value}</div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Network Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-12 space-y-8">
           {viewMode === 'GRID' && (
             <div className="manifest-card !p-0 !bg-white/5 flex flex-col sm:flex-row items-center justify-between p-4 gap-6">
               <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto px-4 py-2">
                 <div className="relative w-full sm:w-80">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                   <input 
                     type="text" 
                     placeholder="Filter creators..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="bg-black border border-white/10 pl-12 pr-6 py-3 text-xs font-mono tracking-widest text-white outline-none focus:border-primary transition-all w-full uppercase"
                   />
                 </div>
                 <div className="flex items-center gap-4">
                   {[
                     { label: 'SMART_MATCH', val: 'SMART_MATCH' },
                     { label: 'ALL_NODES', val: 'ALL' }
                   ].map(f => (
                      <button 
                        key={f.val}
                        onClick={() => setActiveFilter(f.val)}
                        className={cn(
                          "text-[10px] font-bold font-mono tracking-widest transition-all px-4 py-2 border",
                          activeFilter === f.val ? "border-primary text-primary bg-primary/5" : "text-white/40 hover:text-white border-transparent"
                        )}
                      >
                        {f.label}
                      </button>
                   ))}
                 </div>
               </div>
               <button 
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="p-2 hover:bg-white/5 transition-colors"
                >
                  <Filter className="w-4 h-4 text-white/20" />
                </button>
                {showAdvancedFilters && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-black border border-white/10 p-6 z-50 shadow-2xl">
                    <div className="text-[10px] font-black font-mono tracking-widest uppercase text-white/20 italic mb-4">Advanced Filters</div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-mono uppercase tracking-widest text-white/30">Min. Reach</label>
                        <input type="text" placeholder="e.g. 100K" className="w-full bg-white/5 border border-white/10 p-2 text-xs text-white font-mono outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-mono uppercase tracking-widest text-white/30">Platform</label>
                        <select className="w-full bg-white/5 border border-white/10 p-2 text-xs text-white font-mono outline-none focus:border-primary">
                          <option>All</option><option>TikTok</option><option>Instagram</option><option>YouTube</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
             </div>
           )}

           {viewMode === 'GRID' ? (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
               {filteredInfluencers.length === 0 ? (
                 <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 bg-white/[0.01]">
                   <div className="text-white/10 font-mono text-sm uppercase tracking-widest italic">No nodes matching these parameters in sector</div>
                 </div>
               ) : filteredInfluencers.map((inf, i) => (
                 <ScrollReveal key={inf.id} delay={i * 0.05} direction="up">
                   <button 
                     onClick={() => toggleInfluencer(inf.id, inf.name)}
                     className={cn(
                      "manifest-card p-0 bg-black overflow-hidden group text-left transition-all w-full",
                      selectedInfluencers.includes(inf.id) ? "border-primary ring-1 ring-primary" : "border-white/5 hover:border-white/20"
                     )}
                   >
                     <div className="aspect-[4/5] relative overflow-hidden">
                       <img src={inf.avatar} alt={inf.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />
                       <div className="absolute top-4 left-4 flex gap-2">
                         {inf.platform === 'TikTok' ? <Music className="w-4 h-4 text-white" /> : <Instagram className="w-4 h-4 text-white" />}
                         <span className="text-[9px] font-black tracking-widest uppercase text-white drop-shadow-lg">{inf.platform}</span>
                       </div>
                       <div className="absolute top-4 right-4">
                          <div className="px-2 py-1 bg-primary text-white text-[8px] font-black font-mono tracking-widest italic">{inf.match || '90%'} MATCH</div>
                       </div>
                       <div className="absolute bottom-6 left-6 right-6">
                         <div className="text-2xl font-black text-white italic font-mono uppercase tracking-tight mb-1">{inf.name}</div>
                         <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{inf.reach} followers</div>
                       </div>
                       {selectedInfluencers.includes(inf.id) && (
                         <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                           <CheckCircle2 className="w-12 h-12 text-white stroke-[3px]" />
                         </div>
                       )}
                     </div>
                     <div className="p-6 space-y-4">
                       <div className="flex justify-between items-center text-[10px] font-bold font-mono italic">
                         <span className="text-white/20 uppercase tracking-widest">Niche</span>
                         <span className="text-primary uppercase">{inf.genre}</span>
                       </div>
                       <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Outreach Status</span>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", inf.status === 'READY' || !inf.status ? "bg-green-500" : "bg-yellow-500")} />
                            <span className="text-[9px] font-bold text-white/60 font-mono tracking-widest">{inf.status || 'READY'}</span>
                          </div>
                       </div>
                     </div>
                   </button>
                 </ScrollReveal>
               ))}
              </div>
            ) : (
              <div className="max-w-md mx-auto relative h-[650px] flex items-center justify-center">
                 <AnimatePresence mode="wait">
                    {filteredInfluencers[currentIndex] ? (
                       <motion.div 
                         key={filteredInfluencers[currentIndex].id}
                         initial={{ opacity: 0, scale: 0.9, x: 0 }}
                         animate={{ opacity: 1, scale: 1, x: 0 }}
                         exit={{ opacity: 0, x: currentIndex % 2 === 0 ? 500 : -500, rotate: currentIndex % 2 === 0 ? 15 : -15 }}
                         className="w-full aspect-[3/4.5] bg-dark border border-white/10 overflow-hidden relative shadow-[0_50px_100px_rgba(0,0,0,1)]"
                       >
                          <img 
                            src={filteredInfluencers[currentIndex].avatar} 
                            alt={filteredInfluencers[currentIndex].name} 
                            className="w-full h-full object-cover grayscale brightness-50 hover:grayscale-0 transition-all duration-1000"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                          
                          <div className="absolute top-6 left-6 flex flex-col gap-2">
                             <motion.span 
                               initial={{ x: -20, opacity: 0 }}
                               animate={{ x: 0, opacity: 1 }}
                               className="px-2 py-1 bg-primary text-white text-[9px] font-black italic tracking-[0.2em] w-fit"
                             >
                                HIGH_CONVERSION_NODE
                             </motion.span>
                             <motion.span 
                               initial={{ x: -20, opacity: 0 }}
                               animate={{ x: 0, opacity: 1 }}
                               transition={{ delay: 0.1 }}
                               className="px-2 py-1 bg-white/10 text-white text-[9px] font-black italic tracking-[0.2em] w-fit uppercase"
                             >
                                Trending in {filteredInfluencers[currentIndex].genre}
                             </motion.span>
                          </div>

                          <div className="absolute bottom-10 left-10 right-10 flex flex-col gap-6">
                             <div>
                                <h3 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-3">{filteredInfluencers[currentIndex].name}</h3>
                                <div className="flex items-center gap-4 text-[11px] font-black text-white/40 uppercase tracking-widest italic font-mono">
                                   <span className="text-primary">{filteredInfluencers[currentIndex].platform}</span>
                                   <div className="w-1 h-1 bg-white/20 rounded-full" />
                                   <span>{filteredInfluencers[currentIndex].reach} Reach</span>
                                </div>
                             </div>
                             
                             <div className="flex gap-4">
                                <button 
                                  onClick={() => handleSwipe('left')}
                                  className="flex-1 h-20 border border-white/10 bg-black/40 backdrop-blur-md text-white hover:bg-white hover:text-black transition-all flex items-center justify-center group"
                                >
                                   <Trash2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                </button>
                                <button 
                                  onClick={() => handleSwipe('right')}
                                  className="flex-[2] h-20 bg-white text-black hover:bg-primary hover:text-white transition-all flex items-center justify-center font-black italic uppercase text-xs gap-4 group"
                                >
                                   Connect <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                </button>
                             </div>
                          </div>
                       </motion.div>
                    ) : (
                       <div className="text-center space-y-8 p-12 border border-white/5 bg-white/[0.02]">
                          <SearchCheck className="w-20 h-20 text-white/10 mx-auto" />
                          <div className="space-y-2">
                            <p className="text-[11px] font-black text-white/60 uppercase tracking-[0.5em] italic">Sector Scan Complete</p>
                            <p className="text-[9px] font-medium text-white/20 uppercase tracking-[0.2em]">No further nodes detected in current relay radius.</p>
                          </div>
                          <button onClick={() => setCurrentIndex(0)} className="w-full py-5 bg-white text-black font-black italic uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all">Reset Scan Loop</button>
                       </div>
                    )}
                 </AnimatePresence>
              </div>
           )}
        </div>
      </div>

      <div className="manifest-card p-12 !border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-8 mt-12">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 border border-primary/40 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h4 className="text-2xl font-black italic font-mono uppercase tracking-tight text-white mb-2">Automated Pitching</h4>
            <p className="text-sm text-white/40 italic font-medium max-w-lg leading-relaxed">
              Our AI writes personalized DMs and emails for each creator based on their history and your song profile. Higher engagement, zero effort.
            </p>
          </div>
        </div>
        <button 
          onClick={() => notify('ai', 'TEMPLATE_PROTOCOL', 'Loading dynamic pitch templates for current sonic profile...')}
          className="secondary-button py-5 px-12 font-mono uppercase tracking-widest text-[11px] font-black"
        >
          Configure Templates
        </button>
      </div>
    </div>
  );
}
