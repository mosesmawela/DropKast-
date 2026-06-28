import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, FileText, Image as ImageIcon, Video, Music, Layers,
  Sparkles, Play, Download, Save, Share2, Sun, Moon, Upload, Search,
  FolderOpen, Trash2, Star, Plus, Settings, Clock, CheckCircle2,
  XCircle, Loader2, ArrowRight, ArrowLeft, RefreshCw, Copy, Mic2,
  Scissors, Grid3X3, List, File, ChevronRight, ChevronDown,
  Music2, Palette, Type, Film, GripVertical, Eye, EyeOff, Lock,
  Unlock, Shuffle, SkipBack, SkipForward, Volume2, AlignLeft,
  Bold, Italic, Underline, Hash, Heart, MessageSquare, Globe,
  BookOpen, Zap, Maximize2, Minimize2, Sliders, Wand2, Smartphone,
  Monitor, Speaker, CircleDot,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

type StudioModule = 'overview' | 'lyrics' | 'assets' | 'templates' | 'broll' | 'cover' | 'timeline';

interface LyricWord { word: string; start: number; end: number; }
interface LyricSegment { id: string; text: string; start: number; end: number; words: LyricWord[]; }
interface VisualClip { id: string; sourceUrl: string; thumbnailUrl: string; duration: number; startTimeInTimeline: number; lockedToBeat: boolean; }
interface AssetFile { id: string; name: string; type: 'video' | 'image' | 'audio' | 'folder'; url?: string; thumbnail?: string; duration?: number; date: string; }
interface Template { id: string; name: string; date: string; clipDuration: number; bpm: number; projectCount: number; projects: string[]; }
interface Project { id: string; name: string; date: string; aspect: '9:16' | '16:9'; status: 'draft' | 'ready' | 'exporting' | 'done'; }
interface BrollJob { id: string; prompt: string; status: 'queued' | 'generating' | 'done' | 'failed'; outputUrl?: string; thumbnailUrl?: string; }

const GENRES = ['Pop', 'Rap', 'R&B', 'Country', 'Rock', 'Metal', 'EDM', 'Worship', 'Afrobeats', 'Amapiano', 'House', 'Jazz'];
const CHORD_PAIRS: Record<string, string[]> = {
  'Em7 Cmaj7 G Dsus4 Am7 B7': ['Em7', 'Cmaj7', 'G', 'Dsus4', 'Am7', 'B7'],
};

const SAMPLE_LYRICS: LyricSegment[] = [
  { id: 's1', text: 'Like a phoenix burning bright', start: 0, end: 3.5, words: [{word:'Like',start:0,end:0.4},{word:'a',start:0.4,end:0.6},{word:'phoenix',start:0.6,end:1.5},{word:'burning',start:1.5,end:2.5},{word:'bright',start:2.5,end:3.5}] },
  { id: 's2', text: 'Ready to rise from the shadows', start: 3.5, end: 7, words: [{word:'Ready',start:3.5,end:4.2},{word:'to',start:4.2,end:4.5},{word:'rise',start:4.5,end:5.2},{word:'from',start:5.2,end:5.5},{word:'the',start:5.5,end:5.8},{word:'shadows',start:5.8,end:7}] },
  { id: 's3', text: 'Praying for the light', start: 7, end: 10, words: [{word:'Praying',start:7,end:7.8},{word:'for',start:7.8,end:8.1},{word:'the',start:8.1,end:8.4},{word:'light',start:8.4,end:10}] },
  { id: 's4', text: 'To show me your soul', start: 10, end: 13.5, words: [{word:'To',start:10,end:10.3},{word:'show',start:10.3,end:11},{word:'me',start:11,end:11.3},{word:'your',start:11.3,end:11.8},{word:'soul',start:11.8,end:13.5}] },
  { id: 's5', text: 'In your eyes there\'s a spark', start: 13.5, end: 17, words: [{word:'In',start:13.5,end:13.8},{word:'your',start:13.8,end:14.2},{word:'eyes',start:14.2,end:15},{word:"there's",start:15,end:15.5},{word:'a',start:15.5,end:15.7},{word:'spark',start:15.7,end:17}] },
  { id: 's6', text: 'Be my light in the dark', start: 17, end: 20.5, words: [{word:'Be',start:17,end:17.3},{word:'my',start:17.3,end:17.6},{word:'light',start:17.6,end:18.5},{word:'in',start:18.5,end:18.8},{word:'the',start:18.8,end:19},{word:'dark',start:19,end:20.5}] },
  { id: 's7', text: 'Dreaming embers that call my name', start: 20.5, end: 24, words: [{word:'Dreaming',start:20.5,end:21.5},{word:'embers',start:21.5,end:22.5},{word:'that',start:22.5,end:22.8},{word:'call',start:22.8,end:23.3},{word:'my',start:23.3,end:23.5},{word:'name',start:23.5,end:24}] },
  { id: 's8', text: 'Give me the fire in your heart', start: 24, end: 28, words: [{word:'Give',start:24,end:24.5},{word:'me',start:24.5,end:24.8},{word:'the',start:24.8,end:25},{word:'fire',start:25,end:26},{word:'in',start:26,end:26.3},{word:'your',start:26.3,end:26.7},{word:'heart',start:26.7,end:28}] },
];

const SAMPLE_ASSETS: AssetFile[] = [
  { id: 'a1', name: 'Sunset Drive', type: 'video', thumbnail: '', duration: 10.5, date: '2d ago' },
  { id: 'a2', name: 'City Nights', type: 'video', thumbnail: '', duration: 8.2, date: '3d ago' },
  { id: 'a3', name: 'Ocean Waves', type: 'video', thumbnail: '', duration: 12.0, date: '5d ago' },
  { id: 'a4', name: 'Neon Glow', type: 'image', date: '1w ago' },
  { id: 'a5', name: 'Rooftop Session', type: 'video', thumbnail: '', duration: 6.5, date: '1w ago' },
  { id: 'a6', name: 'Studio Live', type: 'video', thumbnail: '', duration: 15.0, date: '2w ago' },
];

