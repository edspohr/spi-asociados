import { describe, expect, it } from 'vitest';
import { EMPTY_FORM, makeCellKey, type FormState } from '../types/form';
import {
  buildRows,
  buildPayload,
  findStage1Blockers,
  findSubmitBlockers,
  groupDisplayLabel,
} from './payload';
import { GROUPS } from '../data/form-config';

function base(): FormState {
  return {
    ...EMPTY_FORM,
    company: { ...EMPTY_FORM.company, razonSocial: 'Acme S.A.' },
    selectedCountries: ['CL'],
  };
}

describe('groupDisplayLabel', () => {
  it('returns the standard label for named groups', () => {
    const g = GROUPS.find((x) => x.id === 'reg_cosmeticos')!;
    expect(groupDisplayLabel(g, 'irrelevant')).toBe('Cosméticos');
  });

  it('replaces the "otro_grupo" label with the custom name', () => {
    const g = GROUPS.find((x) => x.id === 'otro_grupo')!;
    expect(groupDisplayLabel(g, '  Reactivos in vitro  ')).toBe('Reactivos in vitro');
  });

  it('falls back to the generic label when the custom name is blank', () => {
    const g = GROUPS.find((x) => x.id === 'otro_grupo')!;
    expect(groupDisplayLabel(g, '   ')).toBe('Otro grupo');
  });
});

describe('buildRows', () => {
  it('returns [] when no groups are selected', () => {
    expect(buildRows(base())).toEqual([]);
  });

  it('emits one row per marked cell with ISO country code and categoria/subcategoria', () => {
    const f = base();
    f.selectedGroupIds = ['reg_cosmeticos'];
    f.matrices = {
      reg_cosmeticos: {
        [makeCellKey('Hosting/tenencia de registro', 'CL')]: 'directo',
        [makeCellKey('Consultoría regulatoria', 'CO')]: 'tercerizado',
      },
    };
    const rows = buildRows(f);
    expect(rows).toHaveLength(2);
    expect(rows).toContainEqual({
      categoria: 'Asuntos Regulatorios',
      subcategoria: 'Uso Humano',
      grupo: 'Cosméticos',
      servicio: 'Hosting/tenencia de registro',
      modalidad: 'Directo',
      paisAplicacion: 'CL',
    });
    expect(rows).toContainEqual({
      categoria: 'Asuntos Regulatorios',
      subcategoria: 'Uso Humano',
      grupo: 'Cosméticos',
      servicio: 'Consultoría regulatoria',
      modalidad: 'Tercerizado',
      paisAplicacion: 'CO',
    });
  });

  it('emits empty subcategoria for PI and Derecho Comercial', () => {
    const f = base();
    f.selectedGroupIds = ['pi', 'derecho_comercial'];
    f.matrices = {
      pi: { [makeCellKey('Patentes', 'AR')]: 'directo' },
      derecho_comercial: {
        [makeCellKey('Contratos comerciales', 'CO')]: 'tercerizado',
      },
    };
    const rows = buildRows(f);
    const piRow = rows.find((r) => r.grupo === 'Propiedad Intelectual')!;
    const dcRow = rows.find((r) => r.grupo === 'Derecho Comercial')!;
    expect(piRow.categoria).toBe('Propiedad Intelectual');
    expect(piRow.subcategoria).toBe('');
    expect(piRow.servicio).toBe('Patentes');
    expect(dcRow.categoria).toBe('Derecho Comercial');
    expect(dcRow.subcategoria).toBe('');
  });

  it('replaces "Otro grupo" with the custom group name in every row', () => {
    const f = base();
    f.selectedGroupIds = ['otro_grupo'];
    f.customGroupName = 'Reactivos in vitro';
    f.matrices = {
      otro_grupo: { [makeCellKey('Consultoría regulatoria', 'UY')]: 'tercerizado' },
    };
    expect(buildRows(f)[0].grupo).toBe('Reactivos in vitro');
  });

  it('ignores matrix data for groups the user has since de-selected', () => {
    const f = base();
    f.selectedGroupIds = ['reg_cosmeticos'];
    f.matrices = {
      reg_cosmeticos: { [makeCellKey('Hosting/tenencia de registro', 'CL')]: 'directo' },
      reg_alimentos: { [makeCellKey('Hosting/tenencia de registro', 'CL')]: 'directo' }, // stale
    };
    const rows = buildRows(f);
    expect(rows).toHaveLength(1);
    expect(rows[0].grupo).toBe('Cosméticos');
  });
});

describe('buildPayload', () => {
  it('bundles company and rows', () => {
    const f = base();
    f.selectedGroupIds = ['pi'];
    f.matrices = { pi: { [makeCellKey('Patentes', 'CL')]: 'directo' } };
    const p = buildPayload(f);
    expect(p.company.razonSocial).toBe('Acme S.A.');
    expect(p.rows).toHaveLength(1);
    expect(p.company.correosAdicionales).toEqual([]);
  });
});

describe('findSubmitBlockers', () => {
  it('flags when no groups are selected', () => {
    const codes = findSubmitBlockers(base()).map((b) => b.code);
    expect(codes).toContain('no-groups');
  });

  it('flags when no cells are marked in the selected groups', () => {
    const f = base();
    f.selectedGroupIds = ['reg_cosmeticos'];
    const codes = findSubmitBlockers(f).map((b) => b.code);
    expect(codes).toContain('no-cells');
  });

  it('flags "otro_grupo" selected without a custom name', () => {
    const f = base();
    f.selectedGroupIds = ['otro_grupo'];
    f.matrices = { otro_grupo: { [makeCellKey('Hosting', 'CL')]: 'directo' } };
    const codes = findSubmitBlockers(f).map((b) => b.code);
    expect(codes).toContain('otro-grupo-sin-nombre');
  });

  it('returns [] when the form is complete and consistent', () => {
    const f = base();
    f.selectedGroupIds = ['reg_cosmeticos'];
    f.matrices = {
      reg_cosmeticos: { [makeCellKey('Hosting/tenencia de registro', 'CL')]: 'directo' },
    };
    expect(findSubmitBlockers(f)).toEqual([]);
  });

  it('flags when no countries are selected', () => {
    const f = base();
    f.selectedCountries = [];
    f.selectedGroupIds = ['reg_cosmeticos'];
    const codes = findSubmitBlockers(f).map((b) => b.code);
    expect(codes).toContain('no-countries');
  });
});

describe('findStage1Blockers', () => {
  it('returns only stage-1 codes, ignoring no-cells', () => {
    const f = base();
    f.selectedCountries = [];
    f.selectedGroupIds = []; // triggers both no-countries and no-groups
    const codes = findStage1Blockers(f).map((b) => b.code);
    expect(codes).toContain('no-countries');
    expect(codes).toContain('no-groups');
    expect(codes).not.toContain('no-cells');
  });

  it('is clean once countries and groups are picked, even with no cells marked yet', () => {
    const f = base();
    f.selectedGroupIds = ['reg_cosmeticos'];
    expect(findStage1Blockers(f)).toEqual([]);
  });
});
