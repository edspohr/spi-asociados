import { useMemo, useState } from 'react';
import type { AssociateDoc } from './types';
import type { Filters } from './filters';
import { coverageByCountry } from './filters';
import {
  COUNTRIES,
  REGIONS,
  countryName,
  findCountry,
  type CountryCode,
  type Region,
} from '../data/countries';

type Props = {
  all: AssociateDoc[];
  filters: Filters;
  /** When set, gaps are computed against this universe instead of all ISO
   *  countries — usually the set of countries that appear in the data. */
  focus?: CountryCode[];
  onSelectCountry: (code: CountryCode) => void;
};

/**
 * The "dónde me falta" panel, grouped by region so it stays compact even with
 * a global country list. Each region is collapsed by default and shows a
 * one-line summary; expanding it reveals the country chips.
 *
 * "Sin cobertura" = 0 associates. "Un solo asociado" = single-point-of-failure
 * (Ana's "dónde tengo backup vs uno solo").
 */
export function GapPanel({ all, filters, focus, onSelectCountry }: Props) {
  const coverage = useMemo(() => coverageByCountry(all, filters), [all, filters]);
  const universe = useMemo<CountryCode[]>(() => {
    if (focus && focus.length > 0) return focus;
    return COUNTRIES.map((c) => c.code2);
  }, [focus]);

  const byRegion = useMemo(() => bucketByRegion(universe, coverage), [universe, coverage]);
  const totals = useMemo(() => {
    let zero = 0;
    let one = 0;
    for (const r of byRegion.values()) {
      zero += r.zero.length;
      one += r.one.length;
    }
    return { zero, one };
  }, [byRegion]);

  const scopeHint = filters.servicio
    ? `Servicio: “${filters.servicio}”`
    : filters.categoria
      ? `Categoría: ${filters.categoria}`
      : 'Sin filtro de servicio';

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
          <div className="flex items-center gap-2 text-[11px]">
            <TotalBadge tone="danger" count={totals.zero} label="sin" />
            <TotalBadge tone="warn" count={totals.one} label="con 1" />
          </div>
        </div>
        <p className="mt-0.5 text-xs text-text-subtle">{scopeHint}</p>
      </header>

      <ul className="mt-3 flex flex-col gap-1.5">
        {REGIONS.map((region) => {
          const b = byRegion.get(region);
          if (!b || b.total === 0) return null;
          return (
            <RegionRow
              key={region}
              region={region}
              zero={b.zero}
              one={b.one}
              total={b.total}
              onSelectCountry={onSelectCountry}
            />
          );
        })}
      </ul>

      {totals.zero === 0 && totals.one === 0 && (
        <p className="mt-3 text-xs text-text-subtle">
          Todos los países del alcance tienen al menos dos asociados. Sin brechas.
        </p>
      )}
    </section>
  );
}

type RegionBucket = { zero: CountryCode[]; one: CountryCode[]; total: number };

function bucketByRegion(
  universe: CountryCode[],
  coverage: Map<CountryCode, number>,
): Map<Region, RegionBucket> {
  const out = new Map<Region, RegionBucket>();
  for (const code of universe) {
    const region = findCountry(code)?.region;
    if (!region) continue;
    const bucket = out.get(region) ?? { zero: [], one: [], total: 0 };
    const n = coverage.get(code) ?? 0;
    if (n === 0) bucket.zero.push(code);
    else if (n === 1) bucket.one.push(code);
    bucket.total += 1;
    out.set(region, bucket);
  }
  for (const b of out.values()) {
    b.zero.sort((a, b2) => countryName(a).localeCompare(countryName(b2), 'es'));
    b.one.sort((a, b2) => countryName(a).localeCompare(countryName(b2), 'es'));
  }
  return out;
}

function RegionRow({
  region,
  zero,
  one,
  total,
  onSelectCountry,
}: {
  region: Region;
  zero: CountryCode[];
  one: CountryCode[];
  total: number;
  onSelectCountry: (code: CountryCode) => void;
}) {
  const hasGaps = zero.length + one.length > 0;
  const [open, setOpen] = useState(false);

  return (
    <li className="rounded border border-border">
      <button
        type="button"
        onClick={() => hasGaps && setOpen((o) => !o)}
        aria-expanded={open}
        disabled={!hasGaps}
        className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs ${
          hasGaps ? 'hover:bg-surface-muted' : 'cursor-default'
        }`}
      >
        <span aria-hidden className={`inline-block text-text-subtle transition ${open ? 'rotate-90' : ''}`}>
          ▶
        </span>
        <span className="flex-1 font-medium text-text">{region}</span>
        <span className="flex items-center gap-1.5 text-[11px]">
          {zero.length > 0 && <Badge tone="danger">{zero.length} sin</Badge>}
          {one.length > 0 && <Badge tone="warn">{one.length} con 1</Badge>}
          {!hasGaps && <span className="text-text-subtle">✓ ok</span>}
          <span className="text-text-subtle">· {total}</span>
        </span>
      </button>

      {open && hasGaps && (
        <div className="border-t border-border px-2.5 py-2">
          {zero.length > 0 && (
            <ChipList
              label="Sin cobertura"
              codes={zero}
              tone="danger"
              onSelect={onSelectCountry}
            />
          )}
          {one.length > 0 && (
            <ChipList
              label="Un solo asociado"
              codes={one}
              tone="warn"
              onSelect={onSelectCountry}
            />
          )}
        </div>
      )}
    </li>
  );
}

function ChipList({
  label,
  codes,
  tone,
  onSelect,
}: {
  label: string;
  codes: CountryCode[];
  tone: 'danger' | 'warn';
  onSelect: (code: CountryCode) => void;
}) {
  const chipCls =
    tone === 'danger'
      ? 'border-red-200 bg-red-50 text-danger hover:border-danger'
      : 'border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-500';
  return (
    <div className="mt-1 first:mt-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <ul className="mt-1 flex flex-wrap gap-1">
        {codes.map((c) => (
          <li key={c}>
            <button
              type="button"
              onClick={() => onSelect(c)}
              className={`rounded border px-1.5 py-0.5 text-[11px] ${chipCls}`}
            >
              {countryName(c)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: 'danger' | 'warn' }) {
  const cls =
    tone === 'danger' ? 'bg-red-100 text-danger' : 'bg-amber-100 text-amber-800';
  return <span className={`rounded px-1.5 py-0.5 ${cls}`}>{children}</span>;
}

function TotalBadge({ count, tone, label }: { count: number; tone: 'danger' | 'warn'; label: string }) {
  if (count === 0) return null;
  const cls =
    tone === 'danger' ? 'bg-red-100 text-danger' : 'bg-amber-100 text-amber-800';
  return (
    <span className={`rounded px-1.5 py-0.5 font-semibold ${cls}`} title={`${count} países ${label} cobertura`}>
      {count} {label}
    </span>
  );
}
