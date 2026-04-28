import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Info, Zap } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'ai';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

interface NotificationContextType {
  notify: (type: NotificationType, title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((type: NotificationType, title: string, message: string) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const remove = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-4 pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className="min-w-[320px] bg-black border border-white/10 p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                
                <div className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {n.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                    {n.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                    {n.type === 'ai' && <Zap className="w-5 h-5 text-primary animate-pulse" />}
                  </div>
                  <div className="flex-1 pr-6">
                    <h4 className="text-[11px] font-black font-mono tracking-widest text-white uppercase italic mb-1">{n.title}</h4>
                    <p className="text-[13px] text-white/40 font-sans italic font-medium leading-relaxed">{n.message}</p>
                  </div>
                  <button 
                    onClick={() => remove(n.id)}
                    className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar */}
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
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
