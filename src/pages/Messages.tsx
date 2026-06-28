import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Send,
  Music,
  Camera,
  Disc,
  Search,
  ChevronLeft,
  Loader2,
  Check,
  CheckCheck,
} from 'lucide-react';
import { useTheme, type UserRole } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotificationContext';
import { cn } from '../lib/utils';

type Role = 'ARTIST' | 'INFLUENCER' | 'DJ';

interface Participant {
  id: string;
  name: string;
  role: Role;
  avatar?: string;
  handle?: string;
}

interface Thread {
  id: string;
  a: Participant;
  b: Participant;
  other: Participant;
  unread: number;
  lastMessage?: string;
  lastTimestamp?: string;
}

interface Message {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  timestamp: string;
  read: boolean;
}

const ROLE_META: Record<Role, { label: string; icon: any; color: string; bg: string }> = {
  ARTIST: { label: 'Artist', icon: Music, color: '#FF4D00', bg: 'bg-primary/10' },
  INFLUENCER: { label: 'Creator', icon: Camera, color: '#00f2ff', bg: 'bg-cyan-400/10' },
  DJ: { label: 'DJ', icon: Disc, color: '#acec00', bg: 'bg-lime-400/10' },
};

const PORTAL_HEADER: Record<UserRole, { title: string; sub: string }> = {
  ARTIST: { title: 'Messages', sub: 'Conversations with creators and DJs working with your releases.' },
  INFLUENCER: { title: 'Messages', sub: 'Briefs, deliverables, and follow-ups with artists and DJs.' },
  DJ: { title: 'Messages', sub: 'Pack drops and feedback threads with artists and other selectas.' },
};

function formatTime(ts?: string): string {
  if (!ts) return '';
  const seconds = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });
}

