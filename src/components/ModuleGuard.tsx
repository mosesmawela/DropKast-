/**
 * Workspace module marker.
 *
 * NOTE: this used to hard-redirect disabled modules to /dashboard. That created
 * dead-end navigation — the sidebar shows a page, you click it, and you're
 * silently bounced to the dashboard (this is what "hid" Studios, DJ Packs,
 * Academy, etc). Workspace modules are a personalization concept: they should
 * control what's *shown* in the sidebar, never make a real URL unreachable.
 *
 * So every route now renders. Kept as a thin wrapper so the moduleId annotations
 * in App.tsx stay meaningful (and so we can reintroduce sidebar-level hiding
 * later without touching routes).
 */
import type { ModuleId } from '../lib/workspace';

export default function ModuleGuard({
  children,
}: {
  moduleId: ModuleId;
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
