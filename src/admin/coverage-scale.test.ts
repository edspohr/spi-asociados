import { describe, expect, it } from 'vitest';
import {
  bucketFor,
  coverageBuckets,
  populationCovered,
} from './coverage-scale';

describe('coverageBuckets', () => {
  it('collapses to only "sin cobertura" when the universe is empty', () => {
    const b = coverageBuckets(0);
    expect(b).toHaveLength(1);
    expect(b[0].id).toBe('sin_cobertura');
    expect(b[0].min).toBe(0);
    expect(b[0].max).toBe(0);
  });

  it('adds "un_solo" once a count of 1 is possible', () => {
    const b = coverageBuckets(1);
    expect(b.map((x) => x.id)).toEqual(['sin_cobertura', 'un_solo']);
    expect(b[1].min).toBe(1);
    expect(b[1].max).toBe(1);
  });

  it('collapses to a single "2+" tier when maxCount is 2', () => {
    const b = coverageBuckets(2);
    expect(b.map((x) => x.id)).toEqual(['sin_cobertura', 'un_solo', 'tier_1']);
    expect(b[2].min).toBe(2);
    expect(b[2].max).toBeNull();
  });

  it('uses two extra tiers when maxCount ≤ 4', () => {
    const b = coverageBuckets(4);
    expect(b).toHaveLength(4);
    expect(b[2].min).toBe(2);
    expect(b[3].max).toBeNull();
  });

  it('uses three extra tiers when maxCount ≥ 5', () => {
    const b = coverageBuckets(10);
    expect(b).toHaveLength(5);
    expect(b[4].max).toBeNull();
  });

  it('produces contiguous, monotonic ranges with no gaps or overlaps', () => {
    for (const maxCount of [0, 1, 2, 3, 4, 5, 6, 7, 10, 25]) {
      const b = coverageBuckets(maxCount);
      for (let i = 1; i < b.length; i++) {
        const prev = b[i - 1];
        expect(prev.max).not.toBeNull();
        expect(prev.max as number).toBeLessThan(b[i].min);
        expect((prev.max as number) + 1).toBe(b[i].min);
      }
      // Top bucket is open-ended whenever coverage above 1 is possible.
      if (maxCount >= 2) expect(b[b.length - 1].max).toBeNull();
    }
  });

  it('assigns light text on the darker blue tiers', () => {
    const b = coverageBuckets(20);
    // The top tier is the darkest blue in the ramp.
    expect(b[b.length - 1].textOnColor).toBe('light');
    // "sin cobertura" and "un_solo" always use dark text.
    expect(b[0].textOnColor).toBe('dark');
    expect(b[1].textOnColor).toBe('dark');
  });
});

describe('bucketFor', () => {
  it('routes 0 to "sin cobertura" and 1 to "un_solo"', () => {
    const b = coverageBuckets(5);
    expect(bucketFor(0, b).id).toBe('sin_cobertura');
    expect(bucketFor(1, b).id).toBe('un_solo');
  });

  it('routes a mid-range count to the correct blue tier', () => {
    const b = coverageBuckets(6);
    expect(bucketFor(3, b).min).toBeLessThanOrEqual(3);
    expect(bucketFor(3, b).max ?? Infinity).toBeGreaterThanOrEqual(3);
  });

  it('routes counts above the observed max to the top open-ended tier', () => {
    const b = coverageBuckets(5);
    expect(bucketFor(99, b).max).toBeNull();
  });
});

describe('populationCovered', () => {
  it('splits population totals across the three coverage classes', () => {
    // Universe of three synthetic countries. Populations are read from real
    // COUNTRIES definitions (CL=19.6, AR=45.5, UY=3.4) so we don't have to
    // reinvent them here; the test only cares about the split ratio.
    const coverage = new Map<string, number>([
      ['CL', 0],
      ['AR', 1],
      ['UY', 3],
    ]);
    const out = populationCovered(coverage, ['CL', 'AR', 'UY']);
    expect(out.sinCobertura).toBeCloseTo(19.6, 5);
    expect(out.unSolo).toBeCloseTo(45.5, 5);
    expect(out.conRespaldo).toBeCloseTo(3.4, 5);
    expect(out.total).toBeCloseTo(19.6 + 45.5 + 3.4, 5);
  });

  it('treats missing coverage entries as zero', () => {
    const out = populationCovered(new Map(), ['CL']);
    expect(out.sinCobertura).toBeCloseTo(19.6, 5);
    expect(out.total).toBeCloseTo(19.6, 5);
  });

  it('ignores codes outside the known country list', () => {
    const out = populationCovered(new Map([['ZZ', 5]]), ['ZZ']);
    expect(out.total).toBe(0);
  });
});
