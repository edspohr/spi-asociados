import { GROUPS, type Group } from '../data/form-config';
import type { CountryCode } from '../data/countries';
import type { CellState, FormState, GroupMatrix } from '../types/form';
import { findGroupContext } from '../data/form-config';
import { parseCellKey } from '../types/form';

export type SubmissionRow = {
  categoria: string;
  subcategoria: string;
  grupo: string;
  servicio: string;
  modalidad: 'Directo' | 'Tercerizado';
  paisAplicacion: CountryCode;
};

export type SubmissionPayload = {
  company: FormState['company'];
  rows: SubmissionRow[];
};

const MODALIDAD: Record<Exclude<CellState, 'empty'>, SubmissionRow['modalidad']> = {
  directo: 'Directo',
  tercerizado: 'Tercerizado',
};

/**
 * Returns the human-facing group label. For "otro_grupo" the user-supplied
 * custom name replaces the generic "Otro grupo" — falling back to the generic
 * label when the field is blank so the destination still records something.
 */
export function groupDisplayLabel(group: Group, customGroupName: string): string {
  if (group.id === 'otro_grupo') {
    const trimmed = customGroupName.trim();
    return trimmed || group.label;
  }
  return group.label;
}

/**
 * Build the flat, long-format rows[] the backend expects: one row per marked
 * (group × service × country) cell. Iterates only groups the user currently has
 * selected, so accidental toggles that leave stale matrix data behind never
 * leak into the submission.
 */
export function buildRows(form: FormState): SubmissionRow[] {
  const rows: SubmissionRow[] = [];

  for (const groupId of form.selectedGroupIds) {
    const group = GROUPS.find((g) => g.id === groupId);
    if (!group) continue;

    const ctx = findGroupContext(groupId);
    const categoria = ctx?.category.label ?? '';
    const subcategoria = ctx?.subcategory?.label ?? '';

    const matrix: GroupMatrix = form.matrices[groupId] ?? {};
    const grupo = groupDisplayLabel(group, form.customGroupName);

    for (const [key, state] of Object.entries(matrix)) {
      if (state !== 'directo' && state !== 'tercerizado') continue;
      const { service, country } = parseCellKey(key);

      rows.push({
        categoria,
        subcategoria,
        grupo,
        servicio: service,
        modalidad: MODALIDAD[state],
        paisAplicacion: country,
      });
    }
  }

  return rows;
}

export function buildPayload(form: FormState): SubmissionPayload {
  return { company: form.company, rows: buildRows(form) };
}

/**
 * Cross-form validation used by the review step. Returns Spanish messages so
 * the review screen can render them directly.
 */
export type SubmitBlocker = { code: string; message: string };

export function findSubmitBlockers(form: FormState): SubmitBlocker[] {
  const blockers: SubmitBlocker[] = [];

  if (form.selectedCountries.length === 0) {
    blockers.push({
      code: 'no-countries',
      message: 'Seleccione al menos un país de operación.',
    });
  }

  if (form.selectedGroupIds.length === 0) {
    blockers.push({
      code: 'no-groups',
      message: 'Seleccione al menos un grupo de producto.',
    });
  }

  if (form.selectedGroupIds.includes('otro_grupo') && !form.customGroupName.trim()) {
    blockers.push({
      code: 'otro-grupo-sin-nombre',
      message: 'Indique el nombre del “Otro grupo”.',
    });
  }

  const rows = buildRows(form);
  if (rows.length === 0 && form.selectedGroupIds.length > 0) {
    blockers.push({
      code: 'no-cells',
      message: 'Marque al menos una celda en las matrices seleccionadas.',
    });
  }

  return blockers;
}

/**
 * Blockers that must be resolved before advancing past stage 1 (company +
 * countries + groups). Subset of `findSubmitBlockers` restricted to stage-1
 * concerns — used to enable/disable the "Continuar" button.
 */
export function findStage1Blockers(form: FormState): SubmitBlocker[] {
  return findSubmitBlockers(form).filter(
    (b) => b.code === 'no-countries' || b.code === 'no-groups' || b.code === 'otro-grupo-sin-nombre',
  );
}