const TEXT_PRESETS = [
  { id: 'none', name: 'None', desc: 'Simple clean text' },
  { id: 'brick', name: 'Brick', desc: 'Bold block serif' },
  { id: 'stencil', name: 'Stencil', desc: 'Cutout with borders' },
  { id: 'heartless', name: 'Heartless', desc: 'Aggressive italic brush' },
  { id: 'fly', name: 'Fly', desc: 'Lightweight tracking' },
  { id: 'voltage', name: 'Voltage', desc: 'Cyan outer glow' },
];

export default function AllInOneStudio() {
  const [activeModule, setActiveModule] = useState<StudioModule>('overview');
  const modules: { id: StudioModule; icon: any; label: string }[] = [
    { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'lyrics', icon: FileText, label: 'Lyric Studio' },
    { id: 'assets', icon: FolderOpen, label: 'Assets' },
    { id: 'templates', icon: Layers, label: 'Templates' },
    { id: 'broll', icon: Film, label: 'B-Roll' },
    { id: 'cover', icon: ImageIcon, label: 'Cover Art' },
    { id: 'timeline', icon: Music, label: 'Timeline Editor' },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#090A0F] text-white overflow-hidden">
      {/* Top Navigation */}
      <header className="shrink-0 bg-[#090A0F] border-b border-[#12141C] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-[0.4em] uppercase italic text-primary">STUDIO</span>
          </div>
          <nav className="flex items-center gap-1">
            {modules.map(m => {
              const Icon = m.icon;
              return (
                <button key={m.id} onClick={() => setActiveModule(m.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest italic transition-all border-b-2',
                    activeModule === m.id
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent text-white/40 hover:text-white hover:border-white/20'
                  )}>
                  <Icon className="w-3.5 h-3.5" />
                  {m.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase italic tracking-widest hover:bg-primary hover:text-black transition-all">
            <Save className="w-3.5 h-3.5" /> Save
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-[#00E5FF] text-black font-black uppercase italic text-[10px] tracking-widest hover:bg-[#2979FF] transition-all">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            {activeModule === 'overview' && <OverviewDashboard onNavigate={setActiveModule} />}
            {activeModule === 'lyrics' && <LyricStudio />}
            {activeModule === 'assets' && <AssetManager />}
            {activeModule === 'templates' && <TemplateManager />}
            {activeModule === 'broll' && <BRollEngine />}
            {activeModule === 'cover' && <CoverArtStudio />}
            {activeModule === 'timeline' && <TimelineEditor />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* =========================================================================
 * MODULE 1: OVERVIEW DASHBOARD
 * ========================================================================= */
function OverviewDashboard({ onNavigate }: { onNavigate: (m: StudioModule) => void }) {
  const quote = useMemo(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'GOOD MORNING';
    if (hrs < 18) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  }, []);

  const cards = [
    { id: 'lyrics', icon: FileText, label: 'Lyric Studio', desc: 'Write songs with AI-powered suggestions, rhymes & chords', color: '#00E5FF' },
    { id: 'broll', icon: Film, label: 'B-Roll Engine', desc: 'Generate cinematic video clips from text prompts', color: '#2979FF' },
    { id: 'cover', icon: ImageIcon, label: 'Cover Art', desc: 'Professional album artwork in seconds', color: '#FF4D00' },
    { id: 'timeline', icon: Music, label: 'Timeline Editor', desc: 'Multi-track lyric video editor with beat sync', color: '#22C55E' },
  ];

  return (
    <div className="p-8 overflow-y-auto h-full custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Greeting */}
        <div>
          <div className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic mb-2">
            {quote}, CREATOR
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter text-white leading-none">
            All-In-One <span className="text-primary">Studio</span>
          </h1>
          <p className="text-white/40 italic mt-3 max-w-xl">
            Every tool you need — lyrics, assets, video, cover art. One workspace.
          </p>
        </div>

        {/* Resource Counters */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Templates', used: 3, total: Infinity, icon: Layers },
            { label: 'Exports', used: 2, total: 1200, icon: Download },
            { label: 'AI Generations', used: 5, total: 144, icon: Sparkles },
            { label: 'Cut Markers', used: 6, total: Infinity, icon: Scissors },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-[#12141C] border border-white/5 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">{s.label}</span>
                  <Icon className="w-4 h-4 text-white/20" />
                </div>
                <div className="text-3xl font-black italic text-white">
                  {s.used}<span className="text-white/20 text-lg ml-1">/ {s.total === Infinity ? '∞' : s.total}</span>
                </div>
                {s.total !== Infinity && (
                  <div className="mt-2 h-1 bg-white/5">
                    <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, (s.used / s.total) * 100)}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-4">
          {cards.map(c => {
            const Icon = c.icon;
            return (
              <button key={c.id} onClick={() => onNavigate(c.id as StudioModule)}
                className="group bg-[#12141C] border border-white/5 hover:border-primary/40 p-8 text-left transition-all relative overflow-hidden">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 border flex items-center justify-center" style={{ borderColor: `${c.color}55`, color: c.color }}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
                </div>
                <h3 className="text-2xl font-black italic text-white tracking-tight mb-2 group-hover:text-primary transition-colors">{c.label}</h3>
                <p className="text-[13px] text-white/40 italic leading-relaxed">{c.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-[#12141C] border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Recent Activity</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {[
              { title: 'Fire in Your Heart', status: 'Ready', time: '2m ago', color: '#22C55E' },
              { title: 'Neon Nights Cover', status: 'Exporting', time: '15m ago', color: '#2979FF' },
              { title: 'Sunset B-Roll Pack', status: 'Ready', time: '1h ago', color: '#22C55E' },
              { title: 'City Lights Template', status: 'Draft', time: '3h ago', color: '#FF4D00' },
            ].map(item => (
              <div key={item.title} className="shrink-0 w-56 bg-black/40 border border-white/5 p-4">
                <div className="text-xs font-bold text-white italic truncate mb-3">{item.title}</div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-white/30 uppercase tracking-widest font-mono">{item.time}</span>
                  <span className="text-[9px] font-black italic px-2 py-0.5 border" style={{ borderColor: `${item.color}40`, color: item.color, background: `${item.color}10` }}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Onboarding Checklist */}
        <div className="bg-[#12141C] border border-white/5 p-6">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Getting Started</span>
            <span className="text-[10px] font-black text-white/40 italic">3/5 Complete</span>
          </div>
          <div className="flex gap-3">
            {['Template', 'Project', 'Export', 'Artist Page', 'Cover Art'].map((step, i) => (
              <div key={step} className="flex items-center gap-3 flex-1">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black italic',
                  i < 3 ? 'bg-primary text-black' : 'bg-white/5 text-white/30'
                )}>
                  {i < 3 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn(
                  'text-[10px] font-black uppercase tracking-widest italic',
                  i < 3 ? 'text-white' : 'text-white/30'
                )}>{step}</span>
                {i < 4 && <div className="flex-1 h-[1px] bg-white/5" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
 * MODULE 2: LYRIC STUDIO
 * ========================================================================= */
function LyricStudio() {
  const [genre, setGenre] = useState('Pop');
  const [lyrics, setLyrics] = useState(SAMPLE_LYRICS);
  const [editingSegment, setEditingSegment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [activeTab, setActiveTab] = useState<'lyrics' | 'rhymes' | 'thesaurus' | 'verse' | 'chords'>('lyrics');
  const [rhymeWord, setRhymeWord] = useState('heart');
  const [suggestions] = useState([
    'Chasing the warmth of the flame we lost',
    'Can you feel the heat',
    'The truth that burns within',
    'What if the flames could carry me to you?',
    'A wildfire of memories, consuming my soul',
    'A whisper of desire',
    'I want it all and nothing less',
  ]);

  const startEditing = (seg: LyricSegment) => {
    setEditingSegment(seg.id);
    setEditText(seg.text);
  };

  const saveEdit = () => {
    if (!editingSegment) return;
    setLyrics(prev => prev.map(s => s.id === editingSegment ? { ...s, text: editText } : s));
    setEditingSegment(null);
    toast.success('Line updated');
  };

  const totalSyllables = useMemo(() => {
    return lyrics.map(s => s.text.split(' ').reduce((sum, w) => sum + Math.max(1, w.length > 4 ? 2 : w.length > 2 ? 2 : 1), 0));
  }, [lyrics]);

  const chordProgression = useMemo(() => {
    const progression = Object.values(CHORD_PAIRS)[0];
    return lyrics.map((_, i) => progression[i % progression.length]);
  }, [lyrics]);

  return (
    <div className="flex h-full">
      {/* Left - Lyric Editor */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-white/5">
        {/* Genre Selector */}
        <div className="shrink-0 bg-[#12141C] border-b border-white/5 px-8 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Genre</span>
          </div>
          <select value={genre} onChange={e => setGenre(e.target.value)}
            className="bg-black border border-white/10 px-4 py-2 text-xs font-mono text-white outline-none focus:border-primary uppercase tracking-widest">
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <div className="ml-auto flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest italic hover:border-primary/40 transition-all">
              <Copy className="w-3 h-3" /> Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest italic hover:border-primary/40 transition-all">
              <Share2 className="w-3 h-3" /> Collab
            </button>
          </div>
        </div>

        {/* Lyric Lines */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-4">
          {lyrics.map((seg, i) => {
            const chords = chordProgression[i];
            const syl = totalSyllables[i];
            return (
              <div key={seg.id} className="group">
                {/* Chord indicator */}
                <div className="flex items-center gap-2 mb-1">
                  {[chords, chords === chordProgression[i] ? chordProgression[(i + 1) % chordProgression.length] : ''].filter(Boolean).map((c, ci) => (
                    <button key={ci} className="text-[10px] font-bold text-primary/80 hover:text-primary tracking-wider font-mono">{c}</button>
                  ))}
                </div>
                {/* Lyric line */}
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-1 pt-2">
                    {syl.toString().split('').map((d, di) => (
                      <span key={di} className="text-[8px] font-mono text-white/20">{d}</span>
                    ))}
                  </div>
                  <div className="flex-1">
                    {editingSegment === seg.id ? (
                      <div className="space-y-2">
                        <input type="text" value={editText} onChange={e => setEditText(e.target.value)}
                          className="w-full bg-black border border-primary/50 px-4 py-3 text-lg italic text-white outline-none font-medium"
                          autoFocus onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingSegment(null); }} />
                        <div className="flex gap-2">
                          <button onClick={saveEdit} className="text-[9px] font-black px-3 py-1 bg-primary text-black uppercase tracking-widest italic">Save</button>
                          <button onClick={() => setEditingSegment(null)} className="text-[9px] font-black px-3 py-1 border border-white/20 text-white/60 uppercase tracking-widest italic">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-lg italic text-white/90 font-medium leading-relaxed tracking-wide"
                          onDoubleClick={() => startEditing(seg)}>
                          {seg.text}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <button onClick={() => startEditing(seg)} className="p-1 hover:text-primary"><FileText className="w-3 h-3" /></button>
                          <button className="p-1 hover:text-primary"><Copy className="w-3 h-3" /></button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom suggestions bar */}
        <div className="shrink-0 bg-[#12141C] border-t border-white/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">AI Suggestions</span>
          </div>
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
            {suggestions.slice(0, 4).map((s, i) => (
              <button key={i} onClick={() => {
                const seg = lyrics.find(l => l.id === editingSegment);
                if (seg) setEditText(s);
                else toast('Click a line to edit it first');
              }}
                className="shrink-0 text-left px-4 py-2 bg-black/40 border border-white/5 hover:border-primary/40 text-[11px] italic text-white/60 hover:text-white transition-all">
                "{s}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Tools Panel */}
      <div className="w-80 bg-[#12141C] flex flex-col overflow-hidden">
        <div className="shrink-0 flex border-b border-white/5">
          {[
            { id: 'lyrics' as const, label: 'Lyrics', icon: FileText },
            { id: 'rhymes' as const, label: 'Rhymes', icon: Hash },
            { id: 'thesaurus' as const, label: 'Thesaurus', icon: BookOpen },
            { id: 'verse' as const, label: 'Verse Gen', icon: Zap },
            { id: 'chords' as const, label: 'Chords', icon: Music2 },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-3 text-[8px] font-black uppercase tracking-widest italic transition-all',
                  activeTab === t.id ? 'text-primary bg-primary/5 border-b-2 border-primary' : 'text-white/30 hover:text-white'
                )}>
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {activeTab === 'rhymes' && (
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest italic block mb-2">Rhyme with</label>
                <input type="text" value={rhymeWord} onChange={e => setRhymeWord(e.target.value)}
                  className="w-full bg-black border border-white/10 px-4 py-2 text-xs text-white outline-none focus:border-primary" />
              </div>
              <div className="space-y-1">
                {['part', 'smart', 'start', 'apart', 'chart', 'dark', 'mark', 'park'].map(w => (
                  <button key={w} onClick={() => setRhymeWord(w)}
                    className="w-full text-left px-3 py-2 text-xs italic text-white/60 hover:text-white hover:bg-white/5 transition-all">
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'thesaurus' && (
            <div className="space-y-3">
              {['fire', 'burn', 'light', 'shadow', 'spark'].map(w => (
                <div key={w} className="bg-black/40 border border-white/5 p-3">
                  <div className="text-xs font-bold text-white italic mb-1">{w}</div>
                  <div className="text-[10px] text-white/40 italic">
                    {w === 'fire' ? 'flame, blaze, inferno, passion' :
                     w === 'burn' ? 'ignite, blaze, smolder, glow' :
                     w === 'light' ? 'illuminate, bright, dawn, radiance' :
                     w === 'shadow' ? 'shade, silhouette, darkness, eclipse' :
                     'spark, gleam, flash, glint'}
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'verse' && (
            <div className="space-y-4">
              <p className="text-[11px] italic text-white/40">Generate verse structures based on your genre and theme.</p>
              <div className="space-y-2">
                {['8-bar verse', '16-bar verse', 'Hook/Chorus', 'Bridge', 'Pre-chorus'].map(v => (
                  <button key={v} onClick={() => toast.success(`${v} generated`)}
                    className="w-full text-left px-4 py-3 bg-black/40 border border-white/5 hover:border-primary/40 text-xs italic text-white/70 hover:text-white transition-all">
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'chords' && (
            <div className="space-y-4">
              <p className="text-[11px] italic text-white/40">Suggested chord progression for {genre}.</p>
              <div className="flex flex-wrap gap-2">
                {chordProgression.slice(0, 8).map((c, i) => (
                  <button key={i} onClick={() => toast.info(`Playing ${c}`)}
                    className="px-4 py-2 bg-black/40 border border-primary/30 text-primary text-xs font-mono font-bold hover:bg-primary/20 transition-all">
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'lyrics' && (
            <div className="space-y-3">
              <button onClick={() => toast.success('New suggestions generated')}
                className="w-full py-3 bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest italic hover:bg-primary hover:text-black transition-all">
                <Sparkles className="w-3.5 h-3.5 inline mr-2" />New Suggestions
              </button>
              <div className="space-y-2 mt-4">
                {suggestions.map((s, i) => (
                  <div key={i} className="px-3 py-2 bg-black/40 border border-white/5 text-[11px] italic text-white/60 leading-relaxed cursor-pointer hover:border-primary/40 hover:text-white transition-all">
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
 * MODULE 3: ASSET MANAGER
 * ========================================================================= */
function AssetManager() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = useState<string | null>('ai-generated');

  const folders = [
    { id: 'ai-generated', label: 'AI Generated', icon: Sparkles },
    { id: 'afrohouse', label: 'Afrohouse v1', icon: Music2 },
    { id: 'dj-edits', label: 'DJ Edits', icon: Scissors },
    { id: 'broll', label: 'B-Roll', icon: Film },
  ];

  const stockLibs = [
    { id: 'studio', label: 'Studio', icon: Mic2 },
    { id: 'live', label: 'Live Performance', icon: Music2 },
    { id: 'club', label: 'Club / Night', icon: CircleDot },
    { id: 'pool', label: 'Pool Party', icon: Sun },
    { id: 'yacht', label: 'Yacht', icon: Monitor },
    { id: 'city', label: 'Bay Area', icon: Monitor },
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-[#12141C] border-r border-white/5 p-4 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-4">YOUR DRIVE</div>
        <div className="space-y-1 mb-6">
          {folders.map(f => {
            const Icon = f.icon;
            return (
              <button key={f.id} onClick={() => setSelectedFolder(f.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-[11px] italic transition-all',
                  selectedFolder === f.id ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-white/50 hover:text-white hover:bg-white/5'
                )}>
                <Icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            );
          })}
        </div>
        <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-4">STOCK LIBRARIES</div>
        <div className="space-y-1">
          {stockLibs.map(f => {
            const Icon = f.icon;
            return (
              <button key={f.id} onClick={() => setSelectedFolder(f.id)}
                className="w-full flex items-center gap-3 px-3 py-2 text-[11px] italic text-white/50 hover:text-white hover:bg-white/5 transition-all">
                <Icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black italic text-white">
              {folders.find(f => f.id === selectedFolder)?.label || 'Assets'}
            </h2>
            <span className="text-[10px] font-mono text-white/30">{SAMPLE_ASSETS.length} files</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex border border-white/10">
              <button onClick={() => setViewMode('grid')} className={cn('p-2', viewMode === 'grid' ? 'bg-white text-black' : 'text-white/40')}>
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={cn('p-2', viewMode === 'list' ? 'bg-white text-black' : 'text-white/40')}>
                <List className="w-4 h-4" />
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 text-primary text-[9px] font-black uppercase tracking-widest italic hover:bg-primary hover:text-black transition-all">
              <Upload className="w-3.5 h-3.5" /> Import
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-4 gap-4">
            {SAMPLE_ASSETS.map(a => (
              <div key={a.id} className="group bg-black/40 border border-white/5 hover:border-primary/40 transition-all cursor-pointer">
                <div className="aspect-video bg-[#090A0F] flex items-center justify-center relative">
                  {a.type === 'video' ? <Video className="w-8 h-8 text-white/20" /> : <ImageIcon className="w-8 h-8 text-white/20" />}
                  {a.duration && (
                    <span className="absolute bottom-2 right-2 text-[9px] font-mono bg-black/80 px-2 py-0.5 text-white/60">{a.duration}s</span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <button className="p-2 bg-white/20 hover:bg-primary/80 transition-all"><Eye className="w-4 h-4" /></button>
                    <button className="p-2 bg-white/20 hover:bg-primary/80 transition-all"><Download className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-[11px] font-bold text-white italic truncate">{a.name}</div>
                  <div className="text-[9px] text-white/30 italic mt-1">{a.date}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {SAMPLE_ASSETS.map(a => (
              <div key={a.id} className="flex items-center gap-4 px-4 py-3 bg-black/20 border border-white/5 hover:border-white/20 transition-all cursor-pointer group">
                {a.type === 'video' ? <Video className="w-4 h-4 text-white/30" /> : <ImageIcon className="w-4 h-4 text-white/30" />}
                <span className="flex-1 text-xs italic text-white/80">{a.name}</span>
                {a.duration && <span className="text-[10px] font-mono text-white/30">{a.duration}s</span>}
                <span className="text-[10px] text-white/30">{a.date}</span>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                  <button className="p-1 hover:text-primary"><Eye className="w-3 h-3" /></button>
                  <button className="p-1 hover:text-primary"><Star className="w-3 h-3" /></button>
                  <button className="p-1 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
 * MODULE 4: TEMPLATE MANAGER
 * ========================================================================= */
function TemplateManager() {
  const [templates] = useState<Template[]>([
    { id: 't1', name: 'THE WORLD IS COLD 02', date: '2026-06-15', clipDuration: 30, bpm: 146, projectCount: 3, projects: ['Project A', 'Project B', 'Project C'] },
    { id: 't2', name: 'AURORA PLAYROOM (PART 1)', date: '2026-06-10', clipDuration: 30, bpm: 120, projectCount: 1, projects: ['Aurora v1'] },
    { id: 't3', name: 'NEON NIGHTS', date: '2026-05-28', clipDuration: 15, bpm: 128, projectCount: 5, projects: ['Night Drive', 'City Lights', 'Neon v3', 'Retro Wave', 'Synth City'] },
    { id: 't4', name: 'ACOUSTIC SESSIONS', date: '2026-05-20', clipDuration: 60, bpm: 90, projectCount: 2, projects: ['Unplugged', 'Stripped Down'] },
  ]);

  return (
    <div className="p-8 overflow-y-auto h-full custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black italic text-white tracking-tight">Templates</h2>
            <p className="text-white/40 italic mt-1 text-sm">Reusable blueprints for your video projects</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest italic hover:bg-primary hover:text-black transition-all">
            <Plus className="w-4 h-4" /> Create Template
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {templates.map(t => (
            <div key={t.id} className="bg-[#12141C] border border-white/5 hover:border-primary/40 transition-all p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-black italic text-white tracking-tight mb-1">{t.name}</h3>
                  <div className="flex items-center gap-3 text-[10px] text-white/30 italic">
                    <span>{t.date}</span>
                    <span>·</span>
                    <span>{t.clipDuration}s</span>
                    <span>·</span>
                    <span>{t.bpm} BPM</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-black text-white/30 uppercase tracking-widest italic">Projects</div>
                  <div className="text-2xl font-black italic text-white">{t.projectCount}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {t.projects.map(p => (
                  <span key={p} className="text-[9px] px-2 py-0.5 bg-black/40 border border-white/10 text-white/40 italic">{p}</span>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                <button className="flex-1 py-2 bg-primary/10 border border-primary/30 text-primary text-[9px] font-black uppercase tracking-widest italic hover:bg-primary hover:text-black transition-all">
                  View Projects
                </button>
                <button className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest italic hover:border-primary/40 transition-all">
                  + New Project
                </button>
                <button className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest italic hover:border-primary/40 transition-all">
                  Edit
                </button>
                <button className="px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-black uppercase tracking-widest italic hover:bg-red-500/20 transition-all">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
 * MODULE 5: B-ROLL ENGINE
 * ========================================================================= */
function BRollEngine() {
  const [prompt, setPrompt] = useState('');
  const [shakes, setShakes] = useState(7);
  const [timeOfDay, setTimeOfDay] = useState(50);
  const [environment, setEnvironment] = useState('rooftop at night');
  const [wardrobe, setWardrobe] = useState('black leather jacket');
  const [handheld, setHandheld] = useState(true);
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [jobs, setJobs] = useState<BrollJob[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) { toast.error('Describe a shot first'); return; }
    setIsGenerating(true);
    const job: BrollJob = { id: `b${Date.now()}`, prompt, status: 'generating' };
    setJobs(prev => [job, ...prev]);
    setTimeout(() => {
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'done', thumbnailUrl: '' } : j));
      setIsGenerating(false);
      toast.success('B-roll clips generated');
    }, 3000);
  };

  return (
    <div className="flex h-full">
      {/* Left - Controls */}
      <div className="w-96 bg-[#12141C] border-r border-white/5 p-6 overflow-y-auto custom-scrollbar space-y-6">
        <h3 className="text-lg font-black italic text-white">B-Roll Generator</h3>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest italic block">Prompt</label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3}
            placeholder="Describe the b-roll you want... Try 'driving through downtown at sunset'"
            className="w-full bg-black border border-white/10 px-4 py-3 text-xs text-white outline-none focus:border-primary resize-none italic" />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest italic block">Shots Duration</label>
          <input type="range" min={3} max={15} value={shakes} onChange={e => setShakes(Number(e.target.value))}
            className="w-full accent-primary" />
          <div className="flex justify-between text-[9px] text-white/30 italic">
            <span>Fewer</span><span>{shakes} clips - ~{(shakes * 0.3).toFixed(1)}s each</span><span>More</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest italic block">Time of Day</label>
          <input type="range" min={0} max={100} value={timeOfDay} onChange={e => setTimeOfDay(Number(e.target.value))}
            className="w-full accent-primary"
            style={{ background: `linear-gradient(to right, #1a1a2e, #ff6b35, #87ceeb, #ffd700)` }} />
          <div className="flex justify-between text-[9px] text-white/30 italic">
            <span>Auto</span><span>Early</span><span>Late</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest italic block">Environment</label>
          <input type="text" value={environment} onChange={e => setEnvironment(e.target.value)}
            className="w-full bg-black border border-white/10 px-4 py-2 text-xs text-white outline-none focus:border-primary" />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest italic block">Wardrobe</label>
          <input type="text" value={wardrobe} onChange={e => setWardrobe(e.target.value)}
            className="w-full bg-black border border-white/10 px-4 py-2 text-xs text-white outline-none focus:border-primary" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">Handheld Shake</span>
          <button onClick={() => setHandheld(!handheld)}
            className={cn('px-4 py-2 text-[9px] font-black uppercase tracking-widest italic border transition-all',
              handheld ? 'bg-primary text-black border-primary' : 'border-white/10 text-white/40')}>
            {handheld ? 'ON' : 'OFF'}
          </button>
        </div>
        <div className="flex gap-2">
          {['720p', '1080p'].map(r => (
            <button key={r} onClick={() => setResolution(r as '720p' | '1080p')}
              className={cn('flex-1 py-2 text-[9px] font-black uppercase tracking-widest italic border transition-all',
                resolution === r ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white/30')}>
              {r}
            </button>
          ))}
        </div>
        <button onClick={handleGenerate} disabled={isGenerating}
          className="w-full py-4 bg-[#00E5FF] text-black font-black uppercase italic text-[10px] tracking-widest hover:bg-[#2979FF] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {isGenerating ? 'Generating...' : 'Generate B-Roll'}
        </button>
      </div>

      {/* Right - Output Gallery */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {jobs.length === 0 ? (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-white/5">
            <div className="text-center">
              <Film className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <p className="text-white/30 italic">No b-roll yet.</p>
              <p className="text-[11px] text-white/20 italic mt-1">Describe a shot on the left and hit Generate.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {jobs.map(j => (
              <div key={j.id} className="bg-black/40 border border-white/5 overflow-hidden">
                <div className="aspect-video bg-[#090A0F] flex items-center justify-center">
                  {j.status === 'generating' ? (
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  ) : j.status === 'done' ? (
                    <Video className="w-8 h-8 text-white/30" />
                  ) : null}
                </div>
                <div className="p-3">
                  <div className="text-[10px] italic text-white/60 truncate">{j.prompt}</div>
                  <div className="text-[9px] text-white/30 mt-1">
                    {j.status === 'generating' ? 'Generating...' : j.status === 'done' ? 'Ready' : 'Failed'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
 * MODULE 6: COVER ART STUDIO
 * ========================================================================= */
function CoverArtStudio() {
  const [prompt, setPrompt] = useState('A solitary figure on a desert horizon at golden hour, washed in deep amber. Editorial.');
  const [title, setTitle] = useState('NIGHTDRIVE');
  const [artist, setArtist] = useState('Artist Name');
  const [parental, setParental] = useState(false);
  const [resolution, setResolution] = useState<'2K' | 'medium'>('2K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGallery(prev => [URL.createObjectURL(new Blob(['placeholder'], { type: 'image/png' })), ...prev]);
      setIsGenerating(false);
      toast.success('Cover art generated');
    }, 2500);
  };

  return (
    <div className="flex h-full">
      {/* Left - Controls */}
      <div className="w-96 bg-[#12141C] border-r border-white/5 p-6 overflow-y-auto custom-scrollbar space-y-6">
        <h3 className="text-lg font-black italic text-white">Cover Art Studio</h3>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest italic block">Model</label>
          <select className="w-full bg-black border border-white/10 px-4 py-2 text-xs text-white outline-none focus:border-primary">
            <option>GPT Image 2</option>
            <option>Stable Diffusion XL</option>
            <option>Flux Pro</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest italic block">Prompt</label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4}
            className="w-full bg-black border border-white/10 px-4 py-3 text-xs text-white outline-none focus:border-primary resize-none italic" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest italic block">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full bg-black border border-white/10 px-4 py-2 text-xs text-white outline-none focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest italic block">Artist</label>
            <input type="text" value={artist} onChange={e => setArtist(e.target.value)}
              className="w-full bg-black border border-white/10 px-4 py-2 text-xs text-white outline-none focus:border-primary" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">Parental Advisory</span>
          <button onClick={() => setParental(!parental)}
            className={cn('px-4 py-2 text-[9px] font-black uppercase tracking-widest italic border transition-all',
              parental ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'border-white/10 text-white/40')}>
            {parental ? 'ON' : 'OFF'}
          </button>
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest italic block">Resolution</label>
          <div className="flex gap-2">
            {['2K', 'medium'].map(r => (
              <button key={r} onClick={() => setResolution(r as '2K' | 'medium')}
                className={cn('flex-1 py-2 text-[9px] font-black uppercase tracking-widest italic border transition-all',
                  resolution === r ? 'bg-white text-black border-white' : 'border-white/10 text-white/40')}>
                {r === '2K' ? '2K' : 'Medium'}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleGenerate} disabled={isGenerating}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-black uppercase italic text-[10px] tracking-widest hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
          {isGenerating ? 'Generating...' : 'Generate Cover Art'}
        </button>
      </div>

      {/* Right - Preview & Gallery */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {gallery.length === 0 ? (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-white/5">
            <div className="text-center">
              <ImageIcon className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <p className="text-white/30 italic">No cover art yet.</p>
              <p className="text-[11px] text-white/20 italic mt-1">Describe your cover on the left and generate.</p>
              {title && (
                <div className="mt-8 inline-block">
                  <div className="w-80 h-80 border-2 border-white/10 bg-[#090A0F] flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="text-4xl font-black italic text-white tracking-tight leading-tight">{title}</div>
                      <div className="text-sm italic text-white/40 mt-4">{artist}</div>
                      {parental && <div className="mt-4 px-4 py-1 border border-white/20 text-[10px] font-black text-white/60 tracking-widest">PARENTAL ADVISORY</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {gallery.map((g, i) => (
              <div key={i} className="aspect-square bg-[#090A0F] border border-white/5 flex items-center justify-center relative group">
                <div className="text-white/20 italic">Cover {i + 1}</div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                  <button className="p-2 bg-white/20 hover:bg-primary/80"><Eye className="w-5 h-5" /></button>
                  <button className="p-2 bg-white/20 hover:bg-primary/80"><Download className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
 * MODULE 7: MULTI-TRACK TIMELINE EDITOR
 * ========================================================================= */
function TimelineEditor() {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration] = useState(30);
  const [bpm] = useState(120);
  const [zoom, setZoom] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState('voltage');
  const [applyAll, setApplyAll] = useState(true);
  const [lockedClips, setLockedClips] = useState<Record<string, boolean>>({});
  const [visibleClips, setVisibleClips] = useState<Record<string, boolean>>({});
  const [activeRightTab, setActiveRightTab] = useState<'lyrics' | 'style' | 'visuals' | 'hook'>('style');
  const [activeStyleTab, setActiveStyleTab] = useState<'preset' | 'textcolor' | 'effects' | 'animation'>('preset');
  const intervalRef = useRef<number | null>(null);

  const togglePlay = () => {
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      intervalRef.current = window.setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) { setIsPlaying(false); return 0; }
          return prev + 0.05;
        });
      }, 50);
    }
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const activeSegment = useMemo(() => {
    return SAMPLE_LYRICS.find(s => currentTime >= s.start && currentTime <= s.end);
  }, [currentTime]);

  const cutMarkers = useMemo(() => {
    const markers = [];
    for (let t = 0; t < duration; t += 60 / bpm) markers.push(t);
    return markers;
  }, [duration, bpm]);

  const toggleLock = (id: string) => setLockedClips(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleVisible = (id: string) => setVisibleClips(prev => ({ ...prev, [id]: !(prev[id] ?? true) }));

  return (
    <div className="flex flex-col h-full">
      {/* Main workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left - Asset panel */}
        <div className="w-64 bg-[#12141C] border-r border-white/5 p-4 overflow-y-auto custom-scrollbar">
          <div className="flex border-b border-white/5 mb-4">
            {['Clips', 'Generate'].map(t => (
              <button key={t} className="flex-1 py-2 text-[9px] font-black uppercase tracking-widest italic text-primary border-b-2 border-primary">
                {t}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="aspect-square bg-black/40 border border-white/5 flex items-center justify-center cursor-pointer hover:border-primary/40 transition-all">
                <Video className="w-5 h-5 text-white/20" />
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-black/40 border border-white/5">
            <div className="text-[9px] text-white/40 mb-1 italic">1 selected</div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-white/60 uppercase italic">Random Start</span>
              <div className="w-8 h-4 bg-primary rounded-full relative cursor-pointer">
                <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 right-0.5" />
              </div>
            </div>
            <button className="w-full mt-3 py-2 bg-[#00E5FF] text-black text-[9px] font-black uppercase tracking-widest italic flex items-center justify-center gap-2 hover:bg-[#2979FF] transition-all">
              <Shuffle className="w-3 h-3" /> Shuffle
            </button>
          </div>
        </div>

        {/* Center - Video Preview */}
        <div className="flex-1 flex flex-col items-center justify-center bg-[#090A0F] p-8">
          <div className="relative w-[360px] aspect-[9/16] bg-black border border-white/10 overflow-hidden">
            {activeSegment && (
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <p className="text-3xl font-black italic text-white text-center leading-tight tracking-tight"
                  style={selectedPreset === 'voltage' ? { textShadow: '0 0 20px #00E5FF, 0 0 40px #00E5FF, 0 0 80px #00E5FF' } :
                    selectedPreset === 'stencil' ? { WebkitTextStroke: '2px white', color: 'transparent' } :
                    selectedPreset === 'brick' ? { fontWeight: 900, letterSpacing: '0.1em' } :
                    selectedPreset === 'heartless' ? { fontStyle: 'italic', fontWeight: 900, transform: 'skewX(-8deg)' } :
                    selectedPreset === 'fly' ? { letterSpacing: '0.3em', fontWeight: 300 } :
                    {}}
                >
                  "{activeSegment.text}"
                </p>
              </div>
            )}
            {!activeSegment && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white/20 italic">Waiting for next line...</p>
              </div>
            )}
          </div>
          {/* Playback controls */}
          <div className="flex items-center gap-4 mt-4 w-[360px]">
            <button className="text-white/40 hover:text-white"><SkipBack className="w-4 h-4" /></button>
            <button onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-primary transition-all">
              {isPlaying ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button className="text-white/40 hover:text-white"><SkipForward className="w-4 h-4" /></button>
            <span className="flex-1 text-[10px] font-mono text-white/40 text-right">{currentTime.toFixed(1)}s / {duration}s <span className="text-primary ml-2">{bpm} BPM</span></span>
          </div>
        </div>

        {/* Right - Style Inspector */}
        <div className="w-80 bg-[#12141C] border-l border-white/5 flex flex-col overflow-hidden">
          <div className="flex border-b border-white/5">
            {[
              { id: 'lyrics' as const, label: 'Lyrics' },
              { id: 'style' as const, label: 'Style' },
              { id: 'visuals' as const, label: 'Visuals' },
              { id: 'hook' as const, label: 'Hook' },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveRightTab(t.id)}
                className={cn(
                  'flex-1 py-3 text-[8px] font-black uppercase tracking-widest italic transition-all',
                  activeRightTab === t.id ? 'text-primary border-b-2 border-primary' : 'text-white/30 hover:text-white'
                )}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex border-b border-white/5">
            {[
              { id: 'preset' as const, label: 'Preset' },
              { id: 'textcolor' as const, label: 'Text & Color' },
              { id: 'effects' as const, label: 'Effects' },
              { id: 'animation' as const, label: 'Animation' },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveStyleTab(t.id)}
                className={cn(
                  'flex-1 py-2 text-[7px] font-black uppercase tracking-widest italic transition-all',
                  activeStyleTab === t.id ? 'text-primary' : 'text-white/20 hover:text-white/50'
                )}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {activeStyleTab === 'preset' && (
              <div className="grid grid-cols-2 gap-2">
                {TEXT_PRESETS.map(p => (
                  <button key={p.id} onClick={() => setSelectedPreset(p.id)}
                    className={cn(
                      'p-3 border text-left transition-all',
                      selectedPreset === p.id ? 'border-primary bg-primary/10' : 'border-white/5 bg-black/40 hover:border-white/20'
                    )}>
                    <div className="text-[10px] font-black italic text-white">{p.name}</div>
                    <div className="text-[8px] text-white/30 italic mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            )}
            {activeStyleTab === 'textcolor' && (
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest italic block mb-2">Font Size</label>
                  <input type="range" min={12} max={72} defaultValue={48} className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest italic block mb-2">Color</label>
                  <div className="grid grid-cols-6 gap-2">
                    {['#FFFFFF','#00E5FF','#FF4D00','#22C55E','#FFD700','#FF0066'].map(c => (
                      <button key={c} onClick={() => {}}
                        className="w-8 h-8 rounded-full border-2 border-white/10 hover:border-white transition-all"
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeStyleTab === 'effects' && (
              <div className="space-y-3">
                {['Glow', 'Shadow', 'Outline', 'Gradient', 'Neon'].map(e => (
                  <label key={e} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked={e === 'Glow'} className="accent-primary" />
                    <span className="text-xs italic text-white/70">{e}</span>
                  </label>
                ))}
              </div>
            )}
            {activeStyleTab === 'animation' && (
              <div className="space-y-3">
                {['Fade In', 'Slide Up', 'Scale In', 'Typewriter', 'Bounce In'].map(a => (
                  <label key={a} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="anim" defaultChecked={a === 'Fade In'} className="accent-primary" />
                    <span className="text-xs italic text-white/70">{a}</span>
                  </label>
                ))}
              </div>
            )}
            <div className="mt-6 pt-4 border-t border-white/5">
              <button onClick={() => setApplyAll(!applyAll)}
                className={cn(
                  'w-full py-3 text-[9px] font-black uppercase tracking-widest italic border transition-all',
                  applyAll ? 'bg-primary/10 border-primary text-primary' : 'border-white/10 text-white/40'
                )}>
                {applyAll ? '✓ APPLY TO ALL LYRICS' : 'Apply to All Lyrics'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Timeline */}
      <div className="shrink-0 bg-[#12141C] border-t border-white/5">
        {/* Timeline controls */}
        <div className="flex items-center gap-4 px-6 py-2 border-b border-white/5">
          <div className="flex items-center gap-2 text-[9px] font-black text-white/30 uppercase tracking-widest italic">
            <button className="hover:text-white transition-all"><AlignLeft className="w-3 h-3" /></button>
            <span className="ml-2">ZOOM</span>
            <input type="range" min={0.5} max={3} step={0.1} value={zoom} onChange={e => setZoom(Number(e.target.value))}
              className="w-20 accent-primary" />
            <span className="text-white/50">{bpm} BPM</span>
          </div>
          <div className="flex items-center gap-2 ml-auto text-[9px] font-black text-white/30 uppercase tracking-widest italic">
            <span>T: <button className="hover:text-white"><Eye className="w-3 h-3 inline" /></button></span>
            <span>V: <button className="hover:text-white"><Eye className="w-3 h-3 inline" /></button></span>
            <span>A: <button className="hover:text-white"><Eye className="w-3 h-3 inline" /></button></span>
            <button className="ml-2 px-2 py-1 border border-white/10 hover:border-white/40 text-white/50 italic">? Tips</button>
          </div>
        </div>

        {/* Timeline tracks */}
        <div className="overflow-x-auto custom-scrollbar">
          <div className="relative" style={{ width: `${duration * 20 * zoom}px`, minWidth: '100%' }}>
            {/* Time ruler */}
            <div className="flex h-6 border-b border-white/5">
              {Array.from({ length: duration + 1 }, (_, i) => (
                <div key={i} className="text-[7px] font-mono text-white/20 px-0.5 border-l border-white/5"
                  style={{ width: `${20 * zoom}px`, minWidth: 10 }}>
                  {i % 5 === 0 ? `${i}s` : ''}
                </div>
              ))}
            </div>

            {/* Track T: Lyrics */}
            <div className="h-10 border-b border-white/5 relative">
              {SAMPLE_LYRICS.map(seg => (
                <div key={seg.id} className="absolute top-1 h-8 bg-primary/20 border border-primary/40 flex items-center px-2 cursor-pointer hover:bg-primary/30 transition-all group"
                  style={{ left: `${seg.start * 20 * zoom}px`, width: `${(seg.end - seg.start) * 20 * zoom}px`, minWidth: 20 }}>
                  <span className="text-[7px] font-mono text-white/60 truncate w-full group-hover:text-white">{seg.text}</span>
                </div>
              ))}
              {/* Current time indicator */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-[#00E5FF] z-10"
                style={{ left: `${currentTime * 20 * zoom}px` }} />
            </div>

            {/* Track V: Video clips */}
            <div className="h-10 border-b border-white/5 relative">
              {[1, 2, 3, 4].map(i => {
                const clipId = `v${i}`;
                const start = (i - 1) * 7;
                const width = 7;
                return (
                  <div key={i} className={cn(
                    'absolute top-1 h-8 flex items-center px-2 transition-all',
                    visibleClips[clipId] === false ? 'opacity-30' : 'opacity-100'
                  )}
                    style={{ left: `${start * 20 * zoom}px`, width: `${width * 20 * zoom}px`, minWidth: 20, backgroundColor: lockedClips[clipId] ? '#1a3a1a' : '#1a1a2e', border: `1px solid ${lockedClips[clipId] ? '#22C55E40' : '#2979FF40'}` }}>
                    <span className="text-[7px] font-mono text-white/40 truncate flex-1">Clip {i}</span>
                    <button onClick={() => toggleLock(clipId)} className="p-0.5 hover:text-primary">
                      {lockedClips[clipId] ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5 text-white/30" />}
                    </button>
                    <button onClick={() => toggleVisible(clipId)} className="p-0.5 hover:text-primary">
                      <Eye className="w-2.5 h-2.5 text-white/30" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Track A: Waveform */}
            <div className="h-12 border-b border-white/5 relative">
              <canvas className="w-full h-full opacity-30" />
              {/* Beat markers */}
              {cutMarkers.map((marker, i) => (
                <div key={i} className="absolute top-0 bottom-0 w-px bg-white/10"
                  style={{ left: `${marker * 20 * zoom}px` }} />
              ))}
              {/* Playhead */}
              <div className="absolute top-0 bottom-0 w-px bg-[#00E5FF] z-10 shadow-[0_0_8px_rgba(0,229,255,0.5)]"
                style={{ left: `${currentTime * 20 * zoom}px` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
