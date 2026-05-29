import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface AnimatedBeamProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  active?: boolean;
}

/**
 * BOLT OPTIMIZATION:
 * Hoisted static animation and transition configurations outside the component.
 * This prevents ~6 redundant object/array allocations per render cycle.
 * With ~34 instances, this saves ~204 allocations on every parent re-render.
 */
const BEAM_ANIMATION = {
  top: ["0%", "0%", "100%", "100%", "0%"],
  left: ["0%", "100%", "100%", "0%", "0%"],
  width: ["0px", "100px", "0px", "100px", "0px"],
  height: ["100px", "0px", "100px", "0px", "100px"],
};

const BEAM_TRANSITION = {
  duration: 4,
  repeat: Infinity,
  ease: "linear" as const,
};

const SECOND_BEAM_TRANSITION = {
  ...BEAM_TRANSITION,
  delay: 2,
};

export default function AnimatedBeam({ 
  children, 
  className, 
  containerClassName,
  active = true 
}: AnimatedBeamProps) {
  if (!active) return <div className={cn("relative", containerClassName)}>{children}</div>;

  return (
    <div className={cn("relative group transition-all duration-500", containerClassName)}>
      {/* The Tracing Beam */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <motion.div
          animate={BEAM_ANIMATION}
          transition={BEAM_TRANSITION}
          className={cn(
            "absolute bg-gradient-to-r from-transparent via-primary/50 to-transparent",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            className
          )}
          style={{
            boxShadow: '0 0 10px var(--color-primary)',
          }}
        />
      </div>
      
      {/* Second Beam for offset effect */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rotate-180">
        <motion.div
          animate={BEAM_ANIMATION}
          transition={SECOND_BEAM_TRANSITION}
          className={cn(
            "absolute bg-gradient-to-r from-transparent via-primary/30 to-transparent",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            className
          )}
        />
      </div>

      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
}
