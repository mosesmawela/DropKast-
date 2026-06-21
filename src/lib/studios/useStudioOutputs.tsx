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
 *
 * Persistence is debounced at 500ms (inspired by Open-Generative-AI's
 * per-studio debounced localStorage pattern). Rapid consecutive writes
 * are batched into a single write, reducing layout thrash.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { StudioId, StudioOutput } from './types';

const KEY = 'dropkast.studios.outputs';
const EVENT = 'dropkast.studios.outputs.updated';
const SAVE_DEBOUNCE_MS = 500;
const MAX_OUTPUTS = 200;

function loadAll(): StudioOutput[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

let _pendingList: StudioOutput[] | null = null;
let _debounceTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave(list: StudioOutput[]) {
  _pendingList = list;
  if (_debounceTimer) return;
  _debounceTimer = setTimeout(() => {
    _debounceTimer = null;
    if (!_pendingList) return;
    try {
      const trimmed = _pendingList.slice(0, MAX_OUTPUTS);
      localStorage.setItem(KEY, JSON.stringify(trimmed));
      window.dispatchEvent(new Event(EVENT));
    } catch {
      localStorage.setItem(KEY, JSON.stringify(_pendingList.slice(0, 50)));
      window.dispatchEvent(new Event(EVENT));
    }
    _pendingList = null;
  }, SAVE_DEBOUNCE_MS);
}

export function saveOutput(o: StudioOutput) {
  const all = loadAll();
  all.unshift(o);
  scheduleSave(all);
}

export function useStudioOutputs(filterStudio?: StudioId) {
  const [outputs, setOutputs] = useState<StudioOutput[]>(() => loadAll());
  // Track version to force re-render after debounced save
  const [version, setVersion] = useState(0);
  const versionRef = useRef(version);
  versionRef.current = version;

  useEffect(() => {
    const refresh = () => {
      setOutputs(loadAll());
    };
    // Force refresh after debounced save flushes
    const onEvent = () => {
      const fresh = loadAll();
      setOutputs(fresh);
      setVersion((v) => v + 1);
    };
    window.addEventListener(EVENT, onEvent);
    window.addEventListener('storage', (e) => {
      if (e.key === KEY) onEvent();
    });
    return () => {
      window.removeEventListener(EVENT, onEvent);
    };
  }, []);

  const visible = filterStudio ? outputs.filter((o) => o.studioId === filterStudio) : outputs;

  const star = useCallback((id: string) => {
    const next = loadAll().map((o) => (o.id === id ? { ...o, starred: !o.starred } : o));
    scheduleSave(next);
    setOutputs(loadAll());
  }, []);

  const remove = useCallback((id: string) => {
    const next = loadAll().filter((o) => o.id !== id);
    scheduleSave(next);
    setOutputs(loadAll());
  }, []);

  const clear = useCallback(() => {
    const next = filterStudio ? loadAll().filter((o) => o.studioId !== filterStudio) : [];
    scheduleSave(next);
    setOutputs(loadAll());
  }, [filterStudio]);

  return { outputs: visible, star, remove, clear };
}
