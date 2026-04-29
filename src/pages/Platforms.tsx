import { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Globe2,
  Search,
  CheckCircle2,
  Sparkles,
  Check,
  X,
  Star,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  DSPS,
  CATEGORY_LABEL,
  REGION_LABEL,
  ALL_DSP_IDS,
  RECOMMENDED_DSP_IDS,
  TIER1_DSP_IDS,
  type DspCategory,
  type DspRegion,
} from '../lib/dsps';
import { toast } from 'sonner';

const STORAGE_KEY = 'dropkast.preferred_stores';

const CATEGORY_FILTERS: Array<DspCategory | 'all'> = [
  'all',
  'streaming-tier1',
  'streaming-regional',
  'short-form',
  'dj-pool',
  'fitness-bgm',
  'store-download',
  'lyrics',
  'radio',
  'video',
  'other',
];

const REGION_FILTERS: Array<DspRegion | 'all'> = [
  'all',
  'global',
  'us-canada',
  'latam',
  'europe',
  'uk-ireland',
  'nordics',
  'mena',
  'africa',
  'india',
  'china',
  'japan-korea',
  'sea',
  'cis',
];

function loadPrefs(): Set<string> {
  if (typeof window === 'undefined') return new Set(RECOMMENDED_DSP_IDS);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set(RECOMMENDED_DSP_IDS);
    const ids = JSON.parse(raw) as string[];
    return new Set(ids);
  } catch {
    return new Set(RECOMMENDED_DSP_IDS);
  }
}

