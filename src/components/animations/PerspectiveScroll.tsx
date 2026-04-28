import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, ReactNode } from 'react';

interface PerspectiveScrollProps {
  children: ReactNode;
  className?: string;
}

export default function PerspectiveScroll({ children, className }: PerspectiveScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Map scroll progress to subtle 3D movements
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <div ref={containerRef} className={className}>
      <motion.div
        style={{
          perspective: "1000px",
          rotateX,
          scale,
          opacity,
          y
        }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}
