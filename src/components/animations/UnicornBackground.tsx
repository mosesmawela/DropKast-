import { motion, useScroll, useTransform } from 'motion/react';
import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function UnicornBackground() {
  const { theme } = useTheme();
  const { scrollYProgress } = useScroll();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const orbY = useTransform(scrollYProgress, [0, 1], [0, 200]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 50,
        y: (e.clientY / window.innerHeight - 0.5) * 50,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none transition-colors duration-1000">
      {/* Soft Gradient Orbs */}
      <motion.div
        animate={{
          x: mousePos.x,
          y: mousePos.y + orbY.get(),
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
        animate={{
          x: -mousePos.x * 0.5,
          y: -mousePos.y * 0.5 - orbY.get() * 0.5,
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
      {[...Array(20)].map((_, i) => (
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
      ))}
    </div>
  );
}
