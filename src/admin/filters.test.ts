import { describe, expect, it } from 'vitest';
import {
  EMPTY_FILTERS,
  applyFilters,
  associatesByCountry,
  coverageByCountry,
  distinctCategorias,
  distinctCountries,
  distinctServices,
  distinctSubcategorias,
  filteredRows,
  hasActiveFilters,
  rowMatches,
} from './filters';
import type { AssociateDoc } from './types';

function assoc(
  id: string,
  razonSocial: string,
  rows: Array<Partial<AssociateDoc['rows'][number]>>,
  emailOverride?: string,
): AssociateDoc {
  return {
    id,
    company: {
      razonSocial,
      dba: '',
      paisOrigen: 'CO',
      anioInicio: '',
      numEmpleados: '',
      repLegal: '',
      contactoPrincipalNombre: 'Alguien',
      contactoPrincipalCorreo: emailOverride ?? `${id}@x.com`,
      contactoPrincipalTelefono: '',
      contactoRegulatorioNombre: '',
      contactoRegulatorioCorreo: '',
      contactoRegulatorioTelefono: '',
      correosAdicionales: [],
    },
    rows: rows.map((r) => ({
      categoria: r.categoria ?? 'Asuntos Regulatorios',
      subcategoria: r.subcategoria ?? 'Uso Humano',
      grupo: r.grupo ?? 'Cosméticos',
      servicio: r.servicio ?? 'Hosting/tenencia de registro',
      modalidad: r.modalidad ?? 'Directo',
      paisAplicacion: r.paisAplicacion ?? 'CL',
    })),
    submissionSource: 'form',
    submittedAt: null,
  };
}

const dataset: AssociateDoc[] = [
  assoc('a1', 'Alfa Legal', [
    { servicio: 'Hosting/tenencia de registro', paisAplicacion: 'CL', modalidad: 'Directo' },
    { servicio: 'Hosting/tenencia de registro', paisAplicacion: 'CO', modalidad: 'Directo' },
    { servicio: 'Consultoría regulatoria', paisAplicacion: 'CL', modalidad: 'Tercerizado' },
  ]),
  assoc('a2', 'Beta Consultores', [
    { servicio: 'Hosting/tenencia de registro', paisAplicacion: 'CO', modalidad: 'Tercerizado' },
    { servicio: 'Patentes', categoria: 'Propiedad Intelectual', subcategoria: '', grupo: 'Propiedad Intelectual', paisAplicacion: 'AR' },
  ]),
  assoc('a3', 'Gamma S.A.', [
    { servicio: 'Consultoría regulatoria', paisAplicacion: 'MX', modalidad: 'Directo' },
  ]),
];

describe('hasActiveFilters', () => {
  it('returns false for the empty filter shape', () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
  });

  it('returns true when q is set', () => {
    expect(hasActiveFilters({ ...EMPTY_FILTERS, q: 'foo' })).toBe(true);
  });

  it('returns true for structural filters', () => {
    expect(hasActiveFilters({ ...EMPTY_FILTERS, pais: 'CL' })).toBe(true);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, modalidad: 'directo' })).toBe(true);
  });
});

describe('rowMatches', () => {
  const row = {
    categoria: 'Asuntos Regulatorios',
    subcategoria: 'Uso Humano',
    grupo: 'Cosméticos',
    servicio: 'Hosting/tenencia de registro',
    modalidad: 'Directo' as const,
    paisAplicacion: 'CL',
  };

  it('matches on servicio + pais + modalidad', () => {
    expect(rowMatches(row, { ...EMPTY_FILTERS, servicio: 'Hosting/tenencia de registro' })).toBe(true);
    expect(rowMatches(row, { ...EMPTY_FILTERS, pais: 'CL' })).toBe(true);
    expect(rowMatches(row, { ...EMPTY_FILTERS, modalidad: 'directo' })).toBe(true);
  });

  it('rejects on mismatch', () => {
    expect(rowMatches(row, { ...EMPTY_FILTERS, pais: 'CO' })).toBe(false);
    expect(rowMatches(row, { ...EMPTY_FILTERS, modalidad: 'tercerizado' })).toBe(false);
    expect(rowMatches(row, { ...EMPTY_FILTERS, servicio: 'Otra cosa' })).toBe(false);
  });
});

