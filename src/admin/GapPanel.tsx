import { useMemo, useState } from 'react';
import type { AssociateDoc } from './types';
import type { Filters } from './filters';
import { coverageByCountry, hasActiveFilters } from './filters';
import {
  COUNTRIES,
  countryName,
  findCountry,
  type CountryCode,
} from '../data/countries';
import { InfoTooltip } from '../components/InfoTooltip';
import {
  SPOF_STROKE,
  coverageBuckets,
  type CoverageBucket,
} from './coverage-scale';
import { PopulationKpis } from './PopulationKpis';
import { groupUniverseByBucket, toGapCsv, type BucketGroup } from './gap-grouping';
import { downloadCsv } from './csv';

type Props = {
  all: AssociateDoc[];
  filters: Filters;
  onSelectCountry: (code: CountryCode) => void;
};

/**
 * Bucket-first "dónde me falta" panel. Sections mirror the map's coverage
 * legend, ordered by severity (sin cobertura → un solo → blues). Chips
 * inside each bucket are sorted by population DESC so the biggest gaps
 * surface first.
 */
export function GapPanel({ all, filters, onSelectCountry }: Props) {
  const coverage = useMemo(() => coverageByCountry(all, filters), [all, filters]);
  const universe = useMemo<CountryCode[]>(() => COUNTRIES.map((c) => c.code2), []);

  const maxCount = useMemo(() => {
    let m = 0;
    for (const n of coverage.values()) if (n > m) m = n;
    return m;
  }, [coverage]);
  const buckets = useMemo(() => coverageBuckets(maxCount), [maxCount]);
  const groups = useMemo(
    () => groupUniverseByBucket(universe, coverage, buckets),
    [universe, coverage, buckets],
  );

  const scopeHint = filters.servicio
    ? `Servicio: “${filters.servicio}”`
    : filters.categoria
      ? `Categoría: ${filters.categoria}`
      : 'Sin filtro de servicio';
  const filtered = hasActiveFilters(filters);

  function handleExportGaps() {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`brechas-${stamp}.csv`, toGapCsv(coverage, buckets));
  }

  return (
    <section
      aria-labelledby="gap-title"
      className="rounded-lg border border-border bg-surface p-4"
    >
      <header>
        <div className="flex items-baseline justify-between gap-2">
          <h3 id="gap-title" className="text-sm font-semibold text-primary">
            Brechas de cobertura
          </h3>
          <button
            type="button"
            onClick={handleExportGaps}
            className="rounded border border-border bg-white px-2 py-0.5 text-[11px] text-primary hover:border-primary"
            title="Exporta un CSV con una fila por país del universo (nombre, región, población, cantidad de asociados y bucket)."
          >
            Exportar brechas (CSV)
          </button>
        </div>
        <p className="mt-1 text-xs text-text-muted">
          <strong>Sin cobertura</strong>: países donde ningún asociado ofrece el alcance
          seleccionado. <strong>Un solo asociado</strong>: hay cobertura pero no hay
          respaldo — si ese asociado no puede tomar el trabajo, no hay reemplazo.
        </p>
        <p
          className={`mt-1 rounded px-2 py-1 text-xs ${
            filtered ? 'bg-amber-50 text-amber-900' : 'text-text-subtle'
          }`}
        >
          <strong>Alcance:</strong> {scopeHint}
          {filtered && (
            <>
              {' '}— los números reflejan el filtro activo, no el universo completo.
            </>
          )}
        </p>
        <PopulationKpis all={all} filters={filters} />
      </header>

      <ul className="mt-3 flex flex-col gap-2">
        {groups.map((g) => (
          <BucketSection
            key={g.bucket.id}
            group={g}
            onSelectCountry={onSelectCountry}
          />
        ))}
      </ul>
    </section>
  );
}

