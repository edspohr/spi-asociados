import { describe, expect, it } from 'vitest';
import {
  COUNTRIES,
  GROUPS,
  SERVICE_LABELS,
  SERVICE_TOOLTIPS,
  type Group,
  type ServiceKey,
} from './form-config';

const VALID_SERVICES = Object.keys(SERVICE_LABELS) as ServiceKey[];

describe('COUNTRIES', () => {
  it('lists the 12 South American markets SPI serves', () => {
    expect(COUNTRIES).toHaveLength(12);
  });

  it('has no duplicates', () => {
    expect(new Set(COUNTRIES).size).toBe(COUNTRIES.length);
  });
});

describe('GROUPS', () => {
  it('has 21 groups per the spec', () => {
    expect(GROUPS).toHaveLength(21);
  });

  it('has unique ids', () => {
    const ids = GROUPS.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('marks Propiedad Intelectual and Servicios Legales as singleRow with no services', () => {
    const singles = GROUPS.filter((g) => g.singleRow);
    expect(singles.map((g) => g.id).sort()).toEqual(['propiedad_intelectual', 'servicios_legales']);
    for (const g of singles) {
      expect(g.services).toBeUndefined();
    }
  });

  it('every non-singleRow group declares a non-empty services list', () => {
    for (const g of GROUPS.filter((g) => !g.singleRow)) {
      expect(g.services).toBeDefined();
      expect(g.services!.length).toBeGreaterThan(0);
    }
  });

  it('every group service is a valid ServiceKey', () => {
    for (const g of GROUPS) {
      for (const s of g.services ?? []) {
        expect(VALID_SERVICES).toContain(s);
      }
    }
  });

  it('no group repeats a service', () => {
    for (const g of GROUPS) {
      const s = g.services ?? [];
      expect(new Set(s).size).toBe(s.length);
    }
  });

  it('only "otro_grupo" allows a custom name', () => {
    const custom = GROUPS.filter((g) => g.allowCustomName);
    expect(custom.map((g) => g.id)).toEqual(['otro_grupo']);
  });
});

describe('Dispositivos médicos', () => {
  it('has all 9 services including SERV_TECNICO', () => {
    const g = byId('dispositivos_medicos');
    expect(g.services).toEqual([
      'CONSULTORIA',
      'HOSTING',
      'PROF_RESP',
      'VIGILANCIA',
      'IMPORT_DIST',
      'SERV_TECNICO',
      'ALMACENAMIENTO',
      'ENSAYOS',
      'OTRO',
    ]);
  });
});

describe('FULL profile groups (Cosméticos, Medicamentos, etc.)', () => {
  const FULL_EXPECTED: ServiceKey[] = [
    'CONSULTORIA',
    'HOSTING',
    'PROF_RESP',
    'VIGILANCIA',
    'IMPORT_DIST',
    'ALMACENAMIENTO',
    'ENSAYOS',
    'OTRO',
  ];
  const ids = [
    'cosmeticos',
    'medicamentos',
    'homeopaticos',
    'fitoterapeuticos',
    'vet_medicamentos',
    'vet_homeopaticos',
    'vet_fitoterapeuticos',
  ];
  it.each(ids)('%s uses the FULL service set (no SERV_TECNICO)', (id) => {
    const g = byId(id);
    expect(g.services).toEqual(FULL_EXPECTED);
  });
});

describe('BASIC profile groups', () => {
  const BASIC_EXPECTED: ServiceKey[] = [
    'CONSULTORIA',
    'HOSTING',
    'PROF_RESP',
    'IMPORT_DIST',
    'ALMACENAMIENTO',
    'OTRO',
  ];
  const ids = [
    'alimentos',
    'bebidas_alcoholicas',
    'suplementos_dietarios',
    'vet_alimentos',
    'vet_suplementos',
    'agricolas',
    'agropecuarios',
    'aseo_domestico',
    'aseo_industrial',
    'plaguicidas_domesticos',
  ];
  it.each(ids)('%s uses the BASIC service set', (id) => {
    const g = byId(id);
    expect(g.services).toEqual(BASIC_EXPECTED);
  });
});

describe('SERVICE_TOOLTIPS', () => {
  it('confirms HOSTING glossary entry', () => {
    expect(SERVICE_TOOLTIPS.HOSTING).toMatch(/representación legal/i);
  });

  it('only references defined ServiceKeys', () => {
    for (const key of Object.keys(SERVICE_TOOLTIPS)) {
      expect(VALID_SERVICES).toContain(key as ServiceKey);
    }
  });
});

function byId(id: string): Group {
  const g = GROUPS.find((x) => x.id === id);
  if (!g) throw new Error(`Group not found: ${id}`);
  return g;
}
