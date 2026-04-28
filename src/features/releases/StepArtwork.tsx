import { Image as ImageIcon, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState, useEffect } from 'react';

interface StepArtworkProps {
  data: any;
  update: (fields: any) => void;
  next: () => void;
  back: () => void;
}

export default function StepArtwork({ data, update, next, back }: StepArtworkProps) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (data.artwork && data.artwork instanceof File) {
      const url = URL.createObjectURL(data.artwork);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof data.artwork === 'string') {
      setPreview(data.artwork);
    }
  }, [data.artwork]);

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter font-mono">Visual Identity</h2>
        <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] font-mono italic">
          Upload 3000x3000px master artwork nodes.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <div className="relative aspect-square border-2 border-dashed border-white/5 bg-white/[0.01] flex items-center justify-center group overflow-hidden">
            <input 
              type="file" 
              accept="image/jpeg,image/png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) update({ artwork: file });
              }}
              className="absolute inset-0 opacity-0 cursor-pointer z-20"
            />
            
            {preview ? (
              <>
                <img src={preview} alt="Artwork" className="absolute inset-0 w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                <div className="relative z-10 p-6 bg-black/60 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-[10px] font-black text-white uppercase italic tracking-widest">Update Artwork Node</p>
                </div>
              </>
            ) : (
              <div className="text-center group-hover:scale-110 transition-transform duration-500">
                <div className="w-20 h-20 border border-white/10 flex items-center justify-center mx-auto mb-6 group-hover:border-primary transition-colors">
                  <ImageIcon className="w-8 h-8 text-white/10 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xs font-bold text-white/20 uppercase tracking-[0.3em] font-mono italic">Upload 1:1 Coverage</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-8">
           <div className="manifest-card p-10 bg-dark border-white/5 space-y-6">
              <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] italic font-mono">Node Specifications</h3>
              <ul className="space-y-4">
                 {[
                   '3000 x 3000 Pixel Resolution',
                   'RGB Color Space',
                   'JPEG or PNG Format Only',
                   'No social media handles or logos',
                   'No blurred or low-res captures'
                 ].map((spec, i) => (
                   <li key={i} className="flex items-center gap-3 text-[10px] font-bold text-white uppercase italic tracking-widest font-mono">
                      <div className="w-1 h-1 bg-primary" />
                      {spec}
                   </li>
                 ))}
              </ul>
           </div>
           
           <div className="p-8 border border-white/5 bg-white/5 space-y-4">
              <div className="flex items-center gap-4 text-primary">
                 <CheckCircle2 className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest italic">Compliance Checkpoint</span>
              </div>
              <p className="text-[11px] text-white/30 font-medium font-sans uppercase italic leading-relaxed tracking-widest">
                Our AI will scan the text within your artwork to ensure it aligns with the metadata provided in the previous node.
              </p>
           </div>
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
          disabled={!data.artwork}
          className="h-16 px-14 bg-white text-black hover:bg-primary hover:text-white font-mono font-black italic tracking-widest uppercase text-xs transition-all active:scale-95 disabled:opacity-20 flex items-center gap-4"
        >
          Sync Distribution
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
