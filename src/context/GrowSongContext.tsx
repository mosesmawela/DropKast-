import { createContext, useContext, useState, ReactNode } from 'react';

interface GrowSongContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const Ctx = createContext<GrowSongContextType | undefined>(undefined);

export function GrowSongProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Ctx.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useGrowSong() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useGrowSong must be used within GrowSongProvider');
  return c;
}
