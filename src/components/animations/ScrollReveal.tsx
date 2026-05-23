import { motion, Variants } from 'motion/react';
import { ReactNode, Key } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: Direction;
  variant?: 'fade' | 'blur' | 'slide';
  width?: "fit-content" | "100%";
  className?: string;
  key?: Key;
}

// ⚡ Bolt: Hoist static configurations to prevent re-allocation on every render.
// This component is used ~68 times, so reducing GC pressure here is high-impact.
const DIRECTIONS = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: 40 },
  right: { x: -40 },
  none: { x: 0, y: 0 }
};

const EASE_CURVE = [0.21, 0.47, 0.32, 0.98] as const;

const VIEWPORT_CONFIG = { once: true, margin: "-100px" };

const VARIANTS: Record<'fade' | 'blur' | 'slide', Variants> = {
  fade: {
    hidden: (direction: Direction) => ({
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
    hidden: (direction: Direction) => ({
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
    hidden: (direction: Direction) => ({
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
        custom={direction}
        variants={VARIANTS[variant]}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_CONFIG}
        transition={{
          duration: 0.8,
          delay: delay,
          ease: EASE_CURVE as unknown as [number, number, number, number]
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
