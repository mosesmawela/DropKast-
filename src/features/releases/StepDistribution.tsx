import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Globe2, Calendar, Check, Sparkles, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  DSPS,
  CATEGORY_LABEL,
  RECOMMENDED_DSP_IDS,
  ALL_DSP_IDS,
  TIER1_DSP_IDS,
  SHORT_FORM_DSP_IDS,
  type DspCategory,
} from '../../lib/dsps';

const STORAGE_KEY = 'dropkast.preferred_stores';

interface StepDistributionProps {
  data: any;
  update: (fields: any) => void;
  next: () => void;
  back: () => void;
}

/** First Friday on/after today + 21 days (recommended editorial lead time). */
function nextFridayPlus21(): string {
  const d = new Date();
  d.setDate(d.getDate() + 21);
  while (d.getDay() !== 5) d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

const CATEGORY_ORDER: DspCategory[] = [
  'streaming-tier1',
  'short-form',
  'streaming-regional',
  'dj-pool',
  'store-download',
  'lyrics',
  'radio',
  'fitness-bgm',
  'video',
  'fingerprint',
  'other',
];

export default function StepDistribution({ data, update, next, back }: StepDistributionProps) {
  // Initialise platforms from saved global prefs if release has none yet
  useEffect(() => {
    if (!data.platforms || data.platforms.length === 0) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const initial = saved ? JSON.parse(saved) as string[] : RECOMMENDED_DSP_IDS;
        update({ platforms: initial });
      } catch {
        update({ platforms: RECOMMENDED_DSP_IDS });
      }
    }
    if (!data.releaseDate) {
      update({ releaseDate: nextFridayPlus21() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [openCategory, setOpenCategory] = useState<DspCategory>('streaming-tier1');

  const grouped = useMemo(() => {
    const out: Record<DspCategory, typeof DSPS> = {
      'streaming-tier1': [],
      'streaming-regional': [],
      'short-form': [],
      'dj-pool': [],
      'fitness-bgm': [],
      'store-download': [],
      'lyrics': [],
      'radio': [],
      'fingerprint': [],
      'video': [],
      'other': [],
    };
    for (const d of DSPS) out[d.category].push(d);
    return out;
  }, []);

  const selected: Set<string> = new Set(data.platforms || []);

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    update({ platforms: Array.from(next) });
  };

  const toggleCategory = (cat: DspCategory, on: boolean) => {
    const next = new Set(selected);
    for (const d of grouped[cat]) {
      if (on) next.add(d.id);
      else next.delete(d.id);
    }
    update({ platforms: Array.from(next) });
  };

  const setPreset = (preset: 'all' | 'recommended' | 'tier1') => {
    let ids: string[] = [];
    if (preset === 'all') ids = ALL_DSP_IDS;
    else if (preset === 'recommended') ids = RECOMMENDED_DSP_IDS;
    else ids = TIER1_DSP_IDS;
    update({ platforms: ids });
  };

  const total = selected.size;

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
          Where should this drop?
        </h2>
        <p className="text-white/40 text-sm font-medium leading-relaxed max-w-2xl">
          Pick the streaming services, social platforms, DJ pools, and stores. Defaults to your saved
          preference. Hit "All platforms" if you want maximum reach across all {DSPS.length} destinations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: schedule + presets */}
        <div className="lg:col-span-1 space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Release date
            </label>
            <input
              type="date"
              value={data.releaseDate}
              onChange={(e) => update({ releaseDate: e.target.value })}
              className="w-full bg-dark border border-white/10 p-4 text-white focus:outline-none focus:border-primary transition-all text-sm"
            />
            <p className="text-[10px] text-white/40 italic leading-relaxed">
              Spotify editorial accepts pitches up to 28 days out. We default to the next Friday
              that's 21+ days away (sweet spot for playlisting).
            </p>
          </div>

          <div className="manifest-card p-6 bg-dark border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">
              <Globe2 className="w-3.5 h-3.5" /> Quick pick
            </div>
            <button
              type="button"
              onClick={() => setPreset('all')}
              className="w-full h-11 bg-primary text-white text-[10px] font-black uppercase tracking-widest italic hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-3 h-3" /> All {ALL_DSP_IDS.length} platforms
            </button>
            <button
              type="button"
              onClick={() => setPreset('recommended')}
              className="w-full h-11 bg-white text-black text-[10px] font-black uppercase tracking-widest italic hover:bg-white/80 transition-all flex items-center justify-center gap-2"
            >
              <Star className="w-3 h-3" /> Recommended ({RECOMMENDED_DSP_IDS.length})
            </button>
            <button
              type="button"
              onClick={() => setPreset('tier1')}
              className="w-full h-11 border border-white/20 text-white/80 text-[10px] font-black uppercase tracking-widest italic hover:bg-white hover:text-black transition-all"
            >
              Major streaming only
            </button>
          </div>

          <div className="manifest-card p-6 bg-dark border-primary/20 space-y-2">
            <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Selected</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black italic text-white">{total}</span>
              <span className="text-sm text-white/30 italic">of {DSPS.length}</span>
            </div>
            <div className="h-1 bg-white/10 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-primary transition-all duration-500"
                style={{ width: `${(total / DSPS.length) * 100}%` }}
              />
            </div>
            {selected.has('tiktok') && selected.has('instagram') && selected.has('facebook') && (
              <div className="flex items-center gap-2 mt-3 text-[10px] text-green-400 italic">
                <Sparkles className="w-3 h-3" /> Short-form pack on (TikTok + Reels + FB)
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: category accordion */}
        <div className="lg:col-span-2 space-y-3">
          {CATEGORY_ORDER.map((cat) => {
            const list = grouped[cat];
            if (!list.length) return null;
            const onCount = list.filter((d) => selected.has(d.id)).length;
            const allOn = onCount === list.length;
            const isOpen = openCategory === cat;

            return (
              <div key={cat} className="border border-white/10 bg-dark">
                <button
                  type="button"
                  onClick={() => setOpenCategory(isOpen ? ('' as any) : cat)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'w-5 h-5 border-2 flex items-center justify-center cursor-pointer',
                        allOn ? 'border-primary bg-primary' : onCount > 0 ? 'border-primary' : 'border-white/20',
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategory(cat, !allOn);
                      }}
                    >
                      {allOn && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      {!allOn && onCount > 0 && <div className="w-2 h-2 bg-primary" />}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-black text-white italic uppercase tracking-tight">
                        {CATEGORY_LABEL[cat]}
                      </div>
                      <div className="text-[10px] text-white/40 italic">
                        {onCount} of {list.length} selected
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={cn('w-4 h-4 text-white/40 transition-transform', isOpen && 'rotate-90')}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-white/5 p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {list.map((d) => {
                      const isOn = selected.has(d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => toggleOne(d.id)}
                          className={cn(
                            'flex items-center gap-3 p-3 border transition-all text-left',
                            isOn ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-white/20',
                          )}
                        >
                          <div
                            className={cn(
                              'w-5 h-5 border-2 flex items-center justify-center shrink-0',
                              isOn ? 'border-primary bg-primary' : 'border-white/20',
                            )}
                          >
                            {isOn && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                          </div>
                          {d.iconSlug ? (
                            <img
                              src={`https://cdn.simpleicons.org/${d.iconSlug}/${isOn ? 'FF4D00' : 'ffffff'}`}
                              alt=""
                              className={cn('w-5 h-5 object-contain', isOn ? 'opacity-100' : 'opacity-40')}
                            />
                          ) : (
                            <Globe2 className={cn('w-4 h-4 shrink-0', isOn ? 'text-primary' : 'text-white/30')} />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-black text-white italic truncate">{d.name}</div>
                            {d.recommended && (
                              <div className="text-[8px] font-black text-primary uppercase tracking-widest italic">★ Recommended</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between pt-8 items-center border-t border-white/5">
        <button
          type="button"
          onClick={back}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em] italic"
        >
          <ChevronLeft className="w-3 h-3" />
          Back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!data.releaseDate || total === 0}
          className="h-14 px-10 bg-white text-black hover:bg-primary hover:text-white font-black italic tracking-widest uppercase text-[11px] transition-all active:scale-95 disabled:opacity-20 flex items-center gap-3"
        >
          Review &amp; submit
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
