import { motion, Variants } from 'motion/react';
import { ReactNode, Key } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';
type Variant = 'fade' | 'blur' | 'slide';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: Direction;
  variant?: Variant;
  width?: "fit-content" | "100%";
  className?: string;
  key?: Key;
}

const DIRECTIONS = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: 40 },
  right: { x: -40 },
  none: { x: 0, y: 0 }
} as const;

// Hoisted static motion variants to prevent per-render allocations.
// Used the 'custom' prop to handle dynamic directions and animation modes.
const SCROLL_REVEAL_VARIANTS: Variants = {
  hidden: (custom: { direction: Direction; variant: Variant }) => ({
    opacity: 0,
    ...(custom.variant === 'blur' ? { filter: 'blur(10px)' } : {}),
    ...DIRECTIONS[custom.direction]
  }),
  visible: (custom: { variant: Variant }) => ({
    opacity: 1,
    ...(custom.variant === 'blur' ? { filter: 'blur(0px)' } : {}),
    x: 0,
    y: 0
  })
};

const VIEWPORT_CONFIG = { once: true, margin: "-100px" } as const;

const TRANSITION_EASE = [0.21, 0.47, 0.32, 0.98] as const;

/**
 * ScrollReveal Component
 *
 * Performance Optimization:
 * - Hoisted DIRECTIONS, SCROLL_REVEAL_VARIANTS, VIEWPORT_CONFIG, and TRANSITION_EASE
 *   outside the component body to avoid redundant object allocations on every render.
 * - Refactored variants to use the 'custom' prop for dynamic direction/variant handling.
 * - This reduces GC pressure and memory churn, especially significant as this component
 *   is used ~68 times across the application.
 */
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
        custom={{ direction, variant }}
        variants={SCROLL_REVEAL_VARIANTS}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_CONFIG}
        transition={{
          duration: 0.8,
          delay: delay,
          ease: TRANSITION_EASE
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
