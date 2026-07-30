import type { AssociateDoc } from './types';
import type { SubmissionRow } from '../lib/payload';
import { countryName } from '../data/countries';

/**
 * Serialize filtered rows to CSV. One row per (associate × marked cell), so
 * the file is directly consumable by Excel/Sheets pivot tables. Country codes
 * are expanded to Spanish names, but the ISO code is kept in a separate
 * column for scripting.
 */
export function toCsv(
  rows: Array<{ associate: AssociateDoc; row: SubmissionRow }>,
): string {
  const header = [
    'razon_social',
    'contacto_correo',
    'contacto_nombre',
    'pais_origen',
    'categoria',
    'subcategoria',
    'grupo',
    'servicio',
    'modalidad',
    'pais_iso',
    'pais_nombre',
    'submitted_at',
  ];
  const out: string[] = [header.map(csvCell).join(',')];
  for (const { associate, row } of rows) {
    const c = associate.company;
    out.push(
      [
        c.razonSocial,
        c.contactoPrincipalCorreo,
        c.contactoPrincipalNombre,
        c.paisOrigen,
        row.categoria,
        row.subcategoria,
        row.grupo,
        row.servicio,
        row.modalidad,
        row.paisAplicacion,
        countryName(row.paisAplicacion),
        associate.submittedAt ?? '',
      ]
        .map(csvCell)
        .join(','),
    );
  }
  return out.join('\n');
}

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

/** Trigger a browser download for the given CSV string. Safe to call from
 *  any event handler. */
export function downloadCsv(filename: string, csv: string): void {
  // Prepend UTF-8 BOM so Excel opens the file with the correct encoding.
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
