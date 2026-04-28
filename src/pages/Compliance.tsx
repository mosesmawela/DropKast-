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
    { id: 'rights', title: 'Full Rights Ownership', desc: 'You confirm that you own 100% of the mechanical and publishing rights to all uploaded nodes.', icon: ShieldCheck },
    { id: 'samples', title: 'Sample Clearances', desc: 'You certify that all samples, loops, and vocal stems have been cleared for commercial distribution.', icon: FileText },
    { id: 'content', title: 'Content Integrity', desc: 'You confirm the release does not infringe on existing trademarks or contain unauthorized remixes.', icon: Scale },
    { id: 'explicit', title: 'Metadata Accuracy', desc: 'You agree that any explicit content has been flagged and titles are free of emojis or placeholder text.', icon: AlertOctagon }
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 font-mono">
      <div className="mb-20">
        <div className="flex items-center gap-4 mb-6">
           <Lock className="w-6 h-6 text-primary" />
           <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] italic">Rights_&_Clearance_Layer</span>
        </div>
        <h1 className="text-8xl font-black text-white italic uppercase tracking-tighter leading-none mb-6">Compliance</h1>
        <p className="text-white/30 text-lg font-bold italic tracking-widest uppercase max-w-2xl">Ensuring your music meets global node safety standards before deployment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
         {requirements.map((req) => (
           <div 
             key={req.id} 
             onClick={() => toggleAgree(req.id)}
             className={cn(
               "p-10 border transition-all cursor-pointer group flex flex-col justify-between",
               agreed.includes(req.id) ? "bg-white/[0.03] border-primary" : "bg-dark border-white/5 hover:border-white/20"
             )}
           >
              <div className="space-y-6">
                 <div className={cn(
                   "w-14 h-14 border flex items-center justify-center transition-colors",
                   agreed.includes(req.id) ? "border-primary text-primary" : "border-white/10 text-white/20 group-hover:border-white"
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
                   {agreed.includes(req.id) ? 'AGREEMENT_CONFIRMED' : 'REVIEWS_PENDING'}
                 </span>
              </div>
           </div>
         ))}
      </div>

      <div className="manifest-card p-12 bg-white text-black mb-12">
         <div className="flex flex-col md:flex-row gap-12">
            <div className="flex-1 space-y-6">
               <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2 text-black">Master Distribution Warrant</h2>
               <p className="text-sm font-sans italic font-bold uppercase tracking-tight opacity-60 leading-relaxed">
                 By proceeding, you verify your identity and grant DROPKAST global license to distribute, monetize and sub-license your master audio files across the Relay Node Network. This warrant is irrevocable until a takedown notice is filed through the official compliance terminal.
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
                  className="h-20 px-12 bg-black text-white font-black italic uppercase tracking-widest text-xs flex items-center justify-center gap-4 disabled:opacity-20 hover:bg-primary transition-all group"
               >
                  Authorize Relay Protocol
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
               </button>
            </div>
         </div>
      </div>

      <div className="flex gap-8 p-10 border border-white/5 bg-dark opacity-40">
         <div className="shrink-0 pt-1">
            <Info className="w-6 h-6 text-white" />
         </div>
         <p className="text-[11px] font-bold text-white/50 italic leading-relaxed uppercase tracking-widest">
            Takedowns: If you need to remove a release from distribution, visit the release status page and select "Initiate Termination". Takedowns take 48-72 hours to propagate across all nodes.
         </p>
      </div>
    </div>
  );
}
