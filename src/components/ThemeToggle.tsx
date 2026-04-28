import { useTheme, VisualStyle } from '../context/ThemeContext';
import { Sun, Moon, Palette, Cpu, Smartphone, Box, Zap, Minus, GlassWater } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
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

export default function ThemeToggle() {
  const { theme, visualStyle, toggleTheme, setVisualStyle } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative">
      <div className="flex items-center border border-white/10 bg-black/20 backdrop-blur-sm shadow-2xl">
        {/* Style Selector Toggle */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={cn(
            "w-10 h-10 flex items-center justify-center transition-all hover:bg-white/5 border-r border-white/5 group outline-none focus-visible:bg-white/10",
            showDropdown && "bg-primary text-white"
          )}
          aria-label="Change Visual Style"
          aria-haspopup="true"
          aria-expanded={showDropdown}
        >
          <Palette className={cn("w-4 h-4 transition-transform", showDropdown ? "scale-110" : "text-white/40 group-hover:text-white")} />
        </button>

        {/* Dark/Light Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center hover:bg-white/5 transition-all group outline-none focus-visible:bg-white/10"
          aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
        >
          <AnimatePresence mode="wait">
            {theme === 'dark' ? (
              <motion.div
                key="moon"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDropdown(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ y: 10, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.95 }}
              className="absolute bottom-full right-0 mb-4 w-48 bg-surface-low border border-white/10 shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-2 border-b border-white/5 bg-white/5">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/40 px-2">Visual Engine</span>
              </div>
              <div className="p-1" role="menu">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setVisualStyle(style.id);
                      setShowDropdown(false);
                    }}
                    role="menuitemradio"
                    aria-checked={visualStyle === style.id}
                    className={cn(
                      "w-full px-3 py-2 flex items-center gap-3 transition-all hover:bg-white/5 group outline-none focus-visible:bg-white/10",
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
