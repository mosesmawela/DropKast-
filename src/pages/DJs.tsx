import { useState, useMemo, useEffect } from 'react';
import { 
  Radio, 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  TrendingUp, 
  Zap, 
  ChevronRight, 
  Disc, 
  Upload, 
  CheckCircle2, 
  Send,
  Cpu,
  ShieldCheck,
  Disc3,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import ScrollReveal from '../components/animations/ScrollReveal';
import AnimatedBeam from '../components/animations/AnimatedBeam';
import { useNotify } from '../context/NotificationContext';
import { useReleases } from '../context/ReleaseContext';
import { useNavigate } from 'react-router-dom';

interface DJNode {
  id: number | string;
  name: string;
  region: string;
  followers: string;
  style: string;
  status: string;
  rating: number;
}

export default function DJs() {
  const { notify } = useNotify();
  const { releases } = useReleases();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'BUILD' | 'SEND' | 'VAULT'>('BUILD');
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedDJs, setSelectedDJs] = useState<(number | string)[]>([]);
  const [djNodes, setDjNodes] = useState<DJNode[]>([]);

  useEffect(() => {
    fetch('/api/djs')
      .then((r) => r.json())
      .then((d) => setDjNodes(Array.isArray(d) ? d : []))
      .catch(() => setDjNodes([]));
  }, []);

  const filteredDJs = useMemo(() => {
    return djNodes.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) || node.style.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = regionFilter === 'ALL' || node.region.includes(regionFilter);
      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, regionFilter, djNodes]);

  const handleUpload = (fileType: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*,.wav,.mp3,.aiff,.flac';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        notify('ai', 'Processing', `Analyzing ${fileType}: ${file.name}...`);
        setIsUploading(true);
        setTimeout(() => {
          notify('success', 'Pack ready', `${fileType} finalized and added to your DJ pack.`);
          setIsUploading(false);
        }, 2000);
      }
    };
    input.click();
  };

  const toggleSelect = (id: number, name: string) => {
    setSelectedDJs(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      notify('info', 'DJ selected', `${name} added to your send list.`);
      return [...prev, id];
    });
  };

  const handleSend = async () => {
    setIsSending(true);
    notify('ai', 'Sending', `Sending your DJ pack to ${selectedDJs.length} DJs...`);
    
    try {
      const response = await fetch('/api/djs/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          djIds: selectedDJs,
          timestamp: new Date()
        })
      });

      if (!response.ok) throw new Error('Broadcast failed');

      // Track analytics
      selectedDJs.forEach(() => {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            releaseId: releases[0]?.id || 'unknown',
            type: 'click',
            platform: 'DJ_TERMINAL',
            value: 1000
          })
        });
      });

      notify('success', 'Sent', 'Your DJ pack was sent successfully.');
      setSelectedDJs([]);
    } catch (err) {
      notify('error', "Send failed", 'Failed to send your DJ pack. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-8 font-sans">
      <ScrollReveal direction="down">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-2 text-primary mb-3 font-mono">
              <Radio className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-widest italic font-mono">DJ Network</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-white italic font-mono uppercase">DJ Packs</h1>
          </div>
          <div className="flex flex-wrap bg-black border border-white/10 p-1 shrink-0">
             {['BUILD', 'SEND', 'VAULT'].map(tab => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={cn(
                    "px-6 sm:px-8 py-3 min-h-[40px] text-[10px] font-bold tracking-widest font-mono transition-all uppercase",
                    activeTab === tab ? "bg-primary text-white" : "text-white/20"
                  )}
               >
                  {tab === 'VAULT' ? 'The Vault' : tab.charAt(0) + tab.slice(1).toLowerCase().replace('pack', '')}
               </button>
             ))}
          </div>
        </header>
      </ScrollReveal>

      <AnimatePresence mode="wait">
        {activeTab === 'BUILD' ? (
          <motion.div 
            key="build"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12"
          >
            {/* Left: Component Uploads */}
            <div className="lg:col-span-12 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { label: 'Instrumental', status: 'READY', icon: Disc3 },
                   { label: 'Clean Edit', status: 'PENDING', icon: ShieldCheck },
                   { label: 'Radio Edit', status: 'PENDING', icon: Radio },
                 ].map((file, i) => (
                   <div key={i} className="p-8 border border-white/5 bg-dark space-y-6 group transition-all">
                      <div className="flex items-center justify-between">
                         <div className="w-10 h-10 border border-white/10 flex items-center justify-center bg-white/5">
                            <file.icon className="w-5 h-5 text-primary" />
                         </div>
                         <div className={cn("text-[9px] font-bold font-mono tracking-widest uppercase", file.status === 'READY' ? 'text-green-500' : 'text-primary')}>
                            {file.status}
                         </div>
                      </div>
                      <h3 className="text-xl font-bold font-mono italic uppercase text-white">{file.label}</h3>
                      <button
                         onClick={() => handleUpload(file.label)}
                         className="beam w-full py-3 min-h-[40px] border border-white/10 text-[10px] font-bold font-mono tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                       >
                         <Upload className="w-3 h-3" />
                         {file.status === 'READY' ? 'Re-Upload' : 'Upload File'}
                       </button>
                   </div>
                 ))}
               </div>

               {/* Pack Logic */}
               <div className="p-12 border border-white/5 bg-white/[0.02] space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Cpu className="w-48 h-48" />
                  </div>
                  <div className="relative z-10 max-w-2xl">
                    <h3 className="text-2xl sm:text-3xl font-black italic font-mono uppercase tracking-tight text-white mb-4">Auto-Stem Generation</h3>
                    <p className="text-white/40 text-sm leading-relaxed italic font-medium mb-8">
                       Our AI engine analyzes your master track to automatically generate clean edits, 8-bar intro/outro transitions, and high-fidelity instrumentals. All assets are packed into a professional DJ pack file ready to send to DJs worldwide.
                    </p>
                    <AnimatedBeam containerClassName="w-fit">
                      <button 
                         onClick={() => handleUpload('Full Pack')}
                         disabled={isUploading}
                         className="primary-button h-16 px-12 flex items-center gap-3"
                       >
                         {isUploading ? <Cpu className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                         {isUploading ? 'Generating...' : 'Build Full DJ Pack'}
                       </button>
                    </AnimatedBeam>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : activeTab === 'SEND' ? (
          <motion.div 
            key="send"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
             {/* Search & Filter */}
             <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/5 p-6 border border-white/5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 w-full sm:w-auto">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="text"
                      placeholder="Search DJs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-black border border-white/10 pl-12 pr-6 py-3 text-xs font-mono tracking-widest text-white outline-none focus:border-primary transition-all w-full uppercase"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {['ALL', 'EU', 'US', 'UK', 'NG'].map(reg => (
                      <button
                        key={reg}
                        onClick={() => setRegionFilter(reg)}
                        className={cn(
                          "px-4 py-2 min-h-[40px] text-[10px] font-bold tracking-widest font-mono border transition-all",
                          regionFilter === reg ? "bg-primary border-primary text-white" : "border-white/5 text-white/20"
                        )}
                      >
                        {reg}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-sm font-black text-white font-mono italic">{selectedDJs.length} Selected</div>
                   <button 
                    onClick={handleSend}
                    disabled={selectedDJs.length === 0 || isSending}
                    className={cn(
                      "primary-button h-14 px-8 flex items-center gap-3",
                      (selectedDJs.length === 0 || isSending) && "opacity-50 grayscale cursor-not-allowed"
                    )}
                   >
                     {isSending ? <Cpu className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                     {isSending ? 'Sending...' : 'Send Release'}
                   </button>
                </div>
             </div>

             {/* Nodes Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDJs.length === 0 ? (
                   <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 bg-white/[0.01]">
                     <div className="text-white/10 font-mono text-sm uppercase tracking-widest italic">No DJs match your filters</div>
                   </div>
                ) : filteredDJs.map((dj, i) => (
                   <ScrollReveal key={dj.id} delay={i * 0.05} direction="up">
                      <div className={cn(
                        "p-8 border bg-dark group transition-all relative overflow-hidden",
                        selectedDJs.includes(dj.id) ? "border-primary bg-primary/[0.02]" : "border-white/5"
                      )}>
                         <div className="absolute top-0 right-0 p-4">
                           <div className="w-10 h-10 border border-white/10 flex items-center justify-center font-mono text-primary text-[10px] font-bold">
                             {dj.rating}
                           </div>
                         </div>
                         
                         <div className="space-y-6">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-white/20 transition-colors">
                                  <Disc className="w-6 h-6" />
                               </div>
                               <div>
                                  <h4 className="text-xl font-black italic font-mono uppercase text-white tracking-tight">{dj.name}</h4>
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest font-mono">
                                     <MapPin className="w-3 h-3" />
                                     {dj.region}
                                  </div>
                               </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                               <div className="space-y-1">
                                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest font-mono">Style</span>
                                  <div className="text-xs font-black text-white uppercase italic">{dj.style}</div>
                               </div>
                               <div className="space-y-1">
                                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest font-mono">Followers</span>
                                  <div className="text-xs font-black text-primary font-mono italic">{dj.followers}</div>
                               </div>
                            </div>

                            <button
                              onClick={() => toggleSelect(dj.id, dj.name)}
                              className={cn(
                                "beam w-full py-4 min-h-[40px] font-mono text-[10px] font-black tracking-[0.2em] uppercase italic transition-all",
                                selectedDJs.includes(dj.id) ? "bg-primary text-white" : "border border-white/10 text-white"
                              )}
                            >
                              {selectedDJs.includes(dj.id) ? 'Selected' : 'Add to list'}
                            </button>
                         </div>
                      </div>
                   </ScrollReveal>
                ))}
             </div>

             {/* Footer CTAs */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-white/5">
                {[
                  { title: 'DJ Early Access', desc: 'Allow vetted DJs to preview tracks 48h before official release.', icon: Zap },
                  { title: 'Trending Pool', desc: 'See which global DJ sets are currently playing your previous packs.', icon: TrendingUp },
                ].map((cta, i) => (
                  <button
                     key={i}
                     onClick={() => navigate(cta.title === 'DJ Early Access' ? '/settings' : '/analytics')}
                     className="beam p-10 border border-white/5 bg-white/[0.01] transition-all text-left flex items-start gap-8 group"
                   >
                     <div className="w-14 h-14 border border-white/10 flex items-center justify-center bg-white/5 transition-colors">
                       <cta.icon className="w-6 h-6 text-primary" />
                     </div>
                     <div className="space-y-2">
                        <h4 className="text-2xl font-black italic font-mono uppercase tracking-tight text-white">{cta.title}</h4>
                        <p className="text-sm text-white/30 italic font-medium leading-relaxed max-w-sm">{cta.desc}</p>
                     </div>
                   </button>
                ))}
             </div>
          </motion.div>
        ) : (
          <motion.div 
            key="vault"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { title: "Ibiza Heat Vol. 1", status: "UNLOCKED", downloads: 124, tag: "EXCLUSIVE", icon: Zap },
                  { title: "Urban Pulse 2024", status: "LOCKED", downloads: 0, tag: "ELITE_PACK", icon: ShieldCheck },
                  { title: "Midnight Deep", status: "LOCKED", downloads: 0, tag: "LEGACY", icon: Disc3 },
                ].map((pack, i) => (
                   <div key={i} className={cn(
                     "p-10 border bg-dark space-y-8 relative overflow-hidden group transition-all",
                     pack.status === "UNLOCKED" ? "border-primary/40 bg-primary/[0.02]" : "border-white/5 grayscale"
                   )}>
                      <div className="flex items-center justify-between relative z-10">
                         <div className="w-12 h-12 border border-white/10 flex items-center justify-center bg-white/5">
                            <pack.icon className={cn("w-6 h-6", pack.status === 'UNLOCKED' ? "text-primary" : "text-white/10")} />
                         </div>
                         <span className={cn("text-[9px] font-black font-mono tracking-widest px-3 py-1 border uppercase italic", 
                            pack.status === 'UNLOCKED' ? "border-primary text-primary" : "border-white/10 text-white/20")}>
                            {pack.tag}
                         </span>
                      </div>
                      
                      <div className="relative z-10">
                         <h3 className="text-2xl font-black italic font-mono uppercase tracking-tight text-white mb-2">{pack.title}</h3>
                         <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] font-mono italic">{pack.status}</div>
                      </div>

                      <div className="relative z-10 pt-6 border-t border-white/5 flex items-center justify-between">
                         <div className="space-y-1">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest font-mono">Downloads</span>
                            <div className="text-sm font-black text-white italic">{pack.downloads} DJs</div>
                         </div>
                         <button className={cn(
                           "beam h-12 px-6 font-mono text-[9px] font-black uppercase tracking-widest italic transition-all",
                           pack.status === 'UNLOCKED' ? "bg-white text-black" : "border border-white/10 text-white/20 cursor-not-allowed"
                         )}>
                            {pack.status === 'UNLOCKED' ? 'Enter Vault' : 'Locked'}
                         </button>
                      </div>

                      <div className="absolute -bottom-4 -right-4 opacity-[0.02] transition-transform">
                         <pack.icon className="w-48 h-48" />
                      </div>
                   </div>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
