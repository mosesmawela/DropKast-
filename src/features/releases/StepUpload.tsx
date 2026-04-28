import { Upload, Disc, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StepUploadProps {
  data: any;
  update: (fields: any) => void;
  next: () => void;
}

export default function StepUpload({ data, update, next }: StepUploadProps) {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter font-mono">Upload Audio</h2>
        <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] font-mono italic">
          Deliver high-fidelity master nodes (WAV/FLAC).
        </p>
      </div>

      <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer group relative">
        <input 
          type="file" 
          accept="audio/wav,audio/flac,audio/mpeg"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) update({ audio: file });
          }}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        
        {data.audio ? (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 border border-primary flex items-center justify-center mx-auto bg-primary/5">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-xl font-black text-white font-mono italic uppercase tracking-tight">{data.audio.name}</p>
              <p className="text-[10px] text-white/30 font-bold tracking-widest font-mono uppercase mt-2">
                File size: {(data.audio.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button className="text-[10px] font-black text-primary border-b border-primary/20 uppercase tracking-[0.3em] font-mono italic">
              Replace Master Node
            </button>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 border border-white/10 flex items-center justify-center mb-8 group-hover:border-primary transition-all">
              <Upload className="w-5 h-5 text-white/20 group-hover:text-primary" />
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-white mb-2 font-mono italic tracking-widest uppercase">Select Audio Node</p>
              <p className="text-white/30 text-[10px] font-bold tracking-widest font-mono italic uppercase">Drag & Drop master files</p>
            </div>
          </>
        )}
      </div>

      <div className="p-8 border border-white/5 bg-dark space-y-4">
        <div className="flex items-center gap-4">
          <Disc className="w-5 h-5 text-primary" />
          <h4 className="text-[11px] font-black text-white italic tracking-widest uppercase font-mono">Encoder Integrity</h4>
        </div>
        <p className="text-[11px] text-white/30 leading-relaxed font-sans italic font-medium uppercase tracking-widest">
          Avoid using converted MP3s. Native 16-bit or 24-bit WAV files ensure maximum node resonance across global DSP networks.
        </p>
      </div>

      <div className="flex justify-end pt-12">
        <button 
          onClick={next}
          disabled={!data.audio}
          className="h-16 px-14 bg-white text-black hover:bg-primary hover:text-white font-mono font-black italic tracking-widest uppercase text-xs transition-all active:scale-95 disabled:opacity-20 flex items-center gap-4"
        >
          Confirm Audio
          <CheckCircle2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
