/**
 * Admin / Command Center backend.
 *
 * Every endpoint here is auth-gated: only emails in ADMIN_EMAILS (comma
 * separated env var, e.g. "moses@lvrn.com,jshep@lvrn.com") can hit them.
 * Defaults to a hardcoded list for the founders if the env var is missing.
 *
 * Endpoints exposed:
 *   GET  /api/admin/overview       — counts + KPIs (artists, releases, MRR, AI runs today)
 *   GET  /api/admin/health         — provider pings (LLM brains, Stripe, DB)
 *   GET  /api/admin/keys           — inventory of API keys configured (booleans only — never returns the actual secrets)
 *   POST /api/admin/keys/test      — test a single provider key end-to-end
 *   GET  /api/admin/jobs           — recent AI job activity across the platform
 *   GET  /api/admin/finance        — subscriptions / advances / payouts rollup
 *   GET  /api/admin/audit          — readthrough of audit log (already exposed elsewhere; here too for convenience)
 *   POST /api/admin/feature-flag   — flip a runtime feature flag
 *   GET  /api/admin/feature-flags  — read all flags
 */
import { EventEmitter } from 'events';
import { logger } from './_logger.js';
import { listAuditEvents } from './_security.js';
import { getAllUsage } from './_ai-budget.js';

const DEFAULT_ADMIN_EMAILS = ['moses@lvrn.com', 'jshep@lvrn.com'];

export function isAdminEmail(email?: string): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS || DEFAULT_ADMIN_EMAILS.join(',');
  const allowed = raw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

/** Express middleware — 403 if caller isn't an admin.
 *  Accepts email from X-User-Email header OR ?email= query param (the latter
 *  is for EventSource which can't set custom headers). Same goes for the
 *  emergency password — header OR ?password= query param. */
export function adminOnly(req: any, res: any, next: any): void {
  const email =
    (req.headers['x-user-email'] as string) ||
    (req.query?.email as string) ||
    '';
  const adminPassword =
    (req.headers['x-admin-password'] as string) ||
    (req.query?.password as string) ||
    undefined;
  const expectedPwd = process.env.ADMIN_EMERGENCY_PASSWORD;

  if (isAdminEmail(email)) return next();
  if (expectedPwd && adminPassword === expectedPwd) return next();

  logger.warn({ email, ip: req.ip }, 'admin: unauthorised access attempt');
  return res.status(403).json({ error: 'admin_only' });
}

/* =========================================================================
 * Inventory of API keys configured.
 *
 * NEVER returns the actual key values. Only booleans + a safe last-4 hint.
 * ========================================================================= */
export interface KeyEntry {
  id: string;
  label: string;
  category: 'ai' | 'payments' | 'analytics' | 'storage' | 'observability' | 'social';
  envVar: string;
  configured: boolean;
  /** Last 4 of the key, when present. Helps the admin tell which key is loaded. */
  lastFour?: string;
  /** True when the env var contains a placeholder / dev value */
  isPlaceholder?: boolean;
}

