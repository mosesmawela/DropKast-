import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  MODULES,
  PRESETS,
  loadEnabledModules,
  saveEnabledModules,
  type ModuleId,
  type WorkspacePreset,
} from '../lib/workspace';

interface WorkspaceContextValue {
  enabled: Set<ModuleId>;
  isEnabled: (id: ModuleId) => boolean;
  toggle: (id: ModuleId) => void;
  setPreset: (preset: WorkspacePreset) => void;
  setMany: (ids: ModuleId[]) => void;
  reset: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState<Set<ModuleId>>(() => loadEnabledModules());

  useEffect(() => {
    saveEnabledModules(enabled);
  }, [enabled]);

  const isEnabled = useCallback((id: ModuleId) => enabled.has(id), [enabled]);

  const toggle = useCallback((id: ModuleId) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      // Required modules can't be turned off
      const def = MODULES.find((m) => m.id === id);
      if (def?.required) return prev;
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const setPreset = useCallback((preset: WorkspacePreset) => {
    setEnabled(new Set(PRESETS[preset].modules));
  }, []);

  const setMany = useCallback((ids: ModuleId[]) => {
    setEnabled(new Set(ids));
  }, []);

  const reset = useCallback(() => {
    setEnabled(new Set(PRESETS.creator.modules));
  }, []);

  const value = useMemo<WorkspaceContextValue>(
    () => ({ enabled, isEnabled, toggle, setPreset, setMany, reset }),
    [enabled, isEnabled, toggle, setPreset, setMany, reset],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside <WorkspaceProvider>');
  return ctx;
}
