import type { CompanyErrors, CompanyInfo } from '../types/form';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type StringField = Exclude<keyof CompanyInfo, 'correosAdicionales'>;

const REQUIRED_FIELDS: StringField[] = [
  'razonSocial',
  'paisOrigen',
  'contactoPrincipalNombre',
  'contactoPrincipalCorreo',
];

const EMAIL_FIELDS: StringField[] = [
  'contactoPrincipalCorreo',
  'contactoRegulatorioCorreo',
];

const YEAR_FIELDS: StringField[] = ['anioInicio'];
const NUMBER_FIELDS: StringField[] = ['numEmpleados'];

const MSG_REQUIRED = 'Este campo es obligatorio.';
const MSG_EMAIL = 'Ingrese un correo electrónico válido.';
const MSG_EMAIL_OR_REMOVE = 'Ingrese un correo o elimine este campo.';
const MSG_YEAR = 'Ingrese un año válido (por ejemplo, 1998).';
const MSG_NUMBER = 'Ingrese un número válido.';

export const PHONE_ALLOWED_RE = /^[0-9+\-\s()]*$/;

/**
 * Strip characters that aren't part of a phone number as-typed.
 * Used as an input mask — invalid chars simply don't appear.
 */
export function sanitizePhoneInput(v: string): string {
  return v.replace(/[^0-9+\-\s()]/g, '');
}

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

  const perEmail = company.correosAdicionales.map((raw): string | undefined => {
    const v = raw.trim();
    if (!v) return MSG_EMAIL_OR_REMOVE;
    if (!EMAIL_RE.test(v)) return MSG_EMAIL;
    return undefined;
  });
  if (perEmail.some(Boolean)) {
    errors.correosAdicionales = perEmail;
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
