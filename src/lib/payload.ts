import {
  GROUPS,
  SERVICE_LABELS,
  type Country,
  type Group,
  type ServiceKey,
} from '../data/form-config';
import type { CellState, FormState, GroupMatrix } from '../types/form';

export type SubmissionRow = {
  grupo: string;
  servicio: string;
  servicioOtroDetalle: string;
  modalidad: 'Directo' | 'Tercerizado';
  paisAplicacion: Country;
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
 * label when the field is blank so the Sheet still records something.
 */
export function groupDisplayLabel(group: Group, customGroupName: string): string {
  if (group.id === 'otro_grupo') {
    const trimmed = customGroupName.trim();
    return trimmed || group.label;
  }
  return group.label;
}

/**
 * Parse a matrix key back into (service, country). Single-row groups store the
 * service as an empty string, which we preserve on the way out.
 */
function parseCellKey(key: string): { service: ServiceKey | ''; country: string } {
  const idx = key.indexOf('::');
  if (idx === -1) return { service: '', country: key };
  const rawService = key.slice(0, idx);
  const country = key.slice(idx + 2);
  return { service: rawService === '' ? '' : (rawService as ServiceKey), country };
}

/**
 * Build the flat, long-format rows[] that the Google Sheet expects: one row per
 * marked (group × service × country) cell. Iterates only groups the user
 * currently has selected, so accidental toggles that leave stale matrix data
 * behind never leak into the submission.
 */
export function buildRows(form: FormState): SubmissionRow[] {
  const rows: SubmissionRow[] = [];

  for (const groupId of form.selectedGroupIds) {
    const group = GROUPS.find((g) => g.id === groupId);
    if (!group) continue;

    const matrix: GroupMatrix = form.matrices[groupId] ?? {};
    const grupo = groupDisplayLabel(group, form.customGroupName);
    const otherDetail = (form.otherServiceDetail[groupId] ?? '').trim();

    for (const [key, state] of Object.entries(matrix)) {
      if (state !== 'directo' && state !== 'tercerizado') continue;
      const { service, country } = parseCellKey(key);

      const servicio = service ? SERVICE_LABELS[service] : '';
      const servicioOtroDetalle = service === 'OTRO' ? otherDetail : '';

      rows.push({
        grupo,
        servicio,
        servicioOtroDetalle,
        modalidad: MODALIDAD[state],
        paisAplicacion: country as Country,
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

  // OTRO service marked but no detail supplied — for every affected group
  for (const groupId of form.selectedGroupIds) {
    const matrix = form.matrices[groupId] ?? {};
    const hasOtro = Object.keys(matrix).some((k) => k.startsWith('OTRO::'));
    const detail = (form.otherServiceDetail[groupId] ?? '').trim();
    if (hasOtro && !detail) {
      const g = GROUPS.find((x) => x.id === groupId);
      const label = g ? groupDisplayLabel(g, form.customGroupName) : groupId;
      blockers.push({
        code: `otro-servicio-sin-detalle:${groupId}`,
        message: `Describa el “Otro” servicio marcado en ${label}.`,
      });
    }
  }

  return blockers;
}
