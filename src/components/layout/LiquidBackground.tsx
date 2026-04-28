import { useTheme } from '../../context/ThemeContext';
import { motion } from 'motion/react';

export default function LiquidBackground() {
  const { visualStyle } = useTheme();

  if (visualStyle !== 'glassmorphism') return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="liquid-glass-bg" />
      
      {/* Floating Blobs */}
      <motion.div 
        animate={{ 
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
          scale: [1, 1.2, 0.8, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"
      />
      
      <motion.div 
        animate={{ 
          x: [0, -120, 80, 0],
          y: [0, 80, -120, 0],
          scale: [1, 0.9, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px]"
      />
    </div>
  );
}
