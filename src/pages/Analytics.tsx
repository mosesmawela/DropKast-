import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Globe2, 
  Calendar,
  ChevronDown,
  Download,
  Cpu,
  MessageSquare,
  Sparkles,
  Send,
  ArrowRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useReleases } from '../context/ReleaseContext';
import ScrollReveal from '../components/animations/ScrollReveal';
import AnimatedBeam from '../components/animations/AnimatedBeam';
import CircularPulse from '../components/animations/CircularPulse';
import { apiFetch } from '../lib/api';

// Populated from real analytics once a release is collecting streams.
const streamData: { name: string; value: number }[] = [];

export default function Analytics() {
  const navigate = useNavigate();
  const { allReleases } = useReleases();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics/demo-release');
        const summary = await res.json();
        setData(summary);
      } catch (err) {
        console.error('Failed to sync analytics nodes.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: 'ai', text: "Ask me anything about your performance — once your releases start collecting streams, I'll surface trends, top territories, and budget suggestions here." }
  ]);

  const stats = [
    { label: 'NODE_PLAYS', value: data?.plays != null ? `${(data.plays / 1000).toFixed(1)}K` : '—', trend: '', color: 'from-primary/20 to-primary/5' },
    { label: 'CONVERSION_NODES', value: data?.clicks != null ? data.clicks : '—', trend: '', color: 'from-blue-500/20 to-blue-500/5' },
    { label: 'INF_POSTS', value: data?.influencerPosts != null ? data.influencerPosts : '—', trend: '', color: 'from-purple-500/20 to-purple-500/5' },
    { label: 'TOTAL_REACH', value: data?.totalReach != null ? (data.totalReach > 1000000 ? `${(data.totalReach/1000000).toFixed(1)}M` : `${(data.totalReach/1000).toFixed(1)}K`) : '—', trend: '', color: 'from-emerald-500/20 to-emerald-500/5' },
  ];

  const handleSendMessage = async () => {
    if (!chatInput) return;
    const userText = chatInput;
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setChatInput('');
    setIsAiThinking(true);

    try {
      const res = await apiFetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `As my music analytics assistant, answer concisely: ${userText}` }),
      });
      if (res.status === 503) {
        setMessages((prev) => [...prev, { role: 'ai', text: 'AI is not configured yet. Add an API key in AI Models to enable the assistant.' }]);
        return;
      }
      if (!res.ok || !res.body) throw new Error(`Request failed: ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let out = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          const t = line.trim();
          if (t.startsWith('data:')) {
            const payload = t.slice(5).trim();
            if (payload && payload !== '[DONE]') {
              try { const p = JSON.parse(payload); out += p.text ?? p.delta ?? p.content ?? ''; }
              catch { out += payload; }
            }
          }
        }
      }
      setMessages((prev) => [...prev, { role: 'ai', text: out || 'No response.' }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Assistant unavailable right now. Check your AI model connection.' }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-20 font-sans py-8">
      <ScrollReveal direction="down">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-2 text-primary mb-3 font-mono">
              <Cpu className="w-4 h-4" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase">AI Assistant</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-white italic font-mono uppercase">Analytics</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-3 px-6 h-14 bg-surface-low border border-white/10 hover:border-white transition-all text-xs font-bold italic tracking-widest font-mono">
              <Calendar className="w-4 h-4 text-primary" />
              Last 30 Days
              <ChevronDown className="w-4 h-4 text-white/20" />
            </button>
            <AnimatedBeam containerClassName="w-fit">
              <button className="primary-button h-14 flex items-center gap-3 px-8">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </AnimatedBeam>
          </div>
        </header>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Charts Area */}
        <div className="lg:col-span-2 space-y-12">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="manifest-card p-10 bg-dark border-white/5 relative group overflow-hidden">
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", stat.color)} />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 border border-white/10 flex items-center justify-center text-primary group-hover:border-primary transition-colors bg-white/5">
                      {i === 0 ? <TrendingUp className="w-4 h-4" /> : i === 1 ? <Globe2 className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                    </div>
                    <span className="text-[11px] font-bold text-white/40 tracking-widest italic font-mono uppercase">{stat.label}</span>
                  </div>
                  <div className="text-5.5xl font-black text-white mb-2 italic leading-none font-mono">{stat.value}</div>
                  <p className="text-[11px] text-primary font-bold italic tracking-widest font-mono">{stat.trend} <span className="text-white/20 lowercase ml-2 font-sans font-medium tracking-normal italic">from target_node</span></p>
                </div>
              </div>
            ))}
          </div>

          {/* Stream Growth Chart */}
          <div className="manifest-card p-10 min-h-[450px] bg-dark border-white/5">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-sm font-bold text-white italic tracking-widest font-mono uppercase">Monthly Growth</h3>
              <div className="barcode-sim opacity-10" />
            </div>
            <div className="h-[300px] w-full">
              {streamData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center border border-dashed border-white/10 bg-white/[0.01] gap-2">
                  <span className="text-white/20 font-mono text-[11px] uppercase tracking-widest italic">No stream data yet</span>
                  <span className="text-white/15 font-mono text-[9px] uppercase tracking-widest italic">Growth charts build once your releases go live</span>
                </div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={streamData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={{stroke: '#ffffff1a'}} 
                    tickLine={false} 
                    tick={{fill: '#ffffff33', fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono'}} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={{stroke: '#ffffff1a'}} 
                    tickLine={false} 
                    tick={{fill: '#ffffff33', fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono'}} 
                    dx={-10} 
                    tickFormatter={(value) => `${value / 1000000}M`} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #FF4D00', 
                      borderRadius: '0px',
                      fontSize: '11px',
                      fontWeight: 700,
                      fontFamily: 'JetBrains Mono'
                    }} 
                  />
                  <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#FF4D00" 
                      strokeWidth={3} 
                      dot={{ r: 0 }} 
                      activeDot={{ r: 6, fill: '#FF4D00', stroke: '#000', strokeWidth: 2 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Global Heatmap Overlay */}
          <div className="manifest-card p-10 bg-dark border-white/5 space-y-10 overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Globe2 className="w-40 h-40" />
             </div>
             <div className="flex items-center justify-between relative z-10">
                <h3 className="text-sm font-bold text-white italic tracking-widest font-mono uppercase">Market Heatmap</h3>
                <div className="flex gap-4 items-center">
                   <div className="flex items-center gap-2 text-[9px] font-black text-primary font-mono italic">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      LIVE_TRENDS
                   </div>
                   <button className="text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors">Expand_Map</button>
                </div>
             </div>

             <div className="relative z-10 py-12 text-center border border-dashed border-white/10 bg-white/[0.01]">
                <span className="text-white/20 font-mono text-[11px] uppercase tracking-widest italic">
                  Territory breakdown appears once your releases collect streams
                </span>
             </div>
          </div>

          {/* Release Performance Nodes */}
          <div className="space-y-8">
             <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-white/30 italic tracking-[0.4em] font-mono uppercase italic">Release Performance Nodes</h3>
                <button className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono italic underline decoration-primary/30 underline-offset-4">View All Catalog</button>
             </div>
             <div className="grid grid-cols-1 gap-4">
                {allReleases.length === 0 && (
                  <div className="p-10 border border-dashed border-white/10 bg-white/[0.01] text-center">
                    <span className="text-white/20 font-mono text-[11px] uppercase tracking-widest italic">No releases yet — your catalogue performance shows here once you drop music</span>
                  </div>
                )}
                {allReleases.map((node) => (
                  <motion.div
                    key={node.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => navigate(`/analytics/${node.id}`)}
                    className="p-6 border border-white/5 bg-dark hover:border-primary/20 transition-all cursor-pointer flex items-center justify-between group"
                  >
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center font-mono font-black italic text-primary overflow-hidden">
                          {node.artwork ? <img src={node.artwork} alt="" className="w-full h-full object-cover" /> : (node.title[0] || '?')}
                        </div>
                        <div>
                           <h4 className="text-lg font-black text-white italic uppercase tracking-tight group-hover:text-primary transition-colors">{node.title}</h4>
                           <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest font-mono">{node.status} · {node.artist}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-xl font-black text-white/30 italic font-mono">—</div>
                        <div className="text-[10px] font-black text-white/20 uppercase italic tracking-widest">No data yet</div>
                     </div>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>

        {/* AI Copilot Side Panel */}
        <div className="lg:col-span-1 flex flex-col h-full min-h-[600px] space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold tracking-tight uppercase italic font-mono">Strategy AI</h3>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-white/40 font-mono tracking-widest">LIVE_SYNC</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-dark border border-white/5 overflow-hidden shadow-2xl">
            <div className="bg-white/5 p-6 border-b border-white/10 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-bold tracking-widest font-mono uppercase italic">Music Strategist AI</span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-black/40">
              {messages.map((msg, idx) => (
                <div key={idx} className={cn(
                  "flex flex-col gap-3 max-w-[90%]",
                  msg.role === 'user' ? "ml-auto items-end" : "items-start"
                )}>
                  <div className={cn(
                    "p-5 text-sm leading-relaxed italic font-medium",
                    msg.role === 'user' 
                      ? "bg-white text-black font-sans shadow-lg" 
                      : "bg-surface-low border border-white/10 text-white/80 font-mono"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiThinking && (
                <div className="flex items-center gap-3 text-primary animate-pulse py-2">
                  <Cpu className="w-4 h-4" />
                  <span className="text-[10px] font-bold tracking-widest italic font-mono">Analyzing data...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t border-white/10 bg-dark">
              <div className="relative">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about strategy..."
                  className="w-full bg-white/5 border border-white/10 p-5 pr-14 text-sm font-sans font-medium focus:border-primary outline-none transition-colors placeholder:text-white/20"
                />
                <button 
                  onClick={handleSendMessage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 text-primary hover:text-white transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 border border-white/5 bg-dark space-y-5">
            <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-widest font-mono">Quick Inquiries</h4>
            <div className="space-y-1">
              {[
                "Why did my streams drop this week?",
                "Which song should I promote next?",
                "Show me emerging markets for my sound."
              ].map((q, i) => (
                <button 
                  key={i}
                  className="w-full text-left p-4 hover:bg-white/5 transition-colors group flex items-center justify-between font-mono"
                  onClick={() => setChatInput(q)}
                >
                  <span className="text-[11px] text-white/50 group-hover:text-white transition-colors">{q}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white/5 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
