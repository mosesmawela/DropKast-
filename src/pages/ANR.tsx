import { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  ChevronRight, 
  Music, 
  Users, 
  TrendingUp, 
  Sparkles,
  Send,
  ArrowUpRight,
  Clock,
  Star,
  Cpu,
  ShieldCheck,
  Disc
} from 'lucide-react';
import { cn } from '../lib/utils';
import ScrollReveal from '../components/animations/ScrollReveal';
import AnimatedBeam from '../components/animations/AnimatedBeam';
import { motion, AnimatePresence } from 'motion/react';
import { useNotify } from '../context/NotificationContext';

const feedbackItemsData: any[] = [];

export default function ANR() {
  const { notify } = useNotify();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackItems, setFeedbackItems] = useState(feedbackItemsData);

  const handleSubmitNew = async () => {
    setIsSubmitting(true);
    notify('ai', 'ASSET_INGESTION', 'Analyzing sonic integrity and preparing editorial packet...');
    
    try {
      const response = await fetch('/api/anr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: 'New Submission',
          timestamp: new Date()
        })
      });

      if (!response.ok) throw new Error('Submission failed');
      const data = await response.json();

      const newItem = {
        id: data.submission.id,
        track: data.submission.track,
        date: new Date().toISOString().split('T')[0],
        type: 'AI_INSTANT',
        status: 'COMPLETED',
        feedback: "Scan complete. Initial benchmarks show high suitability for Sync licensing. Full report pending."
      };
      setFeedbackItems([newItem, ...feedbackItems]);
      notify('success', 'SUBMISSION_VERIFIED', 'Submission successfully pushed to A&R queue.');
    } catch (err) {
      notify('error', 'SUBMISSION_FAILED', 'Failed to reach A&R node.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAudit = (tier: string) => {
    notify('ai', 'PROTOCOL_ENGAGED', `Initializing ${tier} audit sequence...`);
    setTimeout(() => {
      notify('success', 'AUDIT_LOCKED', `Assigned specialist code 4082 to current session.`);
    }, 1500);
  };

  const viewFullAnalysis = (track: string) => {
    notify('info', 'DECRYPTING_REPORT', `Loading deep-scan data for ${track}...`);
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-8 font-sans">
      <ScrollReveal direction="down">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-2 text-primary mb-3 font-mono">
              <MessageSquare className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-widest italic font-mono">Editorial Feedback Portal</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-white italic font-mono uppercase">A&R Protocol</h1>
          </div>
          <div className="flex items-center gap-4">
             <AnimatedBeam containerClassName="w-fit">
              <button 
                onClick={handleSubmitNew}
                disabled={isSubmitting}
                className="primary-button h-14 flex items-center gap-3 px-10"
              >
                {isSubmitting ? <Cpu className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSubmitting ? 'Processing...' : 'Submit New Track'}
              </button>
            </AnimatedBeam>
          </div>
        </header>
      </ScrollReveal>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ScrollReveal key="ai-tier" delay={0.1}>
           <div className="p-10 border border-white/5 bg-dark space-y-8 group hover:border-primary/20 transition-all">
              <div className="flex items-center gap-3 text-primary font-mono font-black italic text-[11px] uppercase tracking-widest">
                <Cpu className="w-4 h-4" />
                AI_INITIAL_AUDIT
              </div>
              <div>
                 <h3 className="text-3xl font-black italic font-mono uppercase tracking-tight text-white mb-2 leading-none">Instant Insights</h3>
                 <p className="text-xs text-white/40 italic font-medium leading-relaxed font-sans">Full sonic analysis, market benchmark comparison, and trend matching within 60 seconds.</p>
              </div>
              <div className="text-4xl font-black text-white italic font-mono">$0.00 <span className="text-[10px] text-white/20 uppercase tracking-widest ml-2 px-3 py-1 border border-white/10">UNLIMITED</span></div>
              <button 
                onClick={() => handleAudit('AI_INSTANT')}
                className="w-full secondary-button py-4 text-[10px] uppercase font-mono tracking-widest"
              >
                Deploy Scouter AI
              </button>
           </div>
        </ScrollReveal>

        <ScrollReveal key="human-tier" delay={0.2}>
           <div className="p-10 border border-primary/20 bg-primary/5 space-y-8 relative overflow-hidden ring-1 ring-primary/20">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <Star className="w-12 h-12 text-primary" />
              </div>
              <div className="flex items-center gap-3 text-primary font-mono font-black italic text-[11px] uppercase tracking-widest">
                <Users className="w-4 h-4" />
                HUMAN_EXPERT_REVIEW
              </div>
              <div>
                 <h3 className="text-3xl font-black italic font-mono uppercase tracking-tight text-white mb-2 leading-none">Pro A&R Feedback</h3>
                 <p className="text-xs text-white/40 italic font-medium leading-relaxed font-sans">Written feedback from verified industry experts and label-affiliated A&Rs (Love Renaissance, etc).</p>
              </div>
              <div className="text-4xl font-black text-white italic font-mono">$25.00 <span className="text-[10px] text-white/20 uppercase tracking-widest ml-2 px-3 py-1 border border-white/10 font-sans">PER TRACK</span></div>
              <button 
                onClick={() => handleAudit('HUMAN_EXPERT')}
                className="w-full primary-button py-4 text-[10px] uppercase font-mono tracking-widest"
              >
                Submit for Review
              </button>
           </div>
        </ScrollReveal>

        <ScrollReveal key="elite-tier" delay={0.3}>
           <div className="p-10 border border-white/5 bg-dark space-y-8 group hover:border-white/20 transition-all">
              <div className="flex items-center gap-3 text-primary font-mono font-black italic text-[11px] uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                ELITE_STRATEGY_CONSULT
              </div>
              <div>
                 <h3 className="text-3xl font-black italic font-mono uppercase tracking-tight text-white mb-2 leading-none">Label Roadmap</h3>
                 <p className="text-xs text-white/40 italic font-medium leading-relaxed font-sans">Direct access to elite strategists for a full 1-on-1 development plan and distribution priority.</p>
              </div>
              <div className="text-4xl font-black text-white italic font-mono">$150.00 <span className="text-[10px] text-white/20 uppercase tracking-widest ml-2 px-3 py-1 border border-white/10 font-sans">PER SESSION</span></div>
              <button 
                onClick={() => handleAudit('ELITE_CONSULT')}
                className="w-full secondary-button py-4 text-[10px] uppercase font-mono tracking-widest"
              >
                Request Priority
              </button>
           </div>
        </ScrollReveal>
      </div>

      {/* Submissions & Logs */}
      <section className="space-y-8 pt-16 border-t border-white/5">
        <div className="flex items-center justify-between">
           <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase font-mono">Submission Lifecycle</h2>
           <div className="flex-1 ml-12 h-[1px] bg-white/5" />
        </div>

        <div className="space-y-4">
           {feedbackItems.map((item, i) => (
             <ScrollReveal key={item.id} delay={i * 0.05} direction="up">
               <div className="p-8 bg-dark border border-white/5 group hover:border-primary/20 transition-all shadow-xl">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-3">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center">
                             <Disc className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                             <div className="text-[10px] font-bold text-white/20 font-mono tracking-widest uppercase mb-1">{item.id}</div>
                             <h4 className="text-xl font-bold italic font-mono uppercase tracking-tight text-white">{item.track}</h4>
                          </div>
                       </div>
                    </div>
                    
                    <div className="lg:col-span-2">
                       <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest font-mono italic">Audit Type</span>
                          <span className="text-[11px] font-bold text-white uppercase italic">{item.type.replace(/_/g, ' ')}</span>
                       </div>
                    </div>

                    <div className="lg:col-span-5 border-l border-white/5 pl-8">
                       <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest font-mono italic mb-2">Feedback Summary</div>
                       <p className="text-xs text-white/40 italic font-medium font-sans leading-relaxed">
                          {item.feedback ? `"${item.feedback}"` : "Editorial team is currently analyzing this asset. Estimated turnaround: 12-24 hours."}
                       </p>
                    </div>

                    <div className="lg:col-span-2 text-right space-y-4">
                       <div className={cn(
                         "inline-flex items-center gap-2 px-4 py-1.5 border text-[9px] font-black tracking-widest font-mono uppercase",
                         item.status === 'COMPLETED' ? "border-primary text-primary" : "border-white/10 text-white/20"
                       )}>
                         {item.status}
                       </div>
                       <div className="text-[10px] font-bold text-white/20 font-mono tracking-widest">{item.date}</div>
                    </div>
                 </div>
                 
                 {item.feedback && (
                   <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-primary font-mono uppercase tracking-widest italic">
                           <Sparkles className="w-3.5 h-3.5" />
                           Strategic Match: 94%
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 font-mono uppercase tracking-widest italic">
                           <TrendingUp className="w-3.5 h-3.5" />
                           Trajectory: BULLISH
                        </div>
                      </div>
                      <button 
                        onClick={() => viewFullAnalysis(item.track)}
                        className="flex items-center gap-2 text-[10px] font-bold text-white hover:text-primary transition-colors font-mono uppercase tracking-widest italic"
                      >
                        View Full Analysis
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                   </div>
                 )}
               </div>
             </ScrollReveal>
           ))}
        </div>
      </section>

      {/* Hero Tip */}
      <div className="p-12 border border-white/5 bg-white/5 flex items-center gap-10">
        <div className="w-20 h-20 border-2 border-primary rotate-45 flex items-center justify-center flex-shrink-0">
           <div className="-rotate-45">
             <Star className="w-10 h-10 text-primary" />
           </div>
        </div>
        <div>
           <div className="text-primary font-mono font-black italic text-[11px] uppercase tracking-widest mb-3">A&R_INTELLIGENCE_NODE</div>
           <h3 className="text-2xl font-black italic font-mono uppercase tracking-tight text-white mb-4">The LVRN standard</h3>
           <p className="text-sm text-white/40 italic font-medium leading-relaxed font-sans max-w-4xl">
             We have partnered with leading A&R teams from independent labels like LVRN to provide direct feedback to the next generation of superstars. Our AI filters for quality first, ensuring only the most polished tracks reach human editorial boards.
           </p>
        </div>
      </div>
    </div>
  );
}
