import { useEffect, useRef, useState } from 'react';

/**
 * Persist a serializable state object to localStorage.
 *
 * - On first mount, if the key has a stored value that parses cleanly, we hydrate
 *   from it; otherwise we fall back to `initial`.
 * - Writes are debounced (default 250ms) so typing in the header fields doesn't
 *   thrash localStorage on every keystroke.
 * - `version` lets us invalidate saved drafts if the state shape changes in a
 *   future release (bump the number to force a fresh start).
 */
export function useLocalStorageState<T>(
  key: string,
  initial: T,
  opts: { version?: number; debounceMs?: number } = {},
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const version = opts.version ?? 1;
  const debounceMs = opts.debounceMs ?? 250;
  const versionedKey = `${key}::v${version}`;

  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = window.localStorage.getItem(versionedKey);
      if (!raw) return initial;
      const parsed = JSON.parse(raw) as T;
      return parsed ?? initial;
    } catch {
      return initial;
    }
  });

  const timer = useRef<number | null>(null);
  const skipNextPersist = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      try {
        window.localStorage.setItem(versionedKey, JSON.stringify(state));
      } catch {
        /* quota exceeded or storage disabled — silently ignore */
      }
    }, debounceMs);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [state, versionedKey, debounceMs]);

  const clear = () => {
    if (typeof window !== 'undefined') {
      if (timer.current) window.clearTimeout(timer.current);
      try {
        window.localStorage.removeItem(versionedKey);
      } catch {
        /* ignore */
      }
    }
    // Prevent the effect from immediately re-persisting the initial value.
    skipNextPersist.current = true;
    setState(initial);
  };

  return [state, setState, clear];
}
