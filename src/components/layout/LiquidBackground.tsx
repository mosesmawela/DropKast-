import { useTheme } from '../../context/ThemeContext';
import { motion } from 'motion/react';

/**
 * Performance Optimization: Hoisted static animation configurations outside the component.
 * This prevents approximately 4 redundant object/array allocations per render cycle,
 * reducing memory churn and garbage collection pressure in the global layout.
 */
const BLOB_1_ANIMATE = {
  x: [0, 100, -50, 0],
  y: [0, -100, 50, 0],
  scale: [1, 1.2, 0.8, 1]
};

const BLOB_1_TRANSITION = {
  duration: 15,
  repeat: Infinity,
  ease: "linear" as const
};

const BLOB_2_ANIMATE = {
  x: [0, -120, 80, 0],
  y: [0, 80, -120, 0],
  scale: [1, 0.9, 1.1, 1]
};

const BLOB_2_TRANSITION = {
  duration: 20,
  repeat: Infinity,
  ease: "linear" as const
};

export default function LiquidBackground() {
  const { visualStyle } = useTheme();

  if (visualStyle !== 'glassmorphism') return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="liquid-glass-bg" />
      
      {/* Floating Blobs */}
      <motion.div 
        animate={BLOB_1_ANIMATE}
        transition={BLOB_1_TRANSITION}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"
      />
      
      <motion.div 
        animate={BLOB_2_ANIMATE}
        transition={BLOB_2_TRANSITION}
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px]"
      />
    </div>
  );
}
