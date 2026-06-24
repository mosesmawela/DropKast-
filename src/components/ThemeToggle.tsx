import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Dark / light mode toggle.
 *
 * The experimental "Visual Engine" style switcher (skeuomorphism / glass /
 * brutalism…) used to live here as a Palette dropdown, but that's a power-user
 * personalization tool — it belongs in Settings → Appearance, not floating in
 * the public landing nav. Keeping this component to the single thing a visitor
 * actually wants: flip dark/light.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center border border-white/10 bg-black/20 backdrop-blur-sm shadow-2xl">
      <button
        onClick={toggleTheme}
        className="w-10 h-10 flex items-center justify-center hover:bg-white/5 transition-all group"
        aria-label="Toggle Mode"
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
  );
}
