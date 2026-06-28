import { createHmac, timingSafeEqual } from 'crypto';
import { logger } from './_logger.js';
import { eventBus } from './_event-bus.js';

export interface WebhookConfig {
  id: string;
  url: string;
  secret?: string;
  events: string[];
  headers?: Record<string, string>;
  retryMax?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
  enabled: boolean;
  createdAt: Date;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  url: string;
  status: 'pending' | 'success' | 'failed';
  statusCode?: number;
  durationMs?: number;
  error?: string;
  attempt: number;
  timestamp: Date;
}

const configs = new Map<string, WebhookConfig>();
const deliveries: WebhookDelivery[] = [];
const MAX_DELIVERIES = 1000;

const PRIVATE_IPS = [
  '127.0.0.0/8', '10.0.0.0/8', '172.16.0.0/12',
  '192.168.0.0/16', '169.254.0.0/16', '::1/128',
  'fc00::/7', 'fe80::/10',
];

function isPrivateIp(hostname: string): boolean {
  try {
    const url = new URL(hostname.startsWith('http') ? hostname : `http://${hostname}`);
    const host = url.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return true;
    const { isIP } = require('net');
    if (!isIP(host)) return false;
    const parts = host.split('.').map(Number);
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 127) return true;
    return false;
  } catch {
    return false;
  }
}

export function registerWebhook(cfg: WebhookConfig): void {
  configs.set(cfg.id, cfg);
  logger.info({ webhookId: cfg.id, url: cfg.url, events: cfg.events }, 'webhook: registered');
}

export function unregisterWebhook(id: string): boolean {
  return configs.delete(id);
}

export function getWebhook(id: string): WebhookConfig | undefined {
  return configs.get(id);
}

export function listWebhooks(): WebhookConfig[] {
  return Array.from(configs.values());
}

export async function deliverEvent(eventType: string, payload: unknown): Promise<void> {
  const matching = Array.from(configs.values()).filter(
    (w) => w.enabled && w.events.includes(eventType)
  );
  if (matching.length === 0) return;

  await Promise.allSettled(
    matching.map((webhook) => deliverToWebhook(webhook, eventType, payload))
  );
}

async function deliverToWebhook(
  webhook: WebhookConfig,
  eventType: string,
  payload: unknown
): Promise<void> {
  if (isPrivateIp(webhook.url)) {
    logger.warn({ webhookId: webhook.id, url: webhook.url }, 'webhook: blocked private IP');
    recordDelivery(webhook.id, eventType, 'failed', { error: 'blocked: private IP', attempt: 1 });
    return;
  }

  const maxRetries = webhook.retryMax ?? 3;
  const delayMs = webhook.retryDelayMs ?? 2000;
  const timeoutMs = webhook.timeoutMs ?? 10000;
  const body = JSON.stringify({
    event: eventType,
    ts: Date.now(),
    payload,
  });

  const signature = webhook.secret
    ? createHmac('sha256', webhook.secret).update(body).digest('hex')
    : undefined;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'DropKast-Webhook/1.0',
    ...(signature ? { 'X-DropKast-Signature': `sha256=${signature}` } : {}),
    ...webhook.headers,
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const t0 = Date.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal,
      });
      clearTimeout(timer);

      const duration = Date.now() - t0;
      if (res.ok) {
        recordDelivery(webhook.id, eventType, 'success', {
          statusCode: res.status,
          durationMs: duration,
          attempt,
        });
        logger.info({ webhookId: webhook.id, eventType, attempt, durationMs: duration }, 'webhook: delivered');
        return;
      }

      recordDelivery(webhook.id, eventType, 'failed', {
        statusCode: res.status,
        durationMs: duration,
        error: `HTTP ${res.status}`,
        attempt,
      });
      logger.warn({ webhookId: webhook.id, eventType, attempt, status: res.status }, 'webhook: failed, retrying');
    } catch (err: any) {
      const duration = Date.now() - t0;
      if (err.name === 'AbortError') {
        recordDelivery(webhook.id, eventType, 'failed', { error: 'timeout', durationMs: timeoutMs, attempt });
      } else {
        recordDelivery(webhook.id, eventType, 'failed', { error: err.message?.slice(0, 200), durationMs: duration, attempt });
      }
    }

    if (attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, delayMs * attempt));
    }
  }

  logger.error({ webhookId: webhook.id, eventType }, 'webhook: all retries exhausted');
}

function recordDelivery(
  webhookId: string,
  event: string,
  status: 'success' | 'failed',
  meta: { statusCode?: number; durationMs?: number; error?: string; attempt: number }
): void {
  const webhook = configs.get(webhookId);
  deliveries.push({
    id: `del-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    webhookId,
    event,
    url: webhook?.url ?? '',
    status,
    ...meta,
    timestamp: new Date(),
  });
  if (deliveries.length > MAX_DELIVERIES) deliveries.shift();
}

export function getDeliveries(webhookId?: string, limit = 50): WebhookDelivery[] {
  const filtered = webhookId
    ? deliveries.filter((d) => d.webhookId === webhookId)
    : deliveries;
  return filtered.slice(-limit).reverse();
}

export function verifySignature(body: string, signature: string, secret: string): boolean {
  try {
    const expected = createHmac('sha256', secret).update(body).digest('hex');
    const [algo, sig] = signature.split('=');
    if (algo !== 'sha256') return false;
    return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

eventBus.on('*', (event) => {
  deliverEvent(event.type, event.payload).catch((err) =>
    logger.error({ err }, 'webhook: deliverEvent error')
  );
});
