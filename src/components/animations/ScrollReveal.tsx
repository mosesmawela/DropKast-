import { motion, Variants } from 'motion/react';
import { ReactNode, Key, memo } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  variant?: 'fade' | 'blur' | 'slide';
  width?: "fit-content" | "100%";
  className?: string;
  key?: Key;
}

// ⚡ Bolt: Hoist static configurations outside the component to prevent redundant allocations
// This is especially important for ScrollReveal as it's used ~68 times.
const DIRECTIONS = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: 40 },
  right: { x: -40 },
  none: { x: 0, y: 0 }
};

const ANIMATION_VARIANTS: Record<string, Variants> = {
  fade: {
    hidden: (direction: keyof typeof DIRECTIONS) => ({
      opacity: 0,
      ...DIRECTIONS[direction]
    }),
    visible: { opacity: 1, x: 0, y: 0 }
  },
  blur: {
    hidden: (direction: keyof typeof DIRECTIONS) => ({
      opacity: 0,
      filter: 'blur(10px)',
      ...DIRECTIONS[direction]
    }),
    visible: { opacity: 1, filter: 'blur(0px)', x: 0, y: 0 }
  },
  slide: {
    hidden: (direction: keyof typeof DIRECTIONS) => ({
      opacity: 0,
      ...DIRECTIONS[direction]
    }),
    visible: { opacity: 1, x: 0, y: 0 }
  }
};

const EASE_CURVE = [0.21, 0.47, 0.32, 0.98] as unknown as [number, number, number, number];
const VIEWPORT_CONFIG = { once: true, margin: "-100px" };

/**
 * ⚡ Bolt Optimization:
 * 1. Hoisted static objects (DIRECTIONS, VARIANTS, VIEWPORT, EASE) to avoid GC pressure.
 * 2. Refactored variants to use 'custom' prop for dynamic directions.
 * 3. Wrapped in React.memo to skip reconciliation when props (like children) are stable.
 */
function ScrollRevealComponent({
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
        variants={ANIMATION_VARIANTS[variant]}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_CONFIG}
        transition={{
          duration: 0.8,
          delay: delay,
          ease: EASE_CURVE
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default memo(ScrollRevealComponent);
