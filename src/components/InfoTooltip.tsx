import { useId, useState } from 'react';

type Props = { text: string };

/**
 * Small info-icon with a hover/focus tooltip. Renders nothing when text is empty
 * so the glossary can grow incrementally without leaving hollow icons in the UI.
 */
export function InfoTooltip({ text }: Props) {
  const trimmed = text.trim();
  const [open, setOpen] = useState(false);
  const id = useId();
  if (!trimmed) return null;

  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-label="Más información"
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-[color:var(--color-border)] text-[10px] font-bold text-[color:var(--color-text-subtle)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]/70"
      >
        i
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-1/2 top-full z-20 mt-1 w-56 -translate-x-1/2 rounded border border-[color:var(--color-border)] bg-white px-2 py-1 text-xs text-[color:var(--color-text)] shadow-md"
        >
          {trimmed}
        </span>
      )}
    </span>
  );
}
