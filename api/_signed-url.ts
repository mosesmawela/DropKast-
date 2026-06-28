/**
 * Phase 4 — DJ pack signed URL generation.
 *
 * For now, signs URLs with HMAC-SHA256 using a server-side secret. URLs
 * embed a short-lived expiration. When R2 / S3 storage is wired, swap
 * for the storage provider's native signed URL API (S3 presigned, R2
 * signed URL). The interface stays the same.
 */
import crypto from 'crypto';

const SECRET: string = process.env.SIGNED_URL_SECRET || (() => { throw new Error('SIGNED_URL_SECRET environment variable is required'); })();
const DEFAULT_TTL_SECONDS = 60 * 60 * 24; // 24 hours

export function signPackUrl(input: {
  baseUrl: string;
  packId: string;
  djId: string;
  ttlSeconds?: number;
}): string {
  const ttl = input.ttlSeconds ?? DEFAULT_TTL_SECONDS;
  const expires = Math.floor(Date.now() / 1000) + ttl;
  const payload = `${input.packId}.${input.djId}.${expires}`;
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex').slice(0, 32);
  const u = new URL(input.baseUrl);
  u.searchParams.set('pack', input.packId);
  u.searchParams.set('dj', input.djId);
  u.searchParams.set('exp', String(expires));
  u.searchParams.set('sig', sig);
  return u.toString();
}

export function verifyPackUrl(params: { pack?: string; dj?: string; exp?: string; sig?: string }): {
  ok: boolean;
  reason?: string;
  packId?: string;
  djId?: string;
} {
  if (!params.pack || !params.dj || !params.exp || !params.sig) {
    return { ok: false, reason: 'missing_params' };
  }
  const exp = parseInt(params.exp, 10);
  if (Number.isNaN(exp) || exp < Math.floor(Date.now() / 1000)) {
    return { ok: false, reason: 'expired' };
  }
  const payload = `${params.pack}.${params.dj}.${exp}`;
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex').slice(0, 32);
  // Constant-time compare
  if (expected.length !== params.sig.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(params.sig))) {
    return { ok: false, reason: 'bad_signature' };
  }
  return { ok: true, packId: params.pack, djId: params.dj };
}
