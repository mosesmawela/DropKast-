/**
 * Lightweight cross-portal inbox.
 *
 * When an artist sends something to an influencer or DJ (or vice-versa),
 * we record an inbox event keyed by the receiver. Portals poll
 * `/api/inbox/:userId` to render notifications. Persists in-memory; swap
 * for a real `notifications` table once Postgres is wired up.
 */

export interface InboxEvent {
  id: string;
  receiverId: string;
  type: 'success' | 'info' | 'ai' | 'error';
  title: string;
  message: string;
  href?: string;
  createdAt: Date;
  read: boolean;
}

const events: InboxEvent[] = [];
const LIMIT = 200;

export function pushEvent(e: Omit<InboxEvent, 'id' | 'createdAt' | 'read'>): InboxEvent {
  const event: InboxEvent = {
    id: `INBOX-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date(),
    read: false,
    ...e,
  };
  events.unshift(event);
  if (events.length > LIMIT) events.length = LIMIT;
  return event;
}

export function listEventsFor(receiverId: string): InboxEvent[] {
  return events.filter((e) => e.receiverId === receiverId);
}

export function markRead(id: string): boolean {
  const e = events.find((x) => x.id === id);
  if (!e) return false;
  e.read = true;
  return true;
}
