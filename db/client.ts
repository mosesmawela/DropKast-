/**
 * Database client. If DATABASE_URL is set we connect to Postgres via Drizzle.
 * Otherwise we fall back to an in-memory store so the demo keeps working
 * without credentials. Production: always set DATABASE_URL (Supabase/Neon).
 */
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

export type Db = PostgresJsDatabase<typeof schema>;

let _db: Db | null = null;
let _connected = false;

export function getDb(): Db | null {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) return null;

  const sql = postgres(url, { prepare: false, max: 5 });
  _db = drizzle(sql, { schema });
  _connected = true;
  return _db;
}

export function isDbConnected(): boolean {
  if (_connected) return true;
  // Probe lazily
  return getDb() !== null;
}

export { schema };
