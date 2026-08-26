import { describe, expect, it } from 'vitest';
import worldTopoJson from 'world-atlas/countries-50m.json';
import {
  COUNTRIES,
  M49_TO_CODE2,
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

  it('has a global country universe (190–200 entries)', () => {
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(190);
    expect(COUNTRIES.length).toBeLessThanOrEqual(200);
  });

  it('includes the 12 legacy Sudamérica countries', () => {
    const sudamerica = countriesByRegion('Sudamérica').map((c) => c.code2).sort();
    expect(sudamerica).toEqual(
      ['AR', 'BO', 'BR', 'CL', 'CO', 'EC', 'GY', 'PY', 'PE', 'SR', 'UY', 'VE'].sort(),
    );
  });

  it('every region is non-empty', () => {
    for (const region of REGIONS) {
      expect(countriesByRegion(region).length).toBeGreaterThan(0);
    }
  });

  it('every country has a positive population', () => {
    for (const c of COUNTRIES) {
      expect(c.population).toBeGreaterThan(0);
    }
  });

  it('names within each region are sorted alphabetically', () => {
    for (const region of REGIONS) {
      const names = countriesByRegion(region).map((c) => c.nameEs);
      const sorted = [...names].sort((a, b) => a.localeCompare(b, 'es'));
      expect(names).toEqual(sorted);
    }
  });

  it('REGIONS display order puts the Americas first, granular', () => {
    expect(REGIONS).toEqual([
      'Sudamérica',
      'Centroamérica',
      'Caribe',
      'Norteamérica',
      'Europa',
      'Asia',
      'África',
      'Oceanía',
    ]);
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

describe('M49 mapping', () => {
  it('maps every COUNTRIES entry to at least one M49 code', () => {
    const covered = new Set(Object.values(M49_TO_CODE2));
    for (const c of COUNTRIES) {
      expect(covered.has(c.code2)).toBe(true);
    }
  });

  it('every M49 mapping resolves to a country in the world-atlas topojson', () => {
    const geoIds = new Set(
      (worldTopoJson.objects.countries.geometries as Array<{ id?: string }>)
        .map((g) => g.id)
        .filter((id): id is string => Boolean(id)),
    );
    for (const m49 of Object.keys(M49_TO_CODE2)) {
      expect(geoIds.has(m49)).toBe(true);
    }
  });
});
