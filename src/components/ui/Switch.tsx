import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export default function Switch({ checked, onChange, label, className }: SwitchProps) {
  return (
    <div className={cn("flex items-center gap-4 cursor-pointer group", className)} onClick={() => onChange(!checked)}>
      {label && <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors italic">{label}</span>}
      <div className={cn(
        "w-12 h-6 border transition-all relative overflow-hidden flex items-center px-1",
        checked ? "bg-primary/20 border-primary" : "bg-black/50 border-white/10"
      )}>
        <motion.div 
          animate={{ x: checked ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "w-4 h-4 transition-colors",
            checked ? "bg-primary" : "bg-white/20"
          )}
        />
        {/* Glow effect when checked */}
        {checked && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-primary/10 animate-pulse pointer-events-none"
          />
        )}
      </div>
    </div>
  );
}
