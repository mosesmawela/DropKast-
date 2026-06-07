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
 * BOLT OPTIMIZATION: Hoisted static animation variants and transition objects
 * outside the component to prevent redundant allocations on every render.
 * This is particularly effective as AnimatedBeam is used ~34 times across the app.
 */
const BEAM_VARIANTS = {
  animate: {
    top: ["0%", "0%", "100%", "100%", "0%"],
    left: ["0%", "100%", "100%", "0%", "0%"],
    width: ["0px", "100px", "0px", "100px", "0px"],
    height: ["100px", "0px", "100px", "0px", "100px"],
  }
};

const BEAM_TRANSITION_1 = {
  duration: 4,
  repeat: Infinity,
  ease: "linear",
} as const;

const BEAM_TRANSITION_2 = {
  duration: 4,
  repeat: Infinity,
  ease: "linear",
  delay: 2,
} as const;

const BEAM_STYLE = {
  boxShadow: '0 0 10px var(--color-primary)',
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
          variants={BEAM_VARIANTS}
          animate="animate"
          transition={BEAM_TRANSITION_1}
          className={cn(
            "absolute bg-gradient-to-r from-transparent via-primary/50 to-transparent",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            className
          )}
          style={BEAM_STYLE}
        />
      </div>
      
      {/* Second Beam for offset effect */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rotate-180">
        <motion.div
          variants={BEAM_VARIANTS}
          animate="animate"
          transition={BEAM_TRANSITION_2}
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
