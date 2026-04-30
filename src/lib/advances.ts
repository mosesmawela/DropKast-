/**
 * Royalty advance underwriting + offer engine.
 *
 * Like Amuse's Advances product: artist gets cash up-front against future
 * royalties, recouped from incoming statements until paid back. We don't
 * touch the rights catalogue — strict recoupment from forward earnings.
 *
 * Scoring inputs (all derived from royalty CSV ledger we already ingest
 * via api/_royalties.ts):
 *   - Last 6 months trailing earnings (smoothed)
 *   - Month-over-month growth rate
 *   - Catalogue depth (number of releases earning)
 *   - Platform diversity (revenue spread across DSPs)
 *
 * Output: an offer (amount + term + recoupment %), or "not yet eligible"
 * with the specific reason. Conservative — we only offer up to 4 months
 * of trailing earnings, never more.
 */

export interface AdvanceLineSummary {
  /** Month key like "2026-04". */
  period: string;
  /** Earnings for that month in cents. */
  amountCents: number;
  /** Number of distinct DSPs that month. */
  platformCount: number;
}

export interface AdvanceOffer {
  eligible: boolean;
  /** Reason when not eligible — surface as the empty state. */
  reason?: string;
  /** Cash offered in cents. */
  offerCents: number;
  /** % of incoming royalties used to recoup until paid. */
  recoupmentPct: number;
  /** Estimated months to recoup at current trailing rate. */
  estMonthsToRecoup: number;
  /** Months of trailing earnings the offer represents. */
  multipleOfTrailingMonthly: number;
  /** Trailing 6-month average per month, cents. */
  trailingMonthlyCents: number;
  /** Eligibility reasons surfaced as the "Why this offer" panel. */
  reasons: string[];
}

const MIN_MONTHS_OF_HISTORY = 3;
const MIN_MONTHLY_CENTS = 5_000; // ~$50/month threshold to qualify
const MAX_MULTIPLE = 4;          // cap at 4 months of trailing
const MIN_MULTIPLE = 2;          // floor for eligible artists
const RECOUPMENT_PCT = 0.80;     // 80% of incoming royalty until repaid

export function offerFromLedger(lines: AdvanceLineSummary[]): AdvanceOffer {
  if (!lines.length) {
    return zeroOffer('No royalty history yet — release something and we\'ll re-check in 30 days.');
  }

  // Sort newest-last
  const sorted = [...lines].sort((a, b) => a.period.localeCompare(b.period));
  const last6 = sorted.slice(-6);

  if (last6.length < MIN_MONTHS_OF_HISTORY) {
    return zeroOffer(
      `We need at least ${MIN_MONTHS_OF_HISTORY} months of royalty data. You have ${last6.length}.`,
    );
  }

  const totalCents = last6.reduce((s, l) => s + l.amountCents, 0);
  const trailingMonthlyCents = Math.round(totalCents / last6.length);

  if (trailingMonthlyCents < MIN_MONTHLY_CENTS) {
    return zeroOffer(
      `Trailing earnings are $${(trailingMonthlyCents / 100).toFixed(2)}/mo. Need $${(MIN_MONTHLY_CENTS / 100).toFixed(2)}/mo+ to qualify.`,
    );
  }

  // Growth rate over last 3 vs prior 3 (defaults to 1 if not enough history)
  let growthRate = 1.0;
  if (last6.length >= 6) {
    const recent = last6.slice(-3).reduce((s, l) => s + l.amountCents, 0) / 3;
    const prior = last6.slice(0, 3).reduce((s, l) => s + l.amountCents, 0) / 3;
    growthRate = prior > 0 ? recent / prior : 1.0;
  }

  // Platform diversity bonus — averages across last 6
  const avgPlatforms = last6.reduce((s, l) => s + (l.platformCount || 1), 0) / last6.length;

  // Multiple calculation: start at MIN_MULTIPLE, add bonuses for growth + diversity
  let multiple = MIN_MULTIPLE;
  const reasons: string[] = [];
  reasons.push(`Trailing 6-mo avg: $${(trailingMonthlyCents / 100).toFixed(2)}/mo`);

  if (growthRate >= 1.25) {
    multiple += 1;
    reasons.push(`Earnings up ${Math.round((growthRate - 1) * 100)}% over last quarter (+1 mo)`);
  } else if (growthRate >= 1.05) {
    multiple += 0.5;
    reasons.push(`Modest growth of ${Math.round((growthRate - 1) * 100)}% (+0.5 mo)`);
  } else if (growthRate < 0.85) {
    reasons.push(`Earnings declining — capped at ${MIN_MULTIPLE} months trailing`);
  }

  if (avgPlatforms >= 4) {
    multiple += 0.5;
    reasons.push(`${Math.round(avgPlatforms)} platforms paying (+0.5 mo for diversification)`);
  }

  multiple = Math.min(multiple, MAX_MULTIPLE);
  const offerCents = Math.round(trailingMonthlyCents * multiple);
  // At 80% recoupment of incoming royalty, estMonthsToRecoup = multiple / 0.8
  const estMonthsToRecoup = Math.ceil(multiple / RECOUPMENT_PCT);

  return {
    eligible: true,
    offerCents,
    recoupmentPct: Math.round(RECOUPMENT_PCT * 100),
    estMonthsToRecoup,
    multipleOfTrailingMonthly: Math.round(multiple * 10) / 10,
    trailingMonthlyCents,
    reasons,
  };
}

function zeroOffer(reason: string): AdvanceOffer {
  return {
    eligible: false,
    reason,
    offerCents: 0,
    recoupmentPct: 0,
    estMonthsToRecoup: 0,
    multipleOfTrailingMonthly: 0,
    trailingMonthlyCents: 0,
    reasons: [],
  };
}

/* =========================================================================
 * Demo seeding — gives the page something to render on a fresh account.
 * Real impl reads from /api/earnings (which already aggregates by period).
 * ========================================================================= */
export function seedDemoLedger(): AdvanceLineSummary[] {
  return [
    { period: '2025-11', amountCents: 46_000, platformCount: 3 },
    { period: '2025-12', amountCents: 51_200, platformCount: 4 },
    { period: '2026-01', amountCents: 58_400, platformCount: 4 },
    { period: '2026-02', amountCents: 67_300, platformCount: 5 },
    { period: '2026-03', amountCents: 81_500, platformCount: 5 },
    { period: '2026-04', amountCents: 92_100, platformCount: 6 },
  ];
}

const ACCEPTED_KEY = 'dropkast.advances.accepted';

export interface AcceptedAdvance {
  id: string;
  acceptedAt: string;
  offerCents: number;
  recoupmentPct: number;
  trailingMonthlyCents: number;
  status: 'pending-payout' | 'recouping' | 'paid-off';
  recoupedCents: number;
}

export function listAccepted(): AcceptedAdvance[] {
  try {
    return JSON.parse(localStorage.getItem(ACCEPTED_KEY) || '[]');
  } catch {
    return [];
  }
}

export function recordAccept(offer: AdvanceOffer): AcceptedAdvance {
  const adv: AcceptedAdvance = {
    id: `adv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    acceptedAt: new Date().toISOString(),
    offerCents: offer.offerCents,
    recoupmentPct: offer.recoupmentPct,
    trailingMonthlyCents: offer.trailingMonthlyCents,
    status: 'pending-payout',
    recoupedCents: 0,
  };
  const next = [adv, ...listAccepted()];
  localStorage.setItem(ACCEPTED_KEY, JSON.stringify(next));
  return adv;
}
