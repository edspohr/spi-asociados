import { describe, expect, it } from 'vitest';
import { CATEGORIES } from '../data/form-config';
import { COUNTRIES, REGIONS } from '../data/countries';
import { countryLabel, hasEnglishLabel, label, regionLabel } from './labels';
import { STRINGS } from './strings';

function allFormLabels(): string[] {
  const out = new Set<string>();
  for (const cat of CATEGORIES) {
    out.add(cat.label);
    const groups = [...(cat.groups ?? []), ...(cat.subcategories ?? []).flatMap((s) => s.groups)];
    for (const sub of cat.subcategories ?? []) out.add(sub.label);
    for (const g of groups) {
      out.add(g.label);
      g.services.forEach((s) => out.add(s));
    }
  }
  return Array.from(out);
}

describe('labels', () => {
  it('has an English translation for every category, group and service label', () => {
    const missing = allFormLabels().filter((l) => !hasEnglishLabel(l));
    expect(missing).toEqual([]);
  });

  it('returns the Spanish label untouched in Spanish', () => {
    expect(label('Patentes', 'es')).toBe('Patentes');
    expect(label('Patentes', 'en')).toBe('Patents');
  });

  it('falls back to the input for unknown labels (e.g. custom group names)', () => {
    expect(label('Mi grupo', 'en')).toBe('Mi grupo');
  });

  it('translates every region and resolves every country name in English', () => {
    for (const r of REGIONS) expect(regionLabel(r, 'en')).not.toBe('');
    for (const c of COUNTRIES) expect(countryLabel(c.code2, 'en')).toBeTruthy();
    expect(countryLabel('DE', 'en')).toBe('Germany');
    expect(countryLabel('DE', 'es')).toBe('Alemania');
  });
});

describe('strings', () => {
  it('has the same keys in both languages', () => {
    expect(Object.keys(STRINGS.en).sort()).toEqual(Object.keys(STRINGS.es).sort());
    expect(Object.keys(STRINGS.en.blockers).sort()).toEqual(
      Object.keys(STRINGS.es.blockers).sort(),
    );
  });
});