describe('applyFilters', () => {
  it('returns all associates when no filters are active', () => {
    expect(applyFilters(dataset, EMPTY_FILTERS).map((d) => d.id)).toEqual(['a1', 'a2', 'a3']);
  });

  it('filters by servicio', () => {
    const out = applyFilters(dataset, { ...EMPTY_FILTERS, servicio: 'Hosting/tenencia de registro' });
    expect(out.map((d) => d.id).sort()).toEqual(['a1', 'a2']);
  });

  it('filters by país', () => {
    const out = applyFilters(dataset, { ...EMPTY_FILTERS, pais: 'MX' });
    expect(out.map((d) => d.id)).toEqual(['a3']);
  });

  it('combines multiple structural filters (AND semantics)', () => {
    const out = applyFilters(dataset, {
      ...EMPTY_FILTERS,
      servicio: 'Hosting/tenencia de registro',
      modalidad: 'tercerizado',
    });
    expect(out.map((d) => d.id)).toEqual(['a2']);
  });

  it('text search hits razon social', () => {
    const out = applyFilters(dataset, { ...EMPTY_FILTERS, q: 'beta' });
    expect(out.map((d) => d.id)).toEqual(['a2']);
  });

  it('text search hits service names on rows', () => {
    const out = applyFilters(dataset, { ...EMPTY_FILTERS, q: 'patentes' });
    expect(out.map((d) => d.id)).toEqual(['a2']);
  });

  it('text + structural filters combine (AND)', () => {
    const out = applyFilters(dataset, {
      ...EMPTY_FILTERS,
      q: 'alfa',
      pais: 'CL',
    });
    expect(out.map((d) => d.id)).toEqual(['a1']);
  });

  it('excludes associates when their matching row does not survive structural filter', () => {
    // a2 has "Hosting" only in CO — filtering by CL should drop it even
    // though it does have some Hosting row.
    const out = applyFilters(dataset, {
      ...EMPTY_FILTERS,
      servicio: 'Hosting/tenencia de registro',
      pais: 'CL',
    });
    expect(out.map((d) => d.id)).toEqual(['a1']);
  });
});

describe('coverageByCountry / associatesByCountry', () => {
  it('counts distinct associates per country under no filter', () => {
    const cov = coverageByCountry(dataset, EMPTY_FILTERS);
    expect(cov.get('CL')).toBe(1);   // only a1
    expect(cov.get('CO')).toBe(2);   // a1 and a2
    expect(cov.get('AR')).toBe(1);   // a2
    expect(cov.get('MX')).toBe(1);   // a3
  });

  it('narrows counts under a servicio filter', () => {
    const cov = coverageByCountry(dataset, { ...EMPTY_FILTERS, servicio: 'Hosting/tenencia de registro' });
    expect(cov.get('CL')).toBe(1);  // only a1's Hosting cell
    expect(cov.get('CO')).toBe(2);  // both a1 and a2 have Hosting in CO
    expect(cov.get('AR')).toBeUndefined();
  });

  it('associatesByCountry returns the doc list per country', () => {
    const bag = associatesByCountry(dataset, EMPTY_FILTERS);
    expect(bag.get('CO')!.map((d) => d.id).sort()).toEqual(['a1', 'a2']);
  });
});

describe('filteredRows', () => {
  it('flattens every matching (associate, row) tuple', () => {
    const rows = filteredRows(dataset, {
      ...EMPTY_FILTERS,
      servicio: 'Hosting/tenencia de registro',
    });
    expect(rows).toHaveLength(3); // a1 CL, a1 CO, a2 CO
  });
});

describe('distinct helpers', () => {
  it('distinctServices returns sorted unique labels', () => {
    expect(distinctServices(dataset)).toEqual([
      'Consultoría regulatoria',
      'Hosting/tenencia de registro',
      'Patentes',
    ]);
  });

  it('distinctCategorias returns sorted unique labels', () => {
    expect(distinctCategorias(dataset)).toEqual([
      'Asuntos Regulatorios',
      'Propiedad Intelectual',
    ]);
  });

  it('distinctCountries returns sorted unique ISO codes', () => {
    expect(distinctCountries(dataset)).toEqual(['AR', 'CL', 'CO', 'MX']);
  });

  it('distinctSubcategorias returns all when no categoria is given', () => {
    expect(distinctSubcategorias(dataset)).toEqual(['Uso Humano']);
  });

  it('distinctSubcategorias narrows by categoria', () => {
    expect(distinctSubcategorias(dataset, 'Asuntos Regulatorios')).toEqual(['Uso Humano']);
    expect(distinctSubcategorias(dataset, 'Propiedad Intelectual')).toEqual([]);
  });

  it('distinctServices narrows by categoria', () => {
    expect(distinctServices(dataset, { categoria: 'Propiedad Intelectual' })).toEqual([
      'Patentes',
    ]);
    expect(
      distinctServices(dataset, { categoria: 'Asuntos Regulatorios' }).sort(),
    ).toEqual(['Consultoría regulatoria', 'Hosting/tenencia de registro']);
  });

  it('distinctServices narrows by categoria + subcategoria together', () => {
    expect(
      distinctServices(dataset, {
        categoria: 'Asuntos Regulatorios',
        subcategoria: 'Uso Humano',
      }).sort(),
    ).toEqual(['Consultoría regulatoria', 'Hosting/tenencia de registro']);
    expect(
      distinctServices(dataset, {
        categoria: 'Asuntos Regulatorios',
        subcategoria: 'Veterinarios',
      }),
    ).toEqual([]);
  });
});
