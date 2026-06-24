import { useTheme, VisualStyle } from '../context/ThemeContext';
import { Sun, Moon, Palette, Cpu, Smartphone, Box, Zap, Minus, GlassWater } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import { cn } from '../lib/utils';

const styles: { id: VisualStyle; label: string; icon: any }[] = [
  { id: 'default', label: 'Technical', icon: Cpu },
  { id: 'neumorphism', label: 'Soft UI', icon: Smartphone },
  { id: 'material', label: 'Material', icon: Box },
  { id: 'brutalism', label: 'Brutalism', icon: Zap },
  { id: 'skeuomorphism', label: 'Skeuo', icon: Palette },
  { id: 'minimalist', label: 'Minimal', icon: Minus },
  { id: 'glassmorphism', label: 'Glassmorphism', icon: GlassWater },
];

// ⚡ Bolt: Hoist static motion variants and wrap in React.memo to prevent unnecessary re-renders.
// This component is in the Navbar and doesn't need to re-render when other Navbar elements (like search) change.
const ICON_VARIANTS = {
  initial: { rotate: -90, opacity: 0 },
  animate: { rotate: 0, opacity: 1 },
  exit: { rotate: 90, opacity: 0 },
};

const DROPDOWN_VARIANTS = {
  initial: { y: 10, opacity: 0, scale: 0.95 },
  animate: { y: 0, opacity: 1, scale: 1 },
  exit: { y: 10, opacity: 0, scale: 0.95 },
};

const FADE_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const TRANSITION_ICON = { duration: 0.2 };

function ThemeToggle() {
  const { theme, visualStyle, toggleTheme, setVisualStyle } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative">
      <div className="flex items-center border border-white/10 bg-black/20 backdrop-blur-sm shadow-2xl">
        {/* Style Selector Toggle */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={cn(
            "w-10 h-10 flex items-center justify-center transition-all hover:bg-white/5 border-r border-white/5 group",
            showDropdown && "bg-primary text-white"
          )}
          aria-label="Change Visual Style"
        >
          <Palette className={cn("w-4 h-4 transition-transform", showDropdown ? "scale-110" : "text-white/40 group-hover:text-white")} />
        </button>

        {/* Dark/Light Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center hover:bg-white/5 transition-all group"
          aria-label="Toggle Mode"
        >
          <AnimatePresence mode="wait">
            {theme === 'dark' ? (
              <motion.div
                key="moon"
                variants={ICON_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={TRANSITION_ICON}
              >
                <Moon className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                variants={ICON_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={TRANSITION_ICON}
              >
                <Sun className="w-4 h-4 text-primary" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Style Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <>
            <motion.div 
              variants={FADE_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={() => setShowDropdown(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              variants={DROPDOWN_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute bottom-full right-0 mb-4 w-48 bg-surface-low border border-white/10 shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-2 border-b border-white/5 bg-white/5">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/40 px-2">Visual Engine</span>
              </div>
              <div className="p-1">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setVisualStyle(style.id);
                      setShowDropdown(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 flex items-center gap-3 transition-all hover:bg-white/5 group",
                      visualStyle === style.id ? "text-primary" : "text-white/60 hover:text-white"
                    )}
                  >
                    <style.icon className={cn(
                      "w-4 h-4",
                      visualStyle === style.id ? "text-primary" : "text-white/20 group-hover:text-white/40"
                    )} />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-tight">{style.label}</span>
                    {visualStyle === style.id && (
                      <motion.div layoutId="active-style" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default React.memo(ThemeToggle);
