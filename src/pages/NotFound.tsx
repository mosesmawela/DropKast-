import { Link } from 'react-router-dom';
import { Home, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 technical-grid">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl w-full text-center"
      >
        <div className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic mb-6">
          404 — Page not found
        </div>

        <h1 className="text-6xl md:text-9xl font-black italic leading-none mb-6 tracking-tighter">
          Lost the beat
        </h1>

        <p className="text-white/50 text-base md:text-lg leading-relaxed mb-12 max-w-md mx-auto">
          The page you tried to reach doesn't exist (or moved). Head back to your dashboard and we'll get you on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="primary-button h-14 bg-white text-black flex items-center gap-3 px-8 transition-all"
          >
            <Home className="w-4 h-4" />
            <span className="text-[11px] font-black tracking-widest uppercase italic">Go to dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/"
            className="text-[11px] font-black text-white/40 tracking-[0.3em] uppercase italic transition-colors"
          >
            Or back home
          </Link>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 text-[10px] font-black text-white/20 tracking-[0.4em] uppercase italic">
          DropKast · Distribution that pays you back
        </div>
      </motion.div>
    </div>
  );
}
