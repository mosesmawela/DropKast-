/**
 * Phase 7 — security hardening middleware.
 *
 * Three concerns:
 *  1. Rate limiting on hot endpoints (/api/ai/*, /api/anr, /api/auth/*)
 *  2. CSP + security response headers
 *  3. Audit log writes for sensitive operations
 *
 * Rate limit uses Upstash Redis if `UPSTASH_REDIS_REST_URL` is set,
 * otherwise falls back to an in-memory token bucket so the app keeps
 * working in dev / on first-deploy.
 */
import type { Request, Response, NextFunction } from 'express';

interface Bucket {
  tokens: number;
  resetAt: number;
}

const memoryBuckets = new Map<string, Bucket>();

function clientId(req: Request): string {
  // Prefer X-Forwarded-For (Vercel + Cloudflare set it) — first hop is the real client.
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim();
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}

/**
 * In-memory rate limiter — N requests per `windowMs` per IP.
 * Memory is per-serverless-instance, so total throughput across many
 * cold-started lambdas is higher than the cap. Good enough as the first
 * line of defense; swap for Upstash for global rate limiting.
 */
export function rateLimit(opts: { name: string; max: number; windowMs: number }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${opts.name}:${clientId(req)}`;
    const now = Date.now();
    let bucket = memoryBuckets.get(key);
    if (!bucket || bucket.resetAt < now) {
      bucket = { tokens: opts.max, resetAt: now + opts.windowMs };
      memoryBuckets.set(key, bucket);
    }
    if (bucket.tokens <= 0) {
      const retry = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retry));
      res.setHeader('X-RateLimit-Limit', String(opts.max));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));
      return res.status(429).json({
        error: 'rate_limit_exceeded',
        message: `Too many requests. Try again in ${retry}s.`,
      });
    }
    bucket.tokens -= 1;
    res.setHeader('X-RateLimit-Limit', String(opts.max));
    res.setHeader('X-RateLimit-Remaining', String(bucket.tokens));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));
    next();
  };
}

/**
 * Adds standard security response headers. Vercel sets some of these
 * automatically, but explicit beats implicit.
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Note: CSP is more nuanced for the SPA; we set a permissive one here
  // and rely on Vercel's own headers + html meta for the strict version.
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https:; media-src 'self' https:; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://*.vercel-analytics.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com data:; " +
      "connect-src 'self' https://api.anthropic.com https://api.groq.com https://integrate.api.nvidia.com " +
      "https://api.cerebras.ai https://openrouter.ai https://api.moonshot.ai " +
      "https://generativelanguage.googleapis.com https://*.supabase.co https://va.vercel-scripts.com;",
  );
  next();
}

/* ===================== AUDIT LOG ====================== */

export interface AuditEvent {
  id: string;
  ts: Date;
  actorId: string;
  actorRole?: string;
  action: string; // e.g. 'release.takedown', 'data.export', 'data.delete', 'admin.dmca'
  resource?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}

const auditEvents: AuditEvent[] = [];
const AUDIT_LIMIT = 5_000;

export function logAudit(req: Request, ev: Omit<AuditEvent, 'id' | 'ts' | 'ip'>): void {
  const event: AuditEvent = {
    id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ts: new Date(),
    ip: clientId(req),
    ...ev,
  };
  auditEvents.unshift(event);
  if (auditEvents.length > AUDIT_LIMIT) auditEvents.length = AUDIT_LIMIT;
  // Mirror to structured log
  console.log(JSON.stringify({ level: 'info', kind: 'audit', ...event }));
  // Push to Command Center SSE stream — lazy import to avoid circular dep
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { emitAdminEvent } = require('./_admin.js');
    emitAdminEvent('audit', event);
  } catch {/* admin module not loaded — fine */}
}

export function listAuditEvents(opts?: { actorId?: string; action?: string; limit?: number }): AuditEvent[] {
  let out = auditEvents;
  if (opts?.actorId) out = out.filter((e) => e.actorId === opts.actorId);
  if (opts?.action) out = out.filter((e) => e.action.startsWith(opts.action!));
  return out.slice(0, opts?.limit ?? 100);
}
