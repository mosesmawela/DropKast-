/**
 * Subscription state + tier-gating helpers.
 *
 * Real source of truth is /api/billing/subscription (Stripe-backed).
 * Until checkout is live, defaults to 'free' tier and persists overrides
 * to localStorage so the demo can simulate upgrades.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TIER_BY_ID, type Tier, type TierId, type BillingPeriod } from '../lib/pricing';

const STORAGE_KEY = 'dropkast.subscription';

interface SubscriptionState {
  tierId: TierId;
  period: BillingPeriod;
  /** Stripe subscription id when live */
  stripeSubscriptionId?: string;
  /** ISO timestamp */
  startedAt?: string;
  /** ISO timestamp — null if active */
  cancelledAt?: string | null;
  /** Trial end ISO if in trial */
  trialEndsAt?: string;
  /** Number of additional artists for label tier */
  extraArtists?: number;
}

interface SubscriptionContextValue extends SubscriptionState {
  tier: Tier;
  isPaid: boolean;
  isTrial: boolean;
  /** Total seats including base + extras (label tier) */
  artistSeats: number;
  /** Set the local plan — used by demo upgrade button. Real upgrades go through Stripe Checkout. */
  setLocalPlan: (tierId: TierId, period?: BillingPeriod) => void;
  /** Has the user unlocked this feature on their current tier? */
  hasFeature: (key: keyof Tier['features']) => boolean;
  /** Has the user hit a hard cap? Returns null if OK, or a reason string if blocked. */
  checkCap: (kind: 'release' | 'ai-run' | 'artist', current?: number) => string | null;
  /** Refetch subscription state from server */
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

function loadLocal(): SubscriptionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {/* ignore */}
  return { tierId: 'free', period: 'yearly' };
}

function saveLocal(s: SubscriptionState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {/* ignore */}
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SubscriptionState>(() => loadLocal());

  useEffect(() => {
    saveLocal(state);
  }, [state]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/billing/subscription');
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.tierId) {
        setState({
          tierId: data.tierId,
          period: data.period || 'yearly',
          stripeSubscriptionId: data.stripeSubscriptionId,
          startedAt: data.startedAt,
          cancelledAt: data.cancelledAt,
          trialEndsAt: data.trialEndsAt,
          extraArtists: data.extraArtists || 0,
        });
      }
    } catch {/* network blip — keep local state */}
  }, []);

  // Initial pull from backend (silently fails to local default)
  useEffect(() => { void refresh(); }, [refresh]);

  // Refetch when returning from Stripe Checkout (?checkout=success)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.has('checkout')) {
      void refresh();
    }
  }, [refresh]);

  const tier = TIER_BY_ID[state.tierId] || TIER_BY_ID.free;
  const isTrial = !!state.trialEndsAt && new Date(state.trialEndsAt) > new Date();

  const setLocalPlan = useCallback((tierId: TierId, period: BillingPeriod = 'yearly') => {
    setState((prev) => ({ ...prev, tierId, period, startedAt: new Date().toISOString(), cancelledAt: null }));
  }, []);

  const hasFeature = useCallback(
    (key: keyof Tier['features']) => !!tier.features[key],
    [tier],
  );

  const artistSeats = (tier.maxArtists || 0) + (state.extraArtists || 0);

  const checkCap = useCallback(
    (kind: 'release' | 'ai-run' | 'artist', current = 0): string | null => {
      if (kind === 'release' && tier.maxReleasesPerYear !== null && current >= tier.maxReleasesPerYear) {
        return `You've used all ${tier.maxReleasesPerYear} releases on the ${tier.name} tier. Upgrade for unlimited.`;
      }
      if (kind === 'ai-run' && !tier.uncappedAi && current >= tier.aiRunsPerMonth) {
        return `You've used all ${tier.aiRunsPerMonth} AI runs this month. Upgrade to Pro for uncapped.`;
      }
      if (kind === 'artist' && tier.maxArtists !== null) {
        const limit = (tier.maxArtists || 0) + (state.extraArtists || 0);
        if (current >= limit) return `Your ${tier.name} tier covers ${limit} artists. Upgrade or add seats.`;
      }
      return null;
    },
    [tier, state.extraArtists],
  );

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      ...state,
      tier,
      isPaid: tier.id !== 'free',
      isTrial,
      artistSeats,
      setLocalPlan,
      hasFeature,
      checkCap,
      refresh,
    }),
    [state, tier, isTrial, artistSeats, setLocalPlan, hasFeature, checkCap, refresh],
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used inside <SubscriptionProvider>');
  return ctx;
}
