/**
 * Billing endpoints — Stripe Checkout for subscriptions + customer portal
 * + the source of truth for which tier each user is on.
 *
 * Pluggable like the payouts adapter: simulator (default, no money moves)
 * or real Stripe (when STRIPE_SECRET_KEY + tier price IDs are set).
 *
 * Env vars expected when going live:
 *   STRIPE_SECRET_KEY
 *   STRIPE_PRICE_INDIE_YEARLY, STRIPE_PRICE_INDIE_MONTHLY
 *   STRIPE_PRICE_PRO_YEARLY,   STRIPE_PRICE_PRO_MONTHLY
 *   STRIPE_PRICE_LABEL_YEARLY, STRIPE_PRICE_LABEL_MONTHLY
 *   PUBLIC_APP_URL  (e.g. https://dropkast.lvrn.dev)
 */
import { logger } from './_logger.js';

export type TierId = 'free' | 'indie' | 'pro' | 'label';
export type BillingPeriod = 'monthly' | 'yearly';

export interface SubscriptionRecord {
  userId: string;
  tierId: TierId;
  period: BillingPeriod;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  startedAt: string;
  cancelledAt?: string | null;
  trialEndsAt?: string;
  extraArtists?: number;
  status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'unpaid';
}

/** In-memory store. Real impl writes to subscriptions table. */
const memSubscriptions: Record<string, SubscriptionRecord> = {};

export function getSubscription(userId: string): SubscriptionRecord {
  return memSubscriptions[userId] || {
    userId,
    tierId: 'free',
    period: 'yearly',
    startedAt: new Date().toISOString(),
    status: 'active',
  };
}

export function setSubscription(record: SubscriptionRecord): void {
  memSubscriptions[record.userId] = record;
}

/* =========================================================================
 * Tier price IDs — wired from env.
 * ========================================================================= */
function priceIdFor(tier: TierId, period: BillingPeriod): string | undefined {
  const map: Record<string, string | undefined> = {
    'indie:yearly':  process.env.STRIPE_PRICE_INDIE_YEARLY,
    'indie:monthly': process.env.STRIPE_PRICE_INDIE_MONTHLY,
    'pro:yearly':    process.env.STRIPE_PRICE_PRO_YEARLY,
    'pro:monthly':   process.env.STRIPE_PRICE_PRO_MONTHLY,
    'label:yearly':  process.env.STRIPE_PRICE_LABEL_YEARLY,
    'label:monthly': process.env.STRIPE_PRICE_LABEL_MONTHLY,
  };
  return map[`${tier}:${period}`];
}

/* =========================================================================
 * Create checkout session
 *
 * Returns { url } to redirect the user to Stripe-hosted checkout, OR
 * { simulated: true } when keys aren't configured. The frontend handles
 * both — simulator mode flips the local subscription state.
 * ========================================================================= */
export async function createCheckoutSession(input: {
  userId: string;
  userEmail: string;
  tierId: TierId;
  period: BillingPeriod;
  trialDays?: number;
}): Promise<{ url?: string; simulated?: boolean; error?: string }> {
  if (input.tierId === 'free') {
    // Free tier doesn't go through Stripe — just record locally.
    setSubscription({
      userId: input.userId,
      tierId: 'free',
      period: input.period,
      startedAt: new Date().toISOString(),
      status: 'active',
    });
    return { simulated: true };
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const priceId = priceIdFor(input.tierId, input.period);

  if (!stripeKey || !priceId) {
    logger.info(
      { tier: input.tierId, period: input.period },
      'billing: simulator mode — no STRIPE_SECRET_KEY or price id configured',
    );
    return { simulated: true };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Stripe = require('stripe');
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' });

    const baseUrl = process.env.PUBLIC_APP_URL || 'https://dropkast.lvrn.dev';

    // Reuse existing customer if we already have one for this user
    const existing = memSubscriptions[input.userId];
    let customerId = existing?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: input.userEmail,
        metadata: { dropkast_user_id: input.userId },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: input.trialDays
        ? { trial_period_days: input.trialDays, metadata: { dropkast_user_id: input.userId, dropkast_tier: input.tierId } }
        : { metadata: { dropkast_user_id: input.userId, dropkast_tier: input.tierId } },
      success_url: `${baseUrl}/subscription?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscription?checkout=cancelled`,
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      metadata: { dropkast_user_id: input.userId, dropkast_tier: input.tierId, dropkast_period: input.period },
    });

    logger.info({ userId: input.userId, tier: input.tierId, sessionId: session.id }, 'billing: checkout session created');
    return { url: session.url || undefined };
  } catch (err: any) {
    logger.error({ err: err.message, userId: input.userId }, 'billing: checkout failed');
    return { error: err.message || 'checkout_failed' };
  }
}

