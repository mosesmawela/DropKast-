import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { Loader2, CheckCircle2, Shield, Activity, Database, Cpu } from "lucide-react";
import { cn } from "../lib/utils";

const processingSteps = [
  { label: "UPLOADING_AUDIO_NODE", icon: Activity, detail: "Initializing master stream encryption..." },
  { label: "VALIDATING_METADATA", icon: Database, detail: "Cross-referencing global identifier databases..." },
  { label: "ANALYZING_VISUAL_IDENTITY", icon: Shield, detail: "Auditing artwork for DSP compliance..." },
  { label: "ASSIGNING_ISRC_IDENTIFIER", icon: Cpu, detail: "Generating unique master recording trace ID..." },
  { label: "DELIVERING_TO_RELAY_PLATFORMS", icon: CheckCircle2, detail: "Synchronizing nodes with global DSP clusters..." },
];

export default function Processing() {
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentStep < processingSteps.length) {
      const duration = 1500 + Math.random() * 1000;
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      const waitTimer = setTimeout(() => {
        navigate(`/releases/${id}/status`);
      }, 2000);
      return () => clearTimeout(waitTimer);
    }
  }, [currentStep, id, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-mono overflow-hidden relative">
      {/* Background Matrix Effect */}
      <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none">
         {Array.from({ length: 20 }).map((_, i) => (
           <div key={i} className="whitespace-nowrap text-[8px] leading-tight flex gap-4">
              {Array.from({ length: 10 }).map((_, j) => (
                <span key={j}>NEWDISTRO_NODE_DEPLOYMENT_SEQUENCE_VERSION_3.0_RELEASE_ID_{id}</span>
              ))}
           </div>
         ))}
      </div>

      <div className="max-w-xl w-full space-y-12 relative z-10">
        <div className="text-center space-y-4">
           <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.4em] italic mb-4">
              <Loader2 className="w-3 h-3 animate-spin" />
              Deployment_In_Progress
           </div>
           <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">Processing <span className="text-primary italic">Transmission</span></h2>
        </div>

        <div className="manifest-card p-10 bg-dark border-white/5 space-y-8 relative">
           <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
              <Database className="w-24 h-24 text-white" />
           </div>

           <div className="space-y-6">
              {processingSteps.map((step, idx) => {
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;

                return (
                  <div key={idx} className={cn(
                    "flex items-start gap-6 transition-all duration-500",
                    isCompleted ? "opacity-30 grayscale" : isActive ? "opacity-100" : "opacity-10"
                  )}>
                    <div className={cn(
                      "w-10 h-10 border flex items-center justify-center shrink-0 transition-all duration-500",
                      isActive ? "border-primary bg-primary shadow-[0_0_20px_rgba(255,102,0,0.3)]" : 
                      isCompleted ? "border-white/20 bg-white/5" : "border-white/5"
                    )}>
                       {isCompleted ? <CheckCircle2 className="w-4 h-4 text-white" /> : 
                        isActive ? <step.icon className="w-4 h-4 text-white animate-pulse" /> : 
                        <step.icon className="w-4 h-4 text-white/20" />}
                    </div>
                    <div className="space-y-1">
                       <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] font-mono italic">{step.label}</h4>
                       {isActive && (
                         <motion.p 
                           initial={{ opacity: 0, y: 5 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="text-[9px] font-bold text-primary uppercase tracking-widest font-mono italic"
                         >
                            {step.detail}
                         </motion.p>
                       )}
                    </div>
                  </div>
                );
              })}
           </div>

           <div className="pt-8 border-t border-white/5">
              <div className="flex justify-between items-center mb-3">
                 <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] font-mono italic">Cluster_Sync_Progress</span>
                 <span className="text-[10px] font-black text-primary font-mono">{Math.min(Math.round(((currentStep) / processingSteps.length) * 100), 100)}%</span>
              </div>
              <div className="w-full h-1 bg-white/5 relative overflow-hidden">
                 <motion.div 
                   className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_10px_rgba(255,102,0,0.5)]"
                   animate={{ width: `${(currentStep / processingSteps.length) * 100}%` }}
                   transition={{ duration: 1, ease: "circOut" }}
                 />
              </div>
           </div>
        </div>

        <div className="flex items-center justify-center gap-12 opacity-10 text-[8px] font-black uppercase tracking-[0.4em] font-mono italic">
           <span>ENCRYPTING_AES_256</span>
           <span>PARSING_JSON_SCHEMA</span>
           <span>RELAY_READY_0.02ms</span>
        </div>
      </div>
    </div>
  );
}
