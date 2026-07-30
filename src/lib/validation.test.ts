import { describe, expect, it } from 'vitest';
import { EMPTY_COMPANY } from '../types/form';
import { hasErrors, sanitizePhoneInput, validateCompany } from './validation';

const filled = {
  ...EMPTY_COMPANY,
  razonSocial: 'Acme S.A.',
  paisOrigen: 'Chile',
  contactoPrincipalNombre: 'María López',
  contactoPrincipalCorreo: 'maria@acme.cl',
};

describe('validateCompany', () => {
  it('flags all required fields when empty', () => {
    const e = validateCompany(EMPTY_COMPANY);
    expect(e.razonSocial).toBeDefined();
    expect(e.paisOrigen).toBeDefined();
    expect(e.contactoPrincipalNombre).toBeDefined();
    expect(e.contactoPrincipalCorreo).toBeDefined();
    expect(hasErrors(e)).toBe(true);
  });

  it('passes when required fields are filled and no optionals present', () => {
    expect(hasErrors(validateCompany(filled))).toBe(false);
  });

  it('rejects malformed principal email', () => {
    const e = validateCompany({ ...filled, contactoPrincipalCorreo: 'not-an-email' });
    expect(e.contactoPrincipalCorreo).toMatch(/correo/i);
  });

  it('rejects malformed regulatorio email but allows empty', () => {
    expect(
      validateCompany({ ...filled, contactoRegulatorioCorreo: '' }).contactoRegulatorioCorreo,
    ).toBeUndefined();
    expect(
      validateCompany({ ...filled, contactoRegulatorioCorreo: 'bad@' }).contactoRegulatorioCorreo,
    ).toBeDefined();
  });

  it('validates correosAdicionales per item', () => {
    // All valid
    expect(
      validateCompany({
        ...filled,
        correosAdicionales: ['a@b.co', 'c@d.co'],
      }).correosAdicionales,
    ).toBeUndefined();

    // One invalid → array with per-index errors, second entry defined
    const e = validateCompany({
      ...filled,
      correosAdicionales: ['a@b.co', 'not-an-email'],
    });
    expect(e.correosAdicionales).toBeDefined();
    expect(e.correosAdicionales![0]).toBeUndefined();
    expect(e.correosAdicionales![1]).toBeDefined();

    // Empty entry is an error ("remove or fill it")
    const e2 = validateCompany({
      ...filled,
      correosAdicionales: [''],
    });
    expect(e2.correosAdicionales![0]).toBeDefined();
  });

  it('allows an empty correosAdicionales array', () => {
    expect(
      validateCompany({ ...filled, correosAdicionales: [] }).correosAdicionales,
    ).toBeUndefined();
  });

  it('rejects nonsense year but allows empty', () => {
    expect(validateCompany({ ...filled, anioInicio: '' }).anioInicio).toBeUndefined();
    expect(validateCompany({ ...filled, anioInicio: '1700' }).anioInicio).toBeDefined();
    expect(validateCompany({ ...filled, anioInicio: '9999' }).anioInicio).toBeDefined();
    expect(validateCompany({ ...filled, anioInicio: '1998' }).anioInicio).toBeUndefined();
  });

  it('rejects negative or fractional employee counts', () => {
    expect(validateCompany({ ...filled, numEmpleados: '-3' }).numEmpleados).toBeDefined();
    expect(validateCompany({ ...filled, numEmpleados: '3.5' }).numEmpleados).toBeDefined();
    expect(validateCompany({ ...filled, numEmpleados: '25' }).numEmpleados).toBeUndefined();
  });

  it('trims whitespace when checking required fields', () => {
    expect(validateCompany({ ...filled, razonSocial: '   ' }).razonSocial).toBeDefined();
  });
});

describe('sanitizePhoneInput', () => {
  it('strips letters and other non-phone characters', () => {
    expect(sanitizePhoneInput('abc123def456')).toBe('123456');
  });

  it('keeps digits, spaces, plus, minus, parentheses', () => {
    expect(sanitizePhoneInput('+57 (1) 555-1234')).toBe('+57 (1) 555-1234');
  });

  it('is a no-op on already-clean input', () => {
    expect(sanitizePhoneInput('123456789')).toBe('123456789');
  });

  it('returns empty string when everything is stripped', () => {
    expect(sanitizePhoneInput('abc')).toBe('');
  });
});