/* =========================================================================
 * Customer portal — for managing card / invoices / cancellation
 * ========================================================================= */
export async function createPortalSession(input: {
  userId: string;
}): Promise<{ url?: string; error?: string }> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return { error: 'stripe_not_configured' };

  const sub = memSubscriptions[input.userId];
  if (!sub?.stripeCustomerId) return { error: 'no_customer' };

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Stripe = require('stripe');
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' });
    const baseUrl = process.env.PUBLIC_APP_URL || 'https://dropkast.lvrn.dev';
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${baseUrl}/subscription`,
    });
    return { url: session.url };
  } catch (err: any) {
    logger.error({ err: err.message, userId: input.userId }, 'billing: portal failed');
    return { error: err.message || 'portal_failed' };
  }
}

/* =========================================================================
 * Webhook handler — Stripe → us when subscription state changes.
 *
 * Handles:
 *   customer.subscription.created
 *   customer.subscription.updated
 *   customer.subscription.deleted
 *   invoice.paid (renewals)
 *   invoice.payment_failed (mark past_due)
 * ========================================================================= */
export function applyStripeSubscriptionEvent(eventType: string, payload: any): void {
  // Tier id is on the subscription's metadata, set during checkout
  const dropkastUserId = payload?.metadata?.dropkast_user_id || payload?.subscription_details?.metadata?.dropkast_user_id;
  const tierId = (payload?.metadata?.dropkast_tier || payload?.subscription_details?.metadata?.dropkast_tier) as TierId | undefined;

  if (!dropkastUserId) {
    logger.warn({ eventType }, 'billing webhook: missing dropkast_user_id metadata');
    return;
  }

  const existing = memSubscriptions[dropkastUserId];

  if (eventType === 'customer.subscription.deleted') {
    setSubscription({
      ...(existing || ({ userId: dropkastUserId } as SubscriptionRecord)),
      tierId: 'free',
      period: 'yearly',
      stripeSubscriptionId: payload.id,
      cancelledAt: new Date().toISOString(),
      status: 'cancelled',
      startedAt: existing?.startedAt || new Date().toISOString(),
    });
    logger.info({ userId: dropkastUserId }, 'billing: subscription cancelled');
    return;
  }

  if (eventType === 'invoice.payment_failed') {
    if (existing) {
      setSubscription({ ...existing, status: 'past_due' });
    }
    return;
  }

  // created / updated / invoice.paid — sync state from Stripe payload
  const period: BillingPeriod = (payload?.items?.data?.[0]?.price?.recurring?.interval === 'month') ? 'monthly' : 'yearly';
  setSubscription({
    userId: dropkastUserId,
    tierId: tierId || existing?.tierId || 'indie',
    period,
    stripeSubscriptionId: payload.id || existing?.stripeSubscriptionId,
    stripeCustomerId: payload.customer || existing?.stripeCustomerId,
    startedAt: existing?.startedAt || new Date().toISOString(),
    cancelledAt: null,
    trialEndsAt: payload.trial_end ? new Date(payload.trial_end * 1000).toISOString() : undefined,
    status: payload.status === 'trialing' ? 'trialing' : 'active',
    extraArtists: existing?.extraArtists || 0,
  });
  logger.info({ userId: dropkastUserId, tierId, period }, 'billing: subscription synced');
}
