/**
 * Release & Marketing Planner — ported from LVRN's planService.ts.
 *
 * Manages a calendar of typed plans (release, content, marketing, milestone,
 * event, note) with rich metadata links (pitch deadlines, music/artwork/
 * presave/DJ-pack/visualiser/asset-folder links) for the full release
 * lifecycle workflow.
 */

import { store } from './_store.js';

// ── Types ──────────────────────────────────────────────────────────────────

export type PlanType = 'release' | 'content' | 'marketing' | 'milestone' | 'event' | 'note';
export type PlanStatus = 'planned' | 'in-progress' | 'done' | 'cancelled';

export interface Plan {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  date: string;
  type: PlanType;
  title: string;
  notes: string | null;
  tags: string[];
  platform: string | null;
  status: PlanStatus;
  createdBy: string;
  // Release tracker link fields
  pitchDeadline: string | null;
  musicLink: string | null;
  artworkLink: string | null;
  presaveLink: string | null;
  djPackLink: string | null;
  visualiserLink: string | null;
  visualiserTreatment: string | null;
  assetFolderLink: string | null;
  schedulingFormLink: string | null;
  lyricsLink: string | null;
  campaignPlanLink: string | null;
  marketingPlanLink: string | null;
  digitalCampaignLink: string | null;
  marketingDriversLink: string | null;
  digitalScheduleLink: string | null;
}

export const PLAN_TYPES: Array<{ key: PlanType; label: string; color: string }> = [
  { key: 'release',   label: 'Release',        color: '#a855f7' },
  { key: 'content',   label: 'Content',         color: '#3b82f6' },
  { key: 'marketing', label: 'Marketing',       color: '#f59e0b' },
  { key: 'milestone', label: 'Milestone',       color: '#10b981' },
  { key: 'event',     label: 'Holiday / Event', color: '#ec4899' },
  { key: 'note',      label: 'Note',            color: '#64748b' },
];

export const PLAN_STATUSES: Array<{ key: PlanStatus; label: string }> = [
  { key: 'planned',     label: 'Planned' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'done',        label: 'Done' },
  { key: 'cancelled',   label: 'Cancelled' },
];

export const PLAN_LINK_FIELDS: Array<{ key: keyof Plan; label: string; placeholder: string }> = [
  { key: 'musicLink',             label: 'Music Link',           placeholder: 'Spotify / YouTube / SoundCloud URL' },
  { key: 'presaveLink',           label: 'Pre-Save / Live Link', placeholder: 'Pre-save or streaming link' },
  { key: 'artworkLink',           label: 'Artwork',              placeholder: 'Drive / Dropbox link to artwork file' },
  { key: 'visualiserLink',        label: 'Visualiser',           placeholder: 'YouTube / Drive link to visualiser' },
  { key: 'djPackLink',            label: 'DJ Pack',              placeholder: 'Link to DJ pack download' },
  { key: 'assetFolderLink',       label: 'Asset Folder',         placeholder: 'Drive folder: press images, EPK, etc.' },
  { key: 'schedulingFormLink',    label: 'Scheduling Form',      placeholder: 'Link to completed scheduling form' },
  { key: 'lyricsLink',            label: 'Lyrics',               placeholder: 'Google Doc / link to lyrics' },
  { key: 'campaignPlanLink',      label: 'Campaign Plan',        placeholder: 'Campaign plan document' },
  { key: 'marketingPlanLink',     label: 'Marketing Plan',       placeholder: 'Marketing plan document' },
  { key: 'digitalCampaignLink',   label: 'Digital Campaign',     placeholder: 'Digital campaign plan' },
  { key: 'marketingDriversLink',  label: 'Marketing Drivers',    placeholder: 'Marketing drivers document' },
  { key: 'digitalScheduleLink',   label: 'Digital Schedule',     placeholder: 'Digital plan schedule' },
];

// ── In-memory store ────────────────────────────────────────────────────────

const plans: Plan[] = [];

