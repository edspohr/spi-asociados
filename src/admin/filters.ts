import type { AssociateDoc } from './types';
import type { SubmissionRow } from '../lib/payload';
import type { CountryCode } from '../data/countries';

export type ModalidadFilter = 'todos' | 'directo' | 'tercerizado';

export type Filters = {
  /** Free-text term matched against company name, contact name/email, group,
   *  service. Case-insensitive substring match. */
  q: string;
  /** Category label (e.g. "Asuntos Regulatorios"). Empty string = all. */
  categoria: string;
  /** Subcategory label (e.g. "Uso Humano"). Empty = all. */
  subcategoria: string;
  /** Service label (e.g. "Hosting/tenencia de registro"). Empty = all. */
  servicio: string;
  /** ISO alpha-2 code (e.g. "CL"). Empty = all. */
  pais: CountryCode | '';
  /** Delivery mode. */
  modalidad: ModalidadFilter;
};

export const EMPTY_FILTERS: Filters = {
  q: '',
  categoria: '',
  subcategoria: '',
  servicio: '',
  pais: '',
  modalidad: 'todos',
};

export function hasActiveFilters(f: Filters): boolean {
  return (
    f.q.trim() !== '' ||
    f.categoria !== '' ||
    f.subcategoria !== '' ||
    f.servicio !== '' ||
    f.pais !== '' ||
    f.modalidad !== 'todos'
  );
}

/**
 * Row-level match. Used both by the table (to keep the associate) and by the
 * map/gaps panel (to count coverage on filtered rows only).
 */
export function rowMatches(row: SubmissionRow, f: Filters): boolean {
  if (f.categoria && row.categoria !== f.categoria) return false;
  if (f.subcategoria && row.subcategoria !== f.subcategoria) return false;
  if (f.servicio && row.servicio !== f.servicio) return false;
  if (f.pais && row.paisAplicacion !== f.pais) return false;
  if (f.modalidad !== 'todos') {
    const want = f.modalidad === 'directo' ? 'Directo' : 'Tercerizado';
    if (row.modalidad !== want) return false;
  }
  return true;
}

/**
 * Returns associates whose text matches `q` AND that have at least one row
 * matching the structural filters. Text `q` is applied against company and
 * against every row's group/service.
 */
export function applyFilters(all: AssociateDoc[], f: Filters): AssociateDoc[] {
  const q = f.q.trim().toLowerCase();
  return all.filter((doc) => {
    if (q && !matchesText(doc, q)) return false;

    const structural: Filters = { ...f, q: '' };
    if (!hasStructuralFilters(structural)) return true;
    return doc.rows.some((r) => rowMatches(r, structural));
  });
}

/**
 * All rows across all associates that pass the filters. Used by the map and
 * gap panel to compute coverage counts per country.
 */
export function filteredRows(all: AssociateDoc[], f: Filters): Array<{
  associate: AssociateDoc;
  row: SubmissionRow;
}> {
  const q = f.q.trim().toLowerCase();
  const out: Array<{ associate: AssociateDoc; row: SubmissionRow }> = [];
  for (const doc of all) {
    if (q && !matchesText(doc, q)) continue;
    for (const row of doc.rows) {
      if (rowMatches(row, f)) out.push({ associate: doc, row });
    }
  }
  return out;
}

function hasStructuralFilters(f: Filters): boolean {
  return (
    f.categoria !== '' ||
    f.subcategoria !== '' ||
    f.servicio !== '' ||
    f.pais !== '' ||
    f.modalidad !== 'todos'
  );
}

function matchesText(doc: AssociateDoc, needle: string): boolean {
  const haystacks = [
    doc.company?.razonSocial,
    doc.company?.dba,
    doc.company?.contactoPrincipalNombre,
    doc.company?.contactoPrincipalCorreo,
    doc.company?.contactoRegulatorioNombre,
    doc.company?.contactoRegulatorioCorreo,
  ];
  for (const h of haystacks) {
    if (h && h.toLowerCase().includes(needle)) return true;
  }
  for (const r of doc.rows) {
    if (
      r.grupo.toLowerCase().includes(needle) ||
      r.servicio.toLowerCase().includes(needle)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Count of distinct associates offering *anything* in each country, restricted
 * to rows that pass the current filters. The map's choropleth is coloured by
 * this map.
 */
export function coverageByCountry(all: AssociateDoc[], f: Filters): Map<CountryCode, number> {
  const associatesByCountry = new Map<CountryCode, Set<string>>();
  for (const { associate, row } of filteredRows(all, f)) {
    const set = associatesByCountry.get(row.paisAplicacion) ?? new Set();
    set.add(associate.id);
    associatesByCountry.set(row.paisAplicacion, set);
  }
  const out = new Map<CountryCode, number>();
  for (const [country, ids] of associatesByCountry) {
    out.set(country, ids.size);
  }
  return out;
}

/**
 * Names of associates active in each country under the current filters. Used
 * for the tooltip / gap panel.
 */
export function associatesByCountry(
  all: AssociateDoc[],
  f: Filters,
): Map<CountryCode, AssociateDoc[]> {
  const dedup = new Map<CountryCode, Map<string, AssociateDoc>>();
  for (const { associate, row } of filteredRows(all, f)) {
    const inner = dedup.get(row.paisAplicacion) ?? new Map();
    inner.set(associate.id, associate);
    dedup.set(row.paisAplicacion, inner);
  }
  const out = new Map<CountryCode, AssociateDoc[]>();
  for (const [country, inner] of dedup) {
    out.set(country, Array.from(inner.values()));
  }
  return out;
}

/** Distinct services present across the current data. Optionally narrowed by
 *  categoria/subcategoria so the servicio dropdown only offers services that
 *  actually exist inside the currently-picked category. */
export function distinctServices(
  all: AssociateDoc[],
  scope: { categoria?: string; subcategoria?: string } = {},
): string[] {
  const s = new Set<string>();
  for (const doc of all) {
    for (const row of doc.rows) {
      if (scope.categoria && row.categoria !== scope.categoria) continue;
      if (scope.subcategoria && row.subcategoria !== scope.subcategoria) continue;
      if (row.servicio) s.add(row.servicio);
    }
  }
  return Array.from(s).sort((a, b) => a.localeCompare(b, 'es'));
}

/** Distinct categoria labels present across the data. */
export function distinctCategorias(all: AssociateDoc[]): string[] {
  const s = new Set<string>();
  for (const doc of all) {
    for (const row of doc.rows) {
      if (row.categoria) s.add(row.categoria);
    }
  }
  return Array.from(s).sort((a, b) => a.localeCompare(b, 'es'));
}

/** Distinct subcategoria labels present under a given categoria (empty rows
 *  outside that categoria are ignored). If `categoria` is empty, returns
 *  every non-empty subcategoria in the data. */
export function distinctSubcategorias(
  all: AssociateDoc[],
  categoria: string = '',
): string[] {
  const s = new Set<string>();
  for (const doc of all) {
    for (const row of doc.rows) {
      if (categoria && row.categoria !== categoria) continue;
      if (row.subcategoria) s.add(row.subcategoria);
    }
  }
  return Array.from(s).sort((a, b) => a.localeCompare(b, 'es'));
}

/** Distinct country codes present in the data. */
export function distinctCountries(all: AssociateDoc[]): CountryCode[] {
  const s = new Set<CountryCode>();
  for (const doc of all) {
    for (const row of doc.rows) {
      if (row.paisAplicacion) s.add(row.paisAplicacion);
    }
  }
  return Array.from(s).sort();
}
