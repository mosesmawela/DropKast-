import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useReleases } from "../context/ReleaseContext";
import { useAuth } from "../context/AuthContext";
import { useNotify } from "../context/NotificationContext";
import { useTierGate, UpgradeModal } from "../components/UpgradePrompt";
import { 
  Disc, 
  Settings, 
  Image as ImageIcon, 
  MapPin, 
  CheckCircle2,
  Save,
  Loader2,
  ChevronLeft,
  CheckSquare
} from "lucide-react";
import { cn } from "../lib/utils";

// Feature Components
import StepUpload from "../features/releases/StepUpload";
import StepChecklist from "../features/releases/StepChecklist";
import StepArtwork from "../features/releases/StepArtwork";
import StepDistribution from "../features/releases/StepDistribution";
import StepReview from "../features/releases/StepReview";

const steps = [
  { label: "Upload", icon: Disc, description: "Audio file" },
  { label: "Details", icon: CheckSquare, description: "Title, ISRC, credits" },
  { label: "Artwork", icon: ImageIcon, description: "Cover image" },
  { label: "Distribution", icon: MapPin, description: "Stores & date" },
  { label: "Review", icon: CheckCircle2, description: "Confirm and submit" },
];

export default function NewRelease() {
  const navigate = useNavigate();
  const { addRelease, releases } = useReleases();
  const { user } = useAuth();
  const { notify } = useNotify();
  const gate = useTierGate();

  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [upgradeBlocked, setUpgradeBlocked] = useState<string | null>(null);

  // Count releases used this year for tier cap (Free=2/yr)
  const thisYearReleaseCount = useMemo(() => {
    const startOfYear = new Date(); startOfYear.setMonth(0, 1); startOfYear.setHours(0,0,0,0);
    return (releases || []).filter((r: any) => r.createdAt && new Date(r.createdAt) >= startOfYear).length;
  }, [releases]);

  const [data, setData] = useState<any>({
    audio: null,
    title: "",
    artist: user?.artistName || "",
    genre: "",
    artwork: null,
    releaseDate: "",
    platforms: [],
    format: "Single",
    label: "Independent",
    // Technical Manifest Fields (Sync with LVRN Template)
    upc: "",
    sales_date: "",
    product_version: "N/A",
    sub_genre: "",
    tiktok_stamp: "",
    lyric_language: "",
    presave_active: false,
    lyrics_link: "",
    atmos_link: "",
    recording_engineer: "",
    country_recording: "",
    artist_origin: "",
    publishing_line: "LVRN",
    copyright_line: "LVRN",
    ownership_note: "ORIGINAL MASTER COPYRIGHT OWNER",
    publishing_splits: "",
    spotify_artist_link: "",
    apple_artist_link: "",
    track_count: 1,
    explicit: false,
    producers: "",
    writers: "",
    mixing_engineer: "",
    mastering_engineer: "",
    final_master_link: "",
    artwork_link: "",
    press_photo_link: "",
    // Production options (Amuse / DistroKid parity)
    is_hi_res: false,           // 24-bit / 96+ kHz delivery
    is_cover_song: false,       // triggers mech-license flow
    cover_original_artist: "",
    ai_mastering_opt_in: false, // run through AI mastering pre-delivery
    youtube_content_id: false,  // monetize from user-uploaded clips
  });

  // Auto-resume from Draft on Mount
  useEffect(() => {
    const savedData = localStorage.getItem('dropkast_release_draft');
    if (savedData) {
      setHasDraft(true);
    }
  }, []);

  const resumeDraft = () => {
    const savedData = localStorage.getItem('dropkast_release_draft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Strip placeholder file references that can't survive serialization
        if (parsed.audio === '[object File]') parsed.audio = null;
        if (parsed.artwork === '[object File]') parsed.artwork = null;
        setData(prev => ({ ...prev, ...parsed, audio: null, artwork: null }));
        setHasDraft(false);
        notify('info', 'Draft restored', 'Re-attach your audio and artwork files to continue.');
      } catch (err) {
        console.error('Failed to parse draft');
      }
    }
  };

  // Auto-save logic every 10 seconds or on data change
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      saveDraft();
    }, 10000); 
    return () => clearTimeout(saveTimer);
  }, [data]);

  const saveDraft = () => {
    setIsSaving(true);
    const { audio, artwork, ...serializable } = data;
    localStorage.setItem('dropkast_release_draft', JSON.stringify(serializable));
    setTimeout(() => setIsSaving(false), 800);
  };

  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  const next = () => {
    const errs: Record<string, string> = {};
    if (step === 0 && !data.audio) errs.audio = 'Upload an audio file to continue';
    if (step === 1 && !data.title?.trim()) errs.title = 'Release title is required';
    if (step === 2 && !data.artwork) errs.artwork = 'Cover artwork is required';
    if (step === 3 && (!data.releaseDate || data.platforms.length === 0)) {
      if (!data.releaseDate) errs.releaseDate = 'Release date is required';
      if (data.platforms.length === 0) errs.platforms = 'Select at least one platform';
    }
    setStepErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setStep((s) => s + 1);
    setStepErrors({});
  };
  const back = () => setStep((s) => s - 1);

  const update = (fields: any) => {
    setStepErrors({});
    setData((prev) => ({ ...prev, ...fields }));
  };

  const handleSubmit = async (finalData: any) => {
    // Tier cap check — Free=2 releases/yr
    const capCheck = gate.check('release', thisYearReleaseCount);
    if (!capCheck.allowed) {
      setUpgradeBlocked(capCheck.reason || 'Release cap reached.');
      return;
    }
    try {
      const res = await addRelease({
        ...finalData,
        artist: finalData.artist || user?.artistName,
      });

      localStorage.removeItem('dropkast_release_draft');
      notify('success', 'Release submitted', 'Your release is queued for delivery to your selected stores.');
      navigate(`/releases/${res.id}/processing`);
    } catch (err) {
      notify('error', 'Submit failed', 'We couldn\'t reach the server. Try again in a moment.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 font-mono">
      {/* Header & Status */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <div className="min-w-0">
           <button
             onClick={() => navigate('/releases')}
             className="flex items-center gap-2 text-white/20 transition-colors mb-8 text-[11px] font-black uppercase tracking-widest font-mono italic"
           >
             <ChevronLeft className="w-3 h-3 shrink-0" />
             Back to Catalog
           </button>
           <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.3em] font-mono italic">New Release</span>
              <div className="flex items-center gap-2">
                 {isSaving ? (
                   <Loader2 className="w-3 h-3 text-white/20 animate-spin" />
                 ) : (
                   <Save className="w-3 h-3 text-white/20" />
                 )}
                 <span className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none underline decoration-white/10 underline-offset-4">Auto-save on</span>
              </div>
           </div>
           <h1 className="text-4xl sm:text-7xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">New <span className="text-primary">Release</span></h1>
           <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.4em] font-mono italic">Release wizard</p>
        </div>

        {hasDraft && (
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="p-8 border-2 border-primary bg-primary/5 flex items-center gap-10 shadow-[0_0_50px_rgba(255,77,0,0.1)]"
           >
              <div className="min-w-0">
                 <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-1 italic">Draft recovered</div>
                 <div className="text-sm font-black text-white uppercase italic tracking-tight">Pick up where you left off?</div>
              </div>
              <button
                onClick={resumeDraft}
                className="beam h-12 px-8 shrink-0 bg-white text-black font-black uppercase italic tracking-widest text-[11px] transition-all shadow-xl active:scale-95"
              >
                Resume Draft
              </button>
           </motion.div>
        )}
      </div>

      {/* Step Indicator */}
      <div className="relative mb-28 group">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -translate-y-1/2 -z-10" />
        <div className="flex justify-between relative z-10">
          {steps.map((s, i) => {
            const isActive = i === step;
            const isCompleted = i < step;
            
            return (
              <div key={i} className="flex flex-col items-center gap-4">
                <div className={cn(
                  "w-14 h-14 border-2 transition-all duration-700 flex items-center justify-center bg-black relative",
                  isActive ? "border-primary text-primary scale-110 shadow-[0_0_30px_rgba(255,77,0,0.2)]" : 
                  isCompleted ? "border-white/40 text-white/40" : "border-white/5 text-white/10"
                )}>
                  {isActive && <div className="absolute inset-0 bg-primary/10 animate-pulse" />}
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-5 h-5 transition-transform duration-500" />}
                </div>
                <div className="text-center absolute pt-16">
                  <div className={cn(
                    "text-[10px] font-black uppercase tracking-[0.4em] font-mono italic transition-all duration-500",
                    isActive ? "text-white opacity-100" : "text-white/20 opacity-40"
                  )}>{s.label}</div>
                  {isActive && (
                    <motion.div 
                      layoutId="step-desc"
                      className="text-[8px] font-black text-primary uppercase tracking-[0.2em] font-mono mt-2"
                    >
                      {s.description}
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wizard Area */}
      <div className="manifest-card p-5 sm:p-12 bg-dark/40 border-white/5 relative overflow-hidden backdrop-blur-3xl min-h-[550px] flex flex-col justify-center">
        {/* Abstract Background Branding */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] select-none pointer-events-none">
           <div className="text-[150px] font-black italic uppercase leading-none tracking-tighter">NEW</div>
           <div className="text-[150px] font-black italic uppercase leading-none tracking-tighter text-primary ml-24">RELEASE</div>
        </div>

        {Object.keys(stepErrors).length > 0 && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500/30 flex flex-wrap gap-3">
            {Object.values(stepErrors).map((err, i) => (
              <span key={i} className="text-[9px] font-black text-red-400 uppercase tracking-widest font-mono italic flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                {err}
              </span>
            ))}
          </div>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "circOut" }}
          >
            {step === 0 && <StepUpload data={data} update={update} next={next} />}
            {step === 1 && <StepChecklist data={data} update={update} next={next} back={back} />}
            {step === 2 && <StepArtwork data={data} update={update} next={next} back={back} />}
            {step === 3 && <StepDistribution data={data} update={update} next={next} back={back} />}
            {step === 4 && <StepReview data={data} back={back} onSubmit={handleSubmit} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="mt-16 flex flex-col md:flex-row items-center justify-between opacity-30 text-[10px] font-black uppercase tracking-[0.4em] font-mono italic gap-6 border-t border-white/5 pt-10">
         <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-primary animate-pulse rounded-full shrink-0" />
            Drafts auto-save every 10s
         </div>
         <div className="flex flex-wrap items-center justify-center gap-8">
            <span>UPC included</span>
            <span>ISRC included</span>
            <span>Fully tracked</span>
         </div>
      </div>

      <UpgradeModal
        open={!!upgradeBlocked}
        feature="Unlimited releases"
        requiredTier="indie"
        reason={upgradeBlocked || undefined}
        onClose={() => setUpgradeBlocked(null)}
      />
    </div>
  );
}
