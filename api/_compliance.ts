/**
 * Phase 7 — compliance endpoints.
 *
 *  · GDPR data export · `GET  /api/me/export`
 *  · GDPR data delete · `DELETE /api/me`
 *  · DMCA takedown    · `POST /api/dmca`
 *
 * These run through the same `store` abstraction so they work whether
 * we're in in-memory mode or backed by Postgres via Drizzle.
 */
import type { Request, Response } from 'express';
import { store } from './_store.js';
import { logAudit } from './_security.js';
import { logger } from './_logger.js';

/** Build a JSON archive of everything we have on a given user. */
export async function handleDataExport(req: Request, res: Response): Promise<void> {
  const userId = (req as any).userId;
  if (!userId) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  try {
    const [releases, campaigns, anr, preReleases] = await Promise.all([
      store.listReleases(),
      store.listCampaigns(),
      store.listAnrSubmissions(),
      store.listPreReleases(),
    ]);

    const archive = {
      exportedAt: new Date().toISOString(),
      userId,
      data: {
        releases: releases.filter((r: any) => r.userId === userId),
        campaigns: campaigns.filter((c: any) => c.userId === userId),
        anrSubmissions: anr.filter((a: any) => a.userId === userId),
        preReleases: preReleases.filter((p: any) => p.userId === userId),
      },
      note: 'This archive is provided per GDPR Article 20 (data portability).',
    };

    logAudit(req, { actorId: userId, action: 'data.export' });
    res.setHeader('Content-Disposition', `attachment; filename="dropkast-data-${userId}.json"`);
    res.json(archive);
  } catch (err) {
    logger.error({ err, userId }, 'data export failed');
    res.status(500).json({ error: 'export_failed' });
  }
}

/** Soft-delete: marks user data as scheduled for deletion. Real hard-delete is done by a daily cron. */
export async function handleDataDelete(req: Request, res: Response): Promise<void> {
  const userId = (req as any).userId;
  if (!userId) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  try {
    const releases = await store.listReleases();
    const userReleases = releases.filter((r: any) => r.userId === userId);
    for (const r of userReleases) {
      await store.patchRelease(r.id, {
        status: 'taken_down',
        metadata: { ...(r.metadata || {}), deletionRequestedAt: new Date().toISOString() },
      });
    }

    logAudit(req, {
      actorId: userId,
      action: 'data.delete',
      metadata: { releasesAffected: userReleases.length },
    });

    res.json({
      ok: true,
      message: 'Deletion scheduled. Releases marked as taken_down. Hard-delete runs nightly.',
      releasesAffected: userReleases.length,
    });
  } catch (err) {
    logger.error({ err, userId }, 'data delete failed');
    res.status(500).json({ error: 'delete_failed' });
  }
}

/** DMCA takedown notice. Anyone can file; admin reviews. */
export async function handleDmcaNotice(req: Request, res: Response): Promise<void> {
  const { releaseId, reporterEmail, reporterName, claim, contactPhone } = req.body ?? {};
  if (!releaseId || !reporterEmail || !claim) {
    res.status(400).json({ error: 'releaseId, reporterEmail, and claim are required' });
    return;
  }

  try {
    const release = await store.getRelease(releaseId);
    if (!release) {
      res.status(404).json({ error: 'release_not_found' });
      return;
    }

    // Mark the release as under review. Admin tool flips it to taken_down or rejects.
    await store.patchRelease(releaseId, {
      metadata: {
        ...(release.metadata || {}),
        dmca: {
          filedAt: new Date().toISOString(),
          reporterEmail,
          reporterName,
          contactPhone,
          claim,
          status: 'pending_review',
        },
      },
    });

    logAudit(req, {
      actorId: reporterEmail,
      action: 'admin.dmca',
      resource: releaseId,
      metadata: { reporterName, status: 'pending_review' },
    });

    logger.warn(
      { releaseId, reporterEmail, claimSnippet: String(claim).slice(0, 120) },
      'DMCA notice filed',
    );

    res.status(202).json({
      ok: true,
      message: 'DMCA notice received. Release flagged for review. Decision within 5 business days.',
      ticketId: `DMCA-${Date.now()}`,
    });
  } catch (err) {
    logger.error({ err }, 'DMCA filing failed');
    res.status(500).json({ error: 'dmca_failed' });
  }
}
