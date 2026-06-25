import { logger } from './_logger.js';

interface CooldownEntry {
  until: number;
  failures: number;
}

const hosts = new Map<string, CooldownEntry>();

const COOLDOWN_MS = 20_000;
const MAX_FAILURES = 2;

export function recordFailure(host: string): void {
  const entry = hosts.get(host) || { until: 0, failures: 0 };
  entry.failures += 1;
  if (entry.failures >= MAX_FAILURES) {
    entry.until = Date.now() + COOLDOWN_MS;
    logger.warn({ host, cooldownMs: COOLDOWN_MS }, 'cooldown: host added');
  }
  hosts.set(host, entry);
}

export function recordSuccess(host: string): void {
  hosts.delete(host);
}

export function isOnCooldown(host: string): boolean {
  const entry = hosts.get(host);
  if (!entry) return false;
  if (Date.now() >= entry.until) {
    hosts.delete(host);
    return false;
  }
  return true;
}

export function getCooldowns(): Record<string, { remainingMs: number; failures: number }> {
  const result: Record<string, { remainingMs: number; failures: number }> = {};
  for (const [host, entry] of hosts) {
    const remaining = entry.until - Date.now();
    if (remaining > 0) {
      result[host] = { remainingMs: remaining, failures: entry.failures };
    }
  }
  return result;
}

export function clearCooldowns(): void {
  hosts.clear();
}
