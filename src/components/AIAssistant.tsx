import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Zap, BarChart3, Users, Play, ChevronRight, Settings, Sliders } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAI } from '../context/AIContext';
import Switch from './ui/Switch';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'CHAT' | 'CONFIG'>('CHAT');
  const [message, setMessage] = useState('');
  const { 
    autoSendDJs, 
    autoGenerateContent, 
    autoOptimizeAds,
    toggleAutoSendDJs,
    toggleAutoGenerateContent,
    toggleAutoOptimizeAds
  } = useAI();
  
  const [history, setHistory] = useState([
    { role: 'ai', text: 'Master Node connection established. I have access to your releases, catalog performance, and influencer relay stats. How can I optimize your growth today?' }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    const newHistory = [...history, { role: 'user', text: message }];
    setHistory(newHistory);
    setMessage('');

    // Simulate AI Context awareness
    setTimeout(() => {
      let response = "I'm analyzing your metadata. Logic indicates a high resonance on TikTok for your track 'Neon Nights'. I recommend initiating an Influencer Relay immediately.";
      
      if (message.toLowerCase().includes('grow') || message.toLowerCase().includes('campaign')) {
        response = "Your current algorithmic signature suggests a budget pivot to the 'High Engagement' influencer cluster. I've prepared a growth plan for you.";
      }
      
      setHistory([...newHistory, { role: 'ai', text: response }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] font-mono">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-96 h-[500px] mb-6 bg-dark border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--card-bg)]">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveTab('CHAT')}
                  className={cn(
                    "p-1.5 transition-all",
                    activeTab === 'CHAT' ? "text-primary" : "text-[var(--text-main)]/20 hover:text-[var(--text-main)]"
                  )}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveTab('CONFIG')}
                  className={cn(
                    "p-1.5 transition-all text-white/20 hover:text-[var(--text-main)]",
                    activeTab === 'CONFIG' ? "text-primary" : ""
                  )}
                >
                  <Sliders className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-[var(--border-main)] mx-1" />
                <span className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-widest italic">{activeTab === 'CHAT' ? 'Node_Chat' : 'Sys_Config'}</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[var(--text-main)]/20 hover:text-[var(--text-main)] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <AnimatePresence mode="wait">
                {activeTab === 'CHAT' ? (
                  <motion.div 
                    key="chat"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
                    ref={scrollRef}
                  >
                    {history.map((msg, i) => (
                      <div key={i} className={cn(
                        "flex flex-col gap-2",
                        msg.role === 'user' ? "items-end" : "items-start"
                      )}>
                        <div className={cn(
                          "p-4 text-[11px] font-black italic tracking-tight leading-relaxed uppercase",
                          msg.role === 'user' 
                            ? "bg-primary text-white ml-8" 
                            : "bg-white/5 text-white/70 border border-white/5 mr-8"
                        )}>
                          {msg.text}
                        </div>
                        {msg.role === 'ai' && i === history.length - 1 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                             <button className="px-3 py-1.5 bg-white/5 border border-white/10 text-[8px] font-black text-white hover:border-primary transition-all flex items-center gap-2 uppercase tracking-widest italic group">
                                Launch Campaign <ChevronRight className="w-2 h-2 group-hover:translate-x-1 transition-all" />
                             </button>
                             <button className="px-3 py-1.5 bg-white/5 border border-white/10 text-[8px] font-black text-white hover:border-primary transition-all flex items-center gap-2 uppercase tracking-widest italic group">
                                Find Influencers <ChevronRight className="w-2 h-2 group-hover:translate-x-1 transition-all" />
                             </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="config"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex-1 p-8 space-y-10"
                  >
                    <div className="space-y-2">
                       <h4 className="text-[10px] font-black italic text-primary uppercase tracking-widest">Automation Engine</h4>
                       <p className="text-[9px] text-white/30 uppercase leading-relaxed">Modify autonomous permissions for Node_Assistant.</p>
                    </div>

                    <div className="space-y-8">
                       <Switch 
                          checked={autoSendDJs} 
                          onChange={toggleAutoSendDJs} 
                          label="Auto Send to DJs"
                        />
                       <Switch 
                          checked={autoGenerateContent} 
                          onChange={toggleAutoGenerateContent} 
                          label="Auto Content Gen"
                        />
                       <Switch 
                          checked={autoOptimizeAds} 
                          onChange={toggleAutoOptimizeAds} 
                          label="Auto Optimize Ads"
                        />
                    </div>

                    <div className="pt-8 border-t border-white/5">
                       <div className="p-4 bg-primary/5 border border-primary/20 space-y-2">
                          <div className="flex items-center gap-2 text-[8px] font-black text-primary uppercase italic">
                             <Zap className="w-3 h-3" /> System Status
                          </div>
                          <p className="text-[8px] text-white/40 uppercase">All AI protocols are running at 450 TFLOPS. Resonance optimization is active.</p>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input (only in Chat) */}
            {activeTab === 'CHAT' && (
              <div className="p-4 border-t border-[var(--border-main)] bg-[var(--card-bg)]">
                <div className="relative">
                  <input 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about your releases..."
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] h-12 px-4 pr-12 text-[10px] font-black text-[var(--text-main)] placeholder:text-[var(--text-main)]/10 focus:border-primary outline-none transition-all font-mono uppercase italic tracking-widest"
                  />
                  <button 
                    onClick={handleSend}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-[var(--text-main)] transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-white text-black hover:bg-primary hover:text-white shadow-[0_0_50px_rgba(255,102,0,0.3)] transition-all active:scale-90 flex items-center justify-center relative group"
      >
        <Zap className={cn("w-6 h-6 transition-transform duration-500", isOpen ? "rotate-180" : "group-hover:scale-125")} />
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping" />
        )}
      </button>
    </div>
  );
}
