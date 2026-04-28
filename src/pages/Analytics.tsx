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
import ScrollReveal from '../components/animations/ScrollReveal';
import AnimatedBeam from '../components/animations/AnimatedBeam';
import CircularPulse from '../components/animations/CircularPulse';

const streamData = [
  { name: 'Jan', value: 1200000 },
  { name: 'Feb', value: 1500000 },
  { name: 'Mar', value: 1800000 },
  { name: 'Apr', value: 2400000 },
  { name: 'May', value: 3100000 },
  { name: 'Jun', value: 2800000 },
];

export default function Analytics() {
  const navigate = useNavigate();
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
  const [messages, setMessages] = useState([
    { role: 'ai', text: "SYST_READY: I've analyzed your June performance. Streams in Brazil are up +24% due to a viral TikTok sound. Should we double down on localized ads there?" }
  ]);

  const stats = [
    { label: 'NODE_PLAYS', value: data?.plays ? `${(data.plays / 1000).toFixed(1)}K` : '1.2M', trend: '+12%', color: 'from-primary/20 to-primary/5' },
    { label: 'CONVERSION_NODES', value: data?.clicks ? data.clicks : '45.2K', trend: '+8%', color: 'from-blue-500/20 to-blue-500/5' },
    { label: 'INF_POSTS', value: data?.influencerPosts ? data.influencerPosts : '24', trend: '+24%', color: 'from-purple-500/20 to-purple-500/5' },
    { label: 'TOTAL_REACH', value: data?.totalReach ? (data.totalReach > 1000000 ? `${(data.totalReach/1000000).toFixed(1)}M` : `${(data.totalReach/1000).toFixed(1)}K`) : '782K', trend: '+15%', color: 'from-emerald-500/20 to-emerald-500/5' },
  ];

  const handleSendMessage = () => {
    if (!chatInput) return;
    setMessages([...messages, { role: 'user', text: chatInput }]);
    setChatInput('');
    setIsAiThinking(true);
    
    // Simulate AI thinking
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "Analyzing trajectory... Based on current trends, your song 'Night Drive' matches the energy of emerging 'Dark Pop' playlists in Berlin. I suggest shifting 15% of your marketing budget to that cluster." 
      }]);
      setIsAiThinking(false);
    }, 1500);
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

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                {[
                  { region: 'N. America', trend: '+14%', hot: false, users: '840K' },
                  { region: 'W. Europe', trend: '+22%', hot: true, users: '1.2M' },
                  { region: 'S. America', trend: '+48%', hot: true, users: '2.1M' },
                  { region: 'Asia Pacific', trend: '+8%', hot: false, users: '520K' },
                ].map((item, i) => (
                   <motion.div 
                    key={i}
                    whileHover={{ y: -5 }}
                    className={cn(
                      "p-6 border flex flex-col gap-4",
                      item.hot ? "bg-primary/5 border-primary/20" : "bg-white/5 border-white/5"
                    )}
                   >
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-white/30 uppercase tracking-widest italic">{item.region}</span>
                         {item.hot && <Sparkles className="w-3 h-3 text-primary" />}
                      </div>
                      <div>
                         <div className="text-2xl font-black text-white italic mb-1">{item.trend}</div>
                         <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">{item.users} Listeners</div>
                      </div>
                      <button className="mt-2 py-2 px-4 bg-white/5 hover:bg-primary hover:text-white transition-all text-[8px] font-black uppercase tracking-widest italic font-mono border border-white/5">
                         Target Market
                      </button>
                   </motion.div>
                ))}
             </div>
          </div>

          {/* Release Performance Nodes */}
          <div className="space-y-8">
             <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-white/30 italic tracking-[0.4em] font-mono uppercase italic">Release Performance Nodes</h3>
                <button className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono italic underline decoration-primary/30 underline-offset-4">View All Catalog</button>
             </div>
             <div className="grid grid-cols-1 gap-4">
                {[
                  { title: 'Neon Nights', streams: '1.2M', growth: '+24%', status: 'Trending', id: 'REL-001' },
                  { title: 'Subsonic Echo', streams: '842K', growth: '+12%', status: 'Stable', id: 'REL-002' },
                  { title: 'Velvet Sky', streams: '2.1M', growth: '+8%', status: 'Peaked', id: 'REL-003' },
                ].map((node) => (
                  <motion.div 
                    key={node.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => {
                        console.log("Navigating to:", `/analytics/${node.id}`);
                        navigate(`/analytics/${node.id}`);
                    }}
                    className="p-6 border border-white/5 bg-dark hover:border-primary/20 transition-all cursor-pointer flex items-center justify-between group"
                  >
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center font-mono font-black italic text-primary">
                          {node.title[0]}
                        </div>
                        <div>
                           <h4 className="text-lg font-black text-white italic uppercase tracking-tight group-hover:text-primary transition-colors">{node.title}</h4>
                           <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest font-mono">{node.status} _NODE</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-xl font-black text-white italic font-mono">{node.streams}</div>
                        <div className="text-[10px] font-black text-green-500 uppercase italic tracking-widest">{node.growth}</div>
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
