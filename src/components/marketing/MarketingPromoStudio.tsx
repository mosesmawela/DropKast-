import { useState } from 'react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import {
  Link2,
  Send,
  Image,
  Music,
  Users,
  Download,
  ChevronRight,
  Sparkles,
  Globe,
  BarChart3,
  CheckCircle2,
  Clock,
} from 'lucide-react';

type PromoTab = 'presave' | 'pitching' | 'art-generator';

export default function MarketingPromoStudio() {
  const [tab, setTab] = useState<PromoTab>('presave');

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8 px-4 sm:px-0">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/40 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black tracking-widest uppercase italic">MARKETING PROMO STUDIO</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase italic">Promotional Tools</h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-white/5 overflow-x-auto">
        {[
          { id: 'presave' as PromoTab, icon: Link2, label: 'PRE-SAVES / SMART LINKS' },
          { id: 'pitching' as PromoTab, icon: Send, label: 'PITCHING' },
          { id: 'art-generator' as PromoTab, icon: Image, label: 'ART GENERATOR' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-6 sm:px-8 py-4 text-[10px] font-black uppercase tracking-widest italic transition-all flex items-center gap-2 whitespace-nowrap',
              tab === t.id ? 'text-primary border-b-2 border-primary' : 'text-white/40',
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'presave' && <PreSaveSmartLinks />}
          {tab === 'pitching' && <PitchingPanel />}
          {tab === 'art-generator' && <PromoArtGenerator />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* =========================================================================
 * Pre-Saves & Smart Links
 * ========================================================================= */
function PreSaveSmartLinks() {
  const [labelFilter, setLabelFilter] = useState('');
  const [artistFilter, setArtistFilter] = useState('');
  const [albumFilter, setAlbumFilter] = useState('');

  const campaigns: { album: string; artist: string; releaseDate: string; actions: string }[] = [];

  return (
    <div className="space-y-8">
      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--card-bg)] border border-white/5 p-8 space-y-4">
          <h3 className="text-xs font-black text-white uppercase italic">Pre-Save</h3>
          <p className="text-[10px] text-white/50 italic leading-relaxed">
            Fans can save your music ahead of its release and on release day we will automatically add it to user's libraries. We currently support pre-save on Spotify, Apple Music, and Deezer.
          </p>
        </div>
        <div className="bg-[var(--card-bg)] border border-white/5 p-8 space-y-4">
          <h3 className="text-xs font-black text-white uppercase italic">Smart Link</h3>
          <p className="text-[10px] text-white/50 italic leading-relaxed">
            Shareable, trackable URL that routes fans to listen to your releases in their preferred music service.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-[var(--bg-main)] border border-white/5 p-4">
        <select value={labelFilter} onChange={(e) => setLabelFilter(e.target.value)} className="border border-white/10 px-4 py-3 text-[9px] font-black text-white/60 uppercase tracking-widest italic bg-black">
          <option value="">Select a Label</option>
        </select>
        <select value={artistFilter} onChange={(e) => setArtistFilter(e.target.value)} className="border border-white/10 px-4 py-3 text-[9px] font-black text-white/60 uppercase tracking-widest italic bg-black">
          <option value="">Select an Artist</option>
        </select>
        <select value={albumFilter} onChange={(e) => setAlbumFilter(e.target.value)} className="border border-white/10 px-4 py-3 text-[9px] font-black text-white/60 uppercase tracking-widest italic bg-black">
          <option value="">Select an Album</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[var(--card-bg)] border border-white/5 overflow-x-auto">
        <table className="w-full min-w-[600px] text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-[var(--bg-main)]">
              {['ALBUM', 'ARTIST', 'RELEASE DATE', 'ACTIONS'].map((h) => (
                <th key={h} className="px-6 py-4 text-[9px] font-black text-white/50 tracking-widest uppercase italic">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center">
                  <Link2 className="w-8 h-8 text-white/20 mx-auto mb-3" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">No campaigns yet</span>
                </td>
              </tr>
            ) : (
              campaigns.map((c, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="px-6 py-5 text-xs font-black text-white italic">{c.album}</td>
                  <td className="px-6 py-5 text-[10px] font-black text-white/60 italic">{c.artist}</td>
                  <td className="px-6 py-5 text-[10px] font-black text-white/40 italic">{c.releaseDate}</td>
                  <td className="px-6 py-5">
                    <button className="text-[9px] font-black text-primary uppercase tracking-widest italic hover:underline flex items-center gap-1">
                      Manage <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Fan Email Harvest */}
      <FanEmailHarvest />
    </div>
  );
}

/* =========================================================================
 * Fan Email Harvest CRM (Module H.3)
 * ========================================================================= */
function FanEmailHarvest() {
  const stats = [
    { label: 'Users have presaved this album', value: '0', icon: Users },
    { label: 'Users with premium accounts', value: '0', icon: Music },
    { label: 'Top territories', value: '—', icon: Globe },
  ];

  return (
    <div className="bg-[var(--bg-main)] border border-white/5 p-6 space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest italic">Fan CRM — Email Harvest</h3>
        <button className="beam flex items-center gap-2 px-6 py-3 bg-primary text-black text-[9px] font-black uppercase tracking-widest italic transition-all">
          <Download className="w-3 h-3" />
          DOWNLOAD EMAIL LIST
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-[var(--card-bg)] border border-white/5 p-5 flex items-start gap-4">
            <div className="w-10 h-10 border border-white/10 flex items-center justify-center">
              <s.icon className="w-4 h-4 text-white/40" />
            </div>
            <div>
              <div className="text-lg font-black text-white italic">{s.value}</div>
              <div className="text-[8px] font-black text-white/40 uppercase tracking-widest italic mt-1">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
 * Pitching Panel (Module H.2)
 * ========================================================================= */
function PitchingPanel() {
  const [labelFilter, setLabelFilter] = useState('');
  const [artistFilter, setArtistFilter] = useState('');
  const [albumFilter, setAlbumFilter] = useState('');

  const upcoming: { album: string; artist: string; releaseDate: string; status: string }[] = [];
  const historical: { album: string; artist: string; releaseDate: string; status: string }[] = [];

  return (
    <div className="space-y-12">
      {/* Upcoming */}
      <div className="space-y-6">
        <h2 className="text-sm font-black text-white uppercase italic tracking-tight flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Active Pitch Candidates
        </h2>
        <div className="bg-[var(--card-bg)] border border-white/5 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[var(--bg-main)]">
                {['ALBUM', 'ARTIST', 'RELEASE DATE', 'PITCHING ACTION STATUS'].map((h) => (
                  <th key={h} className="px-6 py-4 text-[9px] font-black text-white/50 tracking-widest uppercase italic">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {upcoming.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-16 text-center text-[10px] font-black text-white/30 italic">No upcoming releases to pitch</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical */}
      <div className="space-y-6">
        <h2 className="text-sm font-black text-white uppercase italic tracking-tight flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-white/40" />
          All Previously Pitched Releases
        </h2>

        <div className="flex flex-wrap gap-4 bg-[var(--bg-main)] border border-white/5 p-4">
          <select value={labelFilter} onChange={(e) => setLabelFilter(e.target.value)} className="border border-white/10 px-4 py-3 text-[9px] font-black text-white/60 uppercase tracking-widest italic bg-black">
            <option value="">Select a Label</option>
          </select>
          <select value={artistFilter} onChange={(e) => setArtistFilter(e.target.value)} className="border border-white/10 px-4 py-3 text-[9px] font-black text-white/60 uppercase tracking-widest italic bg-black">
            <option value="">Select an Artist</option>
          </select>
          <select value={albumFilter} onChange={(e) => setAlbumFilter(e.target.value)} className="border border-white/10 px-4 py-3 text-[9px] font-black text-white/60 uppercase tracking-widest italic bg-black">
            <option value="">Select an Album</option>
          </select>
        </div>

        <div className="bg-[var(--card-bg)] border border-white/5 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[var(--bg-main)]">
                {['ALBUM', 'ARTIST', 'RELEASE DATE', 'DISTRO / PLATFORM PITCH STATUS'].map((h) => (
                  <th key={h} className="px-6 py-4 text-[9px] font-black text-white/50 tracking-widest uppercase italic">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historical.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-16 text-center text-[10px] font-black text-white/30 italic">No pitch history</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
 * Promo Art Generator (Module H.4)
 * ========================================================================= */
function PromoArtGenerator() {
  const [albumSelect, setAlbumSelect] = useState('');
  const [labelFilter, setLabelFilter] = useState('');
  const [artistFilter, setArtistFilter] = useState('');
  const [albumFilter, setAlbumFilter] = useState('');

  const assets: { album: string; artist: string; promoType: string; format: string; date: string }[] = [];

  return (
    <div className="space-y-8">
      {/* Create new */}
      <div className="bg-[var(--card-bg)] border border-white/5 p-6 space-y-4">
        <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest italic">Source Asset</h3>
        <div className="flex flex-wrap items-center gap-4">
          <select value={albumSelect} onChange={(e) => setAlbumSelect(e.target.value)} className="flex-1 min-w-[200px] border border-white/10 px-4 py-4 text-[10px] font-black text-white/60 uppercase tracking-widest italic bg-black">
            <option value="">Select Album</option>
          </select>
          <button className="beam px-8 py-4 bg-primary text-black text-[10px] font-black uppercase tracking-widest italic transition-all flex items-center gap-2">
            <Image className="w-4 h-4" />
            CREATE NEW
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-[var(--bg-main)] border border-white/5 p-4">
        <select value={labelFilter} onChange={(e) => setLabelFilter(e.target.value)} className="border border-white/10 px-4 py-3 text-[9px] font-black text-white/60 uppercase tracking-widest italic bg-black">
          <option value="">Select a Label</option>
        </select>
        <select value={artistFilter} onChange={(e) => setArtistFilter(e.target.value)} className="border border-white/10 px-4 py-3 text-[9px] font-black text-white/60 uppercase tracking-widest italic bg-black">
          <option value="">Select an Artist</option>
        </select>
        <select value={albumFilter} onChange={(e) => setAlbumFilter(e.target.value)} className="border border-white/10 px-4 py-3 text-[9px] font-black text-white/60 uppercase tracking-widest italic bg-black">
          <option value="">Select an Album</option>
        </select>
      </div>

      {/* Assets Table */}
      <div className="bg-[var(--card-bg)] border border-white/5 overflow-x-auto">
        <table className="w-full min-w-[700px] text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-[var(--bg-main)]">
              {['ALBUM', 'ARTIST', 'PROMO TYPE', 'FORMAT', 'DATE CREATED', 'ACTIONS'].map((h) => (
                <th key={h} className="px-6 py-4 text-[9px] font-black text-white/50 tracking-widest uppercase italic">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assets.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <Image className="w-8 h-8 text-white/20 mx-auto mb-3" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">No promo assets yet</span>
                </td>
              </tr>
            )}
            {assets.map((a, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="px-6 py-5 text-xs font-black text-white italic">{a.album}</td>
                <td className="px-6 py-5 text-[10px] font-black text-white/60 italic">{a.artist}</td>
                <td className="px-6 py-5"><span className="text-[9px] font-black text-white/60 italic">{a.promoType}</span></td>
                <td className="px-6 py-5"><span className="text-[9px] font-black text-white/40 italic uppercase">{a.format}</span></td>
                <td className="px-6 py-5 text-[9px] font-black text-white/40 italic">{a.date}</td>
                <td className="px-6 py-5">
                  <button className="text-[9px] font-black text-primary uppercase tracking-widest italic hover:underline">
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