const KEY_REGISTRY: Omit<KeyEntry, 'configured' | 'lastFour' | 'isPlaceholder'>[] = [
  // AI brains
  { id: 'anthropic',  label: 'Anthropic (Claude)',     category: 'ai', envVar: 'ANTHROPIC_API_KEY' },
  { id: 'openai',     label: 'OpenAI (GPT-5)',         category: 'ai', envVar: 'OPENAI_API_KEY' },
  { id: 'gemini',     label: 'Google (Gemini)',        category: 'ai', envVar: 'GEMINI_API_KEY' },
  { id: 'groq',       label: 'Groq',                   category: 'ai', envVar: 'GROQ_API_KEY' },
  { id: 'nvidia',     label: 'NVIDIA NIM',             category: 'ai', envVar: 'NVIDIA_API_KEY' },
  { id: 'cerebras',   label: 'Cerebras',               category: 'ai', envVar: 'CEREBRAS_API_KEY' },
  { id: 'openrouter', label: 'OpenRouter',             category: 'ai', envVar: 'OPENROUTER_API_KEY' },
  { id: 'moonshot',   label: 'Moonshot (Kimi)',        category: 'ai', envVar: 'MOONSHOT_API_KEY' },
  // Payments
  { id: 'stripe',          label: 'Stripe (Payments + Connect)', category: 'payments', envVar: 'STRIPE_SECRET_KEY' },
  { id: 'stripe-webhook',  label: 'Stripe webhook secret',       category: 'payments', envVar: 'STRIPE_WEBHOOK_SECRET' },
  { id: 'stripe-indie-y',  label: 'Stripe Price · Indie Yearly', category: 'payments', envVar: 'STRIPE_PRICE_INDIE_YEARLY' },
  { id: 'stripe-indie-m',  label: 'Stripe Price · Indie Monthly', category: 'payments', envVar: 'STRIPE_PRICE_INDIE_MONTHLY' },
  { id: 'stripe-pro-y',    label: 'Stripe Price · Pro Yearly',   category: 'payments', envVar: 'STRIPE_PRICE_PRO_YEARLY' },
  { id: 'stripe-pro-m',    label: 'Stripe Price · Pro Monthly',  category: 'payments', envVar: 'STRIPE_PRICE_PRO_MONTHLY' },
  { id: 'stripe-label-y',  label: 'Stripe Price · Label Yearly', category: 'payments', envVar: 'STRIPE_PRICE_LABEL_YEARLY' },
  { id: 'stripe-label-m',  label: 'Stripe Price · Label Monthly', category: 'payments', envVar: 'STRIPE_PRICE_LABEL_MONTHLY' },
  // Storage / DB
  { id: 'database',  label: 'Postgres (Drizzle)',     category: 'storage', envVar: 'DATABASE_URL' },
  { id: 'supabase',  label: 'Supabase',               category: 'storage', envVar: 'SUPABASE_URL' },
  { id: 'cloudinary', label: 'Cloudinary',            category: 'storage', envVar: 'CLOUDINARY_URL' },
  // Observability
  { id: 'sentry',     label: 'Sentry',                category: 'observability', envVar: 'VITE_SENTRY_DSN' },
  // Social verification
  { id: 'tiktok',     label: 'TikTok (post verifier)', category: 'social', envVar: 'TIKTOK_ACCESS_TOKEN' },
  { id: 'meta',       label: 'Meta / Instagram',       category: 'social', envVar: 'META_ACCESS_TOKEN' },
  // Music distro partner
  { id: 'routenote',  label: 'RouteNote (DSP delivery)', category: 'storage', envVar: 'ROUTENOTE_API_KEY' },
  // Misc
  { id: 'signed-url', label: 'Signed URL secret',      category: 'storage', envVar: 'SIGNED_URL_SECRET' },
  { id: 'isrc-prefix', label: 'ISRC registrant',       category: 'storage', envVar: 'ISRC_REGISTRANT' },
  { id: 'upc-prefix',  label: 'UPC company prefix',    category: 'storage', envVar: 'UPC_COMPANY_PREFIX' },
];

const PLACEHOLDER_HINTS = ['dev-', 'placeholder', 'changeme', 'test-key', 'sk_test_xxx'];

export function inventoryKeys(): KeyEntry[] {
  return KEY_REGISTRY.map((entry) => {
    const v = process.env[entry.envVar];
    const configured = !!v && v.length > 4;
    const isPlaceholder = !!v && PLACEHOLDER_HINTS.some((h) => v.toLowerCase().includes(h));
    return {
      ...entry,
      configured,
      lastFour: configured ? v.slice(-4) : undefined,
      isPlaceholder,
    };
  });
}

/* =========================================================================
 * AI provider health pings — quick "is the brain awake?" check.
 *
 * Each provider has a tiny test request (~$0.0001 cost). Returns ok + latency.
 * ========================================================================= */
export interface ProviderHealth {
  id: string;
  label: string;
  ok: boolean;
  latencyMs?: number;
  error?: string;
}

