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
    const g = GROUPS.find((x) => x.id === 'cosmeticos')!;
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

  it('emits one row per marked cell in a multi-row group', () => {
    const f = base();
    f.selectedGroupIds = ['cosmeticos'];
    f.matrices = {
      cosmeticos: {
        [makeCellKey('HOSTING', 'Chile')]: 'directo',
        [makeCellKey('HOSTING', 'Perú')]: 'tercerizado',
        [makeCellKey('CONSULTORIA', 'Colombia')]: 'directo',
      },
    };
    const rows = buildRows(f);
    expect(rows).toHaveLength(3);
    expect(rows).toContainEqual({
      grupo: 'Cosméticos',
      servicio: 'Hosting',
      servicioOtroDetalle: '',
      modalidad: 'Directo',
      paisAplicacion: 'Chile',
    });
    expect(rows).toContainEqual({
      grupo: 'Cosméticos',
      servicio: 'Hosting',
      servicioOtroDetalle: '',
      modalidad: 'Tercerizado',
      paisAplicacion: 'Perú',
    });
    expect(rows).toContainEqual({
      grupo: 'Cosméticos',
      servicio: 'Consultoría regulatoria',
      servicioOtroDetalle: '',
      modalidad: 'Directo',
      paisAplicacion: 'Colombia',
    });
  });

  it('emits servicio:"" for single-row groups (Propiedad Intelectual)', () => {
    const f = base();
    f.selectedGroupIds = ['propiedad_intelectual'];
    f.matrices = {
      propiedad_intelectual: {
        [makeCellKey('', 'Argentina')]: 'directo',
      },
    };
    expect(buildRows(f)).toEqual([
      {
        grupo: 'Propiedad Intelectual',
        servicio: '',
        servicioOtroDetalle: '',
        modalidad: 'Directo',
        paisAplicacion: 'Argentina',
      },
    ]);
  });

  it('fills servicioOtroDetalle only on OTRO rows and only for that group', () => {
    const f = base();
    f.selectedGroupIds = ['cosmeticos', 'medicamentos'];
    f.matrices = {
      cosmeticos: { [makeCellKey('OTRO', 'Brasil')]: 'directo' },
      medicamentos: { [makeCellKey('HOSTING', 'Brasil')]: 'tercerizado' },
    };
    f.otherServiceDetail = {
      cosmeticos: 'Estudios de estabilidad',
      medicamentos: 'no debería aparecer',
    };
    const rows = buildRows(f);
    const otroRow = rows.find((r) => r.grupo === 'Cosméticos')!;
    const hostingRow = rows.find((r) => r.grupo === 'Medicamentos')!;
    expect(otroRow.servicioOtroDetalle).toBe('Estudios de estabilidad');
    expect(hostingRow.servicioOtroDetalle).toBe('');
  });

  it('replaces "Otro grupo" with the custom group name in every row', () => {
    const f = base();
    f.selectedGroupIds = ['otro_grupo'];
    f.customGroupName = 'Reactivos in vitro';
    f.matrices = {
      otro_grupo: { [makeCellKey('CONSULTORIA', 'Uruguay')]: 'tercerizado' },
    };
    expect(buildRows(f)[0].grupo).toBe('Reactivos in vitro');
  });

  it('ignores matrix data for groups the user has since de-selected', () => {
    const f = base();
    f.selectedGroupIds = ['cosmeticos'];
    f.matrices = {
      cosmeticos: { [makeCellKey('HOSTING', 'Chile')]: 'directo' },
      alimentos: { [makeCellKey('HOSTING', 'Chile')]: 'directo' }, // stale
    };
    const rows = buildRows(f);
    expect(rows).toHaveLength(1);
    expect(rows[0].grupo).toBe('Cosméticos');
  });
});

describe('buildPayload', () => {
  it('bundles company and rows', () => {
    const f = base();
    f.selectedGroupIds = ['propiedad_intelectual'];
    f.matrices = { propiedad_intelectual: { [makeCellKey('', 'Chile')]: 'directo' } };
    const p = buildPayload(f);
    expect(p.company.razonSocial).toBe('Acme S.A.');
    expect(p.rows).toHaveLength(1);
  });
});

describe('findSubmitBlockers', () => {
  it('flags when no groups are selected', () => {
    const codes = findSubmitBlockers(base()).map((b) => b.code);
    expect(codes).toContain('no-groups');
  });

  it('flags when no cells are marked in the selected groups', () => {
    const f = base();
    f.selectedGroupIds = ['cosmeticos'];
    const codes = findSubmitBlockers(f).map((b) => b.code);
    expect(codes).toContain('no-cells');
  });

  it('flags "otro_grupo" selected without a custom name', () => {
    const f = base();
    f.selectedGroupIds = ['otro_grupo'];
    f.matrices = { otro_grupo: { [makeCellKey('HOSTING', 'Chile')]: 'directo' } };
    const codes = findSubmitBlockers(f).map((b) => b.code);
    expect(codes).toContain('otro-grupo-sin-nombre');
  });

  it('flags OTRO service marked without a detail', () => {
    const f = base();
    f.selectedGroupIds = ['cosmeticos'];
    f.matrices = { cosmeticos: { [makeCellKey('OTRO', 'Chile')]: 'directo' } };
    const codes = findSubmitBlockers(f).map((b) => b.code);
    expect(codes.some((c) => c.startsWith('otro-servicio-sin-detalle:'))).toBe(true);
  });

  it('returns [] when the form is complete and consistent', () => {
    const f = base();
    f.selectedGroupIds = ['cosmeticos'];
    f.matrices = { cosmeticos: { [makeCellKey('HOSTING', 'Chile')]: 'directo' } };
    expect(findSubmitBlockers(f)).toEqual([]);
  });
});
