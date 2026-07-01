import type { CompanyErrors, CompanyInfo } from '../types/form';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REQUIRED_FIELDS: Array<keyof CompanyInfo> = [
  'razonSocial',
  'paisOrigen',
  'contactoPrincipalNombre',
  'contactoPrincipalCorreo',
];

const EMAIL_FIELDS: Array<keyof CompanyInfo> = [
  'contactoPrincipalCorreo',
  'contactoRegulatorioCorreo',
  'correoAdicional',
];

const YEAR_FIELDS: Array<keyof CompanyInfo> = ['anioInicio'];
const NUMBER_FIELDS: Array<keyof CompanyInfo> = ['numEmpleados'];

const MSG_REQUIRED = 'Este campo es obligatorio.';
const MSG_EMAIL = 'Ingrese un correo electrónico válido.';
const MSG_YEAR = 'Ingrese un año válido (por ejemplo, 1998).';
const MSG_NUMBER = 'Ingrese un número válido.';

export function validateCompany(company: CompanyInfo): CompanyErrors {
  const errors: CompanyErrors = {};

  for (const field of REQUIRED_FIELDS) {
    if (!company[field].trim()) {
      errors[field] = MSG_REQUIRED;
    }
  }

  for (const field of EMAIL_FIELDS) {
    const value = company[field].trim();
    if (!value) continue;
    if (!EMAIL_RE.test(value)) {
      errors[field] = MSG_EMAIL;
    }
  }

  for (const field of YEAR_FIELDS) {
    const value = company[field].trim();
    if (!value) continue;
    const n = Number(value);
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(n) || n < 1800 || n > currentYear) {
      errors[field] = MSG_YEAR;
    }
  }

  for (const field of NUMBER_FIELDS) {
    const value = company[field].trim();
    if (!value) continue;
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
      errors[field] = MSG_NUMBER;
    }
  }

  return errors;
}

export function hasErrors(errors: CompanyErrors): boolean {
  return Object.keys(errors).length > 0;
}
