import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CircularPulseProps {
  children?: ReactNode;
  className?: string;
  size?: number;
  color?: string;
  pulse?: boolean;
}

/**
 * Performance Optimization: Hoisted static animation configurations outside the component.
 * This prevents redundant object allocations on every render cycle, reducing GC pressure.
 */
const RING_ANIMATE = {
  scale: [1, 2],
  opacity: [0.5, 0],
};

const RING_TRANSITION = {
  duration: 2,
  repeat: Infinity,
  ease: "easeOut",
} as const;

const OUTLINE_ANIMATE = {
  scale: [1, 1.1, 1],
  opacity: [0.2, 0.4, 0.2],
};

const OUTLINE_TRANSITION = {
  duration: 3,
  repeat: Infinity,
  ease: "easeInOut",
} as const;

export default function CircularPulse({
  children,
  className,
  size = 100,
  color = "var(--color-primary)",
  pulse = true
}: CircularPulseProps) {
  return (
    <div 
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Expanding Ring */}
      {pulse && (
        <motion.div
          animate={RING_ANIMATE}
          transition={RING_TRANSITION}
          className="absolute inset-0 rounded-full border border-current"
          style={{ color }}
        />
      )}
      
      {/* Pulsing Outline */}
      <motion.div
        animate={pulse ? OUTLINE_ANIMATE : undefined}
        transition={OUTLINE_TRANSITION}
        className="absolute inset-4 rounded-full border-2 border-current"
        style={{ color }}
      />

      {/* Center point / Content */}
      <div className="relative z-10 flex items-center justify-center">
        {children || (
          <div 
            className="w-2 h-2 rounded-full bg-current"
            style={{ color }}
          />
        )}
      </div>
    </div>
  );
}
