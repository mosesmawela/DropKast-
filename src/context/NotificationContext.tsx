import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Info, Zap } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'ai';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  /** If set, route to push when notification is clicked. */
  href?: string;
}

interface NotificationContextType {
  notify: (type: NotificationType, title: string, message: string, opts?: { href?: string; persist?: boolean }) => void;
  inbox: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const INBOX_KEY = 'dropkast_inbox_v1';
const INBOX_LIMIT = 50;

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [inbox, setInbox] = useState<Notification[]>(() => {
    try {
      const raw = localStorage.getItem(INBOX_KEY);
      return raw ? (JSON.parse(raw) as Notification[]) : [];
    } catch {
      return [];
    }
  });

  // Persist inbox
  useEffect(() => {
    try {
      localStorage.setItem(INBOX_KEY, JSON.stringify(inbox.slice(0, INBOX_LIMIT)));
    } catch {
      // ignore quota errors
    }
  }, [inbox]);

  const notify = useCallback(
    (type: NotificationType, title: string, message: string, opts?: { href?: string; persist?: boolean }) => {
      const note: Notification = {
        id: Math.random().toString(36).substring(2, 10),
        type,
        title,
        message,
        timestamp: Date.now(),
        read: false,
        href: opts?.href,
      };
      // Toast (transient)
      setToasts((prev) => [...prev, note]);
      setTimeout(() => setToasts((prev) => prev.filter((n) => n.id !== note.id)), 5000);
      // Inbox (persistent), unless explicitly opted out
      if (opts?.persist !== false) {
        setInbox((prev) => [note, ...prev].slice(0, INBOX_LIMIT));
      }
    },
    [],
  );

  const remove = (id: string) => setToasts((prev) => prev.filter((n) => n.id !== id));

  const markAllRead = useCallback(() => {
    setInbox((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setInbox((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clearAll = useCallback(() => setInbox([]), []);

  const unreadCount = inbox.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notify, inbox, unreadCount, markAllRead, markRead, clearAll }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className="min-w-[280px] max-w-sm bg-black border border-white/10 p-4 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

                <div className="flex gap-3">
                  <div className="shrink-0 mt-0.5">
                    {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {n.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    {n.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                    {n.type === 'ai' && <Zap className="w-4 h-4 text-primary animate-pulse" />}
                  </div>
                  <div className="flex-1 pr-5 min-w-0">
                    <h4 className="text-[10px] font-black font-mono tracking-widest text-white uppercase italic mb-1 truncate">
                      {n.title}
                    </h4>
                    <p className="text-xs text-white/60 font-medium leading-relaxed">{n.message}</p>
                  </div>
                  <button
                    onClick={() => remove(n.id)}
                    className="absolute top-3 right-3 text-white/20 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className="absolute bottom-0 left-0 h-0.5 bg-primary/20"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotify = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotify must be used within a NotificationProvider');
  }
  return context;
};
