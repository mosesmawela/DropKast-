import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, FileText, Image as ImageIcon, Video, Music, Layers,
  Sparkles, Play, Download, Save, Share2, Upload, Search,
  FolderOpen, Trash2, Plus, Settings, Clock, CheckCircle2,
  Loader2, ArrowRight, ArrowLeft, RefreshCw, Copy,
  Scissors, Grid3X3, List, File, ChevronRight, ChevronDown,
  Music2, Palette, Type, Film, GripVertical, Eye, EyeOff, Lock,
  Unlock, Shuffle, SkipBack, SkipForward, Volume2,
  BookOpen, Zap, Maximize2, Minimize2, Sliders, Wand2,
  Monitor, Speaker, CircleDot, Sun, Mic2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

type StudioModule = 'overview' | 'lyrics' | 'assets' | 'templates' | 'broll' | 'cover' | 'timeline';

interface LyricWord { word: string; start: number; end: number; }
interface LyricSegment { id: string; text: string; start: number; end: number; words: LyricWord[]; }
interface AssetFile { id: string; name: string; type: 'video' | 'image' | 'audio' | 'folder'; url?: string; thumbnail?: string; duration?: number; date: string; }
interface Template { id: string; name: string; date: string; clipDuration: number; bpm: number; projectCount: number; projects: string[]; }
interface BrollJob { id: string; prompt: string; status: 'queued' | 'generating' | 'done' | 'failed'; outputUrl?: string; thumbnailUrl?: string; }
interface TimelineClip { id: string; name: string; type: 'video' | 'image' | 'audio'; start: number; end: number; track: 'V' | 'A'; locked: boolean; visible: boolean; color: string; }
interface CutMarker { time: number; label: string; }

const GENRES = ['Pop', 'Rap', 'R&B', 'Country', 'Rock', 'Metal', 'EDM', 'Worship', 'Afrobeats', 'Amapiano', 'House', 'Jazz'];
const TEXT_PRESETS = [
  { id: 'none', name: 'None', desc: 'Simple clean text' },
  { id: 'brick', name: 'Brick', desc: 'Bold block serif' },
  { id: 'stencil', name: 'Stencil', desc: 'Cutout with borders' },
  { id: 'heartless', name: 'Heartless', desc: 'Aggressive italic brush' },
  { id: 'fly', name: 'Fly', desc: 'Lightweight tracking' },
  { id: 'voltage', name: 'Voltage', desc: 'Cyan outer glow' },
];
const CHORD_PROGRESSIONS = ['Em7', 'Cmaj7', 'G', 'Dsus4', 'Am7', 'B7'];
const STORAGE_KEY = 'dropkast.studio.data';

