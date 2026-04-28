import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  History as HistoryIcon,
  Package, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  XOctagon,
  ArrowUpRight,
  BarChart3,
  Search,
  Filter
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useReleases } from '../context/ReleaseContext';

export default function History() {
  const navigate = useNavigate();
  const { releases } = useReleases();

  const mockHistory = releases.map(r => ({
    ...r,
    events: [
      { type: 'SUBMISSION', date: r.createdAt, status: 'SUCCESS' },
      { type: 'METADATA_VERIFICATION', date: new Date(new Date(r.createdAt).getTime() + 1000000).toISOString(), status: 'SUCCESS' },
      { type: 'AUDIO_INTEGRITY_CHECK', date: new Date(new Date(r.createdAt).getTime() + 2000000).toISOString(), status: 'SUCCESS' },
      { type: 'STORE_DELIVERY', date: new Date(new Date(r.createdAt).getTime() + 400000000).toISOString(), status: r.status === 'LIVE' ? 'SUCCESS' : 'PENDING' },
    ]
  }));

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 font-mono">
      <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-12">
        <div className="space-y-6">
          <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] italic">
            Deployment_Audit_Log
          </div>
          <h1 className="text-8xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
            Distribution <span className="text-primary">History</span>
          </h1>
          <p className="text-white/30 text-base font-bold italic tracking-widest uppercase">Comprehensive logs of all master data node transmissions.</p>
        </div>

        <div className="flex items-center gap-6">
           <div className="p-8 border border-white/5 bg-dark space-y-2 text-right">
              <div className="text-4xl font-black text-white italic">{releases.length}</div>
              <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Total Deployments</div>
           </div>
           <div className="p-8 border border-white/5 bg-dark space-y-2 text-right">
              <div className="text-4xl font-black text-primary italic">0</div>
              <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Failed Transmissions</div>
           </div>
        </div>
      </div>

      <div className="space-y-12">
        {mockHistory.map((release) => (
          <div key={release.id} className="manifest-card p-0 bg-dark border-white/5 overflow-hidden group">
             <div className="p-10 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 group-hover:bg-white/[0.01] transition-all">
                <div className="flex items-center gap-8">
                   <div className="w-24 h-24 border border-white/10 p-1.5 bg-surface-low shadow-2xl relative">
                      <img src={release.artwork} className="w-full h-full object-cover grayscale" />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ArrowUpRight className="w-8 h-8 text-white" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black text-primary italic uppercase tracking-widest font-mono">ID: {release.id}</span>
                         <span className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                         <span className="text-[10px] font-black text-white/40 italic uppercase tracking-widest font-mono">{release.format}</span>
                      </div>
                      <h3 
                        onClick={() => navigate(`/releases/${release.id}/status`)}
                        className="text-4xl font-black text-white italic uppercase tracking-tighter cursor-pointer hover:text-primary transition-colors"
                      >
                        {release.title}
                      </h3>
                      <p className="text-xs font-bold text-white/20 uppercase tracking-widest">{release.artist} • {new Date(release.createdAt).toLocaleDateString()}</p>
                   </div>
                </div>

                <div className="flex items-center gap-4">
                   <button 
                     onClick={() => navigate(`/analytics/${release.id}`)}
                     className="h-14 px-8 border border-white/5 bg-white/[0.03] text-white/40 hover:text-white hover:border-white transition-all font-black text-[11px] uppercase tracking-widest italic flex items-center gap-3"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Trace Stats
                   </button>
                   <button 
                     onClick={() => navigate(`/releases/${release.id}/status`)}
                     className="h-14 px-8 bg-white text-black hover:bg-primary hover:text-white transition-all font-black text-[11px] uppercase tracking-widest italic flex items-center gap-3"
                   >
                      Status Terminal
                      <ChevronRight className="w-4 h-4" />
                   </button>
                </div>
             </div>

             <div className="p-10 bg-black/30">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                   {release.events.map((event, i) => (
                     <div key={i} className="flex flex-col gap-4 relative">
                        {i < release.events.length - 1 && (
                          <div className="hidden md:block absolute top-5 left-10 w-full h-[1px] bg-white/5" />
                        )}
                        <div className="flex items-center gap-4 z-10">
                           <div className={cn(
                             "w-10 h-10 border flex items-center justify-center p-2 bg-dark shadow-xl transition-all",
                             event.status === 'SUCCESS' ? "border-green-500 text-green-500" : "border-yellow-500 text-yellow-500"
                           )}>
                              {event.status === 'SUCCESS' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                           </div>
                           <div className="md:hidden text-[10px] font-black text-white uppercase italic tracking-widest">{event.type}</div>
                        </div>
                        <div className="hidden md:block">
                           <div className="text-[9px] font-black text-white uppercase italic tracking-widest leading-tight mb-1">{event.type}</div>
                           <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">{new Date(event.date).toLocaleString()}</div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="mt-20 pt-10 border-t border-white/5 flex items-center justify-between opacity-30">
         <div className="flex items-center gap-4">
            <HistoryIcon className="w-5 h-5 text-white" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] italic font-mono">Log_Integrity_Verified_by_AI Distro Node</span>
         </div>
         <div className="text-[9px] font-black uppercase tracking-[0.5em]">SYSTEM_VERSION_3.0_RELEASE</div>
      </div>
    </div>
  );
}
