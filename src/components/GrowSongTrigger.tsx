import { Zap } from 'lucide-react';
import { useGrowSong } from '../context/GrowSongContext';

export default function GrowSongTrigger() {
  const { open } = useGrowSong();
  return (
    <button
      onClick={open}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-[10px] font-mono font-black uppercase italic tracking-widest hover:scale-[1.04] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,77,0,0.3)]"
      title="Grow My Song"
    >
      <Zap className="w-3.5 h-3.5" />
      <span className="hidden lg:inline">Grow My Song</span>
      <span className="hidden md:inline lg:hidden">Grow</span>
    </button>
  );
}
