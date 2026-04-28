import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Music, 
  ChevronRight,
  Loader2,
  Copy,
  PenTool,
  Film
} from 'lucide-react';

export default function Content() {
  const [activeTab, setActiveTab] = useState<'visuals' | 'scripts' | 'mv'>('visuals');
  const [loading, setLoading] = useState(false);

  const scriptIdeas = [
    { title: 'The Emotional Connection', hook: 'Have you ever felt like...', body: 'Show a montage of late night drives.', cta: 'Link in bio for more feels.' },
    { title: 'The Process Reveal', hook: 'How I made this beat in 60s', body: 'Flash cuts of MIDI keyboard and coffee.', cta: 'Full track out now.' },
    { title: 'The Lyrics Story', hook: 'I wrote this song when I was...', body: 'Text overlay on cinematic b-roll.', cta: 'Save on Spotify.' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Camera className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI_CONTENT_FORGE</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Content Laboratory</h1>
        </div>
        <div className="barcode-sim" />
      </header>

      <div className="flex gap-4 border-b border-white/5 pb-0">
        {[
          { id: 'visuals', label: 'VISUAL_CONCEPTS', icon: ImageIcon },
          { id: 'scripts', label: 'SOCIAL_SCRIPTS', icon: PenTool },
          { id: 'mv', label: 'VIDEO_TREATMENTS', icon: Film },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
              activeTab === tab.id ? "text-primary bg-white/[0.02]" : "text-white/20 hover:text-white"
            )}
          >
            <tab.icon className={cn("w-3 h-3", activeTab === tab.id ? "text-primary" : "text-white/20")} />
            {tab.label}
            {activeTab === tab.id && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary shadow-[0_0_10px_rgba(255,77,0,0.5)]" />}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'visuals' && (
              <motion.div 
                key="visuals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="manifest-card technical-grid p-10 flex flex-col items-center text-center gap-6">
                  <div className="w-16 h-16 border border-primary/20 flex items-center justify-center bg-primary/5 text-primary">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold uppercase tracking-tight">Generate Artwork Blueprint</h3>
                    <p className="text-xs text-white/40 font-mono leading-relaxed max-w-sm">
                      Our AI Team analyzes your music's sonic profile to generate high-fidelity cover art concepts and brand-aligned assets.
                    </p>
                  </div>
                  <button className="primary-button px-10">INITIATE_DREAM_SEQUENCE</button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="manifest-card corner-marker p-3 group">
                      <div className="aspect-square bg-white/5 border border-white/10 relative overflow-hidden">
                        <img 
                          src={`https://picsum.photos/seed/art${i}/800/800?blur=1`} 
                          alt="" 
                          className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-all group-hover:scale-105" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button className="bg-black text-white px-4 py-2 text-[9px] font-black uppercase tracking-widest border border-primary/50">Detail_View</button>
                        </div>
                      </div>
                      <div className="mt-4 p-2 space-y-1">
                        <div className="text-[9px] font-black text-white/40 uppercase">Concept_ID: 00{i}</div>
                        <div className="text-[10px] font-bold text-white uppercase italic tracking-tight">Cyber-Organic Minimal</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'scripts' && (
              <motion.div 
                key="scripts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {scriptIdeas.map((script, idx) => (
                  <div key={idx} className="manifest-card corner-marker p-8 space-y-4">
                    <div className="flex justify-between items-center bg-white/5 p-4 border-l-2 border-primary">
                      <h4 className="text-xs font-black uppercase tracking-widest italic">{script.title}</h4>
                      <button className="text-primary hover:text-white transition-colors">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
                      <div className="space-y-2">
                        <span className="text-[8px] font-black text-primary uppercase">Hook</span>
                        <p className="text-[10px] leading-relaxed text-white/70 italic">"{script.hook}"</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[8px] font-black text-primary uppercase">Body/Visuals</span>
                        <p className="text-[10px] leading-relaxed text-white/70">{script.body}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[8px] font-black text-primary uppercase">CTA</span>
                        <p className="text-[10px] leading-relaxed text-white/70">{script.cta}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="secondary-button w-full py-4 border-dashed">Refresh_Scripts_Node</button>
              </motion.div>
            )}
            
            {activeTab === 'mv' && (
              <motion.div 
                key="mv"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="manifest-card technical-grid p-10 space-y-6">
                  <div className="flex h-12 items-center gap-4 border-b border-white/5 pb-4">
                    <Film className="w-5 h-5 text-primary" />
                    <span className="text-[11px] font-black uppercase tracking-[0.3em]">CINEMA_ENGINE_V2</span>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-white/20 uppercase tracking-widest">Atmosphere/Mood</label>
                      <div className="flex gap-2">
                        {['Noir', 'Y2K', 'Cyberpunk', 'Ethereal', 'Lo-Fi'].map(mood => (
                          <button key={mood} className="px-4 py-2 border border-white/10 text-[9px] font-bold hover:border-primary transition-colors">{mood}</button>
                        ))}
                      </div>
                    </div>
                    <div className="p-8 border border-white/10 bg-white/[0.01] rounded-sm italic text-xs text-white/30 font-mono text-center">
                      Generate a detailed treatment including color palettes, camera movements, and wardrobe directions.
                    </div>
                    <button className="primary-button w-full h-14">GENERATE_VIDEO_TREATMENT</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="p-6 border border-primary/20 bg-primary/5 space-y-6">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black tracking-widest uppercase">Team Insight</span>
            </div>
            <p className="text-[11px] font-mono leading-relaxed text-white/70 italic">
              "Your track's BPM (124) and minor key suggest a high-contrast visual style. We recommend 'Techno-Brutalist' aesthetics for your next TikTok rollout."
            </p>
          </div>

          <div className="manifest-card corner-marker space-y-6">
            <h4 className="text-[10px] font-black tracking-widest uppercase">Content Pipeline</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-1 bg-green-500 h-8" />
                <div className="flex-1 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-tight">Campaign Assets</div>
                  <div className="text-[8px] font-mono text-white/20 uppercase">92% Produced</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-1 bg-primary h-8 animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-tight">Social Overlays</div>
                  <div className="text-[8px] font-mono text-white/20 uppercase">Generating...</div>
                </div>
              </div>
            </div>
          </div>

          <div className="barcode-sim h-32 w-full opacity-5" />
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
