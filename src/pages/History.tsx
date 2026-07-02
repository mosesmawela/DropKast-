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

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 font-mono">
      <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-12">
        <div className="space-y-6 min-w-0">
          <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] italic">
            Activity log
          </div>
          <h1 className="text-4xl sm:text-8xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 break-words">
            Distribution <span className="text-primary">history</span>
          </h1>
          <p className="text-white/30 text-base font-bold italic tracking-widest uppercase">Every release event, in order. Submitted, approved, delivered, taken down.</p>
        </div>

        <div className="flex items-center gap-6 shrink-0">
           <div className="p-8 border border-white/5 bg-dark space-y-2 text-right">
              <div className="text-4xl font-black text-white italic">{releases.length}</div>
              <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Total releases</div>
           </div>
        </div>
      </div>

      <div className="text-center py-20 border border-dashed border-white/10">
        <HistoryIcon className="w-8 h-8 text-white/20 mx-auto mb-4" />
        <div className="text-white/40 italic mb-2">No history available yet.</div>
        <p className="text-white/20 text-sm italic">Release your first track to see distribution history here.</p>
      </div>

      <div className="mt-20 pt-10 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 opacity-30">
         <div className="flex items-center gap-4 min-w-0">
            <HistoryIcon className="w-5 h-5 text-white shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] italic font-mono">Every event logged and verified</span>
         </div>
         <div className="text-[9px] font-black uppercase tracking-[0.5em] shrink-0">DropKast</div>
      </div>
    </div>
  );
}
