/**
 * Phase 3 — royalty ingestion and earnings aggregation.
 *
 * Real DSPs send monthly CSV statements. We parse them, write line items
 * into the ledger, then roll up earnings by ISRC/release/payee. When a
 * payout is triggered, the splits table determines who gets what %.
 *
 * Default columns we accept (case-insensitive):
 *   isrc | upc | platform | territory | period | quantity | amount | currency
 *
 * Some DSPs use different headers; we map the most common synonyms below.
 */
import { logger } from './_logger.js';

export interface RoyaltyLine {
  id: string;
  releaseId?: string;
  isrc?: string;
  upc?: string;
  platform?: string;
  territory?: string;
  period?: string;
  quantity: number;
  amountCents: number;
  currency: string;
  source?: string;
  ingestedAt: Date;
}

const HEADER_SYNONYMS: Record<string, keyof RoyaltyLine | 'amount'> = {
  isrc: 'isrc', track_isrc: 'isrc', recording_isrc: 'isrc',
  upc: 'upc', release_upc: 'upc', barcode: 'upc',
  platform: 'platform', dsp: 'platform', store: 'platform', service: 'platform',
  territory: 'territory', country: 'territory', region: 'territory',
  period: 'period', month: 'period', reporting_period: 'period',
  quantity: 'quantity', streams: 'quantity', units: 'quantity', plays: 'quantity', count: 'quantity',
  amount: 'amount', earnings: 'amount', revenue: 'amount', payable: 'amount', net: 'amount',
  currency: 'currency', curr: 'currency',
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s_-]+/g, '_');
}

/** Parse a generic DSP CSV statement into structured RoyaltyLines. */
export function parseRoyaltyCsv(csvText: string, source = 'manual'): RoyaltyLine[] {
  const lines = csvText.replace(/\r\n/g, '\n').split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];

  const rawHeaders = lines[0].split(',').map((s) => s.trim().replace(/^"|"$/g, ''));
  const headerMap: (keyof RoyaltyLine | 'amount' | null)[] = rawHeaders.map((h) => {
    const norm = normalizeHeader(h);
    return HEADER_SYNONYMS[norm] ?? null;
  });

  const out: RoyaltyLine[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    const row: any = {};
    for (let j = 0; j < cols.length && j < headerMap.length; j++) {
      const target = headerMap[j];
      if (target) row[target] = cols[j];
    }
    if (!row.isrc && !row.upc) continue; // skip malformed rows

    const quantity = parseInt(String(row.quantity ?? '0').replace(/[, ]/g, ''), 10) || 0;
    const amountStr = String(row.amount ?? '0').replace(/[$, ]/g, '');
    const amountFloat = parseFloat(amountStr) || 0;
    const amountCents = Math.round(amountFloat * 100);

    out.push({
      id: `RL-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      isrc: row.isrc,
      upc: row.upc,
      platform: row.platform,
      territory: row.territory,
      period: row.period,
      quantity,
      amountCents,
      currency: row.currency || 'USD',
      source,
      ingestedAt: new Date(),
    });
  }
  return out;
}

/** Minimal CSV row parser that handles quoted fields with commas inside. */
function parseCsvRow(row: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const c = row[i];
    if (c === '"') {
      if (inQuotes && row[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      out.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

/** Aggregate ledger lines into earnings summary for a release / payee. */
export function aggregateEarnings(lines: RoyaltyLine[]): {
  totalCents: number;
  byPlatform: Record<string, { quantity: number; amountCents: number }>;
  byTerritory: Record<string, { quantity: number; amountCents: number }>;
  byPeriod: Record<string, { quantity: number; amountCents: number }>;
  byRelease: Record<string, { quantity: number; amountCents: number }>;
  totalQuantity: number;
} {
  const byPlatform: Record<string, { quantity: number; amountCents: number }> = {};
  const byTerritory: Record<string, { quantity: number; amountCents: number }> = {};
  const byPeriod: Record<string, { quantity: number; amountCents: number }> = {};
  const byRelease: Record<string, { quantity: number; amountCents: number }> = {};
  let totalCents = 0;
  let totalQuantity = 0;

  for (const l of lines) {
    totalCents += l.amountCents;
    totalQuantity += l.quantity;

    const platKey = l.platform ?? 'unknown';
    byPlatform[platKey] = byPlatform[platKey] || { quantity: 0, amountCents: 0 };
    byPlatform[platKey].quantity += l.quantity;
    byPlatform[platKey].amountCents += l.amountCents;

    const tKey = l.territory ?? 'unknown';
    byTerritory[tKey] = byTerritory[tKey] || { quantity: 0, amountCents: 0 };
    byTerritory[tKey].quantity += l.quantity;
    byTerritory[tKey].amountCents += l.amountCents;

    const pKey = l.period ?? 'unknown';
    byPeriod[pKey] = byPeriod[pKey] || { quantity: 0, amountCents: 0 };
    byPeriod[pKey].quantity += l.quantity;
    byPeriod[pKey].amountCents += l.amountCents;

    const rKey = l.releaseId ?? l.isrc ?? l.upc ?? 'unknown';
    byRelease[rKey] = byRelease[rKey] || { quantity: 0, amountCents: 0 };
    byRelease[rKey].quantity += l.quantity;
    byRelease[rKey].amountCents += l.amountCents;
  }

  return { totalCents, byPlatform, byTerritory, byPeriod, byRelease, totalQuantity };
}

/** In-memory ledger for the simulator. Real impl writes to royalty_lines table. */
const memoryLedger: RoyaltyLine[] = [];

export function appendToLedger(lines: RoyaltyLine[]): void {
  memoryLedger.push(...lines);
  logger.info({ count: lines.length, totalSoFar: memoryLedger.length }, 'royalty ledger updated');
}

export function getLedger(filter?: { isrc?: string; upc?: string; releaseId?: string }): RoyaltyLine[] {
  if (!filter) return [...memoryLedger];
  return memoryLedger.filter((l) =>
    (!filter.isrc || l.isrc === filter.isrc) &&
    (!filter.upc || l.upc === filter.upc) &&
    (!filter.releaseId || l.releaseId === filter.releaseId),
  );
}

/**
 * Apply splits to an earnings amount and return per-payee breakdown.
 * Splits is the existing `splits` records: `{ payeeEmail, payeeName, percentage }`.
 */
export function applySplits(
  totalCents: number,
  splits: Array<{ payeeEmail: string; payeeName?: string; percentage: number }>,
): Array<{ payeeEmail: string; payeeName?: string; amountCents: number; percentage: number }> {
  const totalPct = splits.reduce((s, x) => s + x.percentage, 0);
  if (totalPct === 0 || splits.length === 0) {
    return [];
  }
  // Normalize if splits don't sum to exactly 100 (within tolerance)
  const norm = totalPct === 100 ? 1 : 100 / totalPct;
  return splits.map((s) => ({
    payeeEmail: s.payeeEmail,
    payeeName: s.payeeName,
    percentage: s.percentage,
    amountCents: Math.round(totalCents * (s.percentage * norm) / 100),
  }));
}
