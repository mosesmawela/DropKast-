import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  FileText, 
  Scale, 
  AlertOctagon, 
  CheckCircle2,
  Lock,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Compliance() {
  const [agreed, setAgreed] = useState<string[]>([]);

  const toggleAgree = (id: string) => {
    setAgreed(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const requirements = [
    { id: 'rights', title: 'Full Rights Ownership', desc: 'You confirm that you own 100% of the mechanical and publishing rights to every track you upload.', icon: ShieldCheck },
    { id: 'samples', title: 'Sample Clearances', desc: 'You certify that all samples, loops, and vocal stems have been cleared for commercial distribution.', icon: FileText },
    { id: 'content', title: 'Content Integrity', desc: 'You confirm the release does not infringe on existing trademarks or contain unauthorized remixes.', icon: Scale },
    { id: 'explicit', title: 'Metadata Accuracy', desc: 'You agree that any explicit content has been flagged and titles are free of emojis or placeholder text.', icon: AlertOctagon }
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 font-mono">
      <div className="mb-20">
        <div className="flex items-center gap-4 mb-6">
           <Lock className="w-6 h-6 text-primary shrink-0" />
           <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] italic">Rights & Clearance</span>
        </div>
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-none mb-6 break-words">Compliance</h1>
        <p className="text-white/30 text-lg font-bold italic tracking-widest uppercase max-w-2xl">Make sure your music is cleared and ready before it goes live.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
         {requirements.map((req) => (
           <div 
             key={req.id} 
             onClick={() => toggleAgree(req.id)}
             className={cn(
               "beam p-6 md:p-10 border transition-all cursor-pointer group flex flex-col justify-between",
               agreed.includes(req.id) ? "bg-white/[0.03] border-primary" : "bg-dark border-white/5"
             )}
           >
              <div className="space-y-6">
                 <div className={cn(
                   "w-14 h-14 border flex items-center justify-center transition-colors",
                   agreed.includes(req.id) ? "border-primary text-primary" : "border-white/10 text-white/20"
                 )}>
                    <req.icon className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tight mb-2">{req.title}</h3>
                    <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest italic leading-relaxed">{req.desc}</p>
                 </div>
              </div>
              
              <div className="mt-12 flex items-center gap-3">
                 <div className={cn(
                   "w-5 h-5 border-2 transition-all flex items-center justify-center p-1",
                   agreed.includes(req.id) ? "border-primary bg-primary" : "border-white/10"
                 )}>
                    {agreed.includes(req.id) && <CheckCircle2 className="w-full h-full text-white" />}
                 </div>
                 <span className={cn(
                   "text-[10px] font-black uppercase tracking-widest italic transition-colors",
                   agreed.includes(req.id) ? "text-primary" : "text-white/20"
                 )}>
                   {agreed.includes(req.id) ? 'Confirmed' : 'Review pending'}
                 </span>
              </div>
           </div>
         ))}
      </div>

      <div className="manifest-card p-6 md:p-12 bg-white text-black mb-12">
         <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            <div className="flex-1 min-w-0 space-y-6">
               <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none mb-2 text-black break-words">Distribution Agreement</h2>
               <p className="text-sm font-sans italic font-bold uppercase tracking-tight opacity-60 leading-relaxed">
                 By proceeding, you verify your identity and grant DROPKAST a global license to distribute, monetize, and sub-license your master recordings across every store and platform you've selected. This stays in place until you file a takedown from your release status page.
               </p>
            </div>
            <div className="flex flex-col gap-4 shrink-0">
               <div className="p-4 bg-black/5 border border-black/10 flex items-center gap-4">
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black italic shadow-lg">ID</div>
                  <div>
                    <div className="text-[9px] font-black uppercase opacity-40">Status</div>
                    <div className="text-[11px] font-black uppercase italic">Verified Artist</div>
                  </div>
               </div>
               <button 
                  disabled={agreed.length < requirements.length}
                  className="beam h-20 px-12 bg-black text-white font-black italic uppercase tracking-widest text-xs flex items-center justify-center gap-4 disabled:opacity-20 transition-all group"
               >
                  Authorize Distribution
                  <ChevronRight className="w-5 h-5 transition-transform shrink-0" />
               </button>
            </div>
         </div>
      </div>

      <div className="flex gap-6 md:gap-8 p-6 md:p-10 border border-white/5 bg-dark opacity-40">
         <div className="shrink-0 pt-1">
            <Info className="w-6 h-6 text-white" />
         </div>
         <p className="text-[11px] font-bold text-white/50 italic leading-relaxed uppercase tracking-widest">
            Takedowns: If you need to pull a release from distribution, head to the release status page and select "Request Takedown". Takedowns take 48-72 hours to roll out across all stores.
         </p>
      </div>
    </div>
  );
}
