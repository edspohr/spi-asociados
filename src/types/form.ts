import type { Country, ServiceKey } from '../data/form-config';

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
  correoAdicional: string;
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
  correoAdicional: '',
};

export type CompanyErrors = Partial<Record<keyof CompanyInfo, string>>;

export type CellState = 'empty' | 'directo' | 'tercerizado';

/**
 * Matrix state per group. Key is `${serviceKey}::${country}`; single-row groups
 * use `::${country}` (empty service). Only non-empty states are stored.
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

export function makeCellKey(service: ServiceKey | '', country: Country): string {
  return `${service}::${country}`;
}
