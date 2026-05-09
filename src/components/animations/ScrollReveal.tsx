import { motion, Variants } from 'motion/react';
import { ReactNode, Key, useMemo } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  variant?: 'fade' | 'blur' | 'slide';
  width?: "fit-content" | "100%";
  className?: string;
  key?: Key;
}

// Hoist static configuration to prevent redundant allocations on every render.
const DIRECTIONS = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: 40 },
  right: { x: -40 },
  none: { x: 0, y: 0 }
} as const;

// Transition ease curve hoisted as const.
// We use 'as any' here because Framer Motion's Easing type expects specific string literal values or a bezier array,
// and 'readonly number[]' from 'as const' can sometimes cause strict TS mismatches.
const EASE_CURVE = [0.21, 0.47, 0.32, 0.98] as any;

const VARIANTS: Record<string, Variants> = {
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

const VIEWPORT_CONFIG = { once: true, margin: "-100px" } as const;

export default function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  variant = 'blur',
  width = "fit-content",
  className
}: ScrollRevealProps) {
  // Memoize transition to prevent object recreation unless delay changes.
  const transition = useMemo(() => ({
    duration: 0.8,
    delay: delay,
    ease: EASE_CURVE
  }), [delay]);

  return (
    <div style={{ position: "relative", width, overflow: "visible" }} className={className}>
      <motion.div
        custom={direction}
        variants={VARIANTS[variant]}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_CONFIG}
        transition={transition}
      >
        {children}
      </motion.div>
    </div>
  );
}
