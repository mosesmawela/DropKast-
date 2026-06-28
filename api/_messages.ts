/**
 * Cross-portal messaging.
 *
 * Threads are 1:1. Each thread has a viewerRole filter so an artist sees
 * threads with influencers/DJs, an influencer sees threads with artists/DJs,
 * etc. Persists in process memory; swap for a real `messages` table when
 * Supabase Postgres is wired up.
 */

export type Role = 'ARTIST' | 'INFLUENCER' | 'DJ';

export interface Participant {
  id: string;
  name: string;
  role: Role;
  avatar?: string;
  /** Optional handle / sub-label, e.g. "TikTok · 1.2M" or "Berlin techno DJ" */
  handle?: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  timestamp: Date;
  read: boolean;
}

export interface Thread {
  id: string;
  // Both participants — viewer is whichever matches the requesting role.
  a: Participant;
  b: Participant;
  lastMessage?: string;
  lastTimestamp?: Date;
  unreadForA?: number;
  unreadForB?: number;
}

const threads: Thread[] = [];
const messages: Message[] = [];

/* =============== SEED DATA ===============
 * Three artist-side threads, two influencer-side, two DJ-side.
 * The same threads appear from both sides via participant matching.
 */

const SEED_PARTICIPANTS = {
  artist1: { id: 'user-artist-1', name: 'Buddy Kay', role: 'ARTIST' as Role, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BuddyKay', handle: 'Hyperpop · LVRN signed' },
  artist2: { id: 'user-artist-2', name: 'Sonic Frame', role: 'ARTIST' as Role, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SonicFrame', handle: 'Indie pop' },
  inf1: { id: 'inf-1', name: 'Alex Wave', role: 'INFLUENCER' as Role, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop', handle: 'TikTok · 1.2M · Dark Pop' },
  inf2: { id: 'inf-5', name: 'Luna Beats', role: 'INFLUENCER' as Role, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', handle: 'TikTok · 3.1M · Hyperpop' },
  inf3: { id: 'inf-3', name: 'VibeCheck', role: 'INFLUENCER' as Role, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop', handle: 'TikTok · 2.5M · Indie' },
  dj1: { id: 'dj-1', name: 'DJ Matrix', role: 'DJ' as Role, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DJMatrix', handle: 'Berlin · Techno' },
  dj2: { id: 'dj-2', name: 'Midnight Selecta', role: 'DJ' as Role, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MidnightSelecta', handle: 'NYC · House / Garage' },
};

function seedMessage(threadId: string, senderId: string, body: string, minutesAgo: number, read = true): Message {
  return {
    id: `MSG-${Math.random().toString(36).slice(2, 10)}`,
    threadId,
    senderId,
    body,
    timestamp: new Date(Date.now() - minutesAgo * 60 * 1000),
    read,
  };
}

function seedThread(a: Participant, b: Participant, msgs: { from: 'a' | 'b'; body: string; minAgo: number; read?: boolean }[]): void {
  const id = `THR-${Math.random().toString(36).slice(2, 10)}`;
  const last = msgs[msgs.length - 1];
  threads.push({
    id,
    a,
    b,
    lastMessage: last.body,
    lastTimestamp: new Date(Date.now() - last.minAgo * 60 * 1000),
    unreadForA: msgs.filter((m) => m.from === 'b' && m.read === false).length,
    unreadForB: msgs.filter((m) => m.from === 'a' && m.read === false).length,
  });
  for (const m of msgs) {
    messages.push(seedMessage(id, m.from === 'a' ? a.id : b.id, m.body, m.minAgo, m.read ?? true));
  }
}

// No seeded threads — conversations start empty and are created when an artist
// actually messages an influencer/DJ. seedThread/seedMessage/SEED_PARTICIPANTS
// are retained below for tests + local fixtures but are intentionally unused.
void seedThread;
void SEED_PARTICIPANTS;

/* =============== PUBLIC API =============== */

export function listThreadsForViewer(viewerId: string, viewerRole: Role): Array<Thread & { other: Participant; unread: number }> {
  const out: Array<Thread & { other: Participant; unread: number }> = [];
  for (const t of threads) {
    let viewerSide: 'a' | 'b' | null = null;
    if (t.a.id === viewerId) viewerSide = 'a';
    else if (t.b.id === viewerId) viewerSide = 'b';
    if (!viewerSide) continue;
    const other = viewerSide === 'a' ? t.b : t.a;
    const unread = viewerSide === 'a' ? t.unreadForA ?? 0 : t.unreadForB ?? 0;
    out.push({ ...t, other, unread });
  }
  out.sort((x, y) => (y.lastTimestamp?.getTime() ?? 0) - (x.lastTimestamp?.getTime() ?? 0));
  return out;
}

export function listMessagesInThread(threadId: string): Message[] {
  return messages.filter((m) => m.threadId === threadId).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

export function findThread(threadId: string): Thread | undefined {
  return threads.find((t) => t.id === threadId);
}

export function postMessage(threadId: string, senderId: string, body: string): Message | null {
  const thread = findThread(threadId);
  if (!thread) return null;
  const msg: Message = {
    id: `MSG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    threadId,
    senderId,
    body,
    timestamp: new Date(),
    read: false,
  };
  messages.push(msg);
  thread.lastMessage = body;
  thread.lastTimestamp = msg.timestamp;
  // bump unread counter for the OTHER side
  if (senderId === thread.a.id) thread.unreadForB = (thread.unreadForB ?? 0) + 1;
  else thread.unreadForA = (thread.unreadForA ?? 0) + 1;
  return msg;
}

export function markThreadRead(threadId: string, viewerRole: Role): void {
  const thread = findThread(threadId);
  if (!thread) return;
  if (thread.a.role === viewerRole) thread.unreadForA = 0;
  if (thread.b.role === viewerRole) thread.unreadForB = 0;
  for (const m of messages) {
    if (m.threadId !== threadId) continue;
    // mark messages from the OTHER side as read
    if ((thread.a.role === viewerRole && m.senderId === thread.b.id) ||
        (thread.b.role === viewerRole && m.senderId === thread.a.id)) {
      m.read = true;
    }
  }
}
