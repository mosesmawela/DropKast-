import type { Request, Response } from 'express';
import { store } from './_store.js';
import { logAudit } from './_security.js';
import { logger } from './_logger.js';
import { eventBus } from './_event-bus.js';
import { safeReadJson, atomicWriteJson } from './_atomic-io.js';
import { join } from 'path';
import { randomBytes } from 'crypto';

export interface BackupArchive {
  version: number;
  exportedAt: string;
  userId: string;
  data: {
    releases: any[];
    campaigns: any[];
    influencers: any[];
    splits: any[];
    anrSubmissions: any[];
    promoPacks: any[];
    ugcAssets: any[];
    preReleases: any[];
    analytics: any[];
  };
}

const BACKUP_VERSION = 1;

export async function buildBackup(userId: string): Promise<BackupArchive> {
  const [
    releases, campaigns, influencers, splits,
    anr, promoPacks, ugcAssets, preReleases, analytics,
  ] = await Promise.all([
    store.listReleases(),
    store.listCampaigns(),
    store.listInfluencers(),
    store.listSplits(),
    store.listAnrSubmissions(),
    store.listPromoPacks(),
    store.listUgcAssets(),
    store.listPreReleases(),
    store.listAnalyticsEvents(),
  ]);

  const filterByUser = (items: any[], key = 'userId') =>
    items.filter((i: any) => i[key] === userId);

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    userId,
    data: {
      releases: filterByUser(releases),
      campaigns: filterByUser(campaigns),
      influencers: filterByUser(influencers),
      splits: filterByUser(splits, 'createdBy'),
      anrSubmissions: filterByUser(anr),
      promoPacks: filterByUser(promoPacks),
      ugcAssets: filterByUser(ugcAssets),
      preReleases: filterByUser(preReleases),
      analytics: analytics.filter((e: any) => filterByUser([e], 'userId').length > 0),
    },
  };
}

export function validateBackupArchive(data: any): { ok: boolean; error?: string } {
  if (!data || typeof data !== 'object') return { ok: false, error: 'Invalid backup: not an object' };
  if (data.version !== BACKUP_VERSION) return { ok: false, error: `Unsupported backup version: ${data.version}. Expected ${BACKUP_VERSION}.` };
  if (!data.exportedAt) return { ok: false, error: 'Invalid backup: missing exportedAt' };
  if (!data.data || typeof data.data !== 'object') return { ok: false, error: 'Invalid backup: missing data section' };
  return { ok: true };
}

export async function importBackup(data: BackupArchive, userId: string): Promise<{
  ok: boolean;
  counts: Record<string, number>;
  errors: string[];
}> {
  const valid = validateBackupArchive(data);
  if (!valid.ok) return { ok: false, counts: {}, errors: [valid.error!] };

  const errors: string[] = [];
  const counts: Record<string, number> = {};
  const now = new Date();

  const importWithId = async (
    items: any[],
    insertFn: (item: any) => Promise<any>,
    name: string,
    transform?: (item: any) => any,
  ) => {
    let count = 0;
    for (const item of items) {
      try {
        const transformed = transform ? transform(item) : { ...item, userId, updatedAt: now };
        await insertFn(transformed);
        count++;
      } catch (err: any) {
        errors.push(`${name}: ${err.message?.slice(0, 100) || 'unknown error'}`);
      }
    }
    counts[name] = count;
  };

  await Promise.all([
    importWithId(data.data.releases, (i) => store.insertRelease(i), 'releases'),
    importWithId(data.data.campaigns, (i) => store.insertCampaign(i), 'campaigns'),
    importWithId(data.data.influencers, (i) => store.insertInfluencer(i), 'influencers'),
    importWithId(data.data.splits, (i) => store.insertSplit(i), 'splits'),
    importWithId(data.data.anrSubmissions, (i) => store.insertAnrSubmission(i), 'anrSubmissions'),
    importWithId(data.data.promoPacks, (i) => store.insertPromoPack(i), 'promoPacks'),
    importWithId(data.data.ugcAssets, (i) => store.insertUgcAsset(i), 'ugcAssets'),
    importWithId(data.data.preReleases, (i) => store.insertPreRelease(i), 'preReleases'),
  ]);

  eventBus.emit('backup.imported', 'backup', { userId, counts, errors: errors.length });

  return { ok: true, counts, errors };
}

export async function handleBackupExport(req: Request, res: Response): Promise<void> {
  const userId = String(req.query.userId ?? req.headers['x-user-id'] ?? '');
  if (!userId) {
    res.status(400).json({ error: 'userId required' });
    return;
  }

  try {
    const archive = await buildBackup(userId);
    logAudit(req, { actorId: userId, action: 'backup.export' });
    res.setHeader('Content-Disposition', `attachment; filename="dropkast-backup-${userId}-${Date.now()}.json"`);
    res.json(archive);
  } catch (err) {
    logger.error({ err, userId }, 'backup export failed');
    res.status(500).json({ error: 'backup_export_failed' });
  }
}

export async function handleBackupImport(req: Request, res: Response): Promise<void> {
  const userId = String(req.headers['x-user-id'] ?? req.body?.userId ?? '');
  if (!userId) {
    res.status(400).json({ error: 'userId required' });
    return;
  }

  try {
    const result = await importBackup(req.body, userId);
    logAudit(req, { actorId: userId, action: 'backup.import', metadata: { counts: result.counts } });
    if (!result.ok) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  } catch (err) {
    logger.error({ err, userId }, 'backup import failed');
    res.status(500).json({ error: 'backup_import_failed' });
  }
}

export async function persistBackupToDisk(filePath: string, userId: string): Promise<void> {
  const archive = await buildBackup(userId);
  await atomicWriteJson(filePath, archive);
  logger.info({ userId, path: filePath }, 'backup: persisted to disk');
}

export async function loadBackupFromDisk(filePath: string): Promise<BackupArchive | null> {
  return safeReadJson<BackupArchive | null>(filePath, null);
}
