/**
 * useActiveArtist — exposes the currently-active artist for label users.
 *
 * The Roster page sets `dropkast.label.activeArtistId` when a label clicks
 * "Switch to" on a roster card. Every page that lists artist-scoped data
 * (Releases, Earnings, Analytics, Splits, History) reads from this hook
 * and filters its data accordingly.
 *
 * For non-label roles (ARTIST / INFLUENCER / DJ) this returns null,
 * meaning "no scope" — the user only owns their own data anyway.
 */
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const STORAGE_KEY = 'dropkast.label.activeArtistId';
const ROSTER_KEY  = 'dropkast.label.roster';

interface RosterArtist {
  id: string;
  name: string;
  genre?: string;
  status: string;
}

function loadActive(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY) || null;
}

function loadRoster(): RosterArtist[] {
  try {
    return JSON.parse(localStorage.getItem(ROSTER_KEY) || '[]');
  } catch {
    return [];
  }
}

export function useActiveArtist(): {
  activeArtistId: string | null;
  activeArtist: RosterArtist | null;
  setActiveArtist: (id: string | null) => void;
  isLabelUser: boolean;
} {
  const { role } = useTheme();
  const isLabelUser = role === 'LABEL';
  const [activeArtistId, setActiveArtistId] = useState<string | null>(() => loadActive());

  // Sync with cross-tab changes
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setActiveArtistId(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setActiveArtist = (id: string | null) => {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
    setActiveArtistId(id);
  };

  const roster = loadRoster();
  const activeArtist = activeArtistId ? roster.find((a) => a.id === activeArtistId) ?? null : null;

  return {
    activeArtistId: isLabelUser ? activeArtistId : null,
    activeArtist: isLabelUser ? activeArtist : null,
    setActiveArtist,
    isLabelUser,
  };
}
