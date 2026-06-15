import { motion } from 'motion/react';

interface NoodleLineProps {
  className?: string;
  path?: string;
  delay?: number;
}

/**
 * Static animation configurations hoisted to prevent redundant object allocations.
 * Used in combination with the 'custom' prop or local spreads for dynamic values
 * like 'delay' to maintain stable references for the core transition logic.
 */
const VIEWPORT_CONFIG = { once: true };

const MAIN_PATH_VARIANTS = {
  initial: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1 },
};

const ENERGY_PATH_VARIANTS = {
  initial: { strokeDashoffset: 50, opacity: 0 },
  animate: { strokeDashoffset: -50, opacity: [0, 1, 0] },
};

const MAIN_PATH_TRANSITION = {
  duration: 2,
  ease: "easeInOut" as const,
};

const ENERGY_PATH_TRANSITION = {
  duration: 3,
  repeat: Infinity,
  ease: "linear" as const,
};

export default function NoodleLine({
  className,
  path = "M 0 50 Q 50 0 100 50",
  delay = 0
}: NoodleLineProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={className}
    >
      <motion.path
        d={path}
        fill="transparent"
        stroke="currentColor"
        strokeWidth="1"
        variants={MAIN_PATH_VARIANTS}
        initial="initial"
        whileInView="visible"
        viewport={VIEWPORT_CONFIG}
        transition={{
          ...MAIN_PATH_TRANSITION,
          delay
        }}
      />
      {/* Flowing energy motion effect */}
      <motion.path
        d={path}
        fill="transparent"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeDasharray="10 40"
        variants={ENERGY_PATH_VARIANTS}
        initial="initial"
        animate="animate"
        transition={{
          ...ENERGY_PATH_TRANSITION,
          delay: delay + 1
        }}
      />
    </svg>
  );
}
