import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Returns a Supabase client when both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * are set, otherwise null. The auth context uses the null case to fall back to
 * the legacy localStorage-based mock so the demo keeps running without keys.
 */
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client;
  if (!url || !anonKey) return null;
  _client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return _client;
}

export const isSupabaseConfigured = Boolean(url && anonKey);