function BucketSection({
  group,
  onSelectCountry,
}: {
  group: BucketGroup;
  onSelectCountry: (code: CountryCode) => void;
}) {
  const isSin = group.bucket.id === 'sin_cobertura';
  const isUno = group.bucket.id === 'un_solo';
  const startOpen = !isSin;
  const [open, setOpen] = useState(startOpen);
  const [showAll, setShowAll] = useState(false);
  const isEmpty = group.count === 0;

  const displayed = isSin && !showAll ? group.codes.slice(0, 15) : group.codes;
  const hasMore = isSin && group.codes.length > 15;

  return (
    <li
      className={`rounded border ${
        isSin ? 'border-l-4 border-l-amber-500 border-border' : 'border-border'
      }`}
    >
      <button
        type="button"
        onClick={() => !isEmpty && setOpen((o) => !o)}
        aria-expanded={open}
        disabled={isEmpty}
        className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs ${
          isEmpty ? 'cursor-default' : 'hover:bg-surface-muted'
        }`}
      >
        <span
          aria-hidden
          className={`inline-block text-text-subtle transition ${
            open && !isEmpty ? 'rotate-90' : ''
          }`}
        >
          ▶
        </span>
        <span
          aria-hidden
          className="inline-block h-3 w-4 rounded-sm"
          style={{
            backgroundColor: group.bucket.color,
            border: isUno
              ? `1.5px solid ${SPOF_STROKE}`
              : '1px solid rgba(0,0,0,0.1)',
          }}
        />
        <span className="flex-1 font-medium text-text">
          {isSin && <span aria-hidden>⚠︎ </span>}
          {group.bucket.labelEs}
        </span>
        <span className="text-[11px] text-text-subtle">
          {group.count} país{group.count === 1 ? '' : 'es'} · {formatPopulation(group.population)}
        </span>
      </button>

      {open && !isEmpty && (
        <div className="border-t border-border px-2.5 py-2">
          {isSin && (
            <p className="mb-1 flex items-center text-[10px] text-text-subtle">
              Ordenados por población descendente. Clic en un país para filtrar el panel.
              <InfoTooltip text="La sección más urgente. Iniciar prospección aquí primero." />
            </p>
          )}
          <ul className="flex flex-wrap gap-1">
            {displayed.map((code) => (
              <li key={code}>
                <CountryChip
                  code={code}
                  bucket={group.bucket}
                  isUno={isUno}
                  onSelect={onSelectCountry}
                />
              </li>
            ))}
          </ul>
          {hasMore && (
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              className="mt-2 text-[11px] text-primary underline hover:opacity-80"
            >
              {showAll
                ? 'Mostrar sólo los 15 más poblados'
                : `Mostrar todos (${group.codes.length - 15} más)`}
            </button>
          )}
        </div>
      )}

      {isEmpty && (
        <p className="border-t border-border px-2.5 py-1.5 text-[11px] text-text-subtle">
          {emptyLabelFor(group.bucket)}
        </p>
      )}
    </li>
  );
}

function CountryChip({
  code,
  bucket,
  isUno,
  onSelect,
}: {
  code: CountryCode;
  bucket: CoverageBucket;
  isUno: boolean;
  onSelect: (code: CountryCode) => void;
}) {
  const def = findCountry(code);
  const region = def?.region ?? '';
  const pop = def?.population ?? 0;
  const useLight = bucket.textOnColor === 'light';

  const tooltip = isUno
    ? `Filtrar por ${countryName(code)} (${region}) — un solo asociado, sin respaldo.`
    : `Filtrar por ${countryName(code)} · Región: ${region} · Población: ${formatPopulation(pop)}`;

  return (
    <button
      type="button"
      onClick={() => onSelect(code)}
      title={tooltip}
      className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px]"
      style={{
        backgroundColor: bucket.color,
        borderColor: isUno ? SPOF_STROKE : 'rgba(0,0,0,0.15)',
        color: useLight ? '#ffffff' : '#0f172a',
      }}
    >
      <span>{countryName(code)}</span>
      <span className={useLight ? 'text-white/80' : 'text-black/60'}>
        · {formatPopulation(pop)}
      </span>
      {isUno && (
        <span
          aria-label="Un solo asociado"
          className="inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-amber-800 px-1 text-[9px] font-semibold leading-none text-white"
        >
          1
        </span>
      )}
    </button>
  );
}

function emptyLabelFor(bucket: CoverageBucket): string {
  switch (bucket.id) {
    case 'sin_cobertura':
      return 'Sin brechas: todos los países del universo tienen al menos un asociado bajo el alcance actual.';
    case 'un_solo':
      return 'Ningún país queda con un único asociado bajo el alcance actual.';
    default:
      return `Ningún país cae en “${bucket.labelEs}” bajo el alcance actual.`;
  }
}

function formatPopulation(millions: number): string {
  if (millions >= 1000) return `${(millions / 1000).toFixed(1).replace('.', ',')}MM`;
  if (millions >= 10) return `${millions.toFixed(0)}M`;
  if (millions >= 1) return `${millions.toFixed(1).replace('.', ',')}M`;
  if (millions > 0) return `${(millions * 1000).toFixed(0)}K`;
  return '—';
}
