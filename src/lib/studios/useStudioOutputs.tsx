/**
 * Persistent gallery of outputs across all studios.
 *
 * Outputs live in localStorage, keyed by studio. Each output remembers
 * its input snapshot so the artist can:
 *   - Re-run with the same params
 *   - Tweak one knob and re-run
 *   - Pipe into another studio (workflow recipes)
 *   - Star / favourite
 *   - Copy / download / share
 */
import { useCallback, useEffect, useState } from 'react';
import type { StudioId, StudioOutput } from './types';

const KEY = 'dropkast.studios.outputs';
const EVENT = 'dropkast.studios.outputs.updated';
const MAX_OUTPUTS = 200; // prune oldest beyond this

function loadAll(): StudioOutput[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAll(list: StudioOutput[]) {
  try {
    const trimmed = list.slice(0, MAX_OUTPUTS);
    localStorage.setItem(KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* quota — drop more aggressively */
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
    window.dispatchEvent(new Event(EVENT));
  }
}

export function saveOutput(o: StudioOutput) {
  saveAll([o, ...loadAll()]);
}

export function useStudioOutputs(filterStudio?: StudioId) {
  const [outputs, setOutputs] = useState<StudioOutput[]>(() => loadAll());

  useEffect(() => {
    const refresh = () => setOutputs(loadAll());
    window.addEventListener(EVENT, refresh);
    window.addEventListener('storage', (e) => {
      if (e.key === KEY) refresh();
    });
    return () => window.removeEventListener(EVENT, refresh);
  }, []);

  const visible = filterStudio ? outputs.filter((o) => o.studioId === filterStudio) : outputs;

  const star = useCallback((id: string) => {
    const next = loadAll().map((o) => (o.id === id ? { ...o, starred: !o.starred } : o));
    saveAll(next);
  }, []);

  const remove = useCallback((id: string) => {
    saveAll(loadAll().filter((o) => o.id !== id));
  }, []);

  const clear = useCallback(() => {
    if (filterStudio) {
      saveAll(loadAll().filter((o) => o.studioId !== filterStudio));
    } else {
      saveAll([]);
    }
  }, [filterStudio]);

  return { outputs: visible, star, remove, clear };
}
