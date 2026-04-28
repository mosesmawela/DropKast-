import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Globe, 
  Database, 
  Trash2, 
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  Smartphone,
  Plus,
  Palette,
  Zap,
  Cpu,
  Box,
  Minus,
  GlassWater,
  Camera,
  Radio
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useTheme, VisualStyle } from '../context/ThemeContext';
import { useAI } from '../context/AIContext';
import Switch from '../components/ui/Switch';

const styles: { id: VisualStyle; label: string; icon: any; desc: string }[] = [
  { id: 'default', label: 'Technical', icon: Cpu, desc: 'Original industrial terminal aesthetics' },
  { id: 'neumorphism', label: 'Neumorphism', icon: Smartphone, desc: 'Soft shadows and plastic surfaces' },
  { id: 'material', label: 'Modern Material', icon: Box, desc: 'Clean shadows and flat cards' },
  { id: 'brutalism', label: 'Neo-Brutalism', icon: Zap, desc: 'High contrast and thick borders' },
  { id: 'skeuomorphism', label: 'Skeuomorphism', icon: Palette, desc: 'Real-world textures and depth' },
  { id: 'minimalist', label: 'Deep Minimal', icon: Minus, desc: 'Zero distractions, absolute focus' },
  { id: 'glassmorphism', label: 'Liquid Glass', icon: GlassWater, desc: 'Frosted surfaces and fluid motions' },
];

