import type { CellState } from '../types/form';

type Props = {
  state: CellState;
  onCycle: () => void;
  onKeyNav: (dir: 'up' | 'down' | 'left' | 'right') => void;
  ariaLabel: string;
  cellRef?: (el: HTMLButtonElement | null) => void;
};

const LABELS: Record<CellState, string> = {
  empty: 'No ofrecido',
  directo: 'Directo',
  tercerizado: 'Tercerizado',
};

export function MatrixCell({ state, onCycle, onKeyNav, ariaLabel, cellRef }: Props) {
  function handleKey(e: React.KeyboardEvent<HTMLButtonElement>) {
    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        onCycle();
        return;
      case 'ArrowUp':
        e.preventDefault();
        onKeyNav('up');
        return;
      case 'ArrowDown':
        e.preventDefault();
        onKeyNav('down');
        return;
      case 'ArrowLeft':
        e.preventDefault();
        onKeyNav('left');
        return;
      case 'ArrowRight':
        e.preventDefault();
        onKeyNav('right');
        return;
    }
  }

  const label = `${ariaLabel} — ${LABELS[state]}`;
  const common =
    'flex h-9 w-9 items-center justify-center rounded text-xs font-bold transition outline-none focus-visible:ring-2 focus-visible:ring-primary/70';

  if (state === 'directo') {
    return (
      <button
        ref={cellRef}
        type="button"
        onClick={onCycle}
        onKeyDown={handleKey}
        aria-label={label}
        className={`${common} bg-primary text-white hover:bg-primary-600`}
      >
        D
      </button>
    );
  }
  if (state === 'tercerizado') {
    return (
      <button
        ref={cellRef}
        type="button"
        onClick={onCycle}
        onKeyDown={handleKey}
        aria-label={label}
        className={`${common} text-white`}
        style={{
          backgroundColor: 'var(--color-outsourced)',
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 4px, transparent 4px 8px)',
        }}
      >
        T
      </button>
    );
  }
  return (
    <button
      ref={cellRef}
      type="button"
      onClick={onCycle}
      onKeyDown={handleKey}
      aria-label={label}
      className={`${common} border border-border bg-white text-text-subtle hover:border-primary`}
    >
      ·
    </button>
  );
}

export function nextCellState(s: CellState): CellState {
  return s === 'empty' ? 'directo' : s === 'directo' ? 'tercerizado' : 'empty';
}

export function MatrixLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
      <span className="flex items-center gap-2">
        <span className="inline-block h-4 w-4 rounded border border-border bg-white" />
        No ofrecido
      </span>
      <span className="flex items-center gap-2">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-primary text-[10px] font-bold text-white">
          D
        </span>
        Directo
      </span>
      <span className="flex items-center gap-2">
        <span
          className="inline-flex h-4 w-4 items-center justify-center rounded text-[10px] font-bold text-white"
          style={{
            backgroundColor: 'var(--color-outsourced)',
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 3px, transparent 3px 6px)',
          }}
        >
          T
        </span>
        Tercerizado
      </span>
    </div>
  );
}
