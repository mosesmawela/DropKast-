import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, CheckCheck, Trash2, CheckCircle2, AlertCircle, Info, Zap } from 'lucide-react';
import { useNotify } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

const TYPE_ICON = {
  success: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />,
  error: <AlertCircle className="w-3.5 h-3.5 text-red-500" />,
  info: <Info className="w-3.5 h-3.5 text-blue-500" />,
  ai: <Zap className="w-3.5 h-3.5 text-primary animate-pulse" />,
};

function formatTime(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function NotificationsDropdown() {
  const { inbox, unreadCount, markAllRead, markRead, clearAll, refreshInbox } = useNotify();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  useEffect(() => {
    if (!user?.id) return;
    refreshInbox(user.id); // initial fetch
    const poll = setInterval(() => refreshInbox(user.id), 30000);
    return () => clearInterval(poll);
  }, [user?.id, refreshInbox]);

  return (
    <div ref={ref} className="relative">
      <button
        data-tour="navbar-bell"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-white/40 transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-primary text-black text-[9px] font-mono font-black flex items-center justify-center rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-black border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-white italic">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest text-primary italic">
                    · {unreadCount} new
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/40 transition-colors"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
              {inbox.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Bell className="w-6 h-6 text-white/10 mx-auto mb-3" />
                  <p className="text-[10px] font-mono font-black uppercase tracking-widest text-white/30 italic">
                    Inbox is empty
                  </p>
                  <p className="text-[10px] text-white/20 mt-1">
                    You'll get pings when releases go live, influencers post, or DJs send feedback.
                  </p>
                </div>
              ) : (
                inbox.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      markRead(n.id);
                      if (n.href) {
                        navigate(n.href);
                        setOpen(false);
                      }
                    }}
                    className={cn(
                      'w-full text-left flex gap-3 px-4 py-3 border-b border-white/5 last:border-0 transition-colors',
                      n.read ? 'bg-transparent' : 'bg-primary/[0.04]',
                    )}
                  >
                    <div className="shrink-0 pt-0.5">{TYPE_ICON[n.type]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className={cn('text-[10px] font-mono font-black uppercase tracking-widest italic truncate', n.read ? 'text-white/60' : 'text-white')}>
                          {n.title}
                        </span>
                        <span className="text-[9px] font-mono text-white/30 shrink-0">{formatTime(n.timestamp)}</span>
                      </div>
                      <p className={cn('text-xs leading-snug', n.read ? 'text-white/40' : 'text-white/70')}>
                        {n.message}
                      </p>
                    </div>
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />}
                  </button>
                ))
              )}
            </div>

            {inbox.length > 0 && (
              <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-white/[0.02]">
                <button
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                  className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-widest italic text-white/40 disabled:opacity-30 transition-colors"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark all read
                </button>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-widest italic text-white/40 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear all
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
