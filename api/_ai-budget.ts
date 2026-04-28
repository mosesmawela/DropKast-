/**
 * AI cost guardrails. Tracks tokens per user and enforces a daily budget.
 * Falls back to a permissive in-memory tracker when no DB is connected,
 * so demos still run.
 *
 * Pricing (April 2026, in USD per million tokens):
 *   Sonnet 4.6 input        $3.00 / Mtok
 *   Sonnet 4.6 cached read  $0.30 / Mtok
 *   Sonnet 4.6 output       $15.00 / Mtok
 *   Haiku 4.5 input         $0.25 / Mtok
 *   Haiku 4.5 cached read   $0.025 / Mtok
 *   Haiku 4.5 output        $1.25 / Mtok
 *
 * Costs returned in cents (rounded).
 */
import { eq } from 'drizzle-orm';
import { getDb } from '../db/client.js';
import * as schema from '../db/schema.js';

export type AiModel = 'sonnet' | 'haiku';

const PRICE_USD_PER_MTOK = {
  sonnet: { input: 3, cachedRead: 0.3, output: 15 },
  haiku: { input: 0.25, cachedRead: 0.025, output: 1.25 },
} as const;

export interface UsageDelta {
  inputTokens: number;
  cachedReadTokens?: number;
  outputTokens: number;
  model: AiModel;
}

export function costCents(d: UsageDelta): number {
  const p = PRICE_USD_PER_MTOK[d.model];
  const usd =
    (d.inputTokens / 1_000_000) * p.input +
    ((d.cachedReadTokens ?? 0) / 1_000_000) * p.cachedRead +
    (d.outputTokens / 1_000_000) * p.output;
  return Math.round(usd * 100);
}

const DEFAULT_DAILY_BUDGET_CENTS = Number(process.env.AI_DAILY_BUDGET_CENTS ?? 100); // $1/day per user

const memoryUsage = new Map<string, { inputTokens: number; outputTokens: number; cachedTokens: number; costCents: number; resetAt: number }>();

function todayResetTimestamp(): number {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime() + 24 * 60 * 60 * 1000;
}

/**
 * Returns true if the user is over their daily budget. Anonymous users
 * (no userId) are always allowed but tracked under a shared bucket.
 */
export async function isOverBudget(userId: string | undefined): Promise<{ over: boolean; spentCents: number; budgetCents: number }> {
  const id = userId || '__anon__';
  const budget = DEFAULT_DAILY_BUDGET_CENTS;
  const db = getDb();
  if (db && userId) {
    try {
      const [row] = await db.select().from(schema.aiUsage).where(eq(schema.aiUsage.userId, userId as any));
      const reset = row?.resetAt ? new Date(row.resetAt).getTime() : 0;
      if (!row || reset < Date.now()) {
        return { over: false, spentCents: 0, budgetCents: budget };
      }
      return { over: row.costCents >= budget, spentCents: row.costCents, budgetCents: budget };
    } catch (err) {
      console.warn('[AI budget] DB read failed, falling back to memory:', err);
    }
  }
  const now = Date.now();
  const row = memoryUsage.get(id);
  if (!row || row.resetAt < now) return { over: false, spentCents: 0, budgetCents: budget };
  return { over: row.costCents >= budget, spentCents: row.costCents, budgetCents: budget };
}

export async function recordUsage(userId: string | undefined, d: UsageDelta): Promise<void> {
  const id = userId || '__anon__';
  const cost = costCents(d);
  const db = getDb();

  if (db && userId) {
    try {
      const [existing] = await db.select().from(schema.aiUsage).where(eq(schema.aiUsage.userId, userId as any));
      const reset = existing?.resetAt ? new Date(existing.resetAt).getTime() : 0;
      if (!existing || reset < Date.now()) {
        await db
          .insert(schema.aiUsage)
          .values({
            userId: userId as any,
            inputTokens: d.inputTokens,
            outputTokens: d.outputTokens,
            cachedTokens: d.cachedReadTokens ?? 0,
            costCents: cost,
            resetAt: new Date(todayResetTimestamp()),
          })
          .onConflictDoUpdate({
            target: schema.aiUsage.userId,
            set: {
              inputTokens: d.inputTokens,
              outputTokens: d.outputTokens,
              cachedTokens: d.cachedReadTokens ?? 0,
              costCents: cost,
              resetAt: new Date(todayResetTimestamp()),
            },
          });
      } else {
        await db
          .update(schema.aiUsage)
          .set({
            inputTokens: existing.inputTokens + d.inputTokens,
            outputTokens: existing.outputTokens + d.outputTokens,
            cachedTokens: existing.cachedTokens + (d.cachedReadTokens ?? 0),
            costCents: existing.costCents + cost,
          })
          .where(eq(schema.aiUsage.userId, userId as any));
      }
      return;
    } catch (err) {
      console.warn('[AI budget] DB write failed, falling back to memory:', err);
    }
  }

  const now = Date.now();
  const existing = memoryUsage.get(id);
  if (!existing || existing.resetAt < now) {
    memoryUsage.set(id, {
      inputTokens: d.inputTokens,
      outputTokens: d.outputTokens,
      cachedTokens: d.cachedReadTokens ?? 0,
      costCents: cost,
      resetAt: todayResetTimestamp(),
    });
  } else {
    existing.inputTokens += d.inputTokens;
    existing.outputTokens += d.outputTokens;
    existing.cachedTokens += d.cachedReadTokens ?? 0;
    existing.costCents += cost;
  }
}
