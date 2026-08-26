import { useMemo } from 'react';
import type { AssociateDoc } from './types';
import type { Filters } from './filters';
import { coverageByCountry, hasActiveFilters } from './filters';
import { COUNTRIES } from '../data/countries';
import { populationCovered } from './coverage-scale';

type Props = {
  all: AssociateDoc[];
  filters: Filters;
};

/**
 * Population-weighted view of coverage: what share of humanity in the current
 * filter scope lacks any associate, has just one, or has backup (≥ 2). Sits
 * inside the gap panel so the "brechas" reading has demographic context.
 */
export function PopulationKpis({ all, filters }: Props) {
  const coverage = useMemo(() => coverageByCountry(all, filters), [all, filters]);
  const universe = useMemo(() => COUNTRIES.map((c) => c.code2), []);
  const pop = useMemo(() => populationCovered(coverage, universe), [coverage, universe]);

  const filtered = hasActiveFilters(filters);
  const scopeCaption = filtered
    ? 'del alcance actual (según los filtros)'
    : 'del universo global';

  const total = pop.total || 1; // avoid div-by-zero on empty universes
  const items: Array<{ id: string; label: string; pct: number; abs: number; tone: string }> = [
    {
      id: 'sin',
      label: 'sin cobertura',
      pct: (pop.sinCobertura / total) * 100,
      abs: pop.sinCobertura,
      tone: 'text-text bg-surface-muted border-border',
    },
    {
      id: 'uno',
      label: 'con un solo asociado',
      pct: (pop.unSolo / total) * 100,
      abs: pop.unSolo,
      tone: 'text-primary bg-primary/5 border-primary/20',
    },
    {
      id: 'respaldo',
      label: 'con respaldo (2+ asociados)',
      pct: (pop.conRespaldo / total) * 100,
      abs: pop.conRespaldo,
      tone: 'text-primary bg-primary/10 border-primary/30',
    },
  ];

  return (
    <div
      aria-label="Cobertura por población"
      className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-3"
    >
      {items.map((it) => (
        <div
          key={it.id}
          className={`rounded border px-2 py-1.5 text-[11px] leading-snug ${it.tone}`}
        >
          <p className="font-semibold text-sm">{formatPct(it.pct)}</p>
          <p>
            de la población {scopeCaption} {it.label}.
          </p>
          <p className="text-text-subtle">≈ {formatMillions(it.abs)} · sobre {formatMillions(pop.total)}</p>
        </div>
      ))}
    </div>
  );
}

function formatPct(v: number): string {
  if (!Number.isFinite(v)) return '—';
  if (v > 0 && v < 0.1) return '<0,1%';
  return `${v.toFixed(1).replace('.', ',')}%`;
}

function formatMillions(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace('.', ',')} MM hab.`;
  if (v >= 10) return `${v.toFixed(0)} M hab.`;
  if (v >= 1) return `${v.toFixed(1).replace('.', ',')} M hab.`;
  if (v > 0) return `${(v * 1000).toFixed(0)} K hab.`;
  return '0';
}
