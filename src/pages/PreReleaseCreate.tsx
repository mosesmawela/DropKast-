import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Music, 
  Scissors, 
  Zap, 
  Users, 
  Calendar,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Video,
  Sparkles,
  Play,
  Pause,
  Clock,
  LayoutDashboard,
  Target,
  Megaphone,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useNotify } from '../context/NotificationContext';

const STEPS = [
  { id: 'upload', label: 'Upload audio', icon: Upload },
  { id: 'hook', label: 'Pick the hook', icon: Scissors },
  { id: 'activation', label: 'AI ideas', icon: Sparkles },
  { id: 'invasion', label: 'Pick creators', icon: Users },
  { id: 'timeline', label: 'Schedule', icon: Calendar },
];

export default function PreReleaseCreate() {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [hookStart, setHookStart] = useState(15);
  const [hookEnd, setHookEnd] = useState(45);
  const [aiIdeas, setAiIdeas] = useState<any[]>([]);
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('audio/')) {
        setFile(selectedFile);
        if (!title) setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      } else {
        notify('error', 'Invalid file', 'Please upload an audio file.');
      }
    }
  };

  const nextStep = () => {
    if (currentStep === 0 && !file) {
      notify('error', 'No audio yet', 'Upload an audio file to continue.');
      return;
    }
    
    if (currentStep === 2 && aiIdeas.length === 0) {
      generateIdeas();
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finalizeActivation();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const generateIdeas = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/assets/viral-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      const data = await response.json();
      setAiIdeas(data.ideas);
      setCurrentStep(prev => prev + 1);
    } catch (err) {
      notify('error', 'AI_SYNC_FAILED', 'Neural activation bridge failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const finalizeActivation = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/pre-releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          hookStart,
          hookEnd,
          creators: selectedCreators,
          status: 'active'
        })
      });
      
      if (response.ok) {
        notify('success', 'ACTIVATED', 'Signal broadcast sequence initiated.');
        navigate('/pre-release');
      }
    } catch (err) {
      notify('error', 'Couldn\'t schedule', 'Something went wrong saving the pre-release.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 uppercase tracking-[0.05em] font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono italic">Pre-release engine</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-[0.8]">Pre-release plan</h1>
          <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono italic">Configure viral payload for global signal injection.</p>
        </div>

        <div className="flex items-center gap-2">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.id}>
              <div 
                className={cn(
                  "w-10 h-10 border flex items-center justify-center transition-all duration-500",
                  i <= currentStep ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(255,77,0,0.3)]" : "border-white/5 text-white/20"
                )}
                title={step.label}
              >
                <step.icon className="w-4 h-4" />
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "w-4 h-[1px]",
                  i < currentStep ? "bg-primary" : "bg-white/10"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div 
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="space-y-6">
                  <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter font-mono">Select_Source_Node</h2>
                  <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest italic font-sans leading-relaxed">
                    Upload the 30-60 second high-fidelity snippet intended for viral exploitation.
                  </p>
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "manifest-card p-20 border-dashed border-white/10 hover:border-primary/50 bg-white/[0.02] flex flex-col items-center justify-center gap-8 cursor-pointer transition-all group",
                    file && "border-primary/30 bg-primary/5"
                  )}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="audio/*"
                  />
                  {file ? (
                    <>
                      <div className="w-20 h-20 bg-primary/20 flex items-center justify-center border border-primary animate-pulse">
                        <Music className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-center space-y-2">
                        <div className="text-2xl font-black text-white italic lowercase font-mono tracking-tight">{file.name}</div>
                        <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono">Audio locked</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 border border-white/5 flex items-center justify-center text-white/10 group-hover:text-primary group-hover:border-primary transition-all">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div className="text-center space-y-2">
                        <div className="text-2xl font-black text-white italic lowercase font-mono tracking-tight">Drag audio here or click</div>
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] font-mono">SUPPORTED: MP3, WAV, FLAC (MAX 50MB)</div>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest font-mono italic">Signal_Label</span>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Track title..."
                    className="w-full h-16 bg-white/[0.02] border border-white/5 px-8 text-[11px] font-mono font-black text-white placeholder:text-white/10 focus:border-primary/50 outline-none transition-all uppercase tracking-widest"
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div 
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="space-y-6">
                  <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter font-mono">Isolate_Viral_Hook</h2>
                  <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest italic font-sans leading-relaxed">
                    Pick the 15-30 second slice fans will hear on TikTok and Reels.
                  </p>
                </div>

                <div className="manifest-card p-12 bg-black/60 border-white/5 space-y-12 pb-16">
                  {/* Waveform Mock */}
                  <div className="h-40 bg-white/[0.03] relative overflow-hidden flex items-end gap-[2px] p-4">
                    {Array.from({ length: 60 }).map((_, i) => {
                      const h = Math.random() * 80 + 10;
                      const isSelected = i >= hookStart && i <= hookEnd;
                      return (
                        <div 
                          key={i} 
                          className={cn(
                            "flex-1 transition-all duration-500", 
                            isSelected ? "bg-primary shadow-[0_0_10px_rgba(255,77,0,0.5)]" : "bg-white/10"
                          )} 
                          style={{ height: `${h}%` }} 
                        />
                      );
                    })}
                    
                    {/* Range Controls */}
                    <div 
                      className="absolute top-0 bottom-0 border-x-2 border-primary bg-primary/5 pointer-events-none"
                      style={{ 
                        left: `${(hookStart / 60) * 100}%`, 
                        right: `${100 - (hookEnd / 60) * 100}%` 
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pr-2">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest font-mono italic">Start_Marker</span>
                        <span className="text-[10px] font-black text-primary font-mono">{hookStart}s</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="45" 
                        value={hookStart}
                        onChange={(e) => setHookStart(parseInt(e.target.value))}
                        className="w-full accent-primary bg-white/5 h-1 appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pr-2">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest font-mono italic">End_Marker</span>
                        <span className="text-[10px] font-black text-primary font-mono">{hookEnd}s</span>
                      </div>
                      <input 
                        type="range" 
                        min={hookStart + 1} 
                        max="60" 
                        value={hookEnd}
                        onChange={(e) => setHookEnd(parseInt(e.target.value))}
                        className="w-full accent-primary bg-white/5 h-1 appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <button className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all group active:scale-90">
                      <Play className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 manifest-card bg-white/[0.02] border-white/5 space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest font-mono italic">Optimal_Duration</span>
                    </div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider font-sans italic leading-relaxed">
                      AI Analysis suggests a 22.4s window for maximum retention on short-form platforms.
                    </p>
                  </div>
                  <div className="p-8 manifest-card bg-white/[0.02] border-white/5 space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                      <Target className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest font-mono italic">Sonic_Peak</span>
                    </div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider font-sans italic leading-relaxed">
                      Loudness peak detected at 0:24s. Strategic inclusion recommended.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div 
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-12"
              >
                <div className="space-y-6">
                  <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter font-mono">AI content ideas</h2>
                  <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest italic font-sans leading-relaxed">
                    AI-generated short-form video concepts built around your hook.
                  </p>
                </div>

                {isProcessing ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-8 bg-white/[0.02] border border-dashed border-white/10 manifest-card">
                    <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] font-mono animate-pulse italic">AI thinking...</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {aiIdeas.map((idea, i) => (
                      <div key={i} className="manifest-card p-10 bg-white/[0.02] border-white/5 space-y-8 group hover:border-primary/30 transition-all">
                        <header className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                              <Video className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest font-mono text-white/60">{idea.type}</span>
                          </div>
                          <Sparkles className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </header>
                        
                        <div className="space-y-4">
                          <h4 className="text-xl font-black italic text-white lowercase tracking-tight">{idea.title}</h4>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest italic font-mono leading-relaxed">
                            {idea.script}
                          </p>
                        </div>

                        <div className="p-6 bg-black border border-white/5 space-y-2">
                          <div className="text-[8px] font-black text-primary uppercase tracking-widest italic font-mono">Caption</div>
                          <p className="text-[10px] font-mono font-medium text-white/60 lowercase italic">
                            {idea.caption}
                          </p>
                        </div>
                      </div>
                    ))}
                    <button className="manifest-card p-10 border-dashed border-white/10 hover:border-primary/50 bg-white/[0.01] flex flex-col items-center justify-center gap-4 group transition-all h-full">
                       <Plus className="w-6 h-6 text-white/10 group-hover:text-primary transition-colors" />
                       <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] font-mono group-hover:text-white transition-colors italic">Generate more</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div 
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-12"
              >
                <div className="space-y-6">
                  <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter font-mono">Pick creators</h2>
                  <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest italic font-sans leading-relaxed">
                    Pick which creators we should pitch to seed your hook.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: '1', name: '@hyper_drive', reach: '2.4M', type: 'Curator', tags: ['Electronic', 'Hyper-Pop'] },
                    { id: '2', name: 'Bass_Echo', reach: '840K', type: 'Dancer', tags: ['Amapiano', 'Afrobeats'] },
                    { id: '3', name: 'Sonic_Voyage', reach: '1.2M', type: 'Edit Page', tags: ['Anime', 'Vibe'] },
                    { id: '4', name: '@vibe_check', reach: '5.6M', type: 'Meme Central', tags: ['General', 'Viral'] },
                  ].map((invader) => (
                    <button 
                      key={invader.id}
                      onClick={() => {
                        setSelectedCreators(prev => 
                          prev.includes(invader.id) ? prev.filter(id => id !== invader.id) : [...prev, invader.id]
                        );
                      }}
                      className={cn(
                        "manifest-card p-8 bg-white/[0.02] border transition-all text-left flex items-center justify-between group",
                        selectedCreators.includes(invader.id) ? "border-primary bg-primary/5" : "border-white/5 hover:border-white/20"
                      )}
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/5 border border-white/5 flex items-center justify-center italic text-white/20 font-black text-lg font-mono lowercase">
                          {invader.name[1]}
                        </div>
                        <div className="space-y-1">
                          <h4 className={cn(
                            "text-lg font-black italic lowercase tracking-tight",
                            selectedCreators.includes(invader.id) ? "text-primary" : "text-white"
                          )}>{invader.name}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-white/40 uppercase font-mono tracking-widest">{invader.type}</span>
                            <div className="w-1 h-1 bg-white/10 rounded-full" />
                            <span className="text-[9px] font-black text-primary font-mono tracking-widest">{invader.reach} REACH</span>
                          </div>
                        </div>
                      </div>
                      <div className={cn(
                        "w-5 h-5 border flex items-center justify-center transition-all",
                        selectedCreators.includes(invader.id) ? "border-primary bg-primary text-white" : "border-white/10 text-transparent"
                      )}>
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div 
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-12"
              >
                <div className="space-y-6">
                  <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter font-mono">Deployment_Sequencing</h2>
                  <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest italic font-sans leading-relaxed">
                    Preview of your signal momentum timeline leading to global release.
                  </p>
                </div>

                <div className="manifest-card p-12 bg-black/40 border-white/5 space-y-1">
                  {[
                    { day: 'D-14', env: 'Tease', action: 'Upload fragment to TikTok/IG sounds', status: 'pending' },
                    { day: 'D-12', env: 'SEED_RELIANCE', action: 'Broadcast payload to elite creators', status: 'pending' },
                    { day: 'D-07', env: 'Push', action: 'Brief meme + edit-page creators', status: 'pending' },
                    { day: 'D-03', env: 'VOLOCITY_BOOST', action: 'Launch UGC "Hook Detection" challenge', status: 'pending' },
                    { day: 'D-00', env: 'GLOBAL_DROP', action: 'Full release sync & official audio conversion', status: 'final' },
                  ].map((event, i) => (
                    <div key={i} className="flex items-center gap-8 py-6 group">
                      <div className="w-16 text-center">
                        <div className="text-xl font-black text-white font-mono italic">{event.day}</div>
                      </div>
                      <div className="w-0.5 h-12 bg-white/5 relative">
                        <div className={cn(
                          "absolute inset-0 w-full group-hover:bg-primary transition-all duration-300",
                          event.status === 'final' ? "bg-primary animate-pulse" : ""
                        )} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="text-[8px] font-black text-white/20 uppercase tracking-widest italic font-mono">{event.env}</div>
                        <div className="text-[12px] font-bold text-white/80 uppercase tracking-widest font-sans italic">{event.action}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex justify-between pt-12 border-t border-white/5">
            <button 
              onClick={prevStep}
              className={cn(
                "h-16 px-8 flex items-center gap-4 font-mono font-black italic text-[11px] tracking-widest uppercase transition-all",
                currentStep === 0 ? "opacity-0 pointer-events-none" : "text-white/40 hover:text-white"
              )}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <button 
              onClick={nextStep}
              disabled={isProcessing}
              className="h-16 bg-white text-black hover:bg-primary hover:text-white px-12 flex items-center gap-6 group transition-all font-mono font-black italic text-[12px] tracking-widest shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              <span>{isProcessing ? 'Working...' : currentStep === STEPS.length - 1 ? 'Schedule pre-release' : 'Next'}</span>
              {!isProcessing && <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" /> }
            </button>
          </div>
        </div>

        {/* Sidebar Status */}
        <div className="space-y-6">
          <div className="manifest-card p-10 bg-black/60 border-white/5 space-y-8 sticky top-12">
            <h3 className="text-xl font-black italic text-white uppercase tracking-tight border-b border-white/5 pb-6">Status</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest font-mono">Payload_Target</span>
                <div className="text-[11px] font-black text-white uppercase italic tracking-widest truncate">{title || 'Untitled track'}</div>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest font-mono">Isolation_Range</span>
                <div className="text-[11px] font-black text-primary italic tracking-widest">{hookEnd - hookStart}s Window [ {hookStart}:{hookEnd} ]</div>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest font-mono">Tier</span>
                <div className="text-[11px] font-black text-white italic tracking-widest uppercase">{aiIdeas.length} Neural Ideas</div>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest font-mono">Target_Nodes</span>
                <div className="text-[11px] font-black text-white italic tracking-widest uppercase">{selectedCreators.length} Strategic Creators</div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
               <div className="text-[8px] font-black text-white/10 uppercase tracking-[0.4em] font-mono italic leading-relaxed">
                 Powered by DropKast. Every action is logged to your audit trail. 
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
