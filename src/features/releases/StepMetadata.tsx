import { ChevronLeft, ChevronRight, Info } from 'lucide-react';

interface StepMetadataProps {
  data: any;
  update: (fields: any) => void;
  next: () => void;
  back: () => void;
}

const genres = ['ELECTRONIC', 'AFROBEATS', 'HIP-HOP', 'DRILL', 'TECHNO', 'HOUSE', 'R&B'];

export default function StepMetadata({ data, update, next, back }: StepMetadataProps) {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter font-mono">Metadata Node</h2>
        <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] font-mono italic">
          Configure transmission identifiers.
        </p>
      </div>

      <div className="space-y-10">
        <div className="space-y-4">
          <label className="text-[11px] font-black text-primary uppercase tracking-[0.4em] font-mono italic">Song Title</label>
          <input 
            placeholder="ENTER NODE IDENTITY..."
            value={data.title}
            onChange={(e) => update({ title: e.target.value })}
            className="w-full bg-transparent border-b border-white/10 py-6 text-white text-3xl font-mono font-black italic focus:outline-none focus:border-primary transition-all placeholder:opacity-5"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <label className="text-[11px] font-black text-primary uppercase tracking-[0.4em] font-mono italic">Artist Name</label>
            <input 
              placeholder="PRIMARY_OPERATOR..."
              value={data.artist}
              onChange={(e) => update({ artist: e.target.value })}
              className="w-full bg-dark border border-white/5 p-6 text-white font-mono font-bold tracking-widest focus:outline-none focus:border-primary transition-all text-xs uppercase"
            />
          </div>
          <div className="space-y-4">
            <label className="text-[11px] font-black text-primary uppercase tracking-[0.4em] font-mono italic">Genre Category</label>
            <select 
              value={data.genre}
              onChange={(e) => update({ genre: e.target.value })}
              className="w-full bg-dark border border-white/5 p-6 text-white font-mono font-bold tracking-widest focus:outline-none focus:border-primary transition-all text-xs uppercase appearance-none"
            >
              <option value="">SELECT_SIGNAL_TYPE</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-6 p-10 bg-primary/5 border border-primary/20">
          <div className="shrink-0">
             <Info className="w-6 h-6 text-primary" />
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed font-sans italic font-medium uppercase tracking-widest">
            Ensure titles match exactly as they appear in the audio metadata. Avoid decorative emojis or platform-specific tags (e.g., [Spotify Exclusive]).
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-12 items-center">
        <button 
          onClick={back}
          className="flex items-center gap-3 text-white/20 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em] font-mono italic"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous_Entry
        </button>
        <button 
          onClick={next}
          disabled={!data.title || !data.artist || !data.genre}
          className="h-16 px-14 bg-white text-black hover:bg-primary hover:text-white font-mono font-black italic tracking-widest uppercase text-xs transition-all active:scale-95 disabled:opacity-20 flex items-center gap-4"
        >
          Proceed to Art
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
