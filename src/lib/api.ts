import { isSupabaseConfigured } from './supabase';

const DEV_AUTH_TOKEN = 'dev-bypass-token';

function getDevAuthHeaders(): Record<string, string> {
  const email = import.meta.env.VITE_BYPASS_EMAIL || 'admin@dropkast.dev';
  const userId = import.meta.env.VITE_BYPASS_USER_ID || 'dev-user-001';
  return {
    'X-User-Id': userId,
    'X-User-Email': email,
    'X-Dev-Auth': 'true',
    'Authorization': `Bearer ${DEV_AUTH_TOKEN}`,
  };
}

export interface ApiFetchOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
}

export async function apiFetch(url: string, opts: ApiFetchOptions = {}): Promise<Response> {
  const headers: Record<string, string> = { ...opts.headers };

  if (!isSupabaseConfigured) {
    Object.assign(headers, getDevAuthHeaders());
  }

  return fetch(url, { ...opts, headers });
}

export async function apiFetchJson<T = any>(url: string, opts: ApiFetchOptions = {}): Promise<T> {
  const res = await apiFetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...opts.headers,
    },
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${errBody.slice(0, 200) || res.statusText}`);
  }
  return res.json();
}

export function isDevBypassActive(): boolean {
  return import.meta.env.VITE_AUTH_BYPASS === 'true' && !isSupabaseConfigured;
}