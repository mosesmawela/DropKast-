import { motion, Variants } from 'motion/react';
import React from 'react';

interface TextMaskProps {
  children: string;
  className?: string;
  delay?: number;
  mode?: 'word' | 'line' | 'letter';
}

const CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.04 + delay
    },
  }),
};

const CHILD_VARIANTS: Variants = {
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100,
    },
  },
  hidden: {
    opacity: 0,
    y: 20,
    rotate: 2,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100,
    },
  },
};

const TextMask = React.memo(({ children, className, delay = 0, mode = 'word' }: TextMaskProps) => {
  const words = children.split(" ");

  return (
    <motion.div
      style={{ overflow: "hidden", display: "flex", flexWrap: "wrap" }}
      variants={CONTAINER_VARIANTS}
      initial="hidden"
      whileInView="visible"
      custom={delay}
      viewport={{ once: true, margin: "-100px" }}
      className={className}
    >
      {words.map((word, index) => (
        <span key={index} style={{ overflow: "hidden", display: "inline-block", marginRight: "0.25em" }}>
          <motion.span
            variants={CHILD_VARIANTS}
            style={{ display: "inline-block" }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.div>
  );
});

TextMask.displayName = 'TextMask';

export default TextMask;
