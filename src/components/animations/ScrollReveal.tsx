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

// ⚡ Bolt: Hoist static configurations outside the component to prevent redundant object allocations
// across ~68 instances during every parent re-render.
const DIRECTIONS = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: 40 },
  right: { x: -40 },
  none: { x: 0, y: 0 }
} as const;

const EASE_CURVE = [0.21, 0.47, 0.32, 0.98] as any; // 'as any' used to satisfy Framer Motion's Easing type
const VIEWPORT_CONFIG = { once: true, margin: "-100px" } as const;

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
        // ⚡ Bolt: Use 'custom' prop to pass dynamic data to hoisted variants,
        // reducing memory pressure by avoiding variant object recreation on every render.
        custom={direction}
        variants={VARIANTS[variant]}
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
