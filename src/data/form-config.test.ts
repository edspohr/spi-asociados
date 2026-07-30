import { describe, expect, it } from 'vitest';
import {
  CATEGORIES,
  COUNTRIES,
  GROUPS,
  findGroupContext,
  isOtherService,
  type Group,
} from './form-config';

describe('COUNTRIES', () => {
  it('lists the 12 South American markets SPI serves', () => {
    expect(COUNTRIES).toHaveLength(12);
  });

  it('has no duplicates', () => {
    expect(new Set(COUNTRIES).size).toBe(COUNTRIES.length);
  });
});

describe('CATEGORIES', () => {
  it('exposes 4 top-level categories', () => {
    expect(CATEGORIES.map((c) => c.id)).toEqual([
      'propiedad_intelectual',
      'derecho_comercial',
      'asuntos_regulatorios',
      'otro',
    ]);
  });

  it('Asuntos Regulatorios has 3 subcategories (Uso Humano, Veterinarios, Uso Agrícola)', () => {
    const reg = CATEGORIES.find((c) => c.id === 'asuntos_regulatorios')!;
    expect(reg.subcategories).toBeDefined();
    expect(reg.subcategories!.map((s) => s.id)).toEqual([
      'reg_uso_humano',
      'reg_veterinarios',
      'reg_uso_agricola',
    ]);
  });

  it('Uso Humano has 12 subgroups; Veterinarios 4; Uso Agrícola 1', () => {
    const reg = CATEGORIES.find((c) => c.id === 'asuntos_regulatorios')!;
    const sub = (id: string) => reg.subcategories!.find((s) => s.id === id)!;
    expect(sub('reg_uso_humano').groups).toHaveLength(12);
    expect(sub('reg_veterinarios').groups).toHaveLength(4);
    expect(sub('reg_uso_agricola').groups).toHaveLength(1);
  });

  it('every regulatorios subgroup starts with the 8 common services', () => {
    const reg = CATEGORIES.find((c) => c.id === 'asuntos_regulatorios')!;
    const commonHead = [
      'Consultoría regulatoria',
      'Hosting/tenencia de registro',
      'Profesional responsable/responsable técnico',
      'Importación',
      'Almacenamiento',
      'Distribución',
      'Consultoría para certificaciones GMP/GLP/similares',
      'Otros',
    ];
    for (const sub of reg.subcategories!) {
      for (const g of sub.groups) {
        expect(g.services.slice(0, 8)).toEqual(commonHead);
      }
    }
  });

  it('Propiedad Intelectual has one group with 10 services', () => {
    const pi = byId('pi');
    expect(pi.services).toHaveLength(10);
    expect(pi.services[0]).toBe('Marcas y signos distintivos');
  });

  it('Derecho Comercial has one group with 9 services', () => {
    const dc = byId('derecho_comercial');
    expect(dc.services).toHaveLength(9);
    expect(dc.services[0]).toBe('Constitución y derecho societario');
  });

  it('Otro grupo has 9 services and allows a custom name', () => {
    const og = byId('otro_grupo');
    expect(og.allowCustomName).toBe(true);
    expect(og.services).toHaveLength(9);
  });
});

describe('GROUPS (flattened)', () => {
  it('flattens all leaves — 1 PI + 1 DC + 17 Regulatorios + 1 Otro = 20', () => {
    expect(GROUPS).toHaveLength(20);
  });

  it('has unique ids', () => {
    const ids = GROUPS.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every group declares at least one service', () => {
    for (const g of GROUPS) {
      expect(g.services.length).toBeGreaterThan(0);
    }
  });

  it('no group repeats a service label', () => {
    for (const g of GROUPS) {
      expect(new Set(g.services).size).toBe(g.services.length);
    }
  });

  it('only "otro_grupo" allows a custom name', () => {
    const custom = GROUPS.filter((g) => g.allowCustomName);
    expect(custom.map((g) => g.id)).toEqual(['otro_grupo']);
  });
});

describe('findGroupContext', () => {
  it('resolves a nested regulatorios subgroup with category + subcategory', () => {
    const ctx = findGroupContext('reg_dispositivos_medicos');
    expect(ctx?.category.id).toBe('asuntos_regulatorios');
    expect(ctx?.subcategory?.id).toBe('reg_uso_humano');
    expect(ctx?.group.label).toBe('Dispositivos Médicos');
  });

  it('resolves a flat-category group without subcategory', () => {
    const ctx = findGroupContext('pi');
    expect(ctx?.category.id).toBe('propiedad_intelectual');
    expect(ctx?.subcategory).toBeUndefined();
  });

  it('returns undefined for unknown ids', () => {
    expect(findGroupContext('nope')).toBeUndefined();
  });
});

describe('isOtherService', () => {
  it('accepts both "Otro" (singular) and "Otros" (plural)', () => {
    expect(isOtherService('Otro')).toBe(true);
    expect(isOtherService('Otros')).toBe(true);
    expect(isOtherService('Hosting')).toBe(false);
    expect(isOtherService('')).toBe(false);
  });
});

describe('Dispositivos Médicos specifics', () => {
  it('appends its 4 unique services after the 8 common', () => {
    const g = byId('reg_dispositivos_medicos');
    expect(g.services.slice(8)).toEqual([
      'Servicio técnico',
      'Ensayos clínicos',
      'Vigilancia postmercado/tecnovigilancia',
      'Reportes UDI DI',
    ]);
  });
});

function byId(id: string): Group {
  const g = GROUPS.find((x) => x.id === id);
  if (!g) throw new Error(`Group not found: ${id}`);
  return g;
}
