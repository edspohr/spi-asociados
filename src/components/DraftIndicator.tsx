import { useEffect, useState } from 'react';

/**
 * Subtle "Borrador guardado" pill that briefly flashes when `dep` changes.
 * We debounce visibility so it doesn't flicker on every keystroke.
 */
export function DraftIndicator({ dep }: { dep: unknown }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), 500);
    const hide = window.setTimeout(() => setVisible(false), 2500);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(hide);
    };
  }, [dep]);

  return (
    <span
      role="status"
      aria-live="polite"
      className={`text-xs transition-opacity ${
        visible ? 'opacity-100' : 'opacity-0'
      } text-text-subtle`}
    >
      Borrador guardado
    </span>
  );
}
