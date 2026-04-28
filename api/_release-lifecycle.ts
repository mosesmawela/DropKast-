/**
 * Release lifecycle state machine.
 *
 *   draft → submitted → in_review → approved → delivering → live
 *                                                        ↘ rejected
 *                                                        ↘ taken_down
 *
 * - draft        : artist still editing, not yet submitted
 * - submitted    : artist clicked "Distribute" — queued for review
 * - in_review    : automated + manual checks running (audio, art, metadata)
 * - approved     : passed checks, ready to ship to DSPs
 * - delivering   : DDEX delivery in flight to one or more platforms
 * - live         : at least one platform reports the release as live
 * - rejected     : checks failed; artist must edit and resubmit
 * - taken_down   : was live, now removed (DMCA, artist request, etc.)
 */

export type ReleaseStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'approved'
  | 'delivering'
  | 'live'
  | 'rejected'
  | 'taken_down';

const ALLOWED: Record<ReleaseStatus, ReleaseStatus[]> = {
  draft: ['submitted'],
  submitted: ['in_review', 'rejected'],
  in_review: ['approved', 'rejected'],
  approved: ['delivering'],
  delivering: ['live', 'rejected'],
  live: ['taken_down', 'delivering'],
  rejected: ['draft'],
  taken_down: ['delivering'],
};

export function canTransition(from: ReleaseStatus, to: ReleaseStatus): boolean {
  return ALLOWED[from]?.includes(to) ?? false;
}

export class ReleaseTransitionError extends Error {
  readonly from: ReleaseStatus;
  readonly to: ReleaseStatus;
  constructor(from: ReleaseStatus, to: ReleaseStatus) {
    super(`Invalid release transition: ${from} → ${to}`);
    this.from = from;
    this.to = to;
  }
}

export function assertTransition(from: ReleaseStatus, to: ReleaseStatus): void {
  if (!canTransition(from, to)) throw new ReleaseTransitionError(from, to);
}

/**
 * Returns true if a release should be held for scheduled delivery.
 * (releaseDate in the future means we keep it in `approved` until the date.)
 */
export function isScheduledForLater(releaseDate?: Date | string | null): boolean {
  if (!releaseDate) return false;
  const ts = typeof releaseDate === 'string' ? Date.parse(releaseDate) : releaseDate.getTime();
  if (Number.isNaN(ts)) return false;
  return ts > Date.now();
}

/**
 * Public-facing labels for the status (UI).
 */
export const STATUS_LABEL: Record<ReleaseStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  in_review: 'Under Review',
  approved: 'Approved',
  delivering: 'Delivering',
  live: 'Live',
  rejected: 'Rejected',
  taken_down: 'Taken Down',
};
