import type { Country } from '../data/form-config';

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
 * Matrix state per group. Key is `${serviceLabel}::${country}`.
 * Only non-empty states are stored.
 */
export type GroupMatrix = Record<string, Exclude<CellState, 'empty'>>;

export type FormState = {
  company: CompanyInfo;
  selectedGroupIds: string[];
  customGroupName: string;
  matrices: Record<string, GroupMatrix>;
  otherServiceDetail: Record<string, string>;
};

export const EMPTY_FORM: FormState = {
  company: EMPTY_COMPANY,
  selectedGroupIds: [],
  customGroupName: '',
  matrices: {},
  otherServiceDetail: {},
};

export function makeCellKey(service: string, country: Country): string {
  return `${service}::${country}`;
}
