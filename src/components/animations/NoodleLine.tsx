import { motion } from 'motion/react';

interface NoodleLineProps {
  className?: string;
  path?: string;
  delay?: number;
}

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
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: 2,
          delay: delay,
          ease: "easeInOut"
        }}
      />
      {/* Flowing energy motion effect */}
      <motion.path
        d={path}
        fill="transparent"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeDasharray="10 40"
        initial={{ strokeDashoffset: 50, opacity: 0 }}
        animate={{ strokeDashoffset: -50, opacity: [0, 1, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
          delay: delay + 1
        }}
      />
    </svg>
  );
}
