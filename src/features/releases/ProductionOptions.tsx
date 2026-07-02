/**
 * Production Options panel — drops into the release wizard.
 *
 * Mirrors the upgrade-tier add-ons every pro distro surfaces during upload:
 *   - Hi-res audio (24-bit / 96+ kHz) — Amuse Plus, DistroKid Musician+
 *   - Cover-song mechanical licensing — Amuse native, DistroKid via Easy Song
 *   - AI mastering — DistroKid Mixea ($)
 *   - YouTube Content ID — DistroKid Social Media Pack ($)
 *
 * Pricing copy uses placeholders; real prices live behind the billing
 * provider and are surfaced after Stripe is wired.
 */
import { Sparkles, Headphones, Music, Youtube, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  data: any;
  update: (fields: any) => void;
}

const OPTIONS: Array<{
  key: string;
  label: string;
  desc: string;
  icon: any;
  price?: string;
  conditional?: 'cover_original_artist';
}> = [
  {
    key: 'is_hi_res',
    label: 'Hi-res audio (24-bit / 96 kHz)',
    desc: 'Deliver lossless to Apple Music, Tidal, Qobuz, Amazon Music HD. Requires a hi-res master.',
    icon: Headphones,
    price: 'Included',
  },
  {
    key: 'ai_mastering_opt_in',
    label: 'AI mastering (Mixea-style)',
    desc: 'Run your master through our AI engine pre-delivery. -14 LUFS target, -1 dBTP ceiling. Adds 3-5 minutes.',
    icon: Sparkles,
    price: '+$5 / track',
  },
  {
    key: 'is_cover_song',
    label: 'This is a cover song',
    desc: 'We\'ll generate the mechanical license for the original work. US-only auto-clearance via Easy Song.',
    icon: Music,
    price: '+$15 + 9.1¢/copy',
    conditional: 'cover_original_artist',
  },
  {
    key: 'youtube_content_id',
    label: 'YouTube Content ID',
    desc: 'Earn ad revenue when fans use your audio in their videos. Eligibility: no samples / loops / AI vocals.',
    icon: Youtube,
    price: '+10% of YT earnings',
  },
];

export default function ProductionOptions({ data, update }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.3em] italic mb-1">
        <Sparkles className="w-3 h-3" /> Production options
      </div>
      <p className="text-[11px] text-white/40 italic mb-4">
        Optional add-ons. Defaults are off — turn on only what your project needs.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {OPTIONS.map((opt) => {
          const isOn = !!data[opt.key];
          const Icon = opt.icon;
          return (
            <div key={opt.key}>
              <button
                type="button"
                onClick={() => update({ [opt.key]: !isOn })}
                className={cn(
                  'beam w-full flex items-start gap-3 p-4 border transition-all text-left',
                  isOn ? 'border-primary bg-primary/5' : 'border-white/10',
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 border-2 flex items-center justify-center shrink-0 mt-0.5',
                    isOn ? 'border-primary bg-primary' : 'border-white/20',
                  )}
                >
                  {isOn && <div className="w-2 h-2 bg-white" />}
                </div>
                <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', isOn ? 'text-primary' : 'text-white/40')} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <div className="text-sm font-black italic text-white">{opt.label}</div>
                    {opt.price && (
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest italic shrink-0">
                        {opt.price}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-white/50 italic leading-relaxed">{opt.desc}</div>
                </div>
              </button>

              {/* Cover-song reveals an "original artist" field when toggled on */}
              {opt.conditional === 'cover_original_artist' && isOn && (
                <div className="mt-2 pl-8">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic block mb-2">
                    Original artist + writer(s)
                  </label>
                  <input
                    type="text"
                    value={data.cover_original_artist || ''}
                    onChange={(e) => update({ cover_original_artist: e.target.value })}
                    placeholder="e.g. Frank Sinatra (Cole Porter, writer)"
                    className="w-full bg-black border border-white/10 py-2 px-3 text-white text-sm focus:outline-none focus:border-primary"
                  />
                  <p className="text-[10px] text-white/40 italic mt-2 flex items-start gap-2">
                    <Info className="w-3 h-3 shrink-0 mt-0.5" />
                    We'll auto-clear the mechanical license. Royalties to original songwriter handled
                    by Easy Song. You get the master royalties.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