export default function Settings() {
  const { theme, visualStyle, vibe, role, toggleTheme, setVisualStyle, setVibe, setRole } = useTheme();
  const { 
    autoSendDJs, 
    autoGenerateContent, 
    autoOptimizeAds,
    toggleAutoSendDJs,
    toggleAutoGenerateContent,
    toggleAutoOptimizeAds
  } = useAI();
  const [activeTab, setActiveTab] = useState('IDENTITY');

  const vibes = [
    { id: 'TECHNICAL_ORANGE', name: 'TECH_ORANGE', color: '#FF4D00' },
    { id: 'LVRN_GREEN', name: 'LVRN_GREEN', color: '#acec00' },
    { id: 'NEON_PINK', name: 'NEON_PINK', color: '#ff00ff' },
    { id: 'CYBER_BLUE', name: 'CYBER_BLUE', color: '#00f2ff' },
    { id: 'MONO_WHITE', name: 'MONO_ARCHIVE', color: '#ffffff' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-20 font-sans uppercase tracking-[0.05em]">
      <header className="border-b border-white/10 pb-8 flex items-end justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-white italic">SYS_CONFIG</h1>
          <p className="text-white/20 mt-2 text-[10px] font-bold lowercase italic tracking-widest">manage node identity, alert protocols, and security handshakes.</p>
        </div>
        <div className="barcode-sim opacity-10" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Nav */}
        <aside className="lg:col-span-1 space-y-[1px] bg-white/10 border border-white/10">
          {[
            { label: 'IDENTITY', icon: User, active: true },
            { label: 'ALERTS', icon: Bell },
            { label: 'V_SHIELD', icon: Shield },
            { label: 'LEDGER_SUB', icon: CreditCard },
            { label: 'GATEWAYS', icon: Globe },
            { label: 'VAULT_STORE', icon: Database },
          ].map((item) => (
            <button
              key={item.label}
              className={cn(
                "w-full flex items-center justify-between px-6 py-4 text-[10px] font-black transition-all bg-black italic tracking-widest",
                item.active 
                  ? "text-primary bg-primary/5" 
                  : "text-white/20 hover:text-white hover:bg-white/[0.02]"
              )}
            >
              <div className="flex items-center gap-4">
                <item.icon className="w-3 h-3" />
                {item.label}
              </div>
              {item.active && <div className="w-1.5 h-1.5 bg-primary" />}
            </button>
          ))}
          <div className="h-10 bg-black" />
          <button className="w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black text-red-900 hover:bg-red-900/5 transition-all bg-black italic tracking-widest border-t border-white/10">
             <LogOut className="w-3 h-3" />
             TERMINATE_SESSION
          </button>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3 space-y-16">
           <div className="manifest-card corner-marker p-10 bg-black">
              <h2 className="text-xl font-black text-white italic mb-10 border-b border-white/5 pb-6">IDENTITY_PROTOCOL</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 {[
                   { id: 'ARTIST', label: 'ARTIST', icon: Cpu },
                   { id: 'INFLUENCER', label: 'INFLUENCER', icon: Camera },
                   { id: 'DJ', label: 'DJ_NODE', icon: Radio },
                 ].map((r) => (
                   <button
                     key={r.id}
                     onClick={() => setRole(r.id as any)}
                     className={cn(
                       "flex flex-col items-center gap-3 p-6 border transition-all",
                       role === r.id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-white/5 bg-black hover:border-white/10"
                     )}
                   >
                     <div className={cn(
                       "w-12 h-12 border flex items-center justify-center transition-all",
                       role === r.id ? "border-primary text-primary" : "border-white/10 text-white/20"
                     )}>
                        <r.icon className="w-5 h-5" />
                     </div>
                     <span className={cn(
                       "text-[10px] font-black italic tracking-widest",
                       role === r.id ? "text-white" : "text-white/20"
                     )}>{r.label}</span>
                   </button>
                 ))}
              </div>
           </div>

           <div className="manifest-card corner-marker p-10 bg-black">
              <h2 className="text-xl font-black text-white italic mb-10 border-b border-white/5 pb-6">COLOR_MANIFEST</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                 {vibes.map((v) => (
                   <button
                     key={v.id}
                     onClick={() => setVibe(v.id as any)}
                     className={cn(
                       "flex flex-col items-center gap-3 p-4 border transition-all",
                       vibe === v.id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-white/5 bg-black hover:border-white/10"
                     )}
                   >
                     <div 
                       className="w-10 h-10 border border-white/10 flex items-center justify-center p-1"
                     >
                        <div className="w-full h-full" style={{ backgroundColor: v.color }} />
                     </div>
                     <span className={cn(
                       "text-[8px] font-black italic tracking-widest",
                       vibe === v.id ? "text-primary" : "text-white/20"
                     )}>{v.name}</span>
                   </button>
                 ))}
              </div>
           </div>

           <div className="manifest-card corner-marker p-10 bg-black">
              <h2 className="text-xl font-black text-white italic mb-10 border-b border-white/5 pb-6">VISUAL_ENGINES</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {styles.map((style) => (
                   <button
                     key={style.id}
                     onClick={() => setVisualStyle(style.id)}
                     className={cn(
                       "p-6 border text-left transition-all group",
                       visualStyle === style.id ? "border-primary bg-primary/5 shadow-[0_0_30px_rgba(255,77,0,0.1)]" : "border-white/5 bg-black hover:border-white/20"
                     )}
                   >
                     <div className="flex items-center justify-between mb-4">
                       <style.icon className={cn("w-5 h-5", visualStyle === style.id ? "text-primary" : "text-white/20 group-hover:text-white/40")} />
                       {visualStyle === style.id && <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />}
                     </div>
                     <h3 className="text-[11px] font-black text-white italic mb-1 tracking-widest">{style.label}</h3>
                     <p className="text-[8px] text-white/20 font-bold lowercase tracking-widest italic">{style.desc}</p>
                   </button>
                 ))}
              </div>
           </div>

           <div className="manifest-card corner-marker p-10 bg-black">
              <h2 className="text-xl font-black text-white italic mb-10 border-b border-white/5 pb-6">TELEMETRY_PREFERENCES</h2>
              <div className="space-y-10">
                 <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-white italic tracking-widest uppercase">CHROMA_DARK_MODE</p>
                      <p className="text-[9px] text-white/20 mt-1 font-bold lowercase italic tracking-widest">optimize luminosity for extended manifest editing sessions.</p>
                    </div>
                    <Switch 
                      checked={theme === 'dark'} 
                      onChange={toggleTheme} 
                    />
                 </div>
                 
                 <div className="h-px dotted-line opacity-10"></div>

                 <div className="space-y-8">
                    <div className="flex items-center justify-between">
                       <div>
                         <p className="text-[11px] font-black text-white italic tracking-widest uppercase">AUTO_SEND_DJS</p>
                         <p className="text-[9px] text-white/20 mt-1 font-bold lowercase italic tracking-widest">Automated distribution to verified node clusters</p>
                       </div>
                       <Switch checked={autoSendDJs} onChange={toggleAutoSendDJs} />
                    </div>

                    <div className="flex items-center justify-between">
                       <div>
                         <p className="text-[11px] font-black text-white italic tracking-widest uppercase">AUTO_CONTENT_GEN</p>
                         <p className="text-[9px] text-white/20 mt-1 font-bold lowercase italic tracking-widest">Synthetic AI visuals for all releases</p>
                       </div>
                       <Switch checked={autoGenerateContent} onChange={toggleAutoGenerateContent} />
                    </div>

                    <div className="flex items-center justify-between">
                       <div>
                         <p className="text-[11px] font-black text-white italic tracking-widest uppercase">AUTO_AD_OPTIMIZE</p>
                         <p className="text-[9px] text-white/20 mt-1 font-bold lowercase italic tracking-widest">Algorithmic budget management across platforms</p>
                       </div>
                       <Switch checked={autoOptimizeAds} onChange={toggleAutoOptimizeAds} />
                    </div>
                 </div>
              </div>
           </div>

           <div className="manifest-card p-10 bg-red-900/5 border border-red-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-10">
              <div>
                <p className="text-[11px] font-black text-red-900 italic tracking-[0.3em] mb-2 uppercase">TERMINATION_PROTOCOL</p>
                <p className="text-[10px] text-white/20 max-w-sm font-bold lowercase italic leading-relaxed">permanently wipe artist directory from global grid. this operation is irreversible. 100% loss of telemetry.</p>
              </div>
              <button className="h-12 px-8 border border-red-900 text-red-900 font-black text-[10px] italic tracking-widest hover:bg-red-900 hover:text-white transition-all uppercase">
                INIT_WIPE_SEQUENCE
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
