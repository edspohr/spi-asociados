import { describe, expect, it } from 'vitest';
import { EMPTY_COMPANY } from '../types/form';
import { hasErrors, validateCompany } from './validation';

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

  it('rejects malformed correoAdicional but allows empty', () => {
    expect(validateCompany({ ...filled, correoAdicional: '' }).correoAdicional).toBeUndefined();
    expect(validateCompany({ ...filled, correoAdicional: 'x@y' }).correoAdicional).toBeDefined();
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
