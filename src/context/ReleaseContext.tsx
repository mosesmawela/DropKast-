import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Release } from '../types';
import { useActiveArtist } from '../hooks/useActiveArtist';

interface ReleaseContextType {
  /** Releases scoped to the currently-active artist (for label users). */
  releases: Release[];
  /** All releases regardless of scope — used by /roster catalogue rollups. */
  allReleases: Release[];
  addRelease: (release: Omit<Release, 'id' | 'status'>) => Promise<void>;
  updateRelease: (id: string, data: Partial<Release>) => void;
  deleteRelease: (id: string) => void;
  isLoading: boolean;
}

const ReleaseContext = createContext<ReleaseContextType | undefined>(undefined);

const SEED_DATA: Release[] = [];

export const ReleaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allReleases, setAllReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { activeArtistId, activeArtist } = useActiveArtist();

  // Initial Sync with Backend
  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const res = await fetch('/api/releases');
        const data = await res.json();
        setAllReleases(data);
      } catch (err) {
        console.error('Failed to load releases:', err);
        setAllReleases([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReleases();
  }, []);

  // Scope releases to the active artist when a label is in artist-context
  const releases = useMemo(() => {
    if (!activeArtistId || !activeArtist) return allReleases;
    return allReleases.filter(
      (r: any) =>
        r.artistId === activeArtistId ||
        (r.artist && r.artist.toLowerCase().includes(activeArtist.name.toLowerCase())),
    );
  }, [allReleases, activeArtistId, activeArtist]);

  const addRelease = async (newReleaseData: any): Promise<any> => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Append basic fields
      formData.append('title', newReleaseData.title);
      formData.append('artist', newReleaseData.artist);
      formData.append('genre', newReleaseData.genre);
      formData.append('releaseDate', newReleaseData.releaseDate);
      
      // Append files
      if (newReleaseData.audio) formData.append('audio', newReleaseData.audio);
      if (newReleaseData.artwork) formData.append('artwork', newReleaseData.artwork);
      
      // Append platforms (as array)
      if (newReleaseData.platforms) {
        newReleaseData.platforms.forEach((platform: string) => {
          formData.append('platforms', platform);
        });
      }

      const res = await fetch('/api/releases', {
        method: 'POST',
        body: formData, // No need for Content-Type header with FormData, browser sets it with boundary
      });
      const newRelease = await res.json();
      // Tag the release with the active artist when a label creates it
      if (activeArtistId) (newRelease as any).artistId = activeArtistId;
      setAllReleases(prev => [newRelease, ...prev]);
      return newRelease;
    } catch (err) {
      console.error('Failed to create release:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRelease = (id: string, data: Partial<Release>) => {
    setAllReleases(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  };

  const deleteRelease = (id: string) => {
    setAllReleases(prev => prev.filter(r => r.id !== id));
  };

  return (
    <ReleaseContext.Provider value={{ releases, allReleases, addRelease, updateRelease, deleteRelease, isLoading }}>
      {children}
    </ReleaseContext.Provider>
  );
};

export const useReleases = () => {
  const context = useContext(ReleaseContext);
  if (context === undefined) {
    throw new Error('useReleases must be used within a ReleaseProvider');
  }
  return context;
};
