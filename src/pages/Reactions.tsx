import { useState, useMemo } from 'react';
import { 
  Play, 
  Search, 
  Filter, 
  CheckCircle2, 
  ChevronRight, 
  Youtube, 
  Zap, 
  Users, 
  Star, 
  Cpu, 
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  Target,
  SearchCheck,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import ScrollReveal from '../components/animations/ScrollReveal';
import AnimatedBeam from '../components/animations/AnimatedBeam';
import { useNotify } from '../context/NotificationContext';

const reactors = [
  { id: 1, channel: 'ReactCentral', genre: 'Hip-Hop', reach: '2.8M', match: '96%', tags: ['TOP_TIER', 'VERIFIED'], avatar: 'RC' },
  { id: 2, channel: 'VibeCheckTV', genre: 'R&B / Soul', reach: '950K', match: '94%', tags: ['RISING'], avatar: 'VC' },
  { id: 3, channel: 'The Beat Node', genre: 'Electronic', reach: '1.4M', match: '82%', tags: ['TECHNICAL'], avatar: 'BN' },
  { id: 4, channel: 'Global Sound', genre: 'Global Pop', reach: '5.1M', match: '91%', tags: ['VIRAL'], avatar: 'GS' },
];

export default function Reactions() {
  const { notify } = useNotify();
  const [selectedReactors, setSelectedReactors] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredReactors = useMemo(() => {
    return reactors.filter(r => {
      const matchesSearch = r.channel.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = activeGenre === 'ALL' || r.genre.toUpperCase().includes(activeGenre);
      return matchesSearch && matchesGenre;
    });
  }, [searchQuery, activeGenre]);

  const toggleSelect = (id: number, channel: string) => {
    setSelectedReactors(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      notify('info', 'REACTOR_ENGAGED', `${channel} has been queued for submission.`);
      return [...prev, id];
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    notify('ai', 'PACKAGING_METADATA', 'Compiling press assets and high-res audio for reactors...');
    
    try {
      const response = await fetch('/api/influencers/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reactorIds: selectedReactors,
          category: 'REACTION',
          timestamp: new Date()
        })
      });

      if (!response.ok) throw new Error('Submission failed');

      notify('success', 'SUBMISSION_VERIFIED', `Pitched track to ${selectedReactors.length} reactor nodes.`);
      setSelectedReactors([]);
    } catch (err) {
      notify('error', 'SUBMISSION_ERROR', 'Failed to engage reactor network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-8">
      <ScrollReveal direction="down">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-mono">
               <Youtube className="w-4 h-4" />
               <span className="text-[11px] font-bold uppercase tracking-widest italic font-mono">Reaction Network</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-white italic font-mono uppercase">Reactor Nodes</h1>
            <p className="text-white/30 text-sm italic font-medium max-w-xl leading-relaxed">
              Auto-scout and pitch to reaction channels. AI analyzes past reaction history to ensure maximum conversion for your specific sonic profile.
            </p>
          </div>
          <div className="flex flex-col items-end gap-4">
            <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] font-mono">Submission Buffer</div>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-black text-white font-mono italic">{selectedReactors.length.toString().padStart(2, '0')}</div>
              <button 
                onClick={handleSubmit}
                disabled={selectedReactors.length === 0 || isSubmitting}
                className={cn(
                  "primary-button h-16 px-10 flex items-center gap-3",
                  (selectedReactors.length === 0 || isSubmitting) && "opacity-50 grayscale cursor-not-allowed"
                )}
              >
                {isSubmitting ? <Cpu className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSubmitting ? 'Transmitting...' : 'Submit to Reactors'}
              </button>
            </div>
          </div>
        </header>
      </ScrollReveal>

      {/* AI Strategy Banner */}
      <div className="p-10 bg-primary/10 border border-primary/20 relative overflow-hidden group">
         <div className="absolute right-0 top-0 text-[100px] font-mono font-black text-primary/[0.05] italic -mr-10 -mt-10 select-none">AI_STRAT</div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-3 text-primary font-mono font-black italic">
                 <Sparkles className="w-5 h-5" />
                 AI SCOUTER_REPORT: READY
               </div>
               <h3 className="text-3xl font-black italic font-mono uppercase tracking-tight text-white">Target High-Velocity Nodes</h3>
               <p className="text-white/40 text-sm italic font-medium max-w-lg leading-relaxed">
                  Pitch your release to reaction channels matched on genre and audience. Strategy recommendations appear here once you've pitched a track and we have response data to learn from.
               </p>
            </div>
            <button 
              onClick={() => notify('success', 'STRATEGY_ADOPTED', 'Filter and prioritization system tuned to AI recommendations.')}
              className="primary-button py-5 px-10 font-mono text-[11px] font-black uppercase tracking-widest bg-white text-black hover:bg-white/80"
            >
              Adopt AI Strategy
            </button>
         </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/5 p-6 border border-white/5">
         <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="text" 
                placeholder="Search reactors..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black border border-white/10 pl-12 pr-6 py-3 text-xs font-mono tracking-widest text-white outline-none focus:border-primary transition-all w-full uppercase"
              />
            </div>
            <div className="hidden lg:flex items-center gap-2">
               {['ALL', 'HIP-HOP', 'R&B', 'ELECTRONIC', 'POP'].map(g => (
                 <button 
                   key={g} 
                   onClick={() => setActiveGenre(g)}
                   className={cn(
                    "px-4 py-2 text-[10px] font-bold tracking-widest font-mono border transition-all uppercase",
                    activeGenre === g ? "bg-primary border-primary text-white" : "border-white/5 text-white/20 hover:text-white"
                   )}
                 >
                   {g}
                 </button>
               ))}
            </div>
         </div>
         <button 
           onClick={() => notify('info', 'DEEP_SCAN', 'Advanced scraping of reaction history initiated.')}
           className="flex items-center gap-2 text-[10px] font-bold font-mono tracking-widest text-white/30 hover:text-white transition-colors"
         >
           <Filter className="w-3.5 h-3.5" />
           ADVANCED_SCOUTING
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredReactors.length === 0 ? (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 bg-white/[0.01]">
            <div className="text-white/10 font-mono text-sm uppercase tracking-widest italic">No reactor nodes matching parameters</div>
          </div>
        ) : filteredReactors.map((r, i) => (
          <ScrollReveal key={r.id} delay={i * 0.1} direction="up">
            <div className={cn(
              "p-10 border transition-all group relative overflow-hidden bg-dark",
              selectedReactors.includes(r.id) ? "border-primary bg-primary/[0.02]" : "border-white/5 hover:border-white/20"
            )}>
              <div className="flex items-start justify-between">
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-white/5 border border-white/10 flex items-center justify-center text-4xl font-black italic font-mono text-white/10 group-hover:text-primary transition-colors">
                       {r.avatar}
                    </div>
                    <div>
                       <h3 className="text-3xl font-black italic font-mono uppercase tracking-tight text-white mb-2">{r.channel}</h3>
                       <div className="flex flex-wrap gap-2">
                          {r.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-white/5 border border-white/5 text-[8px] font-bold text-white/30 font-mono tracking-widest uppercase">
                              {tag}
                            </span>
                          ))}
                       </div>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-[10px] font-bold text-primary font-mono tracking-widest uppercase mb-1">{r.match} MATCH</div>
                    <div className="flex items-center justify-end gap-2 text-white font-mono italic">
                       <Users className="w-3.5 h-3.5 opacity-40" />
                       <span className="text-xl font-bold">{r.reach}</span>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-10 py-6 border-y border-white/5">
                 <div className="space-y-1">
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest font-mono">Primary Genre</span>
                    <div className="text-xs font-black text-white uppercase italic">{r.genre}</div>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest font-mono">Response Time</span>
                    <div className="text-xs font-black text-white uppercase italic font-mono tracking-tighter">~48 Hours</div>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest font-mono">Conversion Rate</span>
                    <div className="text-xs font-black text-primary italic font-mono">14.2%</div>
                 </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                 <button 
                   onClick={() => notify('info', 'DEMO_RESTRICTED', 'Preview is restricted to full LVRN Pro membership.')}
                   className="flex items-center gap-2 text-[10px] font-bold font-mono tracking-widest text-white/40 hover:text-white transition-colors"
                 >
                    <Play className="w-3 h-3" />
                    VIEW_LATEST_REACTION
                 </button>
                 <button 
                   onClick={() => toggleSelect(r.id, r.channel)}
                   className={cn(
                    "flex items-center gap-2 px-8 py-3 font-mono text-[11px] font-black tracking-widest uppercase italic transition-all",
                    selectedReactors.includes(r.id) ? "bg-primary text-white" : "border border-white/10 text-white hover:bg-white hover:text-black"
                   )}
                 >
                    {selectedReactors.includes(r.id) ? 'NODE_READY' : 'SELECT_NODE'}
                    <ArrowUpRight className="w-4 h-4" />
                 </button>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
