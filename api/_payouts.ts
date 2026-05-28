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
 * Stripe Connect (real — uses STRIPE_SECRET_KEY)
 *
 * Express accounts only — lightest onboarding, Stripe handles all KYC,
 * tax-form (W-9/W-8BEN) collection, and payout schedules. We never see
 * the bank details directly.
 *
 * Flow:
 *   1. onboardCreator → POST /v1/accounts (express) → POST /v1/account_links
 *      → return hosted onboarding URL.
 *   2. Once the artist completes onboarding, Stripe webhook flips status
 *      to 'active'. We poll account.charges_enabled at the same time.
 *   3. pay → POST /v1/transfers from platform balance to the connected
 *      account (we top up platform balance from royalty PSP receipts).
 * ========================================================================= */
class StripeConnectAdapter implements PayoutAdapter {
  readonly id: PayoutProvider = 'stripe';
  private stripe: any;
  constructor(apiKey: string) {
    // Lazy require so this file can still parse when stripe isn't installed.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Stripe = require('stripe');
    this.stripe = new Stripe(apiKey, { apiVersion: '2024-12-18.acacia' });
  }

  async onboardCreator(input: {
    payeeEmail: string;
    payeeName?: string;
    role: 'ARTIST' | 'INFLUENCER' | 'DJ';
    country?: string;
    returnUrl?: string;
  }) {
    try {
      const account = await this.stripe.accounts.create({
        type: 'express',
        email: input.payeeEmail,
        country: input.country || 'US',
        capabilities: {
          transfers: { requested: true },
        },
        business_type: 'individual',
        business_profile: {
          product_description: `DropKast ${input.role.toLowerCase()} payouts`,
          mcc: '7929', // Bands, orchestras, and miscellaneous entertainers
        },
        metadata: {
          dropkast_role: input.role,
          dropkast_email: input.payeeEmail,
        },
      });

      const baseUrl = process.env.PUBLIC_APP_URL || 'https://dropkast.lvrn.dev';
      const accountLink = await this.stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${baseUrl}/settings?stripe_refresh=1`,
        return_url: input.returnUrl || `${baseUrl}/earnings?stripe_onboarded=1`,
        type: 'account_onboarding',
      });

      logger.info(
        { payeeEmail: input.payeeEmail, accountId: account.id },
        'stripe connect: account created',
      );

      return {
        accountId: account.id,
        onboardingUrl: accountLink.url,
        status: account.charges_enabled ? ('active' as const) : ('pending' as const),
      };
    } catch (err: any) {
      logger.error({ err: err.message, payeeEmail: input.payeeEmail }, 'stripe connect: onboard failed');
      throw err;
    }
  }

  async pay(input: {
    payeeEmail: string;
    payeeAccountId?: string;
    amountCents: number;
    currency?: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }) {
    if (!input.payeeAccountId) {
      return { ok: false, error: 'missing_payee_account_id' };
    }
    try {
      const transfer = await this.stripe.transfers.create({
        amount: input.amountCents,
        currency: (input.currency || 'usd').toLowerCase(),
        destination: input.payeeAccountId,
        description: input.description || 'DropKast royalty payout',
        metadata: {
          dropkast_payee_email: input.payeeEmail,
          ...((input.metadata as Record<string, string>) || {}),
        },
      });
      logger.info(
        { payeeEmail: input.payeeEmail, transferId: transfer.id, amountCents: input.amountCents },
        'stripe connect: transfer created',
      );
      return { ok: true, transferId: transfer.id };
    } catch (err: any) {
      logger.error(
        { err: err.message, payeeEmail: input.payeeEmail, amountCents: input.amountCents },
        'stripe connect: transfer failed',
      );
      return { ok: false, error: err.message || 'stripe_transfer_failed' };
    }
  }

  async getStatus(transferId: string) {
    try {
      const transfer = await this.stripe.transfers.retrieve(transferId);
      // A Stripe Transfer is essentially "paid" the moment it succeeds — the
      // delivery to the connected account is handled by Stripe's payout
      // schedule. Reversed transfers count as failed.
      if (transfer.reversed) {
        return { status: 'failed' as const, raw: transfer };
      }
      return { status: 'paid' as const, raw: transfer };
    } catch (err: any) {
      logger.error({ err: err.message, transferId }, 'stripe connect: getStatus failed');
      return { status: 'failed' as const, raw: { error: err.message } };
    }
  }
}

/* =========================================================================
 * Selection
 * ========================================================================= */
let _adapter: PayoutAdapter | null = null;

export function getPayoutAdapter(): PayoutAdapter {
  if (_adapter) return _adapter;
  // Auto-promote to Stripe when key is present. Override with PAYOUT_PROVIDER=simulator
  // to force the simulator even when keys are loaded (useful for staging).
  if (process.env.STRIPE_SECRET_KEY && process.env.PAYOUT_PROVIDER !== 'simulator') {
    try {
      _adapter = new StripeConnectAdapter(process.env.STRIPE_SECRET_KEY);
      logger.info('Payouts: Stripe Connect adapter active');
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Stripe init failed — falling back to simulator');
      _adapter = new SimulatorPayoutAdapter();
    }
  } else {
    _adapter = new SimulatorPayoutAdapter();
    logger.info('Payouts: simulator adapter active (set STRIPE_SECRET_KEY to switch)');
  }
  return _adapter;
}
