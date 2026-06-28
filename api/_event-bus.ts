import { EventEmitter } from 'events';
import { logger } from './_logger.js';

export interface BusEvent {
  type: string;
  source: string;
  payload: unknown;
  ts: number;
  id: string;
}

export type EventHandler = (event: BusEvent) => void;

type Subscription = { handler: EventHandler; once?: boolean };

class EventBus {
  private emitter = new EventEmitter();
  private subscriptions = new Map<string, Set<Subscription>>();
  private history: BusEvent[] = [];
  private maxHistory = 500;

  on(type: string, handler: EventHandler): () => void {
    if (!this.subscriptions.has(type)) {
      this.subscriptions.set(type, new Set());
    }
    const sub: Subscription = { handler };
    this.subscriptions.get(type)!.add(sub);
    this.emitter.on(type, handler);
    return () => {
      this.subscriptions.get(type)?.delete(sub);
      this.emitter.off(type, handler);
    };
  }

  once(type: string, handler: EventHandler): void {
    if (!this.subscriptions.has(type)) {
      this.subscriptions.set(type, new Set());
    }
    this.subscriptions.get(type)!.add({ handler, once: true } as Subscription);
    this.emitter.once(type, handler);
  }

  emit(type: string, source: string, payload: unknown): void {
    const event: BusEvent = {
      type,
      source,
      payload,
      ts: Date.now(),
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
    this.history.push(event);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    this.emitter.emit(type, event);
    logger.debug({ type, source }, 'event-bus: emitted');
  }

  off(type: string, handler: EventHandler): void {
    const subs = this.subscriptions.get(type);
    if (subs) {
      for (const sub of subs) {
        if (sub.handler === handler) {
          subs.delete(sub);
          break;
        }
      }
    }
    this.emitter.off(type, handler);
  }

  listeners(type: string): number {
    return this.emitter.listenerCount(type);
  }

  recent(count = 50): BusEvent[] {
    return this.history.slice(-count).reverse();
  }

  clear(): void {
    this.subscriptions.clear();
    this.emitter.removeAllListeners();
    this.history = [];
  }
}

export const eventBus = new EventBus();
