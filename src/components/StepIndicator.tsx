type Step = { n: number; label: string };

type Props = {
  steps: Step[];
  current: number;
  onJump?: (n: number) => void;
};

/**
 * Horizontal step indicator with numbered dots. `onJump` (when provided) lets
 * users click a past step to go back — future steps stay disabled.
 */
export function StepIndicator({ steps, current, onJump }: Props) {
  return (
    <ol
      aria-label="Progreso del formulario"
      className="flex items-center gap-2 text-xs"
    >
      {steps.map((s, idx) => {
        const isCurrent = s.n === current;
        const isPast = s.n < current;
        const isFuture = s.n > current;
        const clickable = Boolean(onJump) && !isFuture;
        const dotClasses = isCurrent
          ? 'bg-primary text-white'
          : isPast
            ? 'bg-primary/70 text-white'
            : 'bg-surface-muted text-text-subtle';
        return (
          <li key={s.n} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => clickable && onJump?.(s.n)}
              disabled={!clickable}
              aria-current={isCurrent ? 'step' : undefined}
              className={`flex items-center gap-2 rounded-full px-2 py-1 transition ${
                clickable ? 'hover:bg-surface-muted' : ''
              } ${isFuture ? 'opacity-60' : ''}`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${dotClasses}`}
              >
                {s.n}
              </span>
              <span className={isCurrent ? 'font-semibold text-primary' : 'text-text-muted'}>
                {s.label}
              </span>
            </button>
            {idx < steps.length - 1 && (
              <span aria-hidden className="text-text-subtle">
                ›
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
