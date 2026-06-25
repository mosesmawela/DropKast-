import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Zap, Sliders, Wrench, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAI } from '../context/AIContext';
import Switch from './ui/Switch';
import { toast } from 'sonner';
import ModelPicker from './ModelPicker';
import { RECOMMENDATIONS } from '../lib/ai-recommendations';
import { providersByKind, ALL_PROVIDERS, type ProviderModel } from '../lib/ai-providers';

type ProviderId = 'anthropic' | 'nvidia' | 'groq' | 'cerebras' | 'openrouter' | 'moonshot' | 'openai' | 'google';

interface ProviderStatus {
  id: ProviderId;
  name: string;
  configured: boolean;
  defaultModel: string;
}

type Message = {
  role: 'user' | 'ai';
  text: string;
  toolCalls?: { name: string; ts: number }[];
  streaming?: boolean;
};

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'CHAT' | 'CONFIG'>('CHAT');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const [chosenModel, setChosenModel] = useState<string>(() => {
    return localStorage.getItem(RECOMMENDATIONS.chat.storageKey) || RECOMMENDATIONS.chat.recommendedId;
  });
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [providerError, setProviderError] = useState<string | null>(null);

  // Load BYOK keys from localStorage
  const getByokKeys = (): Record<string, string> => {
    try {
      return JSON.parse(localStorage.getItem('dropkast_byok_keys') || '{}');
    } catch { return {}; }
  };

  // On mount, fetch available providers from API (including BYOK keys)
  useEffect(() => {
    const byokKeys = getByokKeys();
    const params = Object.keys(byokKeys).length > 0
      ? `?keys=${encodeURIComponent(JSON.stringify(byokKeys))}`
      : '';
    fetch(`/api/ai/providers${params}`)
      .then((r) => r.json())
      .then((d) => {
        const providerList = (d.providers || []) as ProviderStatus[];
        setProviders(providerList);
        
        // If current model's provider isn't configured, pick first available
        const currentModel = ALL_PROVIDERS.find(m => m.id === chosenModel);
        const currentProvider = currentModel ? providerList.find(p => {
          const vendor = currentModel.vendor.toLowerCase();
          if (vendor.includes('anthropic')) return p.id === 'anthropic';
          if (vendor.includes('nvidia')) return p.id === 'nvidia';
          if (vendor.includes('groq')) return p.id === 'groq';
          if (vendor.includes('cerebras')) return p.id === 'cerebras';
          if (vendor.includes('openrouter')) return p.id === 'openrouter';
          if (vendor.includes('moonshot')) return p.id === 'moonshot';
          if (vendor.includes('openai')) return p.id === 'openai';
          if (vendor.includes('google')) return p.id === 'google';
          return false;
        }) : null;
        
        if (!currentProvider && providerList.length > 0) {
          // Pick first available provider's default model
          const firstAvailable = providerList[0];
          const modelMap: Record<string, string> = {
            anthropic: 'anthropic-sonnet',
            groq: 'groq',
            nvidia: 'nvidia-nim',
            cerebras: 'cerebras',
            openrouter: 'openrouter-free',
            moonshot: 'moonshot-kimi',
            openai: 'openai-gpt5',
            google: 'gemini-25-pro',
          };
          setChosenModel(modelMap[firstAvailable.id] || firstAvailable.defaultModel);
        }
      })
      .catch(() => {
        setProviderError('Failed to load AI providers');
      });
  }, [chosenModel]);

  // Map chosen model to provider ID for API call
  const getProviderForModel = (modelId: string): ProviderId => {
    const model = ALL_PROVIDERS.find(p => p.id === modelId);
    if (!model) return 'anthropic';
    const vendor = model.vendor.toLowerCase();
    if (vendor.includes('anthropic')) return 'anthropic';
    if (vendor.includes('nvidia')) return 'nvidia';
    if (vendor.includes('groq')) return 'groq';
    if (vendor.includes('cerebras')) return 'cerebras';
    if (vendor.includes('openrouter')) return 'openrouter';
    if (vendor.includes('moonshot')) return 'moonshot';
    if (vendor.includes('openai')) return 'openai';
    if (vendor.includes('google')) return 'google';
    return 'anthropic';
  };

  const provider: ProviderId = getProviderForModel(chosenModel);
  const isProviderConfigured = providers.find(p => p.id === provider)?.configured ?? false;

  const {
    autoSendDJs,
    autoGenerateContent,
    autoOptimizeAds,
    toggleAutoSendDJs,
    toggleAutoGenerateContent,
    toggleAutoOptimizeAds,
  } = useAI();

  const [history, setHistory] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('dropkast_ai_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{
      role: 'ai' as const,
      text: "Hey — I'm your DropKast strategist. I can see your releases, analytics, campaigns, and creator roster in real time. Try asking: \"how is my latest release doing?\", \"what should I post about [your song] this week?\", or \"who should I send my new track to?\"",
    }];
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem('dropkast_ai_history', JSON.stringify(history.slice(-50)));
    } catch {}
  }, [history]);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    const userMsg: Message = { role: 'user', text: message };
    const aiMsg: Message = { role: 'ai', text: '', streaming: true, toolCalls: [] };
    setHistory((h) => [...h, userMsg, aiMsg]);
    const sendText = message;
    setMessage('');
    setIsSending(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const byokKeys = getByokKeys();
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: sendText,
          provider,
          apiKeys: Object.keys(byokKeys).length > 0 ? byokKeys : undefined,
        }),
        signal: controller.signal,
      });

      if (res.status === 503) {
        const data = await res.json();
        toast.error(data.message || 'AI not configured');
        setHistory((h) => {
          const copy = [...h];
          copy[copy.length - 1] = {
            role: 'ai',
            text: '⚠️ AI is not configured. Add an API key (Anthropic, Groq, NVIDIA, Cerebras, OpenRouter, Moonshot, OpenAI, or Google) in your environment.',
          };
          return copy;
        });
        return;
      }
      if (!res.ok || !res.body) {
        throw new Error(`Chat request failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse SSE frames
        const frames = buffer.split('\n\n');
        buffer = frames.pop() || '';

        for (const frame of frames) {
          const lines = frame.split('\n');
          let eventName = '';
          let dataPayload = '';
          for (const line of lines) {
            if (line.startsWith('event:')) eventName = line.slice(6).trim();
            else if (line.startsWith('data:')) dataPayload += line.slice(5).trim();
          }
          if (!eventName || !dataPayload) continue;
          let data: any;
          try {
            data = JSON.parse(dataPayload);
          } catch {
            continue;
          }
          currentEvent = eventName;

          setHistory((h) => {
            const copy = [...h];
            const last = copy[copy.length - 1];
            if (last.role !== 'ai') return copy;
            if (eventName === 'token') {
              last.text += data.text || '';
            } else if (eventName === 'tool_call') {
              last.toolCalls = [...(last.toolCalls || []), { name: data.name, ts: Date.now() }];
            } else if (eventName === 'done') {
              last.streaming = false;
            } else if (eventName === 'error') {
              last.text += `\n\n⚠️ ${data.message || 'error'}`;
              last.streaming = false;
            }
            return copy;
          });
        }
      }

      // Make sure streaming flag clears on close
      setHistory((h) => {
        const copy = [...h];
        const last = copy[copy.length - 1];
        if (last && last.role === 'ai') last.streaming = false;
        return copy;
      });
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error(err);
      toast.error(err.message || 'Chat failed');
      setHistory((h) => {
        const copy = [...h];
        const last = copy[copy.length - 1];
        if (last && last.role === 'ai') {
          last.text = last.text || '⚠️ Chat failed. Please try again.';
          last.streaming = false;
        }
        return copy;
      });
    } finally {
      setIsSending(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-[100] font-mono">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed sm:relative bottom-20 right-4 left-4 sm:bottom-auto sm:right-0 sm:left-auto sm:w-96 h-[min(560px,calc(100vh-7rem))] mb-4 sm:mb-6 bg-black border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom,0px)]"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--card-bg)]">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('CHAT')}
                  className={cn(
                    'p-1.5 transition-all',
                    activeTab === 'CHAT' ? 'text-primary' : 'text-white/20 hover:text-white',
                  )}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab('CONFIG')}
                  className={cn(
                    'p-1.5 transition-all',
                    activeTab === 'CONFIG' ? 'text-primary' : 'text-white/20 hover:text-white',
                  )}
                >
                  <Sliders className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-[var(--border-main)] mx-1" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest italic">
                  {activeTab === 'CHAT' ? 'Strategist' : 'Settings'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setHistory([{
                      role: 'ai' as const,
                      text: "Conversation cleared. How can I help?",
                    }]);
                    localStorage.removeItem('dropkast_ai_history');
                  }}
                  className="text-white/20 hover:text-white transition-colors p-1"
                  title="Clear conversation"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
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
                    className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide"
                    ref={scrollRef}
                  >
                    {history.map((msg, i) => (
                      <div
                        key={i}
                        className={cn('flex flex-col gap-2', msg.role === 'user' ? 'items-end' : 'items-start')}
                      >
                        {msg.toolCalls && msg.toolCalls.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mr-8">
                            {msg.toolCalls.map((t, j) => (
                              <div
                                key={j}
                                className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 border border-primary/30 text-[8px] font-black text-primary uppercase tracking-widest italic"
                              >
                                <Wrench className="w-2.5 h-2.5" />
                                <span>{t.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div
                          className={cn(
                            'p-4 text-[11px] font-medium leading-relaxed whitespace-pre-wrap break-words',
                            msg.role === 'user'
                              ? 'bg-primary text-white ml-8 italic uppercase tracking-tight font-black'
                              : 'bg-white/5 text-white/85 border border-white/5 mr-8',
                          )}
                        >
                          {msg.text}
                          {msg.streaming && (
                            <span className="inline-block ml-1 w-1.5 h-3 bg-primary animate-pulse align-middle" />
                          )}
                        {msg.role === 'ai' && !msg.streaming && msg.text && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(msg.text);
                              toast.success('Copied to clipboard');
                            }}
                            className="text-[8px] font-mono font-black uppercase tracking-widest text-white/20 hover:text-primary transition-colors mt-1"
                          >
                            Copy
                          </button>
                        )}
                        </div>
                      </div>
                    ))}
                    {isSending && history[history.length - 1]?.text === '' && (
                      <div className="flex items-center gap-2 text-white/30 text-[10px] font-mono uppercase tracking-widest italic">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Thinking...
                      </div>
                    )}
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
                      <h4 className="text-[10px] font-black italic text-primary uppercase tracking-widest">
                        Automation
                      </h4>
                      <p className="text-[9px] text-white/40 leading-relaxed">
                        Let DropKast handle these tasks without asking each time.
                      </p>
                    </div>

                    <div className="space-y-8">
                      <Switch checked={autoSendDJs} onChange={toggleAutoSendDJs} label="Auto Send to DJs" />
                      <Switch
                        checked={autoGenerateContent}
                        onChange={toggleAutoGenerateContent}
                        label="Auto Content Gen"
                      />
                      <Switch checked={autoOptimizeAds} onChange={toggleAutoOptimizeAds} label="Auto Optimize Ads" />
                    </div>

                    <div className="pt-8 border-t border-white/5">
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black italic text-primary uppercase tracking-widest">
                          AI Providers
                        </h4>
                        <p className="text-[9px] text-white/40 leading-relaxed">
                          Add API keys in your environment to enable providers. Free tiers available for Groq, NVIDIA, Cerebras, OpenRouter.
                        </p>
                        {providerError && (
                          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-[9px] font-mono">
                            {providerError}
                          </div>
                        )}
                        <div className="grid gap-2 max-h-48 overflow-y-auto">
                          {providers.length === 0 ? (
                            <div className="text-[9px] text-white/30 italic">Loading providers...</div>
                          ) : (
                            providers.map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center justify-between p-3 bg-white/5 border border-white/10"
                              >
                                <div className="flex items-center gap-2">
                                  {p.configured ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                  ) : (
                                    <AlertCircle className="w-3.5 h-3.5 text-white/30" />
                                  )}
                                  <span className="text-[9px] font-mono font-black uppercase tracking-widest text-white">
                                    {p.name}
                                  </span>
                                  <span className="text-[8px] font-mono text-white/40 italic">
                                    ({p.defaultModel})
                                  </span>
                                </div>
                                <span className={cn(
                                  'text-[8px] font-mono font-black uppercase tracking-widest px-2 py-0.5',
                                  p.configured ? 'text-green-500 bg-green-500/10' : 'text-white/30 bg-white/5'
                                )}>
                                  {p.configured ? 'Connected' : 'Add Key'}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                        {providers.length > 0 && providers.every(p => !p.configured) && (
                          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[9px] font-mono">
                            No providers configured. Add at least one API key to enable AI features.
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input */}
            {activeTab === 'CHAT' && (
              <div className="p-4 sm:p-3 border-t border-[var(--border-main)] bg-[var(--card-bg)] space-y-3 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-[9px] font-mono font-black uppercase tracking-widest text-white/30 italic">Model</span>
                  <ModelPicker recommendation={RECOMMENDATIONS.chat} value={chosenModel} onChange={setChosenModel} />
                </div>
                <div className="relative">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={isSending}
                    placeholder={isSending ? 'Thinking...' : 'Ask about your releases, analytics, campaigns...'}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] h-14 sm:h-12 px-4 sm:px-4 pr-14 sm:pr-12 text-xs sm:text-[10px] font-medium text-white placeholder:text-white/20 focus:border-primary outline-none transition-all font-mono disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isSending || !message.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-white disabled:text-white/10 transition-colors"
                  >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        data-tour="ai-assistant"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 sm:w-16 sm:h-16 bg-white text-black hover:bg-primary hover:text-white shadow-[0_0_50px_rgba(255,102,0,0.3)] transition-all active:scale-90 flex items-center justify-center relative group"
      >
        <Zap className={cn('w-6 h-6 transition-transform duration-500', isOpen ? 'rotate-180' : 'group-hover:scale-125')} />
        {!isOpen && <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping" />}
      </button>
    </div>
  );
}
