import { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Plus, 
  ExternalLink,
  ChevronDown,
  Disc,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useReleases } from '../context/ReleaseContext';
import ScrollReveal from '../components/animations/ScrollReveal';

const statusIcons = {
  Released: CheckCircle2,
  Scheduled: Clock,
  Draft: Disc,
  Rejected: AlertCircle,
};

export default function Releases() {
  const navigate = useNavigate();
  const { releases, deleteRelease, isLoading } = useReleases();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const filteredReleases = releases.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'All' || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-10 max-w-7xl mx-auto py-8">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 text-white/30 text-[10px] font-bold tracking-[0.2em] mb-4 font-mono">
            <span className="w-1.5 h-1.5 bg-white/30"></span>
            CATALOG_SYSTEM_v2
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white uppercase italic font-mono">Your Songs</h1>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => navigate('/releases/history')}
             className="h-14 px-8 border border-white/10 text-white/40 hover:text-white transition-all text-xs font-bold italic tracking-widest font-mono"
           >
             HISTORY_LOG
           </button>
           <button 
             onClick={() => navigate('/releases/new')}
             className="primary-button h-14 flex items-center bg-white text-black hover:bg-primary hover:text-white px-10"
           >
             NEW_RELEASE
           </button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-8 items-center bg-dark border-y border-white/5 py-3 px-4">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white transition-colors" />
          <input 
            type="text" 
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none py-3 pl-10 pr-4 text-xs font-sans font-medium tracking-wide focus:ring-0 text-white placeholder:text-white/20"
          />
        </div>
        <div className="flex items-center gap-2">
          {['All', 'Released', 'Scheduled', 'Draft'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all font-mono italic",
                filter === f 
                  ? "bg-primary text-white" 
                  : "bg-white/5 text-white/40 hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Action Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <ScrollReveal>
          <Link 
            to="/releases/new"
            className="manifest-card p-10 bg-primary/10 border-primary/20 flex items-center justify-between group hover:bg-primary/20 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="flex items-center gap-8">
               <div className="w-16 h-16 border-2 border-primary/40 flex items-center justify-center relative group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-primary" />
               </div>
               <div>
                  <h2 className="text-3xl font-black italic uppercase font-mono tracking-tighter text-white mb-1">Initialize_New_Drop</h2>
                  <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest font-mono italic">Expansion Protocol 03: DISTRO_SYNC</p>
               </div>
            </div>
            <ArrowRight className="w-8 h-8 text-primary opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
          </Link>
        </ScrollReveal>
        
        <ScrollReveal delay={0.1}>
          <div className="manifest-card p-10 border-white/5 flex items-center justify-between bg-white/[0.02] relative overflow-hidden">
            <div className="flex items-center gap-8">
               <div className="w-16 h-16 border border-white/10 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white/20" />
               </div>
               <div>
                  <h2 className="text-3xl font-black italic uppercase font-mono tracking-tighter text-white/40 mb-1">AI_Strategy_Gen</h2>
                  <p className="text-[11px] font-bold text-white/10 uppercase tracking-widest font-mono italic">Market prediction: OPTIMISTIC</p>
               </div>
            </div>
            <div className="px-4 py-2 bg-white/5 text-[9px] font-black text-white/20 font-mono tracking-[0.3em] italic uppercase">Locked_Pending_Drop</div>
          </div>
        </ScrollReveal>
      </div>

      {/* Manifest Table */}
      <div className="bg-dark border border-white/5 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-bold text-white tracking-[0.2em] italic uppercase font-mono">Name / Info</th>
                <th className="px-8 py-6 text-[10px] font-bold text-white tracking-[0.2em] italic uppercase font-mono">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold text-white tracking-[0.2em] italic uppercase font-mono">Format</th>
                <th className="px-8 py-6 text-[10px] font-bold text-white tracking-[0.2em] italic uppercase font-mono">Stores</th>
                <th className="px-8 py-6 text-[10px] font-bold text-white tracking-[0.2em] italic uppercase font-mono text-right opacity-30">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredReleases.map((release, i) => {
                const StatusIcon = statusIcons[release.status as keyof typeof statusIcons];
                return (
                  <motion.tr 
                    key={release.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/releases/${release.id}/status`)}
                    className="hover:bg-white/[0.01] transition-colors group cursor-pointer relative"
                  >
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 border border-white/10 p-0.5 relative group-hover:border-primary transition-colors bg-surface-low">
                          <img src={release.artwork} alt="" className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white tracking-tight uppercase font-mono italic">{release.title}</p>
                          <p className="text-[11px] text-white/40 font-medium tracking-wide font-sans mt-0.5">{release.artist}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                       <div className="flex flex-col gap-1.5 px-0 py-0 font-mono">
                          <div className="flex items-center gap-3">
                             <div className={cn("w-1.5 h-1.5 bg-current rounded-full", 
                                release.status === 'Released' ? 'text-green-500' :
                                release.status === 'Scheduled' ? 'text-primary animate-pulse' : 'text-white/20'
                             )}></div>
                             <span className="text-[11px] font-bold text-white italic tracking-widest">{release.status.toUpperCase()}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-8">
                      <p className="text-[11px] text-white/60 font-bold italic tracking-widest leading-none font-mono">
                        {release.format.toUpperCase()}
                      </p>
                      <div className="flex items-center gap-2 mt-2 font-mono">
                         <Calendar className="w-3 h-3 text-white/10" />
                         <span className="text-[9px] text-white/20 font-bold tracking-widest italic">{release.releaseDate}</span>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-baseline gap-2 font-mono">
                        <span className="text-base font-bold text-white italic">{release.stores?.length || '00'}</span>
                        <span className="text-[10px] text-white/20 font-bold tracking-widest italic uppercase">Stores</span>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <div className="flex items-center justify-end gap-6 h-full opacity-10 group-hover:opacity-100 transition-opacity font-mono">
                        <button 
                          onClick={() => navigate('/strategy')}
                          className="text-[10px] font-bold text-primary hover:text-white transition-all uppercase tracking-widest flex items-center gap-2"
                        >
                           <Sparkles className="w-3.5 h-3.5" />
                           PROMOTE
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if(confirm('Delete record?')) deleteRelease(release.id);
                          }}
                          className="text-[10px] font-bold text-white/20 hover:text-red-500 transition-all uppercase tracking-widest flex items-center gap-2"
                        >
                           <Trash2 className="w-3.5 h-3.5" />
                           DELETE
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filteredReleases.length === 0 && !isLoading && (
            <div className="py-32 text-center bg-dark">
               <div className="flex flex-col items-center justify-center p-12 border border-white/5 inline-block mx-auto">
                <Disc className="w-12 h-12 text-white/5 mb-8" />
                <h3 className="text-xl font-bold text-white italic tracking-tight font-mono uppercase">No songs found</h3>
                <p className="text-[11px] text-white/20 mt-3 uppercase font-bold tracking-widest italic font-mono">Your catalog search returned zero results.</p>
               </div>
            </div>
          )}
          {isLoading && (
             <div className="py-24 text-center bg-dark">
                <div className="w-12 h-0.5 bg-white/5 mx-auto mb-6 relative overflow-hidden">
                   <div className="absolute inset-y-0 bg-primary w-1/3 animate-infinite-scroll"></div>
                </div>
                <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em] italic font-mono">Syncing catalog data...</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
