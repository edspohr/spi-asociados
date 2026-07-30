import { describe, expect, it } from 'vitest';
import {
  COUNTRIES,
  REGIONS,
  countriesByRegion,
  countryName,
  findCountry,
  findCountryByCode3,
} from './countries';

describe('COUNTRIES', () => {
  it('has unique alpha-2 codes', () => {
    const codes = COUNTRIES.map((c) => c.code2);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('has unique alpha-3 codes', () => {
    const codes = COUNTRIES.map((c) => c.code3);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('every code2 is exactly 2 uppercase letters', () => {
    for (const c of COUNTRIES) {
      expect(c.code2).toMatch(/^[A-Z]{2}$/);
    }
  });

  it('every code3 is exactly 3 uppercase letters', () => {
    for (const c of COUNTRIES) {
      expect(c.code3).toMatch(/^[A-Z]{3}$/);
    }
  });

  it('every country has a non-empty Spanish name and a known region', () => {
    for (const c of COUNTRIES) {
      expect(c.nameEs.trim().length).toBeGreaterThan(0);
      expect(REGIONS).toContain(c.region);
    }
  });

  it('includes the 12 legacy Sudamérica countries', () => {
    const sudamerica = countriesByRegion('Sudamérica').map((c) => c.code2).sort();
    expect(sudamerica).toEqual(
      ['AR', 'BO', 'BR', 'CL', 'CO', 'EC', 'GY', 'PY', 'PE', 'SR', 'UY', 'VE'].sort(),
    );
  });
});

describe('lookups', () => {
  it('findCountry resolves by alpha-2 code', () => {
    expect(findCountry('CO')?.nameEs).toBe('Colombia');
    expect(findCountry('ZZ')).toBeUndefined();
  });

  it('findCountryByCode3 resolves by alpha-3 code', () => {
    expect(findCountryByCode3('COL')?.code2).toBe('CO');
    expect(findCountryByCode3('ZZZ')).toBeUndefined();
  });

  it('countryName returns the Spanish name or the code as fallback', () => {
    expect(countryName('AR')).toBe('Argentina');
    expect(countryName('XX')).toBe('XX');
  });
});
