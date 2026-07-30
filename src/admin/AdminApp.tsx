import { useCallback, useEffect, useMemo, useState } from 'react';
import { AccessGate } from './AccessGate';
import { KpiCards } from './KpiCards';
import { MapView } from './MapView';
import { GapPanel } from './GapPanel';
import { AssociatesTable } from './AssociatesTable';
import { AssociateDrawer } from './AssociateDrawer';
import { useAssociates } from './useAssociates';
import type { AssociateDoc } from './types';
import type { Filters, ModalidadFilter } from './filters';
import {
  EMPTY_FILTERS,
  applyFilters,
  distinctCategorias,
  distinctCountries,
  distinctServices,
  filteredRows,
  hasActiveFilters,
} from './filters';
import { downloadCsv, toCsv } from './csv';
import { COUNTRIES, countryName, type CountryCode } from '../data/countries';

const SESSION_KEY = 'spi-admin-key';

/**
 * Orchestrates the analytics view. Owns:
 *  - the admin key (from `?key=` or sessionStorage, falls back to AccessGate)
 *  - the filter state (round-tripped through URL query params so links are
 *    shareable between staff members)
 *  - the drawer's currently-open associate
 */
export function AdminApp() {
  const [adminKey, setAdminKey] = useState<string | null>(() => resolveKey());
  const [filters, setFilters] = useState<Filters>(() => readFiltersFromUrl());
  const [selected, setSelected] = useState<AssociateDoc | null>(null);
  const state = useAssociates(adminKey);

  // Persist filters into the URL — enables staff to share a "look at this
  // exact view" link. History replaced (not pushed) so back button still exits
  // the /admin route cleanly.
  useEffect(() => {
    const usp = new URLSearchParams();
    if (filters.q) usp.set('q', filters.q);
    if (filters.categoria) usp.set('categoria', filters.categoria);
    if (filters.subcategoria) usp.set('subcategoria', filters.subcategoria);
    if (filters.servicio) usp.set('servicio', filters.servicio);
    if (filters.pais) usp.set('pais', filters.pais);
    if (filters.modalidad !== 'todos') usp.set('modalidad', filters.modalidad);
    const qs = usp.toString();
    const url = `${window.location.pathname}${qs ? '?' + qs : ''}`;
    window.history.replaceState(null, '', url);
  }, [filters]);

  const setPatch = useCallback((patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  if (state.status === 'error' && state.unauthorized) {
    return (
      <AccessGate
        error={
          adminKey
            ? 'La clave no es válida o está vencida. Vuelva a intentar.'
            : undefined
        }
        onKey={(k) => {
          window.sessionStorage.setItem(SESSION_KEY, k);
          setAdminKey(k);
        }}
      />
    );
  }

  const associates = state.status === 'ready' ? state.data : [];
  const filteredAssociates = useMemo(
    () => applyFilters(associates, filters),
    [associates, filters],
  );

  const categorias = useMemo(() => distinctCategorias(associates), [associates]);
  const servicios = useMemo(() => distinctServices(associates), [associates]);
  const countriesInData = useMemo(() => distinctCountries(associates), [associates]);
  const focusCountries: CountryCode[] = countriesInData.length > 0 ? countriesInData : [];

  function handleExport() {
    const rows = filteredRows(associates, filters);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`asociados-${stamp}.csv`, toCsv(rows));
  }

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold text-primary">
              Panel de asociados · SPI Americas
            </h1>
            <p className="text-sm text-text-muted">
              Vista interna: cobertura, brechas y búsqueda del universo de asociados.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            {state.status === 'loading' && <span>Cargando…</span>}
            {state.status === 'ready' && (
              <span>
                {state.data.length} asociado(s){' '}
                {state.history.length !== state.data.length && (
                  <span className="text-text-subtle">· {state.history.length} envíos totales</span>
                )}
              </span>
            )}
            <button
              type="button"
              onClick={handleExport}
              disabled={state.status !== 'ready' || filteredAssociates.length === 0}
              className="rounded border border-border bg-white px-3 py-1 text-xs text-primary hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Descargar CSV
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6">
        {state.status === 'error' && !state.unauthorized && (
          <div role="alert" className="rounded border border-danger/40 bg-red-50 p-3 text-sm text-danger">
            No se pudieron cargar los datos: {state.error}
          </div>
        )}

        <FiltersBar
          filters={filters}
          onPatch={setPatch}
          onReset={() => setFilters(EMPTY_FILTERS)}
          categorias={categorias}
          servicios={servicios}
          countriesInData={countriesInData}
        />

        <KpiCards all={associates} filters={filters} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
          <MapView
            all={associates}
            filters={filters}
            onSelectCountry={(pais) => setPatch({ pais: filters.pais === pais ? '' : pais })}
          />
          <GapPanel
            all={associates}
            filters={filters}
            focus={focusCountries}
            onSelectCountry={(pais) => setPatch({ pais: filters.pais === pais ? '' : pais })}
          />
        </div>

        <AssociatesTable associates={filteredAssociates} onSelect={setSelected} />
      </main>

      <AssociateDrawer associate={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function FiltersBar({
  filters,
  onPatch,
  onReset,
  categorias,
  servicios,
  countriesInData,
}: {
  filters: Filters;
  onPatch: (patch: Partial<Filters>) => void;
  onReset: () => void;
  categorias: string[];
  servicios: string[];
  countriesInData: CountryCode[];
}) {
  // Order: put countries that appear in the data first (sorted by Spanish
  // name), then the rest of the world at the bottom for completeness.
  const countryOptions = useMemo(() => {
    const seen = new Set(countriesInData);
    const inData = countriesInData
      .map((c) => COUNTRIES.find((x) => x.code2 === c))
      .filter((x): x is (typeof COUNTRIES)[number] => Boolean(x))
      .sort((a, b) => a.nameEs.localeCompare(b.nameEs, 'es'));
    const rest = COUNTRIES.filter((c) => !seen.has(c.code2)).sort((a, b) =>
      a.nameEs.localeCompare(b.nameEs, 'es'),
    );
    return { inData, rest };
  }, [countriesInData]);

  return (
    <section
      aria-label="Filtros"
      className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-6"
    >
      <label className="flex flex-col gap-1 text-xs text-text-muted lg:col-span-2">
        Buscar (razón social, correo, servicio…)
        <input
          type="search"
          value={filters.q}
          onChange={(e) => onPatch({ q: e.target.value })}
          placeholder="Ej: dispositivos, maria@…, hosting"
          className="rounded border border-border bg-white px-2 py-1 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-text-muted">
        Categoría
        <select
          value={filters.categoria}
          onChange={(e) => onPatch({ categoria: e.target.value })}
          className="rounded border border-border bg-white px-2 py-1 text-sm text-text outline-none focus:border-primary"
        >
          <option value="">Todas</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-text-muted">
        Servicio
        <select
          value={filters.servicio}
          onChange={(e) => onPatch({ servicio: e.target.value })}
          className="rounded border border-border bg-white px-2 py-1 text-sm text-text outline-none focus:border-primary"
        >
          <option value="">Todos</option>
          {servicios.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-text-muted">
        País
        <select
          value={filters.pais}
          onChange={(e) => onPatch({ pais: e.target.value })}
          className="rounded border border-border bg-white px-2 py-1 text-sm text-text outline-none focus:border-primary"
        >
          <option value="">Todos</option>
          {countryOptions.inData.length > 0 && (
            <optgroup label="En los datos">
              {countryOptions.inData.map((c) => (
                <option key={c.code2} value={c.code2}>
                  {c.nameEs}
                </option>
              ))}
            </optgroup>
          )}
          <optgroup label="Resto del mundo">
            {countryOptions.rest.map((c) => (
              <option key={c.code2} value={c.code2}>
                {c.nameEs}
              </option>
            ))}
          </optgroup>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-text-muted">
        Modalidad
        <select
          value={filters.modalidad}
          onChange={(e) => onPatch({ modalidad: e.target.value as ModalidadFilter })}
          className="rounded border border-border bg-white px-2 py-1 text-sm text-text outline-none focus:border-primary"
        >
          <option value="todos">Todas</option>
          <option value="directo">Directo</option>
          <option value="tercerizado">Tercerizado</option>
        </select>
      </label>

      <div className="flex items-end justify-between gap-2 lg:col-span-6">
        <p className="text-xs text-text-subtle">
          {hasActiveFilters(filters) ? (
            <>
              Filtro activo
              {filters.pais && <> · País: <strong>{countryName(filters.pais)}</strong></>}
              {filters.servicio && <> · Servicio: <strong>{filters.servicio}</strong></>}
            </>
          ) : (
            'Sin filtros — mostrando el universo completo.'
          )}
        </p>
        <button
          type="button"
          onClick={onReset}
          disabled={!hasActiveFilters(filters)}
          className="text-xs text-primary underline hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Limpiar filtros
        </button>
      </div>
    </section>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function resolveKey(): string | null {
  const url = new URL(window.location.href);
  const fromUrl = url.searchParams.get('key');
  if (fromUrl && fromUrl.trim()) {
    const trimmed = fromUrl.trim();
    window.sessionStorage.setItem(SESSION_KEY, trimmed);
    // Scrub the key from the visible URL so it's not left in browser history.
    url.searchParams.delete('key');
    window.history.replaceState(null, '', url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : ''));
    return trimmed;
  }
  return window.sessionStorage.getItem(SESSION_KEY);
}

function readFiltersFromUrl(): Filters {
  const usp = new URLSearchParams(window.location.search);
  const modalidadRaw = usp.get('modalidad');
  const modalidad: ModalidadFilter =
    modalidadRaw === 'directo' || modalidadRaw === 'tercerizado' ? modalidadRaw : 'todos';
  return {
    q: usp.get('q') ?? '',
    categoria: usp.get('categoria') ?? '',
    subcategoria: usp.get('subcategoria') ?? '',
    servicio: usp.get('servicio') ?? '',
    pais: usp.get('pais') ?? '',
    modalidad,
  };
}
