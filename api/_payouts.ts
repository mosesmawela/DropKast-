/**
 * Phase 3 — pluggable payout adapter (Stripe Connect ready).
 *
 * The rest of the app calls `getPayoutAdapter().pay(...)` without caring
 * whether it's the simulator (default, no money moves) or the real
 * Stripe Connect implementation (when STRIPE_SECRET_KEY is set).
 *
 * Three operations:
 *   - onboardCreator(payeeEmail, role) → returns onboarding URL
 *   - pay(payee, amountCents, metadata) → creates a Transfer
 *   - getStatus(transferId) → polls payout state
 *
 * The Stripe adapter is a stub today. It's wired to fail-safe (returns
 * "stripe_not_configured" error) when called without keys.
 */
import { logger } from './_logger.js';

export type PayoutProvider = 'simulator' | 'stripe';

export interface PayoutAdapter {
  readonly id: PayoutProvider;
  onboardCreator(input: {
    payeeEmail: string;
    payeeName?: string;
    role: 'ARTIST' | 'INFLUENCER' | 'DJ';
    country?: string;
    returnUrl?: string;
  }): Promise<{ accountId: string; onboardingUrl: string; status: 'pending' | 'active' }>;
  pay(input: {
    payeeEmail: string;
    payeeAccountId?: string;
    amountCents: number;
    currency?: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ ok: boolean; transferId?: string; error?: string }>;
  getStatus(transferId: string): Promise<{ status: 'pending' | 'paid' | 'failed'; raw?: unknown }>;
}

/* =========================================================================
 * Simulator (default — useful for demo, dev, and pre-Stripe testing)
 * ========================================================================= */
class SimulatorPayoutAdapter implements PayoutAdapter {
  readonly id: PayoutProvider = 'simulator';
  private accounts = new Map<string, { id: string; status: 'pending' | 'active'; ts: number }>();
  private transfers = new Map<string, { status: 'pending' | 'paid'; ts: number }>();

  async onboardCreator(input: { payeeEmail: string; role: string }) {
    const accountId = `sim_acct_${input.payeeEmail.replace(/[^a-z0-9]/gi, '').slice(0, 12)}_${Date.now()}`;
    this.accounts.set(input.payeeEmail, { id: accountId, status: 'active', ts: Date.now() });
    logger.info({ payeeEmail: input.payeeEmail, role: input.role, accountId }, 'simulator onboard');
    return {
      accountId,
      onboardingUrl: `https://example.com/onboard?simulated=true&acct=${accountId}`,
      status: 'active' as const,
    };
  }

  async pay(input: { payeeEmail: string; amountCents: number; metadata?: Record<string, unknown> }) {
    const transferId = `sim_tr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    this.transfers.set(transferId, { status: 'pending', ts: Date.now() });
    // Simulate paid after 2s
    setTimeout(() => {
      const t = this.transfers.get(transferId);
      if (t) t.status = 'paid';
    }, 2000);
    logger.info(
      { payeeEmail: input.payeeEmail, amountCents: input.amountCents, transferId, provider: this.id },
      'simulator payout',
    );
    return { ok: true, transferId };
  }

  async getStatus(transferId: string) {
    const t = this.transfers.get(transferId);
    if (!t) return { status: 'failed' as const, raw: { error: 'not_found' } };
    return { status: t.status === 'paid' ? ('paid' as const) : ('pending' as const) };
  }
}

/* =========================================================================
 * Stripe Connect (real — requires STRIPE_SECRET_KEY, scaffolded only)
 * ========================================================================= */
class StripeConnectAdapter implements PayoutAdapter {
  readonly id: PayoutProvider = 'stripe';
  private apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Real Stripe Connect calls would look like:
  //   POST /v1/accounts { type: 'express', email, country, capabilities }
  //   POST /v1/account_links { account, refresh_url, return_url, type: 'account_onboarding' }
  //   POST /v1/transfers { amount, currency, destination, transfer_group }
  // Hooked up here as no-ops so the API contract is stable; flip the
  // commented blocks on once you confirm partnership terms.

  async onboardCreator(input: { payeeEmail: string; payeeName?: string; role: string; country?: string; returnUrl?: string }) {
    logger.warn({ payeeEmail: input.payeeEmail }, 'Stripe Connect onboardCreator: not implemented (key set but adapter is scaffold)');
    return {
      accountId: '',
      onboardingUrl: '',
      status: 'pending' as const,
    };
  }

  async pay(input: { payeeEmail: string; amountCents: number }) {
    logger.warn({ payeeEmail: input.payeeEmail, amountCents: input.amountCents }, 'Stripe Connect pay: not implemented');
    return { ok: false, error: 'stripe_adapter_not_implemented' };
  }

  async getStatus(_transferId: string) {
    return { status: 'failed' as const, raw: { error: 'stripe_adapter_not_implemented' } };
  }
}

/* =========================================================================
 * Selection
 * ========================================================================= */
let _adapter: PayoutAdapter | null = null;

export function getPayoutAdapter(): PayoutAdapter {
  if (_adapter) return _adapter;
  if (process.env.STRIPE_SECRET_KEY && process.env.PAYOUT_PROVIDER === 'stripe') {
    _adapter = new StripeConnectAdapter(process.env.STRIPE_SECRET_KEY);
  } else {
    _adapter = new SimulatorPayoutAdapter();
  }
  return _adapter;
}
