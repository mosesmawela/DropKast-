import { motion } from 'motion/react';
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

// ⚡ Bolt: Hoist static configurations outside the component to avoid re-allocation on every render.
// This is especially important for components used frequently (68 times in this project).

const DIRECTIONS: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: 40 },
  right: { x: -40 },
  none: { x: 0, y: 0 }
};

const VARIANTS = {
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

const VIEWPORT_CONFIG = { once: true, margin: "-100px" };
const EASE_CURVE = [0.21, 0.47, 0.32, 0.98];

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
          ease: EASE_CURVE
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
