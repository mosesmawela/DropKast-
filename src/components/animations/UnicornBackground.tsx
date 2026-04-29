import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function UnicornBackground() {
  const { theme } = useTheme();
  const { scrollYProgress } = useScroll();

  // ⚡ Bolt: Use MotionValues for mouse position to avoid React re-renders on every mouse move
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // ⚡ Bolt: Smooth out the mouse movement with hardware-accelerated springs
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const orbY = useTransform(scrollYProgress, [0, 1], [0, 200]);

  // ⚡ Bolt: Combined motion values for orbs to handle mouse + scroll in a single pipeline
  const orb1Y = useTransform([springY, orbY], ([y, scroll]) => (y as number) + (scroll as number));

  const orb2X = useTransform(springX, (x) => (x as number) * -0.5);
  const orb2Y = useTransform([springY, orbY], ([y, scroll]) => (y as number) * -0.5 - (scroll as number) * 0.5);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Direct update of motion values bypasses React reconciliation
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 50);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 50);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // ⚡ Bolt: Memoize particles to prevent re-generation and redundant Math.random() calls
  const particles = useMemo(() => (
    [...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        initial={{
          x: Math.random() * 100 + 'vw',
          y: Math.random() * 100 + 'vh',
          opacity: 0
        }}
        animate={{
          y: [null, '-=100px'],
          opacity: [0, theme === 'dark' ? 0.2 : 0.1, 0],
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          ease: "linear",
          delay: Math.random() * 20,
        }}
        className={`absolute w-1 h-1 rounded-full blur-sm transition-colors duration-1000 ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}
      />
    ))
  ), [theme]);

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none transition-colors duration-1000">
      {/* Soft Gradient Orbs */}
      <motion.div
        style={{
          x: springX,
          y: orb1Y,
          willChange: "transform",
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute -top-1/4 -left-1/4 w-[80vw] h-[80vw] rounded-full blur-[120px] mix-blend-screen transition-all duration-1000 ${theme === 'dark' ? 'bg-primary/10' : 'bg-primary/20'}`}
      />

      <motion.div
        style={{
          x: orb2X,
          y: orb2Y,
          willChange: "transform",
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className={`absolute bottom-0 -right-1/4 w-[70vw] h-[70vw] rounded-full blur-[150px] mix-blend-screen transition-all duration-1000 ${theme === 'dark' ? 'bg-primary/5' : 'bg-primary/15'}`}
      />

      {/* Noise Texture Overlay */}
      <div className={`absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat transition-opacity duration-1000 ${theme === 'dark' ? 'opacity-[0.03]' : 'opacity-[0.015]'}`} />

      {/* Floating Particles Simulation (Subtle) */}
      {particles}
    </div>
  );
}
