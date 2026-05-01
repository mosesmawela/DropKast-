/**
 * Workspace-aware route guard.
 *
 * If the user has disabled this module in Settings → Workspace, redirect
 * them to /settings with a toast explaining why and pre-selecting the
 * Workspace tab. Without this guard, hidden-from-sidebar routes are still
 * URL-reachable.
 *
 * Usage in App.tsx:
 *   <Route path="/campaigns" element={<ModuleGuard moduleId="campaigns"><Campaigns /></ModuleGuard>} />
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useWorkspace } from '../context/WorkspaceContext';
import { MODULE_BY_ID, type ModuleId } from '../lib/workspace';

export default function ModuleGuard({
  moduleId,
  children,
}: {
  moduleId: ModuleId;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { isEnabled } = useWorkspace();
  const enabled = isEnabled(moduleId);

  useEffect(() => {
    if (!enabled) {
      const def = MODULE_BY_ID[moduleId];
      toast.message(`${def?.label || 'This module'} is disabled in your workspace`, {
        description: 'Turn it on in Settings → Workspace to use it.',
        action: {
          label: 'Open settings',
          onClick: () => navigate('/settings'),
        },
        duration: 6000,
      });
      navigate('/dashboard', { replace: true });
    }
  }, [enabled, moduleId, navigate]);

  if (!enabled) return null;
  return <>{children}</>;
}
