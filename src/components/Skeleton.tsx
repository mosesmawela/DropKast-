/**
 * Lightweight skeleton primitives. Replaces the empty-flash that pages
 * show while their first fetch is in flight.
 */
import { cn } from '../lib/utils';

interface SkeletonProps {
  className?: string;
  'aria-label'?: string;
}

export function Skeleton({ className, ...rest }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-white/[0.03] border border-white/5',
        className,
      )}
      {...rest}
    >
      <div className="absolute inset-0 -translate-x-full animate-skeleton-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

/** Card skeleton — used for grid items in Releases / Influencers / Roster */
export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="manifest-card p-6 bg-dark border border-white/5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
    </div>
  );
}

/** Row skeleton — used for tables / lists */
export function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-white/5">
      <Skeleton className="w-10 h-10" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="w-20 h-6" />
    </div>
  );
}

/** Stat card skeleton — used for dashboard KPIs */
export function StatSkeleton() {
  return (
    <div className="manifest-card p-6 bg-dark border border-white/5 space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-2 w-full" />
    </div>
  );
}
