import { motion } from 'motion/react';
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

export default function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  variant = 'blur',
  width = "fit-content",
  className
}: ScrollRevealProps) {
  const directions = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
    none: { x: 0, y: 0 }
  };

  const variants = {
    fade: {
      hidden: { opacity: 0, ...directions[direction] },
      visible: { opacity: 1, x: 0, y: 0 }
    },
    blur: {
      hidden: { opacity: 0, filter: 'blur(10px)', ...directions[direction] },
      visible: { opacity: 1, filter: 'blur(0px)', x: 0, y: 0 }
    },
    slide: {
      hidden: { opacity: 0, ...directions[direction] },
      visible: { opacity: 1, x: 0, y: 0 }
    }
  };

  return (
    <div style={{ position: "relative", width, overflow: "visible" }} className={className}>
      <motion.div
        variants={variants[variant]}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        transition={{
          duration: 0.8,
          delay: delay,
          ease: [0.21, 0.47, 0.32, 0.98]
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