function loadStudioData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`studio.${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveStudioData(key: string, data: any) {
  try { localStorage.setItem(`studio.${key}`, JSON.stringify(data)); } catch {}
}

/* =========================================================================
 * MAIN COMPONENT
 * ========================================================================= */
export default function AllInOneStudio() {
  const [activeModule, setActiveModule] = useState<StudioModule>('overview');
  const modules = [
    { id: 'overview' as StudioModule, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'lyrics' as StudioModule, icon: FileText, label: 'Lyric Studio' },
    { id: 'assets' as StudioModule, icon: FolderOpen, label: 'Assets' },
    { id: 'templates' as StudioModule, icon: Layers, label: 'Templates' },
    { id: 'broll' as StudioModule, icon: Film, label: 'B-Roll' },
    { id: 'cover' as StudioModule, icon: ImageIcon, label: 'Cover Art' },
    { id: 'timeline' as StudioModule, icon: Music, label: 'Timeline Editor' },
  ];

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-main)] text-white overflow-hidden">
      <header className="shrink-0 bg-[var(--bg-main)] border-b border-[var(--border-main)] px-6 py-3 flex items-center justify-between">
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
          <button onClick={() => { toast.success('Studio saved'); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase italic tracking-widest hover:bg-primary hover:text-black transition-all">
            <Save className="w-3.5 h-3.5" /> Save
          </button>
          <button onClick={() => { toast.success('Export started'); }}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-black font-black uppercase italic text-[10px] tracking-widest hover:bg-primary/80 transition-all">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </header>

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
  const greeting = useMemo(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'GOOD MORNING';
    if (hrs < 18) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  }, []);

  const resourceCounts = useMemo(() => ({
    templates: loadStudioData('template-count', 0),
    exports: loadStudioData('export-count', 0),
    generations: loadStudioData('generation-count', 0),
    markers: loadStudioData('marker-count', 0),
  }), []);

  const cards = [
    { id: 'lyrics' as const, icon: FileText, label: 'Lyric Studio', desc: 'Write songs with AI-powered suggestions, rhymes & chords' },
    { id: 'broll' as const, icon: Film, label: 'B-Roll Engine', desc: 'Generate cinematic video clips from text prompts' },
    { id: 'cover' as const, icon: ImageIcon, label: 'Cover Art', desc: 'Professional album artwork in seconds' },
    { id: 'timeline' as const, icon: Music, label: 'Timeline Editor', desc: 'Multi-track lyric video editor with beat sync' },
  ];

  return (
    <div className="p-8 overflow-y-auto h-full custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-10">
        <div>
          <div className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic mb-2">
            {greeting}, CREATOR
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter text-white leading-none">
            All-In-One <span className="text-primary">Studio</span>
          </h1>
          <p className="text-white/40 italic mt-3 max-w-xl">
            Every tool you need — lyrics, assets, video, cover art. One workspace.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Templates', count: resourceCounts.templates, icon: Layers },
            { label: 'Exports', count: resourceCounts.exports, icon: Download },
            { label: 'AI Generations', count: resourceCounts.generations, icon: Sparkles },
            { label: 'Cut Markers', count: resourceCounts.markers, icon: Scissors },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-[var(--card-bg)] border border-white/5 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">{s.label}</span>
                  <Icon className="w-4 h-4 text-white/20" />
                </div>
                <div className="text-3xl font-black italic text-white">
                  {s.count}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {cards.map(c => {
            const Icon = c.icon;
            return (
              <button key={c.id} onClick={() => onNavigate(c.id)}
                className="group bg-[var(--card-bg)] border border-white/5 hover:border-primary/40 p-8 text-left transition-all relative overflow-hidden">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 border border-primary/30 flex items-center justify-center text-primary">
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

        <div className="bg-[var(--card-bg)] border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Recent Activity</span>
          </div>
          <div className="text-white/30 italic text-sm">No recent activity yet. Start by creating something in one of the studios above.</div>
        </div>

        <div className="bg-[var(--card-bg)] border border-white/5 p-6">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Getting Started</span>
          </div>
          <div className="flex gap-3">
            {['Write Lyrics', 'Import Assets', 'Create Template', 'Generate B-Roll', 'Export Video'].map((step, i) => (
              <div key={step} className="flex items-center gap-3 flex-1">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black italic',
                  'bg-white/5 text-white/30'
                )}>
                  {i + 1}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest italic text-white/30">{step}</span>
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
  const [lyrics, setLyrics] = useState<LyricSegment[]>(() => loadStudioData<LyricSegment[]>('lyrics', []));
  const [editingSegment, setEditingSegment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [activeTab, setActiveTab] = useState<'lyrics' | 'rhymes' | 'thesaurus' | 'verse' | 'chords'>('lyrics');
  const [rhymeWord, setRhymeWord] = useState('heart');
  const [newLine, setNewLine] = useState('');

  useEffect(() => { saveStudioData('lyrics', lyrics); }, [lyrics]);

  const addLine = () => {
    if (!newLine.trim()) return;
    const seg: LyricSegment = {
      id: `l${Date.now()}`,
      text: newLine.trim(),
      start: lyrics.length * 3.5,
      end: lyrics.length * 3.5 + 3.5,
      words: newLine.trim().split(' ').map((w, i, arr) => ({
        word: w,
        start: i * (3.5 / arr.length),
        end: (i + 1) * (3.5 / arr.length),
      })),
    };
    setLyrics(prev => [...prev, seg]);
    setNewLine('');
    toast.success('Line added');
  };

  const deleteLine = (id: string) => {
    setLyrics(prev => prev.filter(s => s.id !== id));
    toast.success('Line removed');
  };

  const startEditing = (seg: LyricSegment) => {
    setEditingSegment(seg.id);
    setEditText(seg.text);
  };

  const saveEdit = () => {
    if (!editingSegment) return;
    setLyrics(prev => prev.map(s => s.id === editingSegment ? { ...s, text: editText, words: [{ word: editText, start: s.start, end: s.end }] } : s));
    setEditingSegment(null);
    toast.success('Line updated');
  };

  const totalSyllables = useMemo(() => {
    return lyrics.map(s => s.text.split(' ').reduce((sum, w) => sum + Math.max(1, w.length > 4 ? 2 : w.length > 2 ? 2 : 1), 0));
  }, [lyrics]);

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col overflow-hidden border-r border-white/5">
        <div className="shrink-0 bg-[var(--card-bg)] border-b border-white/5 px-8 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Genre</span>
          </div>
          <select value={genre} onChange={e => setGenre(e.target.value)}
            className="bg-black border border-white/10 px-4 py-2 text-xs font-mono text-white outline-none focus:border-primary uppercase tracking-widest">
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-4">
          {lyrics.length === 0 && (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-white/5">
              <div className="text-center">
                <FileText className="w-12 h-12 text-white/10 mx-auto mb-3" />
                <p className="text-white/30 italic">No lyrics yet</p>
                <p className="text-[11px] text-white/20 italic mt-1">Type a line below and hit Add to begin</p>
              </div>
            </div>
          )}
          {lyrics.map((seg, i) => (
            <div key={seg.id} className="group">
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-1 pt-2">
                  {totalSyllables[i].toString().split('').map((d, di) => (
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
                        <button onClick={() => deleteLine(seg.id)} className="p-1 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="shrink-0 bg-[var(--card-bg)] border-t border-white/5 p-4 flex items-center gap-3">
          <input type="text" value={newLine} onChange={e => setNewLine(e.target.value)}
            placeholder="Type a new lyric line..."
            className="flex-1 bg-black border border-white/10 px-4 py-3 text-sm italic text-white outline-none focus:border-primary"
            onKeyDown={e => { if (e.key === 'Enter') addLine(); }} />
          <button onClick={addLine} disabled={!newLine.trim()}
            className="px-6 py-3 bg-primary text-black text-[10px] font-black uppercase tracking-widest italic hover:bg-primary/80 transition-all disabled:opacity-30">
            <Plus className="w-3.5 h-3.5 inline mr-1" /> Add
          </button>
        </div>
      </div>

      <div className="w-80 bg-[var(--card-bg)] flex flex-col overflow-hidden">
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
                {CHORD_PROGRESSIONS.slice(0, 8).map((c, i) => (
                  <button key={i} onClick={() => toast.info(`Playing ${c}`)}
                    className="px-4 py-2 bg-black/40 border border-primary/30 text-primary text-xs font-mono font-bold hover:bg-primary/20 transition-all">
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'lyrics' && (
            <div className="text-white/40 italic text-sm text-center py-8">
              Select another tab (Rhymes, Thesaurus, Verse Gen, or Chords) for writing assistance.
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
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [assets, setAssets] = useState<AssetFile[]>(() => loadStudioData<AssetFile[]>('assets', []));
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { saveStudioData('assets', assets); }, [assets]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAssets: AssetFile[] = files.map(f => ({
      id: `a${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: f.name,
      type: f.type.startsWith('video/') ? 'video' : f.type.startsWith('image/') ? 'image' : 'audio',
      url: URL.createObjectURL(f),
      duration: f.type.startsWith('video/') ? 10 : undefined,
      date: 'Just now',
    }));
    setAssets(prev => [...newAssets, ...prev]);
    toast.success(`${files.length} file(s) uploaded`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    toast.success('Asset removed');
  };

  const folders = [
    { id: 'my-uploads', label: 'My Uploads', icon: FolderOpen },
    { id: 'ai-generated', label: 'AI Generated', icon: Sparkles },
    { id: 'broll', label: 'B-Roll', icon: Film },
  ];

  const filteredAssets = selectedFolder && selectedFolder !== 'my-uploads' ? [] : assets;

  return (
    <div className="flex h-full">
      <div className="w-64 bg-[var(--card-bg)] border-r border-white/5 p-4 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-4">FOLDERS</div>
        <div className="space-y-1">
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
      </div>

      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black italic text-white">
              {folders.find(f => f.id === selectedFolder)?.label || 'All Assets'}
            </h2>
            <span className="text-[10px] font-mono text-white/30">{assets.length} files</span>
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
            <button onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 text-primary text-[9px] font-black uppercase tracking-widest italic hover:bg-primary hover:text-black transition-all">
              <Upload className="w-3.5 h-3.5" /> Import
            </button>
            <input ref={fileInputRef} type="file" multiple accept="video/*,image/*,audio/*" onChange={handleUpload} className="hidden" />
          </div>
        </div>

        {assets.length === 0 ? (
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-white/5">
            <div className="text-center">
              <Upload className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 italic mb-1">No assets yet</p>
              <p className="text-[11px] text-white/20 italic">Click Import to upload files</p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-4 gap-4">
            {filteredAssets.map(a => (
              <div key={a.id} className="group bg-black/40 border border-white/5 hover:border-primary/40 transition-all cursor-pointer">
                <div className="aspect-video bg-[var(--bg-main)] flex items-center justify-center relative">
                  {a.type === 'video' ? <Video className="w-8 h-8 text-white/20" /> :
                   a.type === 'image' ? <ImageIcon className="w-8 h-8 text-white/20" /> :
                   <Music className="w-8 h-8 text-white/20" />}
                  {a.duration && (
                    <span className="absolute bottom-2 right-2 text-[9px] font-mono bg-black/80 px-2 py-0.5 text-white/60">{a.duration}s</span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <button className="p-2 bg-white/20 hover:bg-primary/80 transition-all"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => deleteAsset(a.id)} className="p-2 bg-white/20 hover:bg-red-500/80 transition-all"><Trash2 className="w-4 h-4" /></button>
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
            {filteredAssets.map(a => (
              <div key={a.id} className="flex items-center gap-4 px-4 py-3 bg-black/20 border border-white/5 hover:border-white/20 transition-all cursor-pointer group">
                {a.type === 'video' ? <Video className="w-4 h-4 text-white/30" /> :
                 a.type === 'image' ? <ImageIcon className="w-4 h-4 text-white/30" /> :
                 <Music className="w-4 h-4 text-white/30" />}
                <span className="flex-1 text-xs italic text-white/80">{a.name}</span>
                {a.duration && <span className="text-[10px] font-mono text-white/30">{a.duration}s</span>}
                <span className="text-[10px] text-white/30">{a.date}</span>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                  <button className="p-1 hover:text-primary"><Eye className="w-3 h-3" /></button>
                  <button onClick={() => deleteAsset(a.id)} className="p-1 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
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
  const [templates, setTemplates] = useState<Template[]>(() => loadStudioData<Template[]>('templates', []));
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => { saveStudioData('templates', templates); }, [templates]);

  const createTemplate = () => {
    if (!newName.trim()) return;
    const t: Template = {
      id: `t${Date.now()}`,
      name: newName.trim().toUpperCase(),
      date: new Date().toISOString().slice(0, 10),
      clipDuration: 30,
      bpm: 120,
      projectCount: 0,
      projects: [],
    };
    setTemplates(prev => [t, ...prev]);
    setNewName('');
    setShowCreate(false);
    toast.success('Template created');
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast.success('Template deleted');
  };

  return (
    <div className="p-8 overflow-y-auto h-full custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black italic text-white tracking-tight">Templates</h2>
            <p className="text-white/40 italic mt-1 text-sm">Reusable blueprints for your video projects</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest italic hover:bg-primary hover:text-black transition-all">
            <Plus className="w-4 h-4" /> Create Template
          </button>
        </div>

        {showCreate && (
          <div className="mb-6 bg-[var(--card-bg)] border border-primary/30 p-6 flex items-center gap-4">
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="Template name..."
              className="flex-1 bg-black border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-primary italic"
              autoFocus onKeyDown={e => { if (e.key === 'Enter') createTemplate(); if (e.key === 'Escape') setShowCreate(false); }} />
            <button onClick={createTemplate} disabled={!newName.trim()}
              className="px-6 py-3 bg-primary text-black text-[10px] font-black uppercase tracking-widest italic disabled:opacity-30">
              Create
            </button>
            <button onClick={() => setShowCreate(false)}
              className="px-4 py-3 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest italic">
              Cancel
            </button>
          </div>
        )}

        {templates.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-white/5">
            <Layers className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 italic">No templates yet</p>
            <p className="text-[11px] text-white/20 italic mt-1">Click "Create Template" to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {templates.map(t => (
              <div key={t.id} className="bg-[var(--card-bg)] border border-white/5 hover:border-primary/40 transition-all p-6 group">
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
                <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                  <button className="flex-1 py-2 bg-primary/10 border border-primary/30 text-primary text-[9px] font-black uppercase tracking-widest italic hover:bg-primary hover:text-black transition-all">
                    View Projects
                  </button>
                  <button onClick={() => deleteTemplate(t.id)}
                    className="px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-black uppercase tracking-widest italic hover:bg-red-500/20 transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
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
 * MODULE 5: B-ROLL ENGINE
 * ========================================================================= */
function BRollEngine() {
  const [prompt, setPrompt] = useState('');
  const [shakes, setShakes] = useState(7);
  const [timeOfDay, setTimeOfDay] = useState(50);
  const [environment, setEnvironment] = useState('');
  const [wardrobe, setWardrobe] = useState('');
  const [handheld, setHandheld] = useState(true);
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [jobs, setJobs] = useState<BrollJob[]>(() => loadStudioData<BrollJob[]>('broll-jobs', []));
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => { saveStudioData('broll-jobs', jobs); }, [jobs]);

  const handleGenerate = () => {
    if (!prompt.trim()) { toast.error('Describe a shot first'); return; }
    setIsGenerating(true);
    const job: BrollJob = { id: `b${Date.now()}`, prompt, status: 'generating' };
    setJobs(prev => [job, ...prev]);
    setTimeout(() => {
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'done' } : j));
      setIsGenerating(false);
      toast.success('B-roll clips generated');
    }, 3000);
  };

  return (
    <div className="flex h-full">
      <div className="w-96 bg-[var(--card-bg)] border-r border-white/5 p-6 overflow-y-auto custom-scrollbar space-y-6">
        <h3 className="text-lg font-black italic text-white">B-Roll Generator</h3>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest italic block">Prompt</label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3}
            placeholder="Describe the b-roll you want... e.g. 'driving through downtown at sunset'"
            className="w-full bg-black border border-white/10 px-4 py-3 text-xs text-white outline-none focus:border-primary resize-none italic" />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest italic block">Shots Duration</label>
          <input type="range" min={3} max={15} value={shakes} onChange={e => setShakes(Number(e.target.value))} className="w-full accent-primary" />
          <div className="flex justify-between text-[9px] text-white/30 italic">
            <span>Fewer</span><span>{shakes} clips - ~{(shakes * 0.3).toFixed(1)}s each</span><span>More</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest italic block">Time of Day</label>
          <input type="range" min={0} max={100} value={timeOfDay} onChange={e => setTimeOfDay(Number(e.target.value))} className="w-full accent-primary" />
          <div className="flex justify-between text-[9px] text-white/30 italic">
            <span>Auto</span><span>Early</span><span>Late</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest italic block">Environment</label>
          <input type="text" value={environment} onChange={e => setEnvironment(e.target.value)}
            placeholder="e.g. rooftop at night"
            className="w-full bg-black border border-white/10 px-4 py-2 text-xs text-white outline-none focus:border-primary" />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest italic block">Wardrobe</label>
          <input type="text" value={wardrobe} onChange={e => setWardrobe(e.target.value)}
            placeholder="e.g. black leather jacket"
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
          className="w-full py-4 bg-primary text-black font-black uppercase italic text-[10px] tracking-widest hover:bg-primary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {isGenerating ? 'Generating...' : 'Generate B-Roll'}
        </button>
      </div>

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
                <div className="aspect-video bg-[var(--bg-main)] flex items-center justify-center">
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
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [parental, setParental] = useState(false);
  const [resolution, setResolution] = useState<'2K' | 'medium'>('2K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [gallery, setGallery] = useState<string[]>(() => loadStudioData<string[]>('cover-gallery', []));

  useEffect(() => { saveStudioData('cover-gallery', gallery); }, [gallery]);

  const handleGenerate = () => {
    if (!prompt.trim()) { toast.error('Enter a prompt first'); return; }
    setIsGenerating(true);
    setTimeout(() => {
      setGallery(prev => [URL.createObjectURL(new Blob(['placeholder'], { type: 'image/png' })), ...prev]);
      setIsGenerating(false);
      saveStudioData('generation-count', loadStudioData('generation-count', 0) + 1);
      toast.success('Cover art generated');
    }, 2500);
  };

  return (
    <div className="flex h-full">
      <div className="w-96 bg-[var(--card-bg)] border-r border-white/5 p-6 overflow-y-auto custom-scrollbar space-y-6">
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
            placeholder="Describe the cover art you want..."
            className="w-full bg-black border border-white/10 px-4 py-3 text-xs text-white outline-none focus:border-primary resize-none italic" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest italic block">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Release title"
              className="w-full bg-black border border-white/10 px-4 py-2 text-xs text-white outline-none focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest italic block">Artist</label>
            <input type="text" value={artist} onChange={e => setArtist(e.target.value)}
              placeholder="Artist name"
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
          className="w-full py-4 bg-primary text-black font-black uppercase italic text-[10px] tracking-widest hover:bg-primary/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
          {isGenerating ? 'Generating...' : 'Generate Cover Art'}
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {gallery.length === 0 ? (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-white/5">
            <div className="text-center">
              <Palette className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <p className="text-white/30 italic">No cover art yet.</p>
              <p className="text-[11px] text-white/20 italic mt-1">Describe your cover on the left and generate.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {gallery.map((url, i) => (
              <div key={i} className="aspect-square bg-[var(--bg-main)] border border-white/5 flex items-center justify-center relative group">
                <ImageIcon className="w-12 h-12 text-white/20" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                  <button className="px-4 py-2 bg-primary text-black text-[10px] font-black uppercase tracking-widest italic"><Download className="w-4 h-4 inline" /> Save</button>
                  <button className="p-2 bg-white/20 hover:bg-red-500/80 transition-all"><Trash2 className="w-4 h-4" /></button>
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
 * MODULE 7: TIMELINE EDITOR
 * ========================================================================= */
function TimelineEditor() {
  const [clips, setClips] = useState<TimelineClip[]>(() => loadStudioData<TimelineClip[]>('timeline-clips', []));
  const [cutMarkers, setCutMarkers] = useState<CutMarker[]>(() => loadStudioData<CutMarker[]>('timeline-markers', []));
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState('none');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [fontSize, setFontSize] = useState(32);
  const [trackVVisible, setTrackVVisible] = useState(true);
  const [trackAAudible, setTrackAAudible] = useState(true);
  const [clipName, setClipName] = useState('');
  const [markerLabel, setMarkerLabel] = useState('');
  const playInterval = useRef<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const totalDuration = Math.max(30, clips.reduce((max, c) => Math.max(max, c.end), 0) + 5);

  useEffect(() => { saveStudioData('timeline-clips', clips); }, [clips]);
  useEffect(() => { saveStudioData('timeline-markers', cutMarkers); }, [cutMarkers]);

  useEffect(() => {
    if (isPlaying) {
      playInterval.current = window.setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalDuration) { setIsPlaying(false); return 0; }
          return prev + 0.05;
        });
      }, 50);
    } else if (playInterval.current) {
      clearInterval(playInterval.current);
    }
    return () => { if (playInterval.current) clearInterval(playInterval.current); };
  }, [isPlaying, totalDuration]);

  const addClip = () => {
    if (!clipName.trim()) return;
    const clip: TimelineClip = {
      id: `c${Date.now()}`,
      name: clipName.trim(),
      type: 'video',
      start: clips.length * 3,
      end: clips.length * 3 + 3,
      track: clips.length % 2 === 0 ? 'V' : 'A',
      locked: false,
      visible: true,
      color: clips.length % 2 === 0 ? '#FF4D00' : '#FF6B33',
    };
    setClips(prev => [...prev, clip]);
    setClipName('');
    toast.success('Clip added to timeline');
  };

  const removeClip = (id: string) => {
    setClips(prev => prev.filter(c => c.id !== id));
    toast.success('Clip removed');
  };

  const toggleLock = (id: string) => {
    setClips(prev => prev.map(c => c.id === id ? { ...c, locked: !c.locked } : c));
  };

  const toggleVisibility = (id: string) => {
    setClips(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
  };

  const addMarker = () => {
    if (!markerLabel.trim()) return;
    setCutMarkers(prev => {
      const exists = prev.some(m => Math.abs(m.time - currentTime) < 0.5);
      if (exists) { toast.error('Marker already at this time'); return prev; }
      toast.success('Cut marker added');
      return [...prev, { time: currentTime, label: markerLabel.trim() }].sort((a, b) => a.time - b.time);
    });
    setMarkerLabel('');
  };

  const removeMarker = (time: number) => {
    setCutMarkers(prev => prev.filter(m => m.time !== time));
    toast.success('Marker removed');
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / (20 * zoom);
    setCurrentTime(Math.max(0, Math.min(time, totalDuration)));
  };

  const clearAll = () => {
    setClips([]);
    setCutMarkers([]);
    setCurrentTime(0);
    toast.success('Timeline cleared');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Controls */}
      <div className="shrink-0 bg-[var(--card-bg)] border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-black italic text-white">Timeline Editor</h3>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <button onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center hover:bg-primary/80 transition-all">
              {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button onClick={() => setCurrentTime(0)} className="p-2 text-white/40 hover:text-white transition-all">
              <SkipBack className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-white/60">
            <span>{(currentTime).toFixed(1)}s</span>
            <span>/</span>
            <span>{totalDuration.toFixed(1)}s</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="p-1.5 text-white/30 hover:text-white text-xs">-</button>
            <span className="text-[10px] font-mono text-white/60 w-8 text-center">{zoom.toFixed(2)}x</span>
            <button onClick={() => setZoom(Math.min(3, zoom + 0.25))} className="p-1.5 text-white/30 hover:text-white text-xs">+</button>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <button onClick={clearAll} className="px-3 py-1.5 border border-red-500/30 text-red-400 text-[9px] font-black uppercase tracking-widest italic hover:bg-red-500/20 transition-all">
            Clear
          </button>
          <button onClick={() => { toast.success('Project exported'); saveStudioData('export-count', loadStudioData('export-count', 0) + 1); }}
            className="px-6 py-2 bg-primary text-black text-[10px] font-black uppercase tracking-widest italic hover:bg-primary/80 transition-all flex items-center gap-2">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Clips & Controls */}
        <div className="w-72 bg-[var(--card-bg)] border-r border-white/5 p-4 overflow-y-auto custom-scrollbar space-y-4">
          <div className="space-y-2">
            <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">Add Clip</span>
            <div className="flex gap-2">
              <input type="text" value={clipName} onChange={e => setClipName(e.target.value)}
                placeholder="Clip name..."
                className="flex-1 bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-primary"
                onKeyDown={e => { if (e.key === 'Enter') addClip(); }} />
              <button onClick={addClip} disabled={!clipName.trim()}
                className="px-3 py-2 bg-primary text-black text-[9px] font-black disabled:opacity-30">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">Add Marker</span>
            <div className="flex gap-2">
              <input type="text" value={markerLabel} onChange={e => setMarkerLabel(e.target.value)}
                placeholder={`Marker at ${currentTime.toFixed(1)}s`}
                className="flex-1 bg-black border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-primary"
                onKeyDown={e => { if (e.key === 'Enter') addMarker(); }} />
              <button onClick={addMarker} disabled={!markerLabel.trim()}
                className="px-3 py-2 bg-primary text-black text-[9px] font-black disabled:opacity-30">
                <Scissors className="w-3 h-3" />
              </button>
            </div>
          </div>

          {cutMarkers.length > 0 && (
            <div>
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest italic block mb-2">Markers</span>
              <div className="space-y-1">
                {cutMarkers.map(m => (
                  <div key={m.time} className="flex items-center justify-between px-2 py-1 bg-black/40 border border-white/5">
                    <span className="text-[10px] font-mono text-white/60">{m.time.toFixed(1)}s</span>
                    <span className="text-[10px] text-white/40 italic truncate mx-2">{m.label}</span>
                    <button onClick={() => removeMarker(m.time)} className="text-white/20 hover:text-red-400 shrink-0"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">Style Preset</span>
            <div className="grid grid-cols-3 gap-2">
              {TEXT_PRESETS.map(p => (
                <button key={p.id} onClick={() => setSelectedPreset(p.id)}
                  className={cn('px-2 py-2 text-[8px] font-black uppercase tracking-widest italic border transition-all text-center',
                    selectedPreset === p.id ? 'border-primary bg-primary/10 text-primary' : 'border-white/5 bg-black/40 text-white/40 hover:border-white/20')}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">Text Color</span>
            <div className="flex gap-2">
              {['#FFFFFF','#00E5FF','#FF4D00','#22C55E','#FFD700','#FF0066'].map(c => (
                <button key={c} onClick={() => setTextColor(c)}
                  className={cn('w-8 h-8 border', textColor === c ? 'border-white scale-110' : 'border-white/20')}
                  style={{ backgroundColor: c }} />
              ))}
              <button onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-8 h-8 border border-white/20 flex items-center justify-center text-[9px] text-white/40">
                +
              </button>
            </div>
            {showColorPicker && (
              <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                className="w-full h-8 cursor-pointer" />
            )}
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">Font Size</span>
            <input type="range" min={16} max={72} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full accent-primary" />
            <div className="text-[9px] text-white/30 text-center">{fontSize}px</div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">Apply to All</span>
            <button className={cn('px-4 py-1.5 text-[9px] font-black uppercase tracking-widest italic border transition-all',
              'border-primary/30 text-primary')}>
              ON
            </button>
          </div>
        </div>

        {/* Center - Video Preview */}
        <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-main)] p-8">
          {clips.length === 0 ? (
            <div className="text-center border-2 border-dashed border-white/5 p-16">
              <Video className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <p className="text-white/30 italic">No clips in timeline</p>
              <p className="text-[11px] text-white/20 italic mt-1">Add clips from the left panel</p>
            </div>
          ) : (
            <div className="relative w-[360px] aspect-[9/16] bg-black border border-white/10 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <p className="text-3xl font-black italic text-white text-center leading-tight tracking-tight"
                  style={{
                    color: textColor,
                    fontSize: `${fontSize}px`,
                    textShadow: selectedPreset === 'voltage' ? `0 0 20px ${textColor}, 0 0 40px ${textColor}, 0 0 80px ${textColor}` :
                      selectedPreset === 'stencil' ? undefined :
                      undefined,
                    WebkitTextStroke: selectedPreset === 'stencil' ? `2px ${textColor}` : undefined,
                  }}>
                  {clips.find(c => Math.abs(currentTime - c.start) < 3)?.name || 'Your Timeline'}
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                <div className="h-full bg-primary transition-all" style={{ width: `${(currentTime / totalDuration) * 100}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom - Timeline Track */}
      <div className="shrink-0 bg-[var(--card-bg)] border-t border-white/5">
        <div className="flex items-center gap-2 px-4 py-1.5 border-b border-white/5">
          <button onClick={() => setTrackVVisible(!trackVVisible)}
            className={cn('flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest italic transition-all',
              trackVVisible ? 'text-white' : 'text-white/30')}>
            {trackVVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />} Track V
          </button>
          <button onClick={() => setTrackAAudible(!trackAAudible)}
            className={cn('flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest italic transition-all',
              trackAAudible ? 'text-white' : 'text-white/30')}>
            {trackAAudible ? <Volume2 className="w-3 h-3" /> : <Volume2 className="w-3 h-3 opacity-30" />} Track A
          </button>
          <div className="text-[9px] text-white/20 italic ml-auto">{clips.length} clips · {cutMarkers.length} markers</div>
        </div>

        <div ref={timelineRef} onClick={handleTimelineClick}
          className="relative h-28 overflow-x-auto custom-scrollbar cursor-crosshair"
          style={{ paddingLeft: '60px' }}>
          {/* Ruler */}
          <div className="sticky top-0 h-5 bg-black/40 border-b border-white/5 flex" style={{ width: `${totalDuration * 20 * zoom}px`, minWidth: '100%' }}>
            {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, i) => (
              <div key={i} className="flex items-end" style={{ width: `${20 * zoom}px`, minWidth: 20 }}>
                {i % 5 === 0 && <span className="text-[7px] font-mono text-white/30 mb-0.5 ml-0.5">{i}s</span>}
              </div>
            ))}
          </div>

          {/* Track V */}
          <div className="h-10 border-b border-white/5 relative" style={{ width: `${totalDuration * 20 * zoom}px`, minWidth: '100%' }}>
            {trackVVisible && clips.filter(c => c.track === 'V').map(c => {
              const left = c.start * 20 * zoom;
              const width = (c.end - c.start) * 20 * zoom;
              const active = Math.abs(currentTime - c.start) < (c.end - c.start);
              return (
                <div key={c.id} onClick={(e) => { e.stopPropagation(); setCurrentTime(c.start); }}
                  className={cn('absolute top-1 h-8 flex items-center px-2 cursor-pointer transition-all group',
                    c.locked ? 'opacity-60' : 'opacity-100')}
                  style={{
                    left: `${left}px`,
                    width: `${Math.max(width, 20)}px`,
                    backgroundColor: c.locked ? '#1a3a1a' : `${c.color}30`,
                    border: `1px solid ${active ? c.color : `${c.color}60`}`,
                  }}>
                  <span className="text-[7px] font-mono text-white/60 truncate w-full group-hover:text-white">{c.name}</span>
                  <div className="hidden group-hover:flex items-center gap-1 ml-1 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); toggleLock(c.id); }} className="text-white/40 hover:text-primary">
                      {c.locked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); removeClip(c.id); }} className="text-white/40 hover:text-red-400">
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="absolute top-0 bottom-0 w-0.5 bg-primary z-10" style={{ left: `${currentTime * 20 * zoom}px` }} />
          </div>

          {/* Track A */}
          <div className="h-10 border-b border-white/5 relative" style={{ width: `${totalDuration * 20 * zoom}px`, minWidth: '100%' }}>
            {trackAAudible && clips.filter(c => c.track === 'A').map(c => {
              const left = c.start * 20 * zoom;
              const width = (c.end - c.start) * 20 * zoom;
              return (
                <div key={c.id} onClick={(e) => { e.stopPropagation(); setCurrentTime(c.start); }}
                  className="absolute top-2 h-6 flex items-center px-2 cursor-pointer transition-all group"
                  style={{
                    left: `${left}px`,
                    width: `${Math.max(width, 20)}px`,
                    backgroundColor: `${c.color}20`,
                    border: `1px solid ${c.color}50`,
                  }}>
                  <span className="text-[7px] font-mono text-white/50 truncate w-full group-hover:text-white">{c.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); removeClip(c.id); }} className="hidden group-hover:block text-white/40 hover:text-red-400 ml-1 shrink-0">
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              );
            })}
            {/* Beat markers */}
            {cutMarkers.map(m => (
              <div key={m.time} className="absolute top-0 bottom-0 w-px bg-primary z-10"
                style={{ left: `${m.time * 20 * zoom}px`, opacity: 0.5 }} />
            ))}
            <div className="absolute top-0 bottom-0 w-px bg-primary z-10 shadow-[0_0_8px_rgba(var(--primary-raw),0.5)]"
              style={{ left: `${currentTime * 20 * zoom}px` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Square(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" />
    </svg>
  );
}
