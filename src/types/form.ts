import type { CountryCode } from '../data/countries';

export type CompanyInfo = {
  razonSocial: string;
  dba: string;
  paisOrigen: string;
  anioInicio: string;
  numEmpleados: string;
  repLegal: string;
  contactoPrincipalNombre: string;
  contactoPrincipalCorreo: string;
  contactoPrincipalTelefono: string;
  contactoRegulatorioNombre: string;
  contactoRegulatorioCorreo: string;
  contactoRegulatorioTelefono: string;
  correosAdicionales: string[];
};

export const EMPTY_COMPANY: CompanyInfo = {
  razonSocial: '',
  dba: '',
  paisOrigen: '',
  anioInicio: '',
  numEmpleados: '',
  repLegal: '',
  contactoPrincipalNombre: '',
  contactoPrincipalCorreo: '',
  contactoPrincipalTelefono: '',
  contactoRegulatorioNombre: '',
  contactoRegulatorioCorreo: '',
  contactoRegulatorioTelefono: '',
  correosAdicionales: [],
};

export type CompanyErrors = Partial<Record<Exclude<keyof CompanyInfo, 'correosAdicionales'>, string>> & {
  correosAdicionales?: Array<string | undefined>;
};

export type CellState = 'empty' | 'directo' | 'tercerizado';

/**
 * Matrix state per group. Key is `${serviceLabel}::${countryCode}` where
 * countryCode is the ISO 3166-1 alpha-2 code (e.g. "AR", "CO", "US").
 * Only non-empty states are stored.
 */
export type GroupMatrix = Record<string, Exclude<CellState, 'empty'>>;

export type FormState = {
  company: CompanyInfo;
  /** ISO alpha-2 codes of every country the associate operates in. Drives which
   * columns render in stage 2 — the matrices only show these countries. */
  selectedCountries: CountryCode[];
  selectedGroupIds: string[];
  customGroupName: string;
  matrices: Record<string, GroupMatrix>;
};

export const EMPTY_FORM: FormState = {
  company: EMPTY_COMPANY,
  selectedCountries: [],
  selectedGroupIds: [],
  customGroupName: '',
  matrices: {},
};

export function makeCellKey(service: string, country: CountryCode): string {
  return `${service}::${country}`;
}

export function parseCellKey(key: string): { service: string; country: CountryCode } {
  const idx = key.indexOf('::');
  if (idx === -1) return { service: '', country: key };
  return { service: key.slice(0, idx), country: key.slice(idx + 2) };
}
