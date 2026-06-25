/**
 * Admin allowlist + helpers — frontend mirror of the backend gate.
 *
 * The backend is the source of truth (env ADMIN_EMAILS); we just check
 * locally to avoid rendering the Command Center to non-admins. The
 * backend will refuse any actual data fetch from a non-admin anyway.
 */
import { isSupabaseConfigured } from './supabase';

const FALLBACK_ADMINS = ['moses@lvrn.com', 'jshep@lvrn.com'];

const DEV_BYPASS_EMAIL = import.meta.env.VITE_BYPASS_EMAIL || 'admin@dropkast.dev';

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  // Dev bypass: always allow the configured bypass email
  if (!isSupabaseConfigured && email.toLowerCase() === DEV_BYPASS_EMAIL.toLowerCase()) {
    return true;
  }
  // Allow override from a localStorage list set during onboarding.
  try {
    const overrides = JSON.parse(localStorage.getItem('dropkast.admin.allowlist') || 'null');
    if (Array.isArray(overrides) && overrides.length > 0) {
      return overrides.map((s: string) => s.toLowerCase()).includes(email.toLowerCase());
    }
  } catch {/* ignore */}
  return FALLBACK_ADMINS.map((s) => s.toLowerCase()).includes(email.toLowerCase());
}

const ACCESS_KEY = 'dropkast.admin.session';

export function setAdminSession(active: boolean): void {
  if (active) localStorage.setItem(ACCESS_KEY, '1');
  else localStorage.removeItem(ACCESS_KEY);
}

export function hasAdminSession(): boolean {
  try {
    return localStorage.getItem(ACCESS_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Build admin headers for fetch calls. The backend reads these.
 * In bypass mode, also sends dev auth headers.
 */
export function adminHeaders(email?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'X-User-Email': email || '',
  };
  // Dev bypass: add dev auth headers
  if (!isSupabaseConfigured) {
    headers['X-User-Id'] = import.meta.env.VITE_BYPASS_USER_ID || 'dev-user-001';
    headers['X-Dev-Auth'] = 'true';
    headers['Authorization'] = 'Bearer dev-bypass-token';
  }
  // Emergency password override — set via Settings → Admin in the UI
  try {
    const pwd = localStorage.getItem('dropkast.admin.password');
    if (pwd) headers['X-Admin-Password'] = pwd;
  } catch {/* ignore */}
  return headers;
}