export default function Messages() {
  const { role } = useTheme();
  const { user } = useAuth();
  const { notify } = useNotify();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [composeRecipient, setComposeRecipient] = useState('');
  const [composeMessage, setComposeMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load threads for current role
  useEffect(() => {
    setLoadingThreads(true);
    fetch(`/api/messages?role=${role}&userId=${user?.id ?? 'viewer'}`)
      .then((r) => r.json())
      .then((d) => {
        setThreads(d.threads ?? []);
        if (d.threads?.length && !active) {
          // auto-select the most recent thread on first load
          setActive(d.threads[0]);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoadingThreads(false));
  }, [role]);

  // Load messages for active thread + mark read
  useEffect(() => {
    if (!active) return;
    setLoadingMessages(true);
    fetch(`/api/messages/${active.id}`)
      .then((r) => r.json())
      .then((d) => setMessages(d.messages ?? []))
      .finally(() => setLoadingMessages(false));
    // Mark as read on the server
    fetch(`/api/messages/${active.id}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    }).catch(() => undefined);
    // optimistic local clear
    setThreads((prev) => prev.map((t) => (t.id === active.id ? { ...t, unread: 0 } : t)));
  }, [active?.id, role]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Send message
  const send = async () => {
    if (!draft.trim() || !active || sending) return;
    setSending(true);
    const localMsg: Message = {
      id: `local-${Date.now()}`,
      threadId: active.id,
      senderId: 'me',
      body: draft.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => [...prev, localMsg]);
    const body = draft.trim();
    setDraft('');
    try {
      const r = await fetch(`/api/messages/${active.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: viewerIdFor(active, role), body }),
      });
      const d = await r.json();
      if (d.message) {
        setMessages((prev) => prev.map((m) => (m.id === localMsg.id ? { ...d.message, senderId: 'me' } : m)));
      }
    } finally {
      setSending(false);
    }
  };

  const filteredThreads = useMemo(() => {
    if (!search) return threads;
    const s = search.toLowerCase();
    return threads.filter(
      (t) => t.other.name.toLowerCase().includes(s) || (t.lastMessage ?? '').toLowerCase().includes(s),
    );
  }, [threads, search]);

  const totalUnread = threads.reduce((sum, t) => sum + (t.unread ?? 0), 0);

  return (
    <div className="space-y-4 pb-12">
      <header className="border-b border-[var(--border-main)] pb-4">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-primary italic">
            {ROLE_META[role].label} Portal — Inbox
          </span>
          {totalUnread > 0 && (
            <span className="text-[9px] font-mono font-black uppercase tracking-widest text-primary italic">
              · {totalUnread} unread
            </span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-mono font-black tracking-tighter text-[var(--text-main)] italic uppercase">
          {PORTAL_HEADER[role].title}
        </h1>
        <p className="text-[var(--text-main)]/40 mt-1 text-xs">{PORTAL_HEADER[role].sub}</p>
      </header>

      <div className="manifest-card border border-[var(--border-main)] bg-[var(--card-bg)] grid grid-cols-1 md:grid-cols-[300px_1fr] h-[calc(100vh-220px)] min-h-[500px] overflow-hidden">
        {/* Thread list */}
        <aside className={cn('border-r border-[var(--border-main)] flex flex-col', active && 'hidden md:flex')}>
          <div className="p-3 border-b border-[var(--border-main)]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-main)]/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-transparent border border-[var(--border-main)] focus:border-primary outline-none pl-8 pr-3 py-1.5 text-xs text-[var(--text-main)] font-medium"
              />
            </div>
            <button
              onClick={() => setShowCompose(true)}
              className="w-full mt-2 py-2 border border-white/10 text-[9px] font-mono font-black uppercase tracking-widest italic text-white/40 hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Conversation
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loadingThreads ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-4 h-4 text-[var(--text-main)]/30 animate-spin" />
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare className="w-6 h-6 text-[var(--text-main)]/20 mx-auto mb-2" />
                <p className="text-[10px] font-mono font-black uppercase tracking-widest text-[var(--text-main)]/40 italic">
                  No conversations yet
                </p>
                <p className="text-[10px] text-[var(--text-main)]/30 mt-1">
                  Send an influencer brief or a DJ pack — replies land here.
                </p>
              </div>
            ) : (
              filteredThreads.map((t) => <ThreadRow key={t.id} thread={t} active={active?.id === t.id} onClick={() => setActive(t)} />)
            )}
          </div>
        </aside>

        {/* Conversation */}
        <main className={cn('flex flex-col min-w-0', !active && 'hidden md:flex')}>
          {active ? (
            <>
              <ConversationHeader thread={active} viewerRole={role} onBack={() => setActive(null)} />

              <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-3 bg-black/20">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-4 h-4 text-[var(--text-main)]/30 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-main)]/30 italic">
                      No messages yet — say hi.
                    </p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((m, i) => {
                      const fromMe = m.senderId === 'me' || (active && m.senderId === viewerIdFor(active, role));
                      const showTime = i === 0 || isFarFromPrev(messages[i - 1].timestamp, m.timestamp);
                      return (
                        <motion.div
                          key={m.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn('flex flex-col gap-1', fromMe ? 'items-end' : 'items-start')}
                        >
                          {showTime && (
                            <div className="text-center w-full mt-1 mb-1">
                              <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--text-main)]/30 italic">
                                {formatTimestamp(m.timestamp)}
                              </span>
                            </div>
                          )}
                          <div
                            className={cn(
                              'max-w-[80%] sm:max-w-[70%] px-3.5 py-2 text-[13px] leading-relaxed font-medium',
                              fromMe
                                ? 'bg-primary text-white'
                                : 'bg-white/[0.05] border border-white/10 text-[var(--text-main)]/85',
                            )}
                          >
                            {m.body}
                          </div>
                          {fromMe && (
                            <div className="text-[9px] font-mono uppercase tracking-widest text-[var(--text-main)]/40 italic flex items-center gap-1 pr-1">
                              {m.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                              <span>{m.read ? 'read' : 'sent'}</span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>

              <Composer
                value={draft}
                onChange={setDraft}
                onSend={send}
                sending={sending}
                placeholder={`Message ${active.other.name}...`}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="w-8 h-8 text-[var(--text-main)]/20 mb-3" />
              <p className="text-sm font-mono font-black uppercase italic tracking-widest text-[var(--text-main)]/50">
                Pick a conversation
              </p>
              <p className="text-xs text-[var(--text-main)]/30 mt-1">
                Or send a brief from Influencers / DJ Packs to start one.
              </p>
            </div>
          )}
        </main>
      </div>

      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCompose(false)}>
          <div className="bg-dark border border-white/10 p-8 max-w-md w-full mx-4 space-y-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black italic font-mono uppercase tracking-tight text-white">New Conversation</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-mono font-black uppercase tracking-widest text-white/40 italic block mb-1">Recipient</label>
                <input type="text" value={composeRecipient} onChange={e => setComposeRecipient(e.target.value)} placeholder="username or email" className="w-full bg-white/5 border border-white/10 p-3 text-white font-mono text-xs outline-none focus:border-primary transition-all" />
              </div>
              <div>
                <label className="text-[9px] font-mono font-black uppercase tracking-widest text-white/40 italic block mb-1">Message</label>
                <textarea value={composeMessage} onChange={e => setComposeMessage(e.target.value)} placeholder="Write your message..." rows={3} className="w-full bg-white/5 border border-white/10 p-3 text-white font-mono text-xs outline-none focus:border-primary transition-all resize-none" />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowCompose(false)} className="flex-1 h-12 border border-white/10 text-white/60 text-[10px] font-mono font-black uppercase italic tracking-widest hover:border-white transition-all">Cancel</button>
              <button onClick={() => {
                if (!composeRecipient.trim()) return;
                const newThread: Thread = {
                  id: `thread-${Date.now()}`,
                  a: { id: 'me', name: 'You', role },
                  b: { id: composeRecipient, name: composeRecipient, role: 'INFLUENCER' },
                  other: { id: composeRecipient, name: composeRecipient, role: 'INFLUENCER' },
                  unread: 0,
                  lastMessage: composeMessage.trim() || 'No message',
                  lastTimestamp: new Date().toISOString(),
                };
                setThreads(prev => [newThread, ...prev]);
                setActive(newThread);
                setShowCompose(false);
                setComposeRecipient('');
                setComposeMessage('');
              }} className="flex-1 h-12 bg-primary text-white text-[10px] font-mono font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ThreadRow({ thread, active, onClick }: { thread: Thread; active: boolean; onClick: () => void }) {
  const meta = ROLE_META[thread.other.role];
  const Icon = meta.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 border-b border-[var(--border-main)]/50 last:border-0 text-left transition-colors',
        active ? 'bg-primary/10' : 'hover:bg-white/[0.02]',
      )}
    >
      <div className="relative shrink-0">
        <div className="w-9 h-9 border border-[var(--border-main)] overflow-hidden">
          <img src={thread.other.avatar} alt={thread.other.name} className="w-full h-full object-cover" />
        </div>
        <div
          className={cn('absolute -bottom-1 -right-1 w-4 h-4 border-2 border-[var(--card-bg)] flex items-center justify-center', meta.bg)}
          style={{ color: meta.color }}
        >
          <Icon className="w-2.5 h-2.5" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn('text-xs font-mono font-black italic uppercase tracking-tight truncate', active ? 'text-primary' : 'text-[var(--text-main)]')}>
            {thread.other.name}
          </span>
          <span className="text-[9px] font-mono text-[var(--text-main)]/30 shrink-0">{formatTime(thread.lastTimestamp)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-[10px] text-[var(--text-main)]/50 truncate">{thread.lastMessage}</span>
          {thread.unread > 0 && (
            <span className="text-[8px] font-mono font-black bg-primary text-black px-1.5 py-0.5 shrink-0">
              {thread.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function ConversationHeader({ thread, viewerRole, onBack }: { thread: Thread; viewerRole: UserRole; onBack: () => void }) {
  const meta = ROLE_META[thread.other.role];
  const Icon = meta.icon;
  const ViewerIcon = ROLE_META[viewerRole].icon;
  return (
    <div className="border-b border-[var(--border-main)] px-4 py-3 flex items-center gap-3 bg-[var(--card-bg)]">
      <button
        onClick={onBack}
        className="md:hidden -ml-1 p-1 text-[var(--text-main)]/60 hover:text-[var(--text-main)]"
        aria-label="Back to conversations"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="relative shrink-0">
        <div className="w-10 h-10 border border-[var(--border-main)] overflow-hidden">
          <img src={thread.other.avatar} alt={thread.other.name} className="w-full h-full object-cover" />
        </div>
        <div
          className={cn('absolute -bottom-1 -right-1 w-5 h-5 border-2 border-[var(--card-bg)] flex items-center justify-center', meta.bg)}
          style={{ color: meta.color }}
        >
          <Icon className="w-3 h-3" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-mono font-black italic uppercase tracking-tight text-[var(--text-main)] truncate">
            {thread.other.name}
          </span>
          <span
            className="text-[9px] font-mono font-black uppercase tracking-widest italic px-1.5 py-0.5 border"
            style={{ color: meta.color, borderColor: `${meta.color}55` }}
          >
            {meta.label}
          </span>
        </div>
        <div className="text-[10px] font-mono text-[var(--text-main)]/40 italic truncate">
          {thread.other.handle ?? thread.other.role.toLowerCase()}
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-widest text-[var(--text-main)]/40 italic">
        You as <ViewerIcon className="w-3 h-3" /> {ROLE_META[viewerRole].label}
      </div>
    </div>
  );
}

function Composer({
  value,
  onChange,
  onSend,
  sending,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  sending: boolean;
  placeholder: string;
}) {
  return (
    <div className="border-t border-[var(--border-main)] p-3 bg-[var(--card-bg)]">
      <div className="relative flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), onSend())}
          placeholder={placeholder}
          disabled={sending}
          className="flex-1 bg-transparent border border-[var(--border-main)] focus:border-primary outline-none px-3 py-2 text-sm text-[var(--text-main)] disabled:opacity-50"
        />
        <button
          onClick={onSend}
          disabled={!value.trim() || sending}
          className="h-10 w-10 bg-primary text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-transform"
          title="Send"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function viewerIdFor(thread: Thread, role: UserRole): string {
  return thread.a.role === role ? thread.a.id : thread.b.id;
}

function isFarFromPrev(prev: string, curr: string): boolean {
  return new Date(curr).getTime() - new Date(prev).getTime() > 30 * 60 * 1000;
}