const PROVIDER_TESTS: Array<{ id: string; label: string; envVar: string; testUrl: string; auth: (k: string) => Record<string, string> }> = [
  { id: 'anthropic',  label: 'Anthropic',  envVar: 'ANTHROPIC_API_KEY',  testUrl: 'https://api.anthropic.com/v1/models',          auth: (k) => ({ 'x-api-key': k, 'anthropic-version': '2023-06-01' }) },
  { id: 'openai',     label: 'OpenAI',     envVar: 'OPENAI_API_KEY',     testUrl: 'https://api.openai.com/v1/models',             auth: (k) => ({ Authorization: `Bearer ${k}` }) },
  { id: 'groq',       label: 'Groq',       envVar: 'GROQ_API_KEY',       testUrl: 'https://api.groq.com/openai/v1/models',        auth: (k) => ({ Authorization: `Bearer ${k}` }) },
  { id: 'nvidia',     label: 'NVIDIA',     envVar: 'NVIDIA_API_KEY',     testUrl: 'https://integrate.api.nvidia.com/v1/models',   auth: (k) => ({ Authorization: `Bearer ${k}` }) },
  { id: 'cerebras',   label: 'Cerebras',   envVar: 'CEREBRAS_API_KEY',   testUrl: 'https://api.cerebras.ai/v1/models',            auth: (k) => ({ Authorization: `Bearer ${k}` }) },
  { id: 'openrouter', label: 'OpenRouter', envVar: 'OPENROUTER_API_KEY', testUrl: 'https://openrouter.ai/api/v1/models',          auth: (k) => ({ Authorization: `Bearer ${k}` }) },
  { id: 'moonshot',   label: 'Moonshot',   envVar: 'MOONSHOT_API_KEY',   testUrl: 'https://api.moonshot.cn/v1/models',            auth: (k) => ({ Authorization: `Bearer ${k}` }) },
];

export async function pingProviders(): Promise<ProviderHealth[]> {
  const results = await Promise.all(
    PROVIDER_TESTS.map(async (p): Promise<ProviderHealth> => {
      const key = process.env[p.envVar];
      if (!key) return { id: p.id, label: p.label, ok: false, error: 'no_key' };
      const t0 = Date.now();
      try {
        const ctrl = new AbortController();
        const to = setTimeout(() => ctrl.abort(), 4000);
        const res = await fetch(p.testUrl, { headers: p.auth(key), signal: ctrl.signal });
        clearTimeout(to);
        return {
          id: p.id,
          label: p.label,
          ok: res.ok,
          latencyMs: Date.now() - t0,
          error: res.ok ? undefined : `HTTP ${res.status}`,
        };
      } catch (err: any) {
        return { id: p.id, label: p.label, ok: false, error: err?.message?.slice(0, 80) || 'network_error', latencyMs: Date.now() - t0 };
      }
    }),
  );
  return results;
}

/* =========================================================================
 * Test a single key end-to-end (used when admin pastes a new key).
 * Returns { ok, latencyMs, error } without the key ever leaving server-side.
 * ========================================================================= */
export async function testProvider(providerId: string): Promise<ProviderHealth> {
  const provider = PROVIDER_TESTS.find((p) => p.id === providerId);
  if (!provider) return { id: providerId, label: providerId, ok: false, error: 'unknown_provider' };
  const all = await pingProviders();
  return all.find((r) => r.id === providerId) || { id: providerId, label: provider.label, ok: false, error: 'no_result' };
}

/* =========================================================================
 * Feature flags — runtime toggles. In-memory; survive restart via env var.
 * ========================================================================= */
const memFlags: Record<string, boolean> = {
  freeTierEnabled: true,
  newSignupsEnabled: true,
  aiBudgetEnforced: true,
  advancesAvailable: true,
  showCommandCenterButton: false, // false by default — only the URL works
};

export function getFlags(): Record<string, boolean> {
  return { ...memFlags };
}

export function setFlag(key: string, value: boolean): void {
  memFlags[key] = value;
  logger.info({ key, value }, 'admin: feature flag updated');
}

/* =========================================================================
 * Audit log re-export for convenience
 * ========================================================================= */
export function recentAudit(limit = 100) {
  return listAuditEvents().slice(-limit).reverse();
}

/* =========================================================================
 * Token usage re-export
 * ========================================================================= */
export { getAllUsage };

/* =========================================================================
 * Server-Sent Events bus — pushes admin updates to the Command Center
 * without polling. Subscribe to events.on('event', listener), emit from
 * audit / studio jobs / billing webhooks as they happen.
 * ========================================================================= */
export const adminEvents = new EventEmitter();
adminEvents.setMaxListeners(50);