export default function Platforms() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<DspCategory | 'all'>('all');
  const [activeRegion, setActiveRegion] = useState<DspRegion | 'all'>('all');
  const [selected, setSelected] = useState<Set<string>>(() => loadPrefs());

  // Persist selection on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selected)));
    } catch {
      /* ignore quota errors */
    }
  }, [selected]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DSPS.filter((d) => {
      if (activeCategory !== 'all' && d.category !== activeCategory) return false;
      if (activeRegion !== 'all' && !d.regions.includes(activeRegion as DspRegion)) return false;
      if (q && !d.name.toLowerCase().includes(q) && !d.id.includes(q)) return false;
      return true;
    });
  }, [search, activeCategory, activeRegion]);

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setAllInView = (on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const d of filtered) {
        if (on) next.add(d.id);
        else next.delete(d.id);
      }
      return next;
    });
  };

  const setPreset = (preset: 'all' | 'recommended' | 'tier1' | 'none') => {
    if (preset === 'all') {
      setSelected(new Set(ALL_DSP_IDS));
      toast.success(`All ${ALL_DSP_IDS.length} platforms selected`);
    } else if (preset === 'recommended') {
      setSelected(new Set(RECOMMENDED_DSP_IDS));
      toast.success(`${RECOMMENDED_DSP_IDS.length} recommended platforms selected`);
    } else if (preset === 'tier1') {
      setSelected(new Set(TIER1_DSP_IDS));
      toast.success(`${TIER1_DSP_IDS.length} major streaming services selected`);
    } else {
      setSelected(new Set());
      toast.message('Cleared all selections');
    }
  };

  const totalSelected = selected.size;
  const totalAvailable = DSPS.length;

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] italic">
            Where your music lands
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none">
            Pick your <span className="text-primary">stores</span>
          </h1>
          <p className="text-white/40 text-base font-medium leading-relaxed max-w-2xl">
            Choose every streaming service, social platform, DJ pool, store, or lyric site that should
            carry your release. Default is the {RECOMMENDED_DSP_IDS.length} we recommend — but you can pick all {totalAvailable} if you want
            maximum reach. Your choice is saved and reused on every new release.
          </p>
        </div>

        <div className="manifest-card p-6 bg-dark border-primary/20 min-w-[260px]">
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-2">Currently selected</div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-5xl font-black italic text-white">{totalSelected}</span>
            <span className="text-sm text-white/30 italic">of {totalAvailable}</span>
          </div>
          <div className="h-1 bg-white/10 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-500"
              style={{ width: `${(totalSelected / totalAvailable) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] italic mr-2">Quick pick:</span>
        <button
          onClick={() => setPreset('all')}
          className="h-10 px-5 bg-primary text-white text-[10px] font-black uppercase tracking-widest italic hover:bg-white hover:text-black transition-all flex items-center gap-2"
        >
          <Check className="w-3 h-3" /> All platforms
        </button>
        <button
          onClick={() => setPreset('recommended')}
          className="h-10 px-5 bg-white text-black text-[10px] font-black uppercase tracking-widest italic hover:bg-primary hover:text-white transition-all flex items-center gap-2"
        >
          <Star className="w-3 h-3" /> Recommended only
        </button>
        <button
          onClick={() => setPreset('tier1')}
          className="h-10 px-5 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest italic hover:border-white hover:bg-white hover:text-black transition-all"
        >
          Major streaming only
        </button>
        <button
          onClick={() => setPreset('none')}
          className="h-10 px-5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest italic hover:border-red-500 hover:text-red-500 transition-all flex items-center gap-2"
        >
          <X className="w-3 h-3" /> Clear all
        </button>
      </div>

      {/* Search + filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="relative group lg:col-span-1">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search Spotify, TikTok, Beatport..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark border border-white/10 py-4 pl-14 pr-5 text-white focus:outline-none focus:border-primary transition-all text-sm placeholder:text-white/20"
          />
        </div>
        <div className="lg:col-span-2 flex flex-wrap gap-2 items-center">
          {CATEGORY_FILTERS.slice(0, 6).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'h-10 px-4 text-[10px] font-black uppercase tracking-widest italic border transition-all',
                activeCategory === cat
                  ? 'bg-white text-black border-white'
                  : 'text-white/50 border-white/10 hover:border-white/30 hover:text-white',
              )}
            >
              {cat === 'all' ? 'All categories' : CATEGORY_LABEL[cat as DspCategory]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center mb-6">
        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] italic mr-2">Region:</span>
        {REGION_FILTERS.map((r) => (
          <button
            key={r}
            onClick={() => setActiveRegion(r)}
            className={cn(
              'h-8 px-3 text-[9px] font-black uppercase tracking-wider italic border transition-all',
              activeRegion === r
                ? 'bg-primary text-white border-primary'
                : 'text-white/40 border-white/10 hover:border-white/30 hover:text-white',
            )}
          >
            {r === 'all' ? 'All regions' : REGION_LABEL[r as DspRegion]}
          </button>
        ))}
      </div>

      {/* Bulk action for current view */}
      <div className="flex items-center justify-between mb-6 p-4 border border-white/5 bg-white/[0.02]">
        <div className="text-[11px] text-white/50 italic">
          Showing <span className="text-white font-black">{filtered.length}</span> of {DSPS.length} platforms
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAllInView(true)}
            className="h-8 px-3 border border-white/10 text-[9px] font-black text-white/60 uppercase tracking-wider italic hover:border-white hover:text-white transition-all"
          >
            Select all in view
          </button>
          <button
            onClick={() => setAllInView(false)}
            className="h-8 px-3 border border-white/10 text-[9px] font-black text-white/60 uppercase tracking-wider italic hover:border-white hover:text-white transition-all"
          >
            Deselect all in view
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
        {filtered.map((p, idx) => {
          const isOn = selected.has(p.id);
          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => toggleOne(p.id)}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(idx * 0.015, 0.4) }}
              className={cn(
                'manifest-card p-6 text-left flex flex-col gap-4 group transition-all bg-dark min-h-[180px] relative',
                isOn ? 'border-primary' : 'border-white/5 hover:border-white/20',
              )}
            >
              {p.recommended && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-[8px] font-black text-primary uppercase tracking-widest italic">
                  <Star className="w-3 h-3 fill-primary" /> Recommended
                </div>
              )}

              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    'w-12 h-12 border flex items-center justify-center p-2 transition-all',
                    isOn ? 'border-primary' : 'border-white/10',
                  )}
                >
                  {p.iconSlug ? (
                    <img
                      src={`https://cdn.simpleicons.org/${p.iconSlug}/${isOn ? 'FF4D00' : 'ffffff'}`}
                      alt=""
                      className={cn('w-full h-full object-contain transition-all', isOn ? 'opacity-100' : 'opacity-30 group-hover:opacity-60')}
                    />
                  ) : (
                    <Globe2 className={cn('w-5 h-5 transition-all', isOn ? 'text-primary' : 'text-white/30')} />
                  )}
                </div>
                <div
                  className={cn(
                    'w-6 h-6 border-2 flex items-center justify-center transition-all',
                    isOn ? 'border-primary bg-primary' : 'border-white/20',
                  )}
                >
                  {isOn && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-white italic tracking-tight mb-1">{p.name}</h3>
                <div className="flex items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-widest italic">
                  <span className="text-primary">{CATEGORY_LABEL[p.category]}</span>
                  <span>·</span>
                  <span>{p.regions.map((r) => REGION_LABEL[r]).join(', ')}</span>
                </div>
              </div>

              {p.note && (
                <p className="text-[11px] text-white/40 leading-relaxed italic mt-auto">{p.note}</p>
              )}
            </motion.button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 border border-dashed border-white/10">
          <div className="text-white/30 italic mb-4">No platforms match those filters.</div>
          <button
            onClick={() => {
              setSearch('');
              setActiveCategory('all');
              setActiveRegion('all');
            }}
            className="text-primary hover:underline italic text-sm"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* CTA — go release */}
      <div className="p-12 border border-primary/20 bg-primary/5 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <Globe2 className="w-40 h-40 text-primary" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">
              Ready to drop?
            </h2>
          </div>
          <p className="text-sm text-white/60 leading-relaxed font-medium max-w-2xl">
            Your selected stores will be the default for any new release. You can still tweak
            per-release if a track only makes sense on a subset (DJ-only, Asia-only, etc.).
          </p>
          {totalSelected === 0 && (
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-2 border border-yellow-500/30 bg-yellow-500/5 text-yellow-300 text-[11px] italic">
              <CheckCircle2 className="w-3 h-3" /> Pick at least one platform before creating a release.
            </div>
          )}
        </div>
        <button
          onClick={() => navigate('/releases/new')}
          disabled={totalSelected === 0}
          className="h-16 px-12 bg-white text-black font-black uppercase italic tracking-widest text-[11px] hover:bg-primary hover:text-white transition-all flex items-center gap-3 shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Create a release
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
