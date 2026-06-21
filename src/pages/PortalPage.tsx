import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Loader2 } from 'lucide-react';

interface ArtistInfo {
  id: string;
  name: string;
  role: string;
  accent: string;
}

const ARTIST_PORTALS: Record<string, ArtistInfo> = {
  'al-xapo': { id: 'al-xapo', name: 'Al Xapo', role: 'ARTIST', accent: '#FF4D00' },
  'ciza': { id: 'ciza', name: 'CIZA', role: 'ARTIST', accent: '#acec00' },
  'lvrn': { id: 'lvrn', name: 'LVRN', role: 'ARTIST', accent: '#acec00' },
};

export default function PortalPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { setRole, setVibe } = useTheme();
  const [info, setInfo] = useState<ArtistInfo | null>(null);

  useEffect(() => {
    if (!slug) return;
    const artist = ARTIST_PORTALS[slug.toLowerCase()];
    if (!artist) {
      navigate('/', { replace: true });
      return;
    }
    setInfo(artist);
    localStorage.setItem('campaign-os-role', artist.role);
    setRole(artist.role as any);
    if (artist.accent) {
      const vibeMap: Record<string, any> = {
        '#FF4D00': 'TECHNICAL_ORANGE',
        '#acec00': 'LVRN_GREEN',
      };
      const vibe = vibeMap[artist.accent] || 'TECHNICAL_ORANGE';
      setVibe(vibe);
    }
    navigate('/dashboard', { replace: true });
  }, [slug, navigate, setRole, setVibe]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <span className="text-[10px] font-black text-primary italic tracking-[0.5em] uppercase">
          Loading Portal
        </span>
      </div>
    </div>
  );
}
