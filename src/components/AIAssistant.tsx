import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Zap, Sliders, Wrench, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAI } from '../context/AIContext';
import Switch from './ui/Switch';
import { toast } from 'sonner';

type ProviderId = 'anthropic' | 'nvidia' | 'groq' | 'cerebras' | 'openrouter';
const PROVIDER_LABELS: Record<ProviderId, string> = {
  anthropic: 'Claude (Anthropic)',
  nvidia: 'NVIDIA NIM (free)',
  groq: 'Groq (free)',
  cerebras: 'Cerebras (free)',
  openrouter: 'OpenRouter',
};

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
  const [provider, setProvider] = useState<ProviderId>(() =>
    (localStorage.getItem('dropkast_chat_provider') as ProviderId) || 'anthropic',
  );
  const [providerStatus, setProviderStatus] = useState<Record<ProviderId, boolean>>({
    anthropic: false,
    nvidia: false,
    groq: false,
    cerebras: false,
    openrouter: false,
  });

  useEffect(() => {
    fetch('/api/ai/providers')
      .then((r) => r.json())
      .then((d) => {
        const map: any = {};
        for (const p of d.providers || []) map[p.id] = p.configured;
        setProviderStatus(map);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    localStorage.setItem('dropkast_chat_provider', provider);
  }, [provider]);

  const {
    autoSendDJs,
    autoGenerateContent,
    autoOptimizeAds,
    toggleAutoSendDJs,
    toggleAutoGenerateContent,
    toggleAutoOptimizeAds,
  } = useAI();

  const [history, setHistory] = useState<Message[]>([
    {
      role: 'ai',
      text: "Master Node connection established. I have live access to your releases, analytics, campaigns, and influencer roster. Ask me anything — \"how is my latest release doing?\", \"what should I post about Buddy Kay this week?\", or \"who should I send my new track to?\"",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: sendText, provider }),
        signal: controller.signal,
      });

      if (res.status === 503) {
        const data = await res.json();
        toast.error(data.message || 'AI not configured');
        setHistory((h) => {
          const copy = [...h];
          copy[copy.length - 1] = {
            role: 'ai',
            text: '⚠️ AI is not configured. Set `ANTHROPIC_API_KEY` in your environment.',
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
            className="fixed sm:relative bottom-20 right-4 left-4 sm:bottom-auto sm:right-0 sm:left-auto sm:w-96 h-[min(560px,calc(100vh-7rem))] mb-4 sm:mb-6 bg-black border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
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
                  {activeTab === 'CHAT' ? 'Node_Chat' : 'Sys_Config'}
                </span>
                {activeTab === 'CHAT' && (
                  <div className="relative">
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value as ProviderId)}
                      className="ml-2 bg-black border border-white/10 hover:border-primary text-white text-[9px] font-mono font-black uppercase tracking-widest italic pl-2 pr-6 py-1 appearance-none cursor-pointer focus:outline-none focus:border-primary transition-colors"
                    >
                      {(Object.keys(PROVIDER_LABELS) as ProviderId[]).map((id) => (
                        <option key={id} value={id} disabled={!providerStatus[id]}>
                          {PROVIDER_LABELS[id]}{providerStatus[id] ? '' : ' — no key'}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-white/40" />
                  </div>
                )}
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-colors">
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
                        Automation Engine
                      </h4>
                      <p className="text-[9px] text-white/30 uppercase leading-relaxed">
                        Modify autonomous permissions for Node_Assistant.
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
                      <div className="p-4 bg-primary/5 border border-primary/20 space-y-2">
                        <div className="flex items-center gap-2 text-[8px] font-black text-primary uppercase italic">
                          <Zap className="w-3 h-3" /> System Status
                        </div>
                        <p className="text-[8px] text-white/40 uppercase">
                          Powered by Claude Sonnet 4.6 with live tool access to your catalog data.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input */}
            {activeTab === 'CHAT' && (
              <div className="p-4 border-t border-[var(--border-main)] bg-[var(--card-bg)]">
                <div className="relative">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={isSending}
                    placeholder={isSending ? 'Streaming...' : 'Ask about your releases, analytics, campaigns...'}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-main)] h-12 px-4 pr-12 text-[10px] font-medium text-white placeholder:text-white/20 focus:border-primary outline-none transition-all font-mono disabled:opacity-50"
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
