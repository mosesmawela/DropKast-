import { motion } from 'motion/react';
import { ReactNode, memo, useMemo } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  variant?: 'fade' | 'blur' | 'slide';
  width?: "fit-content" | "100%";
  className?: string;
}

const DIRECTIONS = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: 40 },
  right: { x: -40 },
  none: { x: 0, y: 0 }
} as const;

type Direction = keyof typeof DIRECTIONS;

const SCROLL_REVEAL_VARIANTS = {
  fade: {
    hidden: (direction: Direction) => ({ opacity: 0, ...DIRECTIONS[direction] }),
    visible: { opacity: 1, x: 0, y: 0 }
  },
  blur: {
    hidden: (direction: Direction) => ({ opacity: 0, filter: 'blur(10px)', ...DIRECTIONS[direction] }),
    visible: { opacity: 1, filter: 'blur(0px)', x: 0, y: 0 }
  },
  slide: {
    hidden: (direction: Direction) => ({ opacity: 0, ...DIRECTIONS[direction] }),
    visible: { opacity: 1, x: 0, y: 0 }
  }
};

const VIEWPORT_CONFIG = { once: true, margin: "-100px" } as const;

const TRANSITION_BASE = {
  duration: 0.8,
  ease: [0.21, 0.47, 0.32, 0.98] as const
} as const;

/**
 * ScrollReveal Component
 * Optimized for performance by hoisting static variants and configuration.
 * Uses 'custom' prop for dynamic directions to avoid object allocations in render.
 * Wrapped in React.memo to prevent unnecessary re-renders in high-usage scenarios.
 */
const ScrollReveal = memo(({
  children,
  delay = 0,
  direction = 'up',
  variant = 'blur',
  width = "fit-content",
  className
}: ScrollRevealProps) => {
  // Memoize transition to prevent object allocation on every render
  const transition = useMemo(() => ({
    ...TRANSITION_BASE,
    delay
  }), [delay]);

  return (
    <div style={{ position: "relative", width, overflow: "visible" }} className={className}>
      <motion.div
        custom={direction}
        variants={SCROLL_REVEAL_VARIANTS[variant]}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_CONFIG}
        transition={transition}
      >
        {children}
      </motion.div>
    </div>
  );
});

ScrollReveal.displayName = 'ScrollReveal';

export default ScrollReveal;
