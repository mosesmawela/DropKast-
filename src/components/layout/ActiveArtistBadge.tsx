/**
 * Floats in the topbar for LABEL users. Shows which artist they're
 * currently managing — clicking opens /roster to switch.
 *
 * Hidden for ARTIST/INFLUENCER/DJ roles since they don't have a roster.
 */
import { Link } from 'react-router-dom';
import { Building2, ChevronDown } from 'lucide-react';
import { useActiveArtist } from '../../hooks/useActiveArtist';

export default function ActiveArtistBadge() {
  const { isLabelUser, activeArtist } = useActiveArtist();
  if (!isLabelUser) return null;

  return (
    <Link
      to="/roster"
      className="beam hidden md:flex items-center gap-3 h-9 px-3 border border-primary/30 bg-primary/5 transition-colors group"
      title="Switch managed artist"
    >
      <Building2 className="w-3.5 h-3.5 text-primary" />
      <div className="text-left">
        <div className="text-[8px] font-black text-primary uppercase tracking-[0.3em] italic leading-none">
          Managing
        </div>
        <div className="text-[11px] font-black italic text-white leading-tight mt-0.5">
          {activeArtist ? activeArtist.name : 'Whole roster'}
        </div>
      </div>
      <ChevronDown className="w-3 h-3 text-white transition-colors" />
    </Link>
  );
}
