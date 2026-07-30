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
 * that region unless the user has explicitly touched it before.
 */
export function RegionCountrySelector({ selected, onChange }: Props) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  function setCountry(code: CountryCode, on: boolean) {
    const next = new Set(selectedSet);
    if (on) next.add(code);
    else next.delete(code);
    onChange(Array.from(next));
  }

  function setRegionAll(region: Region, on: boolean) {
    const codes = countriesByRegion(region).map((c) => c.code2);
    const next = new Set(selectedSet);
    for (const c of codes) {
      if (on) next.add(c);
      else next.delete(c);
    }
    onChange(Array.from(next));
  }

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
          Marque las regiones en las que su firma opera. Al abrir una región puede destildar los
          países específicos que no aplican; sólo estos países aparecerán en las matrices del
          paso siguiente.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {REGIONS.map((region) => (
          <RegionBlock
            key={region}
            region={region}
            selectedSet={selectedSet}
            onCountryChange={setCountry}
            onRegionAllChange={setRegionAll}
          />
        ))}
      </div>

      <p className="mt-4 text-xs text-text-subtle">
        {selected.length === 0
          ? 'Aún no ha seleccionado ningún país.'
          : `${selected.length} país(es) seleccionados.`}
      </p>
    </section>
  );
}

function RegionBlock({
  region,
  selectedSet,
  onCountryChange,
  onRegionAllChange,
}: {
  region: Region;
  selectedSet: Set<CountryCode>;
  onCountryChange: (code: CountryCode, on: boolean) => void;
  onRegionAllChange: (region: Region, on: boolean) => void;
}) {
  const countries = useMemo(() => countriesByRegion(region), [region]);
  const selectedCount = countries.filter((c) => selectedSet.has(c.code2)).length;
  const [open, setOpen] = useState(false);

  // First time the user opens a region, if nothing is selected in it yet,
  // auto-select every country in that region (Ana's "default all" rule).
  function handleToggleOpen() {
    const nextOpen = !open;
    if (nextOpen && selectedCount === 0) {
      onRegionAllChange(region, true);
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
