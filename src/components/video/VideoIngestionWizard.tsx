import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Check, Upload, Video, Users, Globe, Eye } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';

const steps = [
  { label: 'VIDEO INFO', icon: Video },
  { label: 'VIDEO CONTRIBUTORS', icon: Users },
  { label: 'UPLOAD VIDEO', icon: Upload },
  { label: 'DISTRIBUTION PREFERENCES', icon: Globe },
  { label: 'PREVIEW/DISTRIBUTE', icon: Eye },
];

const mainGenres = [
  'Afrobeats', 'Pop', 'Hip-Hop', 'R&B', 'Electronic', 'Rock',
  'Dancehall', 'Amapiano', 'Reggae', 'Latin', 'K-Pop', 'Jazz',
];

const secondaryGenres = [
  'Afro fusion', 'Afro pop', 'Afro soul', 'Afro house',
  'Alternative', 'Contemporary', 'Experimental', 'Fusion',
];

const languages = [
  'English', 'Spanish', 'French', 'Portuguese', 'Yoruba', 'Zulu',
  'Swahili', 'Arabic', 'Mandarin', 'Japanese',
];

export default function VideoIngestionWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    title: '',
    isAlternative: false,
    primaryArtist: '',
    mainGenre: '',
    secondaryGenre: '',
    language: '',
    label: 'SixxtuneAfrica',
    copyrightYear: new Date().getFullYear().toString(),
    copyrightOwner: 'SixxtuneAfrica',
    recordingYear: new Date().getFullYear().toString(),
    recordingOwner: 'SixxtuneAfrica',
    hasOwnUPC: false,
    upc: '',
    videoFile: null as File | null,
    contributors: [] as string[],
    platforms: [] as string[],
  });

  const update = (fields: Partial<typeof data>) => setData((prev) => ({ ...prev, ...fields }));

  const canProceed = () => {
    switch (step) {
      case 0: return data.title.trim().length > 0 && data.primaryArtist.trim().length > 0;
      case 1: return true;
      case 2: return data.videoFile !== null;
      case 3: return data.platforms.length > 0;
      case 4: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    const release = {
      id: `vid-${Date.now()}`,
      type: 'video',
      title: data.title,
      artist: data.primaryArtist,
      mainGenre: data.mainGenre,
      secondaryGenre: data.secondaryGenre,
      language: data.language,
      label: data.label,
      contributors: data.contributors,
      platforms: data.platforms,
      copyright: `${data.copyrightYear} ${data.copyrightOwner}`,
      recording: `${data.recordingYear} ${data.recordingOwner}`,
      upc: data.hasOwnUPC ? data.upc : 'Auto-generated',
      fileName: data.videoFile?.name,
      fileSize: data.videoFile?.size,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('dropkast_releases') || '[]');
    existing.unshift(release);
    localStorage.setItem('dropkast_releases', JSON.stringify(existing));
    toast.success('Video submitted for distribution', {
      description: 'Your video is being processed for delivery to selected platforms.',
    });
    navigate('/releases');
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto py-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <span className="w-1.5 h-1.5 bg-[#F05A28]" />
          <span className="text-[10px] font-bold tracking-widest uppercase font-mono">VIDEO SUPPLY-CHAIN WIZARD</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase font-mono">Distribute Video</h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 border border-gray-200 bg-gray-50/50">
        {steps.map((s, i) => (
          <div
            key={s.label}
            className={cn(
              'flex-1 flex items-center gap-3 px-5 py-4 text-[9px] font-black uppercase tracking-widest font-mono transition-all',
              i <= step ? 'text-[#F05A28] bg-[#F05A28]/5' : 'text-gray-300',
              i < step && 'text-emerald-600 bg-emerald-50/50',
            )}
          >
            <div
              className={cn(
                'w-8 h-8 border flex items-center justify-center',
                i < step && 'border-emerald-500 bg-emerald-500 text-white',
                i === step && 'border-[#F05A28] text-[#F05A28]',
                i > step && 'border-gray-200 text-gray-300',
              )}
            >
              {i < step ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
            </div>
            <span className="hidden md:inline">{s.label}</span>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-gray-200 ml-4" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white border border-gray-200 p-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && <StepVideoInfo data={data} update={update} />}
            {step === 1 && <StepContributors data={data} update={update} />}
            {step === 2 && <StepUploadFile data={data} update={update} />}
            {step === 3 && <StepDistributionPrefs data={data} update={update} />}
            {step === 4 && <StepPreview data={data} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => step === 0 ? navigate(-1) : setStep(step - 1)}
          className="flex items-center gap-2 px-8 py-4 border border-gray-200 text-gray-600 hover:border-gray-400 transition-all text-[10px] font-black uppercase tracking-widest font-mono"
        >
          <ChevronLeft className="w-4 h-4" />
          {step === 0 ? 'Cancel' : 'Back'}
        </button>

        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className={cn(
              'flex items-center gap-2 px-8 py-4 text-[10px] font-black uppercase tracking-widest font-mono transition-all',
              canProceed()
                ? 'bg-[#F05A28] text-white hover:bg-[#d94d20]'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed',
            )}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest font-mono hover:bg-emerald-700 transition-all"
          >
            <Check className="w-4 h-4" />
            Submit for Distribution
          </button>
        )}
      </div>
    </div>
  );
}

/* Step 1: Video Info */
function StepVideoInfo({ data, update }: { data: any; update: (f: any) => void }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-black text-gray-900 uppercase font-mono mb-1">Video Information</h2>
        <p className="text-[10px] text-gray-400 font-mono">Configure metadata for your video asset.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono block mb-2">Title of a Video</label>
          <input
            value={data.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Enter video title..."
            className="w-full border border-gray-200 px-4 py-3 text-sm font-bold text-gray-800 font-mono focus:border-[#F05A28] outline-none"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.isAlternative}
            onChange={(e) => update({ isAlternative: e.target.checked })}
            className="w-4 h-4 accent-[#F05A28]"
          />
          <span className="text-[10px] font-bold text-gray-600 font-mono">Mark as alternative version of the original release</span>
        </label>

        <div>
          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono block mb-2">Primary Artist or Band Name</label>
          <input
            value={data.primaryArtist}
            onChange={(e) => update({ primaryArtist: e.target.value })}
            placeholder="Artist name..."
            className="w-full border border-gray-200 px-4 py-3 text-sm font-bold text-gray-800 font-mono focus:border-[#F05A28] outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono block mb-2">Main Genre</label>
            <select
              value={data.mainGenre}
              onChange={(e) => update({ mainGenre: e.target.value })}
              className="w-full border border-gray-200 px-4 py-3 text-[10px] font-bold text-gray-600 font-mono uppercase focus:border-[#F05A28] outline-none"
            >
              <option value="">Select main genre</option>
              {mainGenres.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono block mb-2">Secondary Genre</label>
            <select
              value={data.secondaryGenre}
              onChange={(e) => update({ secondaryGenre: e.target.value })}
              className="w-full border border-gray-200 px-4 py-3 text-[10px] font-bold text-gray-600 font-mono uppercase focus:border-[#F05A28] outline-none"
            >
              <option value="">Select secondary genre</option>
              {secondaryGenres.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono block mb-2">
            Language <span className="text-gray-300 normal-case">(Language of the album, album title, and track titles)</span>
          </label>
          <select
            value={data.language}
            onChange={(e) => update({ language: e.target.value })}
            className="w-full border border-gray-200 px-4 py-3 text-[10px] font-bold text-gray-600 font-mono focus:border-[#F05A28] outline-none"
          >
            <option value="">Select language</option>
            {languages.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

/* Step 2: Contributors */
function StepContributors({ data, update }: { data: any; update: (f: any) => void }) {
  const [name, setName] = useState('');
  const addContributor = () => {
    if (name.trim()) {
      update({ contributors: [...data.contributors, name.trim()] });
      setName('');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-black text-gray-900 uppercase font-mono mb-1">Video Contributors</h2>
        <p className="text-[10px] text-gray-400 font-mono">Add featured artists, directors, and contributors.</p>
      </div>

      <div className="flex gap-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addContributor()}
          placeholder="Contributor name..."
          className="flex-1 border border-gray-200 px-4 py-3 text-sm font-bold text-gray-800 font-mono focus:border-[#F05A28] outline-none"
        />
        <button
          onClick={addContributor}
          className="px-6 py-3 bg-[#F05A28] text-white text-[10px] font-black uppercase tracking-widest font-mono hover:bg-[#d94d20] transition-all"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {data.contributors.length === 0 && (
          <p className="text-[10px] text-gray-300 font-mono italic">No contributors added yet. You can skip this step.</p>
        )}
        {data.contributors.map((c: string, i: number) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200">
            <span className="text-xs font-bold text-gray-700 font-mono">{c}</span>
            <button
              onClick={() => update({ contributors: data.contributors.filter((_: string, j: number) => j !== i) })}
              className="text-[9px] font-bold text-red-500 uppercase tracking-widest font-mono"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Step 3: Upload */
function StepUploadFile({ data, update }: { data: any; update: (f: any) => void }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-black text-gray-900 uppercase font-mono mb-1">Upload Video</h2>
        <p className="text-[10px] text-gray-400 font-mono">Select the video file for distribution.</p>
      </div>

      <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer relative">
        <input
          type="file"
          accept="video/mp4,video/mov,video/avi"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) update({ videoFile: file });
          }}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        {data.videoFile ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-2 border-emerald-500 flex items-center justify-center mx-auto bg-emerald-50">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-sm font-black text-gray-800 font-mono">{data.videoFile.name}</p>
            <p className="text-[9px] text-gray-400 font-mono">{(data.videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-gray-300 mb-6" />
            <p className="text-sm font-black text-gray-800 font-mono mb-2">Select file & upload</p>
            <p className="text-[9px] text-gray-400 font-mono">MP4, MOV, or AVI</p>
          </>
        )}
      </div>
    </div>
  );
}

/* Step 4: Distribution Preferences */
function StepDistributionPrefs({ data, update }: { data: any; update: (f: any) => void }) {
  const platformList = [
    { id: 'apple-music', name: 'Apple Music' },
    { id: 'tidal', name: 'Tidal' },
    { id: 'vevo', name: 'VEVO' },
    { id: 'youtube', name: 'YouTube' },
    { id: 'spotify', name: 'Spotify' },
    { id: 'amazon-music', name: 'Amazon Music' },
  ];

  const togglePlatform = (id: string) => {
    const updated = data.platforms.includes(id)
      ? data.platforms.filter((p: string) => p !== id)
      : [...data.platforms, id];
    update({ platforms: updated });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-black text-gray-900 uppercase font-mono mb-1">Distribution Preferences</h2>
        <p className="text-[10px] text-gray-400 font-mono">Select target platforms for your video.</p>
      </div>

      <div className="space-y-4">
        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono block mb-2">Target Platforms</label>
        <div className="grid grid-cols-2 gap-3">
          {platformList.map((p) => (
            <button
              key={p.id}
              onClick={() => togglePlatform(p.id)}
              className={`p-4 border text-left transition-all flex items-center gap-3 ${
                data.platforms.includes(p.id)
                  ? 'border-[#F05A28] bg-[#F05A28]/5 text-[#F05A28]'
                  : 'border-gray-200 text-gray-500 hover:border-gray-400'
              }`}
            >
              <div
                className={`w-5 h-5 border flex items-center justify-center ${
                  data.platforms.includes(p.id) ? 'bg-[#F05A28] border-[#F05A28]' : 'border-gray-300'
                }`}
              >
                {data.platforms.includes(p.id) && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest font-mono">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Label & Copyright */}
      <div className="border-t border-gray-200 pt-8 space-y-6">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">Intellectual Property & Licensing</h3>

        <div>
          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono block mb-2">Label</label>
          <input
            value={data.label}
            onChange={(e) => update({ label: e.target.value })}
            className="w-full border border-gray-200 px-4 py-3 text-sm font-bold text-gray-800 font-mono focus:border-[#F05A28] outline-none"
          />
          <p className="text-[8px] text-gray-400 mt-1 font-mono italic">
            If you are an independent artist, you may leave this field blank, and your artist name will appear as the label name.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono block mb-2">Copyright Date of Release</label>
            <input
              value={`${data.copyrightYear} ${data.copyrightOwner}`}
              onChange={(e) => {
                const parts = e.target.value.split(' ');
                update({ copyrightYear: parts[0], copyrightOwner: parts.slice(1).join(' ') || data.copyrightOwner });
              }}
              className="w-full border border-gray-200 px-4 py-3 text-[10px] font-bold text-gray-800 font-mono focus:border-[#F05A28] outline-none"
            />
          </div>
          <div>
            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono block mb-2">Copyright Date of Recording</label>
            <input
              value={`${data.recordingYear} ${data.recordingOwner}`}
              onChange={(e) => {
                const parts = e.target.value.split(' ');
                update({ recordingYear: parts[0], recordingOwner: parts.slice(1).join(' ') || data.recordingOwner });
              }}
              className="w-full border border-gray-200 px-4 py-3 text-[10px] font-bold text-gray-800 font-mono focus:border-[#F05A28] outline-none"
            />
          </div>
        </div>

        {/* UPC */}
        <div className="border-t border-gray-100 pt-6 space-y-4">
          <div>
            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono block mb-2">
              Universal Product Identifier (UPC)
            </label>
            <p className="text-[8px] text-gray-400 mb-3 font-mono italic">
              If you don't have a Bar Code (UPC) we will generate one for you.
            </p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.hasOwnUPC}
                onChange={(e) => update({ hasOwnUPC: e.target.checked })}
                className="w-4 h-4 accent-[#F05A28]"
              />
              <span className="text-[10px] font-bold text-gray-600 font-mono">I have my own UPC</span>
            </label>
          </div>
          {data.hasOwnUPC && (
            <input
              value={data.upc}
              onChange={(e) => update({ upc: e.target.value })}
              placeholder="Enter UPC barcode..."
              className="w-full border border-gray-200 px-4 py-3 text-sm font-bold text-gray-800 font-mono focus:border-[#F05A28] outline-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* Step 5: Preview */
function StepPreview({ data }: { data: any }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-black text-gray-900 uppercase font-mono mb-1">Preview & Submit</h2>
        <p className="text-[10px] text-gray-400 font-mono">Review your video distribution details before submitting.</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 p-6 space-y-4">
        {[
          { label: 'Title', value: data.title || '—' },
          { label: 'Artist', value: data.primaryArtist || '—' },
          { label: 'Main Genre', value: data.mainGenre || '—' },
          { label: 'Secondary Genre', value: data.secondaryGenre || '—' },
          { label: 'Language', value: data.language || '—' },
          { label: 'Label', value: data.label || '—' },
          { label: 'Contributors', value: data.contributors.length > 0 ? data.contributors.join(', ') : 'None' },
          { label: 'Video File', value: data.videoFile?.name || 'Not uploaded' },
          { label: 'Platforms', value: data.platforms.length > 0 ? data.platforms.join(', ') : 'None selected' },
          { label: 'Copyright', value: `${data.copyrightYear} ${data.copyrightOwner}` },
          { label: 'Recording', value: `${data.recordingYear} ${data.recordingOwner}` },
          { label: 'UPC', value: data.hasOwnUPC ? data.upc : 'Auto-generated' },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">{row.label}</span>
            <span className="text-[10px] font-bold text-gray-800 font-mono text-right max-w-[60%] truncate">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
