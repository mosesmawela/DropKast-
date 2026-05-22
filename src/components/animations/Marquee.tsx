import { motion, Variants } from 'motion/react';
import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface MarqueeProps {
  children: ReactNode;
  direction?: 'left' | 'right';
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
  fadeEdges?: boolean;
}

/**
 * Performance-optimized variants for Marquee.
 * Hoisted outside the component to prevent re-allocation on every render.
 * Uses the 'custom' prop to pass dynamic speed to the transition.
 */
const MARQUEE_VARIANTS: Variants = {
  left: (speed: number) => ({
    x: ['0%', '-50%'],
    transition: {
      duration: speed,
      repeat: Infinity,
      ease: "linear",
    },
  }),
  right: (speed: number) => ({
    x: ['-50%', '0%'],
    transition: {
      duration: speed,
      repeat: Infinity,
      ease: "linear",
    },
  }),
};

export default function Marquee({
  children,
  direction = 'left',
  speed = 40,
  pauseOnHover = true,
  className,
  fadeEdges = true,
}: MarqueeProps) {
  return (
    <div className={cn("relative flex overflow-hidden group", className)}>
      {fadeEdges && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
        </>
      )}

      <motion.div
        custom={speed}
        variants={MARQUEE_VARIANTS}
        animate={direction}
        className={cn(
          "flex min-w-full shrink-0 items-center justify-around gap-8 py-4",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
