import { useState } from 'react';
import { 
  Target, 
  ChevronRight, 
  ChevronLeft,
  Music,
  Zap,
  Users,
  TrendingUp,
  DollarSign,
  Sparkles,
  Search,
  Check,
  Disc,
  ArrowRight,
  Cpu,
  Calendar,
  Radio,
  Share2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import ScrollReveal from '../components/animations/ScrollReveal';
import AnimatedBeam from '../components/animations/AnimatedBeam';
import { useCampaigns } from '../context/CampaignContext';
import { useNotify } from '../context/NotificationContext';
import { useReleases } from '../context/ReleaseContext';

import { useAI } from '../context/AIContext';

const goals = [
  { id: 'STREAMS', title: 'Global Streaming', desc: 'Maximize listeners on Spotify, Apple Music & Tidal.', icon: Music, color: 'text-blue-500' },
  { id: 'VIRAL', title: 'Viral Growth', desc: 'Focus on TikTok sounds and short-form content growth.', icon: Zap, color: 'text-primary' },
  { id: 'REVENUE', title: 'Monetization', desc: 'Optimize for sync licensing, merch & direct sales.', icon: DollarSign, color: 'text-green-500' },
  { id: 'AWARENESS', title: 'Legacy Awareness', desc: 'Build long-term brand equity and press coverage.', icon: Users, color: 'text-purple-500' },
];

export default function NewCampaign() {
  const { addCampaign } = useCampaigns();
  const { notify } = useNotify();
  const { allReleases } = useReleases();
  const { generateCampaign, isLoading: isAiLoading, lastPlan } = useAI();
  // Real catalogue — map releases into the shape this wizard's picker expects.
  const releases = allReleases.map((r) => ({
    id: r.id,
    title: r.title,
    artist: r.artist,
    type: (r.format || 'SINGLE').toUpperCase(),
    cover: r.artwork,
  }));
  const [step, setStep] = useState(1);
  const [selectedRelease, setSelectedRelease] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step === 1) {
      notify('info', 'Track selected', 'Your track is ready. Now choose a goal.');
    }
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const generatePlan = async () => {
    if (!selectedRelease || !selectedGoal) return;
    
    notify('ai', 'Generating plan', 'Analyzing the market and available creators...');
    
    const release = releases.find(r => r.id === selectedRelease);
    const goal = goals.find(g => g.id === selectedGoal);

    const planData = await generateCampaign(
      release?.title || 'Unknown', 
      release?.artist || 'Unknown', 
      goal?.title || 'Growth'
    );

    if (planData) {
      notify('success', 'Plan ready', 'Your campaign plan has been generated.');
      setStep(3);
    }
  };

  const handleLaunch = async () => {
    if (!selectedRelease || !selectedGoal) return;
    
    setIsLaunching(true);
    notify('ai', 'Launching', 'Sending your release to DJs and creators...');
    
    const release = releases.find(r => r.id === selectedRelease);
    const goal = goals.find(g => g.id === selectedGoal);

    await addCampaign({
      title: `${release?.title} - ${goal?.title}`,
      status: 'SCHEDULED',
      progress: 0,
      goal: goal?.id || 'CUSTOM',
      budget: '$2,500',
      spent: '$0',
      channels: ['TikTok', 'Instagram', 'DJs'],
      startDate: new Date().toISOString().split('T')[0],
      metrics: { engagement: '0%', reach: '0' }
    });

    notify('success', 'Campaign launched', 'Your campaign is now live.');
    navigate('/campaigns');
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-8 font-sans">
      {/* Stepper */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-20">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-4 group">
            <div className={cn(
              "w-10 h-10 border-2 flex items-center justify-center font-mono font-black italic transition-all",
              step >= s ? "border-primary text-primary bg-primary/5" : "border-white/10 text-white/20"
            )}>
              0{s}
            </div>
            <div className={cn(
              "text-[9px] font-bold uppercase tracking-[0.2em] transition-all",
              step >= s ? "text-white" : "text-white/20"
            )}>
              {s === 1 ? 'Select Release' : s === 2 ? 'Campaign Goal' : 'Your Plan'}
            </div>
            {s < 3 && <div className="w-12 h-[1px] bg-white/10 mx-4" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
            <div>
              <h2 className="text-4xl sm:text-6xl font-black italic font-mono uppercase tracking-tighter text-white mb-6">Select Track</h2>
              <p className="text-white/40 text-lg italic font-medium leading-relaxed max-w-2xl">
                Pick the track for this campaign. Our AI will analyze it to match with the right creators.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {releases.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 bg-white/[0.01]">
                  <div className="text-white/20 font-mono text-sm uppercase tracking-widest italic mb-4">No releases yet</div>
                  <button
                    type="button"
                    onClick={() => navigate('/releases/new')}
                    className="text-[10px] font-black text-primary uppercase italic tracking-widest transition-colors"
                  >
                    + Create your first release
                  </button>
                </div>
              )}
              {releases.map((rel) => (
                <button
                  key={rel.id}
                  onClick={() => setSelectedRelease(rel.id)}
                  className={cn(
                    "manifest-card p-4 transition-all group overflow-hidden bg-black",
                    selectedRelease === rel.id ? "border-primary ring-1 ring-primary" : "border-white/5"
                  )}
                >
                  <div className="aspect-square mb-6 overflow-hidden relative">
                    <img src={rel.cover} alt={rel.title} className="w-full h-full object-cover grayscale transition-all duration-700" />
                    {selectedRelease === rel.id && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-sm">
                        <Check className="w-12 h-12 text-white stroke-[3px]" />
                      </div>
                    )}
                  </div>
                  <div className="text-left space-y-2">
                    <div className="text-[10px] font-bold text-primary font-mono tracking-widest uppercase italic">{rel.type}</div>
                    <div className="text-xl font-black text-white font-mono uppercase italic tracking-tight">{rel.title}</div>
                    <div className="text-[10px] font-bold text-white/30 font-mono tracking-widest uppercase">{rel.artist}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-12 border-t border-white/5">
              <button 
                onClick={handleNext}
                disabled={!selectedRelease}
                className={cn(
                  "primary-button h-16 px-12 flex items-center gap-3",
                  !selectedRelease && "opacity-50 cursor-not-allowed grayscale"
                )}
              >
                Continue to Goals
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
            <div>
              <h2 className="text-4xl sm:text-6xl font-black italic font-mono uppercase tracking-tighter text-white mb-6">Set Objective</h2>
              <p className="text-white/40 text-lg italic font-medium leading-relaxed max-w-2xl">
                What is the main goal for this campaign? We'll tune the AI rollout plan accordingly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {goals.map((goal) => (
                <button 
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal.id)}
                  className={cn(
                    "beam p-5 sm:p-10 border transition-all text-left group relative overflow-hidden bg-black",
                    selectedGoal === goal.id ? "border-primary bg-primary/[0.03]" : "border-white/5"
                  )}
                >
                  <div className={cn("w-14 h-14 border border-white/10 flex items-center justify-center mb-8 bg-surface-low transition-all", goal.color)}>
                    <goal.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black italic font-mono uppercase tracking-tight text-white mb-4">{goal.title}</h3>
                  <p className="text-sm text-white/30 font-medium italic leading-relaxed">{goal.desc}</p>
                  
                  {selectedGoal === goal.id && (
                    <div className="absolute top-6 right-6">
                      <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(255,77,0,0.5)]" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-12 border-t border-white/5">
              <button onClick={handleBack} className="secondary-button h-16 px-10 flex items-center gap-3">
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
              <AnimatedBeam containerClassName="w-fit">
                <button 
                  onClick={generatePlan}
                  disabled={!selectedGoal || isAiLoading}
                  className={cn(
                    "primary-button h-16 px-12 flex items-center gap-3",
                    (!selectedGoal || isAiLoading) && "opacity-50 cursor-not-allowed grayscale"
                  )}
                >
                  {isAiLoading ? (
                    <>
                      <Cpu className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Plan
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </button>
              </AnimatedBeam>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-12"
          >
            <header className="flex items-center justify-between gap-6 p-5 sm:p-12 bg-primary/10 border border-primary/20 relative overflow-hidden">
               <div className="absolute right-0 top-0 text-[120px] font-black text-primary/[0.05] -mr-10 -mt-10 font-mono italic select-none pointer-events-none">Ready</div>
               <div className="relative z-10 min-w-0">
                 <div className="flex items-center gap-3 text-primary mb-4 font-mono font-black italic">
                   <Sparkles className="w-5 h-5 shrink-0" />
                   Plan generated
                 </div>
                 <h2 className="text-3xl sm:text-5xl font-black italic font-mono uppercase tracking-tighter text-white break-words">Your Campaign Plan</h2>
               </div>
               <div className="relative z-10 text-right space-y-4 shrink-0">
                 <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Predicted return</div>
                 <div className="text-3xl sm:text-5xl font-black text-primary font-mono italic">3.8x — 4.5x</div>
               </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
               {/* Left Column: Timeline */}
               <div className="lg:col-span-12 space-y-8">
                 <h3 className="text-sm font-bold text-white/30 uppercase tracking-[0.3em] font-mono italic">Rollout Timeline</h3>
                 <div className="relative pt-12 pb-24">
                   <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/5" />
                   
                   {[
                     { day: 'Day 01', icon: Cpu, label: 'Asset Preparation', text: 'AI generates 12 TikTok variations and 4 DJ drop edits.' },
                     { day: 'Day 03', icon: Users, label: 'Influencer Seeding', text: 'Auto outreach to 45 matched TikTok creators starts.' },
                     { day: 'Day 07', icon: Radio, label: 'DJ Distribution', text: 'Send to genre-specific DJs in SA, US & UK.' },
                     { day: 'Day 10', icon: Share2, label: 'Social Growth', text: 'Launch dynamic Meta & Google discovery ads.' },
                   ].map((item, i) => (
                     <div key={item.day} className={cn(
                       "relative flex items-center mb-24 last:mb-0",
                       i % 2 === 0 ? "flex-row-reverse text-right pr-[50%] -translate-x-[20px]" : "pl-[50%] translate-x-[20px]"
                     )}>
                       <div className="manifest-card p-8 bg-dark border-white/10 w-full max-w-sm transition-all">
                          <div className={cn("flex items-center gap-3 mb-4 font-mono", i % 2 === 0 ? "flex-row-reverse" : "")}>
                            <item.icon className="w-4 h-4 text-primary" />
                            <span className="text-[11px] font-bold text-white tracking-widest">{item.day}</span>
                          </div>
                          <div className="text-xl font-bold italic text-white uppercase font-mono mb-4">{item.label}</div>
                          <p className="text-xs text-white/40 italic font-medium leading-relaxed font-sans">{item.text}</p>
                       </div>
                       
                       {/* Center Indicator */}
                       <div className={cn(
                         "absolute left-1/2 -translate-x-1/2 w-10 h-10 border-4 border-black bg-white/5 flex items-center justify-center",
                         i === 0 ? "bg-primary" : ""
                       )}>
                         <div className={cn("w-2 h-2", i === 0 ? "bg-white" : "bg-white/20")} />
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="p-5 sm:p-10 border border-white/5 bg-primary/5 flex flex-col justify-center items-center text-center space-y-8">
                <div className="w-20 h-20 border-2 border-primary flex items-center justify-center animate-pulse">
                  {isLaunching ? <Cpu className="w-10 h-10 text-primary animate-spin" /> : <Target className="w-10 h-10 text-primary" />}
                </div>
                <div>
                   <h4 className="text-2xl font-black italic font-mono uppercase text-white mb-2 tracking-tight">One-Click Growth</h4>
                   <p className="text-xs text-white/40 italic font-medium max-w-[280px]">Send all your assets and launch outreach across every channel instantly.</p>
                </div>
                <button 
                  onClick={handleLaunch}
                  disabled={isLaunching}
                  className={cn(
                    "w-full primary-button py-6 flex items-center justify-center gap-3 text-sm",
                    isLaunching && "opacity-50 cursor-not-allowed grayscale"
                  )}
                >
                  {isLaunching ? 'Launching...' : 'Confirm & Launch Campaign'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