function generateId(): string {
  return `PLN-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function now(): string {
  return new Date().toISOString();
}

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function groupByDate(planList: Plan[]): Map<string, Plan[]> {
  const map = new Map<string, Plan[]>();
  for (const p of planList) {
    if (!map.has(p.date)) map.set(p.date, []);
    map.get(p.date)!.push(p);
  }
  return map;
}

// ── CRUD ───────────────────────────────────────────────────────────────────

export interface PlanInput {
  userId: string;
  date: string;
  type: PlanType;
  title: string;
  notes?: string | null;
  tags?: string[];
  platform?: string | null;
  status?: PlanStatus;
  createdBy?: string;
  pitchDeadline?: string | null;
  musicLink?: string | null;
  artworkLink?: string | null;
  presaveLink?: string | null;
  djPackLink?: string | null;
  visualiserLink?: string | null;
  visualiserTreatment?: string | null;
  assetFolderLink?: string | null;
  schedulingFormLink?: string | null;
  lyricsLink?: string | null;
  campaignPlanLink?: string | null;
  marketingPlanLink?: string | null;
  digitalCampaignLink?: string | null;
  marketingDriversLink?: string | null;
  digitalScheduleLink?: string | null;
}

export function listPlans(userId?: string): Plan[] {
  if (userId) return plans.filter((p) => p.userId === userId);
  return [...plans];
}

export function getPlan(id: string): Plan | null {
  return plans.find((p) => p.id === id) ?? null;
}

export function addPlan(input: PlanInput): Plan {
  const plan: Plan = {
    id: generateId(),
    createdAt: now(),
    updatedAt: now(),
    userId: input.userId,
    date: input.date,
    type: input.type,
    title: input.title.trim(),
    notes: input.notes?.trim() || null,
    tags: input.tags ?? [],
    platform: input.platform || null,
    status: input.status ?? 'planned',
    createdBy: input.createdBy ?? input.userId,
    pitchDeadline: input.pitchDeadline || null,
    musicLink: input.musicLink || null,
    artworkLink: input.artworkLink || null,
    presaveLink: input.presaveLink || null,
    djPackLink: input.djPackLink || null,
    visualiserLink: input.visualiserLink || null,
    visualiserTreatment: input.visualiserTreatment?.trim() || null,
    assetFolderLink: input.assetFolderLink || null,
    schedulingFormLink: input.schedulingFormLink || null,
    lyricsLink: input.lyricsLink || null,
    campaignPlanLink: input.campaignPlanLink || null,
    marketingPlanLink: input.marketingPlanLink || null,
    digitalCampaignLink: input.digitalCampaignLink || null,
    marketingDriversLink: input.marketingDriversLink || null,
    digitalScheduleLink: input.digitalScheduleLink || null,
  };
  plans.push(plan);
  return plan;
}

export function updatePlan(id: string, patch: Partial<PlanInput>): Plan | null {
  const idx = plans.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const existing = plans[idx];
  const updated: Plan = {
    ...existing,
    updatedAt: now(),
    ...(patch.date !== undefined && { date: patch.date }),
    ...(patch.type !== undefined && { type: patch.type }),
    ...(patch.title !== undefined && { title: patch.title.trim() }),
    ...(patch.notes !== undefined && { notes: patch.notes?.trim() || null }),
    ...(patch.tags !== undefined && { tags: patch.tags }),
    ...(patch.platform !== undefined && { platform: patch.platform || null }),
    ...(patch.status !== undefined && { status: patch.status }),
    ...(patch.pitchDeadline !== undefined && { pitchDeadline: patch.pitchDeadline || null }),
    ...(patch.musicLink !== undefined && { musicLink: patch.musicLink || null }),
    ...(patch.artworkLink !== undefined && { artworkLink: patch.artworkLink || null }),
    ...(patch.presaveLink !== undefined && { presaveLink: patch.presaveLink || null }),
    ...(patch.djPackLink !== undefined && { djPackLink: patch.djPackLink || null }),
    ...(patch.visualiserLink !== undefined && { visualiserLink: patch.visualiserLink || null }),
    ...(patch.visualiserTreatment !== undefined && { visualiserTreatment: patch.visualiserTreatment?.trim() || null }),
    ...(patch.assetFolderLink !== undefined && { assetFolderLink: patch.assetFolderLink || null }),
    ...(patch.schedulingFormLink !== undefined && { schedulingFormLink: patch.schedulingFormLink || null }),
    ...(patch.lyricsLink !== undefined && { lyricsLink: patch.lyricsLink || null }),
    ...(patch.campaignPlanLink !== undefined && { campaignPlanLink: patch.campaignPlanLink || null }),
    ...(patch.marketingPlanLink !== undefined && { marketingPlanLink: patch.marketingPlanLink || null }),
    ...(patch.digitalCampaignLink !== undefined && { digitalCampaignLink: patch.digitalCampaignLink || null }),
    ...(patch.marketingDriversLink !== undefined && { marketingDriversLink: patch.marketingDriversLink || null }),
    ...(patch.digitalScheduleLink !== undefined && { digitalScheduleLink: patch.digitalScheduleLink || null }),
  };
  plans[idx] = updated;
  return updated;
}

export function deletePlan(id: string): boolean {
  const idx = plans.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  plans.splice(idx, 1);
  return true;
}
