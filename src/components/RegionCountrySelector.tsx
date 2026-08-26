import { useMemo, useState } from 'react';
import {
  COUNTRIES,
  REGIONS,
  countriesByRegion,
  type CountryCode,
  type CountryDef,
  type Region,
} from '../data/countries';

type Props = {
  selected: CountryCode[];
  onChange: (next: CountryCode[]) => void;
};

/**
 * Two-level picker: user opens a region and each country inside starts
 * pre-checked (the "default all" mode Ana asked for — she said associates who
 * cover a whole continent shouldn't have to click every country). Uncheck to
 * remove; the "Todos/Ninguno" shortcut toggles the whole region.
 *
 * Regions are collapsed by default; opening one auto-selects every country in
 * that region unless the user has explicitly touched it before. When that
 * happens we surface an inline notice inside the region so the auto-selection
 * is not silent.
 */
export function RegionCountrySelector({ selected, onChange }: Props) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  // Regions whose current selection was produced by opening the region (as
  // opposed to the user ticking countries by hand). Cleared per-region as
  // soon as the user edits that region.
  const [autoFilledRegions, setAutoFilledRegions] = useState<Set<Region>>(
    () => new Set(),
  );

  function setCountry(code: CountryCode, on: boolean) {
    const next = new Set(selectedSet);
    if (on) next.add(code);
    else next.delete(code);
    onChange(Array.from(next));
    // Any manual tick/untick counts as "the user has edited this region",
    // so we retire the auto-fill notice.
    const region = COUNTRIES.find((c) => c.code2 === code)?.region;
    if (region) clearAutoFilled(region);
  }

  function setRegionAll(region: Region, on: boolean) {
    const codes = countriesByRegion(region).map((c) => c.code2);
    const next = new Set(selectedSet);
    for (const c of codes) {
      if (on) next.add(c);
      else next.delete(c);
    }
    onChange(Array.from(next));
    clearAutoFilled(region);
  }

  function markAutoFilled(region: Region) {
    setAutoFilledRegions((prev) => {
      const next = new Set(prev);
      next.add(region);
      return next;
    });
  }

  function clearAutoFilled(region: Region) {
    setAutoFilledRegions((prev) => {
      if (!prev.has(region)) return prev;
      const next = new Set(prev);
      next.delete(region);
      return next;
    });
  }

  const regionsWithSelection = useMemo(() => {
    const out: Region[] = [];
    for (const region of REGIONS) {
      const codes = countriesByRegion(region).map((c) => c.code2);
      if (codes.some((c) => selectedSet.has(c))) out.push(region);
    }
    return out;
  }, [selectedSet]);

  return (
    <section
      aria-labelledby="regions-title"
      className="rounded-lg border border-border bg-surface p-6"
    >
      <header className="mb-4">
        <h2 id="regions-title" className="text-lg font-semibold text-primary">
          Regiones y países de operación
        </h2>
        <p className="text-sm text-text-muted">
          Marque las regiones en las que su firma opera.{' '}
          <strong>Al abrir una región se marcan todos sus países por defecto</strong> —
          destilde los que no correspondan. Sólo estos países aparecerán en las matrices
          del paso siguiente.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {REGIONS.map((region) => (
          <RegionBlock
            key={region}
            region={region}
            selectedSet={selectedSet}
            autoFilled={autoFilledRegions.has(region)}
            onCountryChange={setCountry}
            onRegionAllChange={setRegionAll}
            onAutoFilled={markAutoFilled}
          />
        ))}
      </div>

      <p className="mt-4 text-xs text-text-subtle">
        {selected.length === 0 ? (
          'Aún no ha seleccionado ningún país.'
        ) : (
          <>
            {selected.length} país(es) seleccionados
            {regionsWithSelection.length > 0 && (
              <> en {regionsWithSelection.length} región(es):{' '}
                <span className="text-text-muted">{regionsWithSelection.join(', ')}</span>
              </>
            )}
            .
          </>
        )}
      </p>
    </section>
  );
}

function RegionBlock({
  region,
  selectedSet,
  autoFilled,
  onCountryChange,
  onRegionAllChange,
  onAutoFilled,
}: {
  region: Region;
  selectedSet: Set<CountryCode>;
  autoFilled: boolean;
  onCountryChange: (code: CountryCode, on: boolean) => void;
  onRegionAllChange: (region: Region, on: boolean) => void;
  onAutoFilled: (region: Region) => void;
}) {
  const countries = useMemo(() => countriesByRegion(region), [region]);
  const selectedCount = countries.filter((c) => selectedSet.has(c.code2)).length;
  const [open, setOpen] = useState(false);

  // First time the user opens a region, if nothing is selected in it yet,
  // auto-select every country in that region (Ana's "default all" rule) and
  // flag it so we can render the auto-fill notice.
  function handleToggleOpen() {
    const nextOpen = !open;
    if (nextOpen && selectedCount === 0) {
      onRegionAllChange(region, true);
      onAutoFilled(region);
    }
    setOpen(nextOpen);
  }

  const allSelected = countries.length > 0 && selectedCount === countries.length;

  return (
    <section
      aria-labelledby={`region-${region}-title`}
      className="rounded-lg border border-border bg-surface"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={handleToggleOpen}
          aria-expanded={open}
          aria-controls={`region-${region}-body`}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <span aria-hidden className={`inline-block transition ${open ? 'rotate-90' : ''}`}>
            ▶
          </span>
          <span id={`region-${region}-title`} className="font-semibold text-primary">
            {region}
          </span>
          <span className="text-xs text-text-muted">
            ({selectedCount}/{countries.length})
          </span>
        </button>
        {open && (
          <button
            type="button"
            onClick={() => onRegionAllChange(region, !allSelected)}
            className="text-xs text-primary underline hover:opacity-80"
          >
            {allSelected ? 'Desmarcar todos' : 'Marcar todos'}
          </button>
        )}
      </div>

      {open && (
        <div id={`region-${region}-body`} className="border-t border-border p-4">
          {autoFilled && (
            <p
              role="status"
              data-testid={`autofill-notice-${region}`}
              className="mb-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900"
            >
              <strong>Se marcaron automáticamente todos los países de {region}.</strong>{' '}
              Destilde los que su firma no atiende.
            </p>
          )}
          <ul
            role="group"
            className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 md:grid-cols-3"
          >
            {countries.map((c) => (
              <CountryCheckbox
                key={c.code2}
                country={c}
                checked={selectedSet.has(c.code2)}
                onChange={(on) => onCountryChange(c.code2, on)}
              />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function CountryCheckbox({
  country,
  checked,
  onChange,
}: {
  country: CountryDef;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <li>
      <label
        className={`flex items-start gap-2 rounded border p-2 text-sm transition ${
          checked ? 'border-primary bg-surface-muted' : 'border-border hover:border-accent-600'
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-primary"
        />
        <span className="flex flex-col">
          <span className="text-text">{country.nameEs}</span>
          <span className="text-xs text-text-subtle">{country.code2}</span>
        </span>
      </label>
    </li>
  );
}

// Convenience export for consumers that want the full list without re-importing
// the whole countries module.
export const ALL_COUNTRIES: CountryDef[] = COUNTRIES;
