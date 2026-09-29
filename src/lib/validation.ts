import type { CompanyErrors, CompanyInfo } from '../types/form';
import { STRINGS, type Strings } from '../i18n/strings';

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

export const PHONE_ALLOWED_RE = /^[0-9+\-\s()]*$/;

/**
 * Strip characters that aren't part of a phone number as-typed.
 * Used as an input mask — invalid chars simply don't appear.
 */
export function sanitizePhoneInput(v: string): string {
  return v.replace(/[^0-9+\-\s()]/g, '');
}

export function validateCompany(
  company: CompanyInfo,
  messages: Strings['validation'] = STRINGS.es.validation,
): CompanyErrors {
  const errors: CompanyErrors = {};

  for (const field of REQUIRED_FIELDS) {
    if (!company[field].trim()) {
      errors[field] = messages.required;
    }
  }

  for (const field of EMAIL_FIELDS) {
    const value = company[field].trim();
    if (!value) continue;
    if (!EMAIL_RE.test(value)) {
      errors[field] = messages.email;
    }
  }

  const perEmail = company.correosAdicionales.map((raw): string | undefined => {
    const v = raw.trim();
    if (!v) return messages.emailOrRemove;
    if (!EMAIL_RE.test(v)) return messages.email;
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
      errors[field] = messages.year;
    }
  }

  for (const field of NUMBER_FIELDS) {
    const value = company[field].trim();
    if (!value) continue;
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
      errors[field] = messages.number;
    }
  }

  return errors;
}

export function hasErrors(errors: CompanyErrors): boolean {
  return Object.keys(errors).length > 0;
}
