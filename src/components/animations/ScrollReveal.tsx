import { motion, Variants } from 'motion/react';
import React, { ReactNode, Key } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';
type VariantType = 'fade' | 'blur' | 'slide';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: Direction;
  variant?: VariantType;
  width?: "fit-content" | "100%";
  className?: string;
  key?: Key;
}

const DIRECTIONS = {
  up: { y: 40, x: 0 },
  down: { y: -40, x: 0 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
  none: { x: 0, y: 0 }
} as const;

const SCROLL_REVEAL_VARIANTS: Record<VariantType, Variants> = {
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

const VIEWPORT_CONFIG = { once: true, margin: "-100px" } as const;
const TRANSITION_EASE = [0.21, 0.47, 0.32, 0.98] as const;

/**
 * ScrollReveal Component
 * ⚡ Bolt Optimization:
 * - Hoisted static configuration objects (DIRECTIONS, SCROLL_REVEAL_VARIANTS, VIEWPORT_CONFIG, TRANSITION_EASE)
 *   outside the component body to prevent redundant object allocations on every render cycle.
 * - Used the 'custom' prop in Framer Motion to pass the dynamic direction to functional variants.
 * - Wrapped component in React.memo to prevent unnecessary re-renders when parent components update.
 */
const ScrollReveal = React.memo(({
  children,
  delay = 0,
  direction = 'up',
  variant = 'blur',
  width = "fit-content",
  className
}: ScrollRevealProps) => {
  return (
    <div style={{ position: "relative", width, overflow: "visible" }} className={className}>
      <motion.div
        custom={direction}
        variants={SCROLL_REVEAL_VARIANTS[variant]}
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
});

ScrollReveal.displayName = 'ScrollReveal';

export default ScrollReveal;
