import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { useTutorial } from '../context/TutorialContext';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;
const TOOLTIP_GAP = 16;

function findTarget(target: string): HTMLElement | null {
  // target may be a CSS selector OR a `data-tour="..."` attribute encoding
  if (target.startsWith('data-tour=')) {
    const value = target.slice('data-tour='.length).replace(/^"|"$/g, '');
    return document.querySelector<HTMLElement>(`[data-tour="${value}"]`);
  }
  return document.querySelector<HTMLElement>(target);
}

export default function Tutorial() {
  const { active, step, steps, next, prev, skip } = useTutorial();
  const current = steps[step];
  const [rect, setRect] = useState<Rect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !current) {
      setRect(null);
      return;
    }
    const update = () => {
      const el = findTarget(current.target);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top - PADDING,
        left: r.left - PADDING,
        width: r.width + PADDING * 2,
        height: r.height + PADDING * 2,
      });
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const interval = setInterval(update, 500); // catches layout shifts during animations
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      clearInterval(interval);
    };
  }, [active, step, current]);

  if (!active || !current) return null;

  const placement = current.placement || 'bottom';
  const tooltipStyle = computeTooltipPosition(rect, placement);

  return (
    <AnimatePresence>
      <motion.div
        key="tutorial-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] pointer-events-none"
      >
        {/* Backdrop with cut-out spotlight */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-auto"
          onClick={skip}
          aria-label="Skip tutorial"
        >
          <defs>
            <mask id="tutorial-mask">
              <rect width="100%" height="100%" fill="white" />
              {rect && (
                <rect
                  x={rect.left}
                  y={rect.top}
                  width={rect.width}
                  height={rect.height}
                  rx="6"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.75)" mask="url(#tutorial-mask)" />
        </svg>

        {/* Spotlight border */}
        {rect && (
          <motion.div
            layout
            className="absolute pointer-events-none border-2 border-primary"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              boxShadow: '0 0 0 4px rgba(255,77,0,0.2), 0 0 60px rgba(255,77,0,0.4)',
              borderRadius: 6,
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          ref={tooltipRef}
          key={`tooltip-${step}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute pointer-events-auto bg-black border-2 border-primary p-5 max-w-xs sm:max-w-sm shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
          style={tooltipStyle}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[9px] font-mono font-black uppercase tracking-[0.3em] text-primary italic">
              Step {step + 1} / {steps.length}
            </span>
            <button
              onClick={skip}
              className="ml-auto text-white/40 transition-colors"
              aria-label="Skip tutorial"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <h3 className="text-base font-mono font-black uppercase italic tracking-tight text-white mb-2">
            {current.title}
          </h3>
          <p className="text-xs text-white/70 leading-relaxed mb-4">{current.body}</p>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={prev}
              disabled={step === 0}
              className="flex items-center gap-1 text-[9px] font-mono font-black uppercase tracking-widest italic text-white/40 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
              Back
            </button>
            <button
              onClick={skip}
              className="text-[9px] font-mono font-black uppercase tracking-widest italic text-white/40 transition-colors"
            >
              Skip Tour
            </button>
            <button
              onClick={next}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-[9px] font-mono font-black uppercase tracking-widest italic"
            >
              {step + 1 === steps.length ? 'Finish' : 'Next'}
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function computeTooltipPosition(rect: Rect | null, placement: 'top' | 'bottom' | 'left' | 'right' | 'center'): React.CSSProperties {
  if (!rect || placement === 'center') {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }
  const W = window.innerWidth;
  const H = window.innerHeight;

  switch (placement) {
    case 'right':
      // place to the right of target if room, else fallback under
      if (rect.left + rect.width + TOOLTIP_GAP + 320 < W) {
        return {
          top: Math.max(8, Math.min(H - 200, rect.top)),
          left: rect.left + rect.width + TOOLTIP_GAP,
        };
      }
      return { top: rect.top + rect.height + TOOLTIP_GAP, left: Math.max(8, rect.left) };
    case 'left':
      if (rect.left - TOOLTIP_GAP - 320 > 0) {
        return {
          top: Math.max(8, Math.min(H - 200, rect.top)),
          left: rect.left - TOOLTIP_GAP - 320,
        };
      }
      return { top: rect.top + rect.height + TOOLTIP_GAP, left: Math.max(8, rect.left) };
    case 'top':
      return {
        top: Math.max(8, rect.top - TOOLTIP_GAP - 200),
        left: Math.min(W - 320 - 8, Math.max(8, rect.left)),
      };
    case 'bottom':
    default:
      return {
        top: Math.min(H - 200 - 8, rect.top + rect.height + TOOLTIP_GAP),
        left: Math.min(W - 320 - 8, Math.max(8, rect.left)),
      };
  }
}
