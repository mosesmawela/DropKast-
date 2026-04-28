import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Video, Zap, MessageSquare, Share2, Play, Pause, RefreshCcw, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import ScrollReveal from '../components/animations/ScrollReveal';

export default function ContentLab() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIdea, setActiveIdea] = useState(0);

  const ideas = [
    {
      title: "The 'Drop' Reveal",
      concept: "Hard cut from a dark, moody studio shot to a high-energy transition precisely when the bass hits at 0:24.",
      hook: "POV: You finally found the anthem of the summer.",
      caption: "Wait for the drop... ⚡️ #NeonNights #NewMusic #Electronic",
      tags: ["#trending", "#musictransition", "#vibes"]
    },
    {
      title: "Lyric Overlay Motion",
      concept: "Sleek kinetic typography floating over urban night b-roll. Each word glitched according to the synth patterns.",
      hook: "I can't get these lyrics out of my head.",
      caption: "Vibe shift detected. 🌃 #Lyrics #Aesthetic #MidnightDeep",
      tags: ["#lyricvideo", "#cinematic", "#urban"]
    },
    {
      title: "Producer Process Breakdown",
      concept: "Fast-paced screen recording of the project file, showing how the lead synth was designed. High educational value.",
      hook: "How I made the biggest synth lead of 2024.",
      caption: "Secrets of the sound engine. 🎹 #ProducerTips #SoundDesign",
      tags: ["#musicproduction", "#flstudio", "#sounddesign"]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 font-mono">
      <ScrollReveal direction="down">
        <header className="mb-16">
          <div className="flex items-center gap-3 text-primary mb-4">
             <Video className="w-5 h-5" />
             <span className="text-[11px] font-black uppercase tracking-[0.5em] italic">Viral_Content_Lab</span>
          </div>
          <h1 className="text-7xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">Viral <span className="text-primary italic">Lab</span></h1>
          <p className="text-white/30 text-xs font-bold uppercase tracking-[0.3em] italic">AI-driven content architecture for algorithmic dominance.</p>
        </header>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-fit">
        {/* Left: Waveform & Analysis */}
        <div className="space-y-8">
           <div className="manifest-card p-10 bg-dark border-white/5 space-y-10 relative overflow-hidden h-full">
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] italic">Audio_Signature_Analysis</h3>
                    <span className="text-[9px] font-black text-green-500 uppercase italic">High_Viral_Potential</span>
                 </div>
                 
                 {/* Mock Waveform */}
                 <div className="h-48 bg-black/50 border border-white/5 flex items-end justify-center px-4 gap-[2px] relative overflow-hidden group">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                       <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 bg-white text-black flex items-center justify-center rounded-full hover:scale-110 transition-transform">
                          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                       </button>
                    </div>
                    {Array.from({ length: 60 }).map((_, i) => (
                      <motion.div 
                        key={i}
                        animate={{ 
                          height: isPlaying ? [10, 80, 20, 100, 40, 10] : 20,
                          backgroundColor: i % 10 === 0 ? '#ff4d00' : '#ffffff20'
                        }}
                        transition={{ 
                          duration: 0.5 + Math.random(), 
                          repeat: Infinity,
                          delay: i * 0.01 
                        }}
                        className="w-1 rounded-full"
                      />
                    ))}
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-white/20 uppercase tracking-widest italic">Tempo</label>
                       <div className="text-xl font-black text-white italic">128 BPM</div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-white/20 uppercase tracking-widest italic">Key</label>
                       <div className="text-xl font-black text-primary italic">F# MINOR</div>
                    </div>
                 </div>

                 <div className="p-8 bg-white/5 border border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                       <Zap className="w-4 h-4 text-primary" />
                       <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">AI Content Suggestions</h4>
                    </div>
                    <div className="space-y-4">
                       {ideas.map((idea, i) => (
                          <button 
                            key={i}
                            onClick={() => setActiveIdea(i)}
                            className={cn(
                              "w-full text-left p-4 border transition-all flex items-center justify-between group",
                              activeIdea === i ? "bg-white text-black border-white" : "border-white/5 hover:border-white/10"
                            )}
                          >
                             <span className="text-[10px] font-black uppercase tracking-widest italic">{idea.title}</span>
                             <Sparkles className={cn("w-3 h-3 group-hover:scale-125 transition-transform", activeIdea === i ? "text-primary" : "text-white/10")} />
                          </button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right: Idea Display & Execution */}
        <div className="space-y-8">
           <AnimatePresence mode="wait">
              <motion.div 
                key={activeIdea}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="manifest-card p-12 bg-surface border-white/5 space-y-12 h-full flex flex-col"
              >
                 <div className="space-y-6 flex-1">
                    <div className="flex items-center justify-between">
                       <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">{ideas[activeIdea].title}</h2>
                       <RefreshCcw className="w-4 h-4 text-white/20 hover:text-white cursor-pointer transition-colors" />
                    </div>

                    <div className="space-y-8">
                       <div className="space-y-3">
                          <label className="text-[9px] font-black text-primary uppercase tracking-[0.4em] font-mono italic">Content_Concept</label>
                          <p className="text-sm font-medium text-white/60 italic leading-relaxed">{ideas[activeIdea].concept}</p>
                       </div>

                       <div className="space-y-3">
                          <label className="text-[9px] font-black text-primary uppercase tracking-[0.4em] font-mono italic">Hook_Strategy</label>
                          <p className="text-base font-black text-white italic tracking-tight">{ideas[activeIdea].hook}</p>
                       </div>

                       <div className="p-6 bg-black/50 border border-white/5 space-y-4">
                          <div className="flex items-center gap-2 text-white/20">
                             <MessageSquare className="w-3 h-3" />
                             <span className="text-[9px] font-black uppercase tracking-widest italic">Captions_&_Tags</span>
                          </div>
                          <p className="text-xs text-white/80 font-mono italic leading-relaxed">{ideas[activeIdea].caption}</p>
                          <div className="flex gap-2">
                             {ideas[activeIdea].tags.map(tag => (
                               <span key={tag} className="text-[9px] font-black text-primary italic font-mono">{tag}</span>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-4 pt-8">
                    <button className="flex-1 h-16 bg-white text-black hover:bg-primary hover:text-white font-black italic uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 group active:scale-95">
                       Deploy to Relay <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    </button>
                    <button className="flex-1 h-16 border border-white/10 text-white/40 hover:text-white hover:border-white font-black italic uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 active:scale-95">
                       Sync with AI <Zap className="w-4 h-4 fill-current" />
                    </button>
                 </div>
              </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
