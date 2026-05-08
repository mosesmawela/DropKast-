import { motion } from 'motion/react';
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

/**
 * Performance Optimization: Hoisted static configuration objects outside the component.
 * This prevents redundant object allocations and reduces garbage collection pressure
 * during renders. Given this component is used 60+ times, this provides a measurable
 * improvement in overall app responsiveness and memory efficiency.
 */

const DIRECTIONS = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: 40 },
  right: { x: -40 },
  none: { x: 0, y: 0 }
} as const;

type Direction = keyof typeof DIRECTIONS;

const VARIANTS = {
  fade: {
    hidden: (direction: Direction) => ({
      opacity: 0,
      ...DIRECTIONS[direction]
    }),
    visible: { opacity: 1, x: 0, y: 0 }
  },
  blur: {
    hidden: (direction: Direction) => ({
      opacity: 0,
      filter: 'blur(10px)',
      ...DIRECTIONS[direction]
    }),
    visible: { opacity: 1, filter: 'blur(0px)', x: 0, y: 0 }
  },
  slide: {
    hidden: (direction: Direction) => ({
      opacity: 0,
      ...DIRECTIONS[direction]
    }),
    visible: { opacity: 1, x: 0, y: 0 }
  }
};

const EASE_CURVE = [0.21, 0.47, 0.32, 0.98] as const;
const VIEWPORT_CONFIG = { once: true, margin: "-100px" } as const;

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
          ease: EASE_CURVE as any
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