export type AdminEventType = 'audit' | 'health' | 'job' | 'flag' | 'payout' | 'subscription';

export interface AdminEvent {
  type: AdminEventType;
  payload: unknown;
  ts: number;
}

export function emitAdminEvent(type: AdminEventType, payload: unknown): void {
  adminEvents.emit('event', { type, payload, ts: Date.now() } as AdminEvent);
}

/* =========================================================================
 * Exfiltration guard — scans outbound text for leaked API keys / secrets
 * before they reach the user. Inspired by ClaudeClaw Pack 5.
 *
 * 16 patterns covering Anthropic, OpenAI, Google, AWS, Stripe, GitHub,
 * Slack, Twilio, SendGrid, Mailgun, Firebase, generic SK, Telegram,
 * private keys, long hex strings, and base64 blobs.
 * ========================================================================= */
const SECRET_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: 'anthropic',     re: /sk-ant-[a-zA-Z0-9_-]{20,}/g },
  { name: 'openai',        re: /sk-(?!ant-)[a-zA-Z0-9]{32,}/g },
  { name: 'generic-sk',    re: /sk-[a-zA-Z0-9]{20,40}\b/g },
  { name: 'google',        re: /AIza[0-9A-Za-z_-]{35}/g },
  { name: 'aws',           re: /AKIA[0-9A-Z]{16}/g },
  { name: 'github-pat',    re: /gh[po]_[a-zA-Z0-9]{20,}/g },
  { name: 'slack',         re: /xox[bp]-[a-zA-Z0-9-]{10,}/g },
  { name: 'stripe-live',   re: /sk_live_[a-zA-Z0-9]{24,}/g },
  { name: 'stripe-test',   re: /sk_test_[a-zA-Z0-9]{24,}/g },
  { name: 'twilio',        re: /SK[0-9a-fA-F]{32}/g },
  { name: 'sendgrid',      re: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g },
  { name: 'mailgun',       re: /key-[a-zA-Z0-9]{32}/g },
  { name: 'firebase',      re: /AAAA[a-zA-Z0-9_-]{7}:[a-zA-Z0-9_-]{140,}/g },
  { name: 'private-key',   re: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/g },
  { name: 'telegram-bot',  re: /\b\d{8,10}:[a-zA-Z0-9_-]{35}\b/g },
  // Long hex (>= 41) — catches lots of API keys but excludes git SHAs (40 chars)
  { name: 'long-hex',      re: /\b[0-9a-fA-F]{41,}\b/g },
];

/** Names of env vars whose values, if echoed back, should be redacted. */
const PROTECTED_ENV_HINTS = ['KEY', 'TOKEN', 'SECRET', 'PASSWORD', 'DSN', 'PRIVATE'];

export interface ScanResult {
  clean: string;
  leaked: Array<{ pattern: string; preview: string }>;
}

export function scanForSecrets(text: string): ScanResult {
  if (!text) return { clean: text, leaked: [] };
  let clean = text;
  const leaked: Array<{ pattern: string; preview: string }> = [];

  for (const { name, re } of SECRET_PATTERNS) {
    const matches = text.match(re);
    if (matches) {
      for (const m of matches) {
        leaked.push({ pattern: name, preview: m.slice(0, 6) + '…' + m.slice(-4) });
      }
      clean = clean.replace(re, '[REDACTED]');
    }
  }

  // Scan for leaked env-var values themselves
  for (const [k, v] of Object.entries(process.env)) {
    if (!v || v.length < 8) continue;
    const looksProtected = PROTECTED_ENV_HINTS.some((h) => k.includes(h));
    if (!looksProtected) continue;
    if (clean.includes(v)) {
      leaked.push({ pattern: `env:${k}`, preview: v.slice(0, 4) + '…' + v.slice(-4) });
      clean = clean.split(v).join('[REDACTED_ENV]');
    }
  }

  if (leaked.length > 0) {
    logger.warn({ count: leaked.length, kinds: leaked.map((l) => l.pattern) }, 'exfiltration guard: secrets detected');
    emitAdminEvent('audit', { event: 'secrets_blocked', count: leaked.length, kinds: leaked.map((l) => l.pattern) });
  }

  return { clean, leaked };
}
