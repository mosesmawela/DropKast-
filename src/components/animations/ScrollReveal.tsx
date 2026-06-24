import { motion, Variants } from 'motion/react';
import { ReactNode, Key } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  variant?: 'fade' | 'blur' | 'slide';
  width?: "fit-content" | "100%";
  className?: string;
  key?: Key;
}

// ⚡ Bolt: Hoist static configuration to prevent redundant object allocations on every render
// This component is used ~68 times, so optimizations here have a high cumulative impact.
const DIRECTIONS = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: 40 },
  right: { x: -40 },
  none: { x: 0, y: 0 }
};

const SCROLL_REVEAL_VARIANTS: Record<string, Variants> = {
  fade: {
    hidden: (direction: keyof typeof DIRECTIONS) => ({
      opacity: 0,
      ...DIRECTIONS[direction]
    }),
    visible: {
      opacity: 1,
      x: 0,
      y: 0
    }
  },
  blur: {
    hidden: (direction: keyof typeof DIRECTIONS) => ({
      opacity: 0,
      filter: 'blur(10px)',
      ...DIRECTIONS[direction]
    }),
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      x: 0,
      y: 0
    }
  },
  slide: {
    hidden: (direction: keyof typeof DIRECTIONS) => ({
      opacity: 0,
      ...DIRECTIONS[direction]
    }),
    visible: {
      opacity: 1,
      x: 0,
      y: 0
    }
  }
};

const VIEWPORT_CONFIG = { once: true, margin: "-100px" as const };

const TRANSITION_BASE = {
  duration: 0.8,
  ease: [0.21, 0.47, 0.32, 0.98] as const
};

export default function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  variant = 'blur',
  width = "fit-content",
  className
}: ScrollRevealProps) {
  return (
    <div style={{ position: "relative", width, overflow: "visible" }} className={className}>
      <motion.div
        variants={SCROLL_REVEAL_VARIANTS[variant]}
        custom={direction}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_CONFIG}
        transition={{
          ...TRANSITION_BASE,
          delay: delay
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
