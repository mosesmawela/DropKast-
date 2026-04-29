/**
 * Phase 1 — DSP delivery adapter.
 *
 * Pluggable interface so the rest of the app doesn't care which provider
 * actually ships releases to Spotify / Apple / etc. Default is the
 * `simulator` (the existing setTimeout fake) so the demo still works.
 * Real implementations are slotted in via env vars when partner contracts
 * land.
 *
 * Available adapters:
 *  - `simulator` — fake delivery with realistic timing (default)
 *  - `routenote` — RouteNote partner API (requires ROUTENOTE_API_KEY)
 *  - `sonosuite` — SonoSuite white-label (requires SONOSUITE_*)
 *
 * Selected via DSP_DELIVERY_PROVIDER env var.
 */
import { logger } from './_logger.js';
import { store } from './_store.js';

export type DeliveryProvider = 'simulator' | 'routenote' | 'sonosuite';

export interface DeliveryAdapter {
  /** Submit a release for distribution. Returns immediately — actual delivery is async. */
  deliver(release: any): Promise<{ jobId: string; eta: Date }>;
  /** Issue a takedown / DDEX update message. */
  takedown(release: any, reason: string): Promise<{ ok: boolean }>;
  /** Update metadata on a live release (DDEX update message). */
  updateMetadata(release: any, changes: Record<string, unknown>): Promise<{ ok: boolean }>;
  /** Provider id for logs / analytics. */
  readonly id: DeliveryProvider;
}

/* =========================================================================
 * Simulator (default, no external deps)
 * ========================================================================= */
class SimulatorAdapter implements DeliveryAdapter {
  readonly id: DeliveryProvider = 'simulator';

  async deliver(release: any): Promise<{ jobId: string; eta: Date }> {
    const jobId = `SIM-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const eta = new Date(Date.now() + 25_000);
    logger.info({ releaseId: release.id, jobId, provider: this.id }, 'delivery queued');

    // Async simulation: mark distributed → cycle through platforms → live
    setTimeout(async () => {
      const r = await store.getRelease(release.id);
      if (!r) return;
      await store.patchRelease(r.id, { status: 'delivering' });
      const platforms = [...(r.platforms || [])];
      for (let i = 0; i < platforms.length; i++) {
        await new Promise((res) => setTimeout(res, 2000));
        platforms[i] = {
          ...platforms[i],
          status: Math.random() > 0.1 ? 'live' : 'failed',
          updatedAt: new Date(),
        };
        await store.patchRelease(r.id, { platforms });
      }
      const anyLive = platforms.some((p: any) => p.status === 'live');
      await store.patchRelease(r.id, { status: anyLive ? 'live' : 'rejected', platforms });
      logger.info({ releaseId: release.id, jobId, anyLive }, 'delivery complete');
    }, 5000);

    return { jobId, eta };
  }

  async takedown(release: any, reason: string): Promise<{ ok: boolean }> {
    logger.info({ releaseId: release.id, reason, provider: this.id }, 'takedown (simulated)');
    return { ok: true };
  }

  async updateMetadata(release: any, changes: Record<string, unknown>): Promise<{ ok: boolean }> {
    logger.info({ releaseId: release.id, changes: Object.keys(changes), provider: this.id }, 'metadata update (simulated)');
    return { ok: true };
  }
}

/* =========================================================================
 * RouteNote (real delivery — stub until contract + key are in place)
 * ========================================================================= */
class RouteNoteAdapter implements DeliveryAdapter {
  readonly id: DeliveryProvider = 'routenote';
  constructor(private apiKey: string) {}

  async deliver(release: any): Promise<{ jobId: string; eta: Date }> {
    // TODO: real RouteNote partner API call when contract lands.
    // POST /v2/releases  — DDEX 4.3 ERN Build payload
    logger.warn({ releaseId: release.id }, 'RouteNote adapter not yet implemented — falling back to simulator');
    return new SimulatorAdapter().deliver(release);
  }

  async takedown(release: any, reason: string): Promise<{ ok: boolean }> {
    logger.warn({ releaseId: release.id, reason }, 'RouteNote takedown not yet implemented');
    return { ok: false };
  }

  async updateMetadata(release: any, changes: Record<string, unknown>): Promise<{ ok: boolean }> {
    logger.warn({ releaseId: release.id, changes: Object.keys(changes) }, 'RouteNote metadata update not yet implemented');
    return { ok: false };
  }
}

/* =========================================================================
 * Selection
 * ========================================================================= */
let _adapter: DeliveryAdapter | null = null;

export function getDeliveryAdapter(): DeliveryAdapter {
  if (_adapter) return _adapter;
  const choice = (process.env.DSP_DELIVERY_PROVIDER || 'simulator') as DeliveryProvider;
  if (choice === 'routenote' && process.env.ROUTENOTE_API_KEY) {
    _adapter = new RouteNoteAdapter(process.env.ROUTENOTE_API_KEY);
  } else {
    _adapter = new SimulatorAdapter();
  }
  return _adapter;
}
