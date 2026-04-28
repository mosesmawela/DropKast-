import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Release } from '../types';

interface ReleaseContextType {
  releases: Release[];
  addRelease: (release: Omit<Release, 'id' | 'status'>) => Promise<void>;
  updateRelease: (id: string, data: Partial<Release>) => void;
  deleteRelease: (id: string) => void;
  isLoading: boolean;
}

const ReleaseContext = createContext<ReleaseContextType | undefined>(undefined);

const SEED_DATA: Release[] = [];

export const ReleaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Sync with Backend
  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const res = await fetch('/api/releases');
        const data = await res.json();
        setReleases(data);
      } catch (err) {
        console.error('Master Node Sync Failed:', err);
        setReleases([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReleases();
  }, []);

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
      setReleases(prev => [newRelease, ...prev]);
      return newRelease;
    } catch (err) {
      console.error('Transmission Blocked:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRelease = (id: string, data: Partial<Release>) => {
    const updated = releases.map(r => r.id === id ? { ...r, ...data } : r);
    setReleases(updated);
  };

  const deleteRelease = (id: string) => {
    const updated = releases.filter(r => r.id !== id);
    setReleases(updated);
  };

  return (
    <ReleaseContext.Provider value={{ releases, addRelease, updateRelease, deleteRelease, isLoading }}>
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
