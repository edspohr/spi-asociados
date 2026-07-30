import { describe, expect, it } from 'vitest';
import { EMPTY_FORM, makeCellKey, type FormState } from '../types/form';
import { buildRows, buildPayload, findSubmitBlockers, groupDisplayLabel } from './payload';
import { GROUPS } from '../data/form-config';

function base(): FormState {
  return {
    ...EMPTY_FORM,
    company: { ...EMPTY_FORM.company, razonSocial: 'Acme S.A.' },
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

  it('emits one row per marked cell with categoria/subcategoria', () => {
    const f = base();
    f.selectedGroupIds = ['reg_cosmeticos'];
    f.matrices = {
      reg_cosmeticos: {
        [makeCellKey('Hosting/tenencia de registro', 'Chile')]: 'directo',
        [makeCellKey('Consultoría regulatoria', 'Colombia')]: 'tercerizado',
      },
    };
    const rows = buildRows(f);
    expect(rows).toHaveLength(2);
    expect(rows).toContainEqual({
      categoria: 'Asuntos Regulatorios',
      subcategoria: 'Uso Humano',
      grupo: 'Cosméticos',
      servicio: 'Hosting/tenencia de registro',
      servicioOtroDetalle: '',
      modalidad: 'Directo',
      paisAplicacion: 'Chile',
    });
    expect(rows).toContainEqual({
      categoria: 'Asuntos Regulatorios',
      subcategoria: 'Uso Humano',
      grupo: 'Cosméticos',
      servicio: 'Consultoría regulatoria',
      servicioOtroDetalle: '',
      modalidad: 'Tercerizado',
      paisAplicacion: 'Colombia',
    });
  });

  it('emits empty subcategoria for PI and Derecho Comercial', () => {
    const f = base();
    f.selectedGroupIds = ['pi', 'derecho_comercial'];
    f.matrices = {
      pi: { [makeCellKey('Patentes', 'Argentina')]: 'directo' },
      derecho_comercial: {
        [makeCellKey('Contratos comerciales', 'Colombia')]: 'tercerizado',
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

  it('fills servicioOtroDetalle on "Otros" (plural) and "Otro" (singular)', () => {
    const f = base();
    f.selectedGroupIds = ['reg_cosmeticos', 'otro_grupo'];
    f.customGroupName = 'Reactivos in vitro';
    f.matrices = {
      reg_cosmeticos: { [makeCellKey('Otros', 'Brasil')]: 'directo' },
      otro_grupo: { [makeCellKey('Otro', 'Brasil')]: 'directo' },
    };
    f.otherServiceDetail = {
      reg_cosmeticos: 'Estudios de estabilidad',
      otro_grupo: 'Servicio X',
    };
    const rows = buildRows(f);
    const regRow = rows.find((r) => r.grupo === 'Cosméticos')!;
    const otroRow = rows.find((r) => r.grupo === 'Reactivos in vitro')!;
    expect(regRow.servicioOtroDetalle).toBe('Estudios de estabilidad');
    expect(otroRow.servicioOtroDetalle).toBe('Servicio X');
  });

  it('replaces "Otro grupo" with the custom group name in every row', () => {
    const f = base();
    f.selectedGroupIds = ['otro_grupo'];
    f.customGroupName = 'Reactivos in vitro';
    f.matrices = {
      otro_grupo: { [makeCellKey('Consultoría regulatoria', 'Uruguay')]: 'tercerizado' },
    };
    expect(buildRows(f)[0].grupo).toBe('Reactivos in vitro');
  });

  it('ignores matrix data for groups the user has since de-selected', () => {
    const f = base();
    f.selectedGroupIds = ['reg_cosmeticos'];
    f.matrices = {
      reg_cosmeticos: { [makeCellKey('Hosting/tenencia de registro', 'Chile')]: 'directo' },
      reg_alimentos: { [makeCellKey('Hosting/tenencia de registro', 'Chile')]: 'directo' }, // stale
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
    f.matrices = { pi: { [makeCellKey('Patentes', 'Chile')]: 'directo' } };
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
    f.matrices = { otro_grupo: { [makeCellKey('Hosting', 'Chile')]: 'directo' } };
    const codes = findSubmitBlockers(f).map((b) => b.code);
    expect(codes).toContain('otro-grupo-sin-nombre');
  });

  it('flags "Otros" (plural) service marked without a detail', () => {
    const f = base();
    f.selectedGroupIds = ['reg_cosmeticos'];
    f.matrices = { reg_cosmeticos: { [makeCellKey('Otros', 'Chile')]: 'directo' } };
    const codes = findSubmitBlockers(f).map((b) => b.code);
    expect(codes.some((c) => c.startsWith('otro-servicio-sin-detalle:'))).toBe(true);
  });

  it('flags "Otro" (singular) service marked without a detail', () => {
    const f = base();
    f.selectedGroupIds = ['otro_grupo'];
    f.customGroupName = 'X';
    f.matrices = { otro_grupo: { [makeCellKey('Otro', 'Chile')]: 'directo' } };
    const codes = findSubmitBlockers(f).map((b) => b.code);
    expect(codes.some((c) => c.startsWith('otro-servicio-sin-detalle:'))).toBe(true);
  });

  it('returns [] when the form is complete and consistent', () => {
    const f = base();
    f.selectedGroupIds = ['reg_cosmeticos'];
    f.matrices = {
      reg_cosmeticos: { [makeCellKey('Hosting/tenencia de registro', 'Chile')]: 'directo' },
    };
    expect(findSubmitBlockers(f)).toEqual([]);
  });
});
