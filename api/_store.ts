/**
 * Storage abstraction. Uses Drizzle/Postgres when DATABASE_URL is set,
 * otherwise falls back to in-process memory so the demo runs without
 * cloud setup.
 *
 * Each function returns the same shape regardless of backend so callers
 * don't need to branch.
 */
import { eq } from 'drizzle-orm';
import { getDb } from '../db/client.js';
import * as schema from '../db/schema.js';
import { SEED_INFLUENCERS } from '../db/seed-influencers.js';

type Mem = {
  releases: any[];
  campaigns: any[];
  influencers: any[];
  influencerCampaigns: any[];
  djSends: any[];
  splits: any[];
  anrSubmissions: any[];
  promoPacks: any[];
  ugcAssets: any[];
  automations: any[];
  analytics: any[];
  preReleases: any[];
};

const mem: Mem = {
  releases: [],
  campaigns: [],
  influencers: SEED_INFLUENCERS.slice(),
  influencerCampaigns: [],
  djSends: [],
  splits: [],
  anrSubmissions: [],
  promoPacks: [],
  ugcAssets: [],
  automations: [],
  analytics: [],
  preReleases: [],
};

export const store = {
  // ---- releases
  async listReleases<T = any>(): Promise<T[]> {
    const db = getDb();
    if (db) return db.select().from(schema.releases) as Promise<T[]>;
    return mem.releases as T[];
  },
  async getRelease<T = any>(id: string): Promise<T | null> {
    const db = getDb();
    if (db) {
      const [r] = await db.select().from(schema.releases).where(eq(schema.releases.id, id));
      return (r ?? null) as T | null;
    }
    return (mem.releases.find((r) => r.id === id) ?? null) as T | null;
  },
  async insertRelease<T = any>(release: T): Promise<T> {
    const db = getDb();
    if (db) {
      const [r] = await db.insert(schema.releases).values(release as any).returning();
      return r as T;
    }
    mem.releases.push(release);
    return release;
  },
  async patchRelease<T = any>(id: string, patch: Partial<T>): Promise<T | null> {
    const db = getDb();
    if (db) {
      const [r] = await db
        .update(schema.releases)
        .set({ ...patch, updatedAt: new Date() } as any)
        .where(eq(schema.releases.id, id))
        .returning();
      return (r ?? null) as T | null;
    }
    const i = mem.releases.findIndex((r: any) => r.id === id);
    if (i === -1) return null;
    mem.releases[i] = { ...mem.releases[i], ...patch, updatedAt: new Date() };
    return mem.releases[i] as T;
  },

  // ---- campaigns
  async listCampaigns() {
    const db = getDb();
    if (db) return db.select().from(schema.campaigns);
    return mem.campaigns;
  },
  async getCampaign(id: string) {
    const db = getDb();
    if (db) {
      const [c] = await db.select().from(schema.campaigns).where(eq(schema.campaigns.id, id));
      return c ?? null;
    }
    return mem.campaigns.find((c) => c.id === id) ?? null;
  },
  async insertCampaign(campaign: any) {
    const db = getDb();
    if (db) {
      const [c] = await db.insert(schema.campaigns).values(campaign).returning();
      return c;
    }
    mem.campaigns.push(campaign);
    return campaign;
  },
  async patchCampaign(id: string, patch: any) {
    const db = getDb();
    if (db) {
      const [c] = await db.update(schema.campaigns).set(patch).where(eq(schema.campaigns.id, id)).returning();
      return c ?? null;
    }
    const i = mem.campaigns.findIndex((c) => c.id === id);
    if (i === -1) return null;
    mem.campaigns[i] = { ...mem.campaigns[i], ...patch };
    return mem.campaigns[i];
  },

  // ---- influencers
  async listInfluencers() {
    const db = getDb();
    if (db) return db.select().from(schema.influencers);
    return mem.influencers;
  },
  async insertInfluencer(inf: any) {
    const db = getDb();
    if (db) {
      const [i] = await db.insert(schema.influencers).values(inf).returning();
      return i;
    }
    mem.influencers.push(inf);
    return inf;
  },

  async insertInfluencerCampaign(rec: any) {
    const db = getDb();
    if (db) {
      const [r] = await db.insert(schema.influencerCampaigns).values(rec).returning();
      return r;
    }
    mem.influencerCampaigns.push(rec);
    return rec;
  },

  // ---- DJ
  async insertDjSend(rec: any) {
    const db = getDb();
    if (db) {
      const [r] = await db.insert(schema.djSends).values(rec).returning();
      return r;
    }
    mem.djSends.push(rec);
    return rec;
  },

  // ---- splits
  async insertSplit(rec: any) {
    const db = getDb();
    if (db) {
      const [r] = await db.insert(schema.splits).values(rec).returning();
      return r;
    }
    mem.splits.push(rec);
    return rec;
  },

  // ---- A&R
  async insertAnrSubmission(rec: any) {
    const db = getDb();
    if (db) {
      const [r] = await db.insert(schema.anrSubmissions).values(rec).returning();
      return r;
    }
    mem.anrSubmissions.push(rec);
    return rec;
  },
  async getAnrSubmission(id: string) {
    const db = getDb();
    if (db) {
      const [r] = await db.select().from(schema.anrSubmissions).where(eq(schema.anrSubmissions.id, id));
      return r ?? null;
    }
    return mem.anrSubmissions.find((r) => r.id === id) ?? null;
  },
  async patchAnrSubmission(id: string, patch: any) {
    const db = getDb();
    if (db) {
      const [r] = await db
        .update(schema.anrSubmissions)
        .set(patch)
        .where(eq(schema.anrSubmissions.id, id))
        .returning();
      return r ?? null;
    }
    const i = mem.anrSubmissions.findIndex((r) => r.id === id);
    if (i === -1) return null;
    mem.anrSubmissions[i] = { ...mem.anrSubmissions[i], ...patch };
    return mem.anrSubmissions[i];
  },
  async listAnrSubmissions() {
    const db = getDb();
    if (db) return db.select().from(schema.anrSubmissions);
    return mem.anrSubmissions;
  },

  // ---- promo packs
  async listPromoPacks() {
    const db = getDb();
    if (db) return db.select().from(schema.promoPacks);
    return mem.promoPacks;
  },
  async insertPromoPack(rec: any) {
    const db = getDb();
    if (db) {
      const [r] = await db.insert(schema.promoPacks).values(rec).returning();
      return r;
    }
    mem.promoPacks.push(rec);
    return rec;
  },
  async getPromoPack(id: string) {
    const db = getDb();
    if (db) {
      const [r] = await db.select().from(schema.promoPacks).where(eq(schema.promoPacks.id, id));
      return r ?? null;
    }
    return mem.promoPacks.find((r) => r.id === id) ?? null;
  },

  // ---- UGC
  async insertUgcAsset(rec: any) {
    const db = getDb();
    if (db) {
      const [r] = await db.insert(schema.ugcAssets).values(rec).returning();
      return r;
    }
    mem.ugcAssets.push(rec);
    return rec;
  },
  async getUgcAsset(id: string) {
    const db = getDb();
    if (db) {
      const [r] = await db.select().from(schema.ugcAssets).where(eq(schema.ugcAssets.id, id));
      return r ?? null;
    }
    return mem.ugcAssets.find((a) => a.id === id) ?? null;
  },
  async patchUgcAsset(id: string, patch: any) {
    const db = getDb();
    if (db) {
      const [r] = await db.update(schema.ugcAssets).set(patch).where(eq(schema.ugcAssets.id, id)).returning();
      return r ?? null;
    }
    const i = mem.ugcAssets.findIndex((a) => a.id === id);
    if (i === -1) return null;
    mem.ugcAssets[i] = { ...mem.ugcAssets[i], ...patch };
    return mem.ugcAssets[i];
  },

  // ---- automation
  async upsertAutomation(rec: any) {
    const db = getDb();
    if (db) {
      const existing = await db
        .select()
        .from(schema.automations)
        .where(eq(schema.automations.releaseId, rec.releaseId));
      if (existing[0]) {
        const [r] = await db
          .update(schema.automations)
          .set(rec)
          .where(eq(schema.automations.releaseId, rec.releaseId))
          .returning();
        return r;
      }
      const [r] = await db.insert(schema.automations).values(rec).returning();
      return r;
    }
    const i = mem.automations.findIndex((a) => a.releaseId === rec.releaseId);
    if (i > -1) mem.automations[i] = rec;
    else mem.automations.push(rec);
    return rec;
  },
  async getAutomation(releaseId: string) {
    const db = getDb();
    if (db) {
      const [r] = await db.select().from(schema.automations).where(eq(schema.automations.releaseId, releaseId));
      return r ?? null;
    }
    return mem.automations.find((a) => a.releaseId === releaseId) ?? null;
  },

  // ---- splits
  async listSplits() {
    const db = getDb();
    if (db) return db.select().from(schema.splits);
    return mem.splits;
  },

  // ---- UGC
  async listUgcAssets() {
    const db = getDb();
    if (db) return db.select().from(schema.ugcAssets);
    return mem.ugcAssets;
  },

  // ---- analytics
  async insertAnalyticsEvent(rec: any) {
    const db = getDb();
    if (db) {
      const [r] = await db.insert(schema.analyticsEvents).values(rec).returning();
      return r;
    }
    mem.analytics.push(rec);
    return rec;
  },
  async listAnalyticsEvents(releaseId?: string) {
    const db = getDb();
    if (db) {
      const q = db.select().from(schema.analyticsEvents);
      if (releaseId) return q.where(eq(schema.analyticsEvents.releaseId, releaseId));
      return q;
    }
    if (releaseId) return mem.analytics.filter((e) => e.releaseId === releaseId);
    return mem.analytics;
  },

  // ---- pre-releases
  async listPreReleases() {
    const db = getDb();
    if (db) return db.select().from(schema.preReleases);
    return mem.preReleases;
  },
  async insertPreRelease(rec: any) {
    const db = getDb();
    if (db) {
      const [r] = await db.insert(schema.preReleases).values(rec).returning();
      return r;
    }
    mem.preReleases.push(rec);
    return rec;
  },
  async getPreRelease(id: string) {
    const db = getDb();
    if (db) {
      const [r] = await db.select().from(schema.preReleases).where(eq(schema.preReleases.id, id));
      return r ?? null;
    }
    return mem.preReleases.find((r) => r.id === id) ?? null;
  },
  async patchPreRelease(id: string, patch: any) {
    const db = getDb();
    if (db) {
      const [r] = await db.update(schema.preReleases).set(patch).where(eq(schema.preReleases.id, id)).returning();
      return r ?? null;
    }
    const i = mem.preReleases.findIndex((r) => r.id === id);
    if (i === -1) return null;
    mem.preReleases[i] = { ...mem.preReleases[i], ...patch };
    return mem.preReleases[i];
  },
};
