import { describe, expect, it } from 'vitest';
import { coverageBuckets } from './coverage-scale';
import { groupUniverseByBucket, toGapCsv } from './gap-grouping';

describe('groupUniverseByBucket', () => {
  const buckets = coverageBuckets(6);
  const universe = ['BR', 'AR', 'CL', 'UY', 'PY', 'SR']; // Sudamérica sample

  it('assigns every universe country to exactly one bucket', () => {
    const coverage = new Map<string, number>([
      ['BR', 0],
      ['AR', 3],
      ['CL', 1],
      ['UY', 0],
      ['PY', 2],
      ['SR', 6],
    ]);
    const groups = groupUniverseByBucket(universe, coverage, buckets);
    const totalPlaced = groups.reduce((n, g) => n + g.count, 0);
    expect(totalPlaced).toBe(universe.length);
  });

  it('sorts each bucket by population DESC', () => {
    const coverage = new Map<string, number>([['BR', 0], ['UY', 0], ['CL', 0]]);
    const groups = groupUniverseByBucket(['BR', 'UY', 'CL'], coverage, buckets);
    const sin = groups.find((g) => g.bucket.id === 'sin_cobertura')!;
    // BR ≫ CL ≫ UY by population.
    expect(sin.codes).toEqual(['BR', 'CL', 'UY']);
  });

  it('sums populations for each group', () => {
    const coverage = new Map<string, number>([['BR', 1], ['AR', 1]]);
    const groups = groupUniverseByBucket(['BR', 'AR'], coverage, buckets);
    const uno = groups.find((g) => g.bucket.id === 'un_solo')!;
    expect(uno.count).toBe(2);
    expect(uno.population).toBeCloseTo(216.4 + 45.5, 5);
  });

  it('ignores unknown country codes', () => {
    const groups = groupUniverseByBucket(['ZZ'], new Map(), buckets);
    const totalPlaced = groups.reduce((n, g) => n + g.count, 0);
    expect(totalPlaced).toBe(0);
  });
});

describe('toGapCsv', () => {
  it('emits a header row and one row per COUNTRIES entry', () => {
    const buckets = coverageBuckets(3);
    const csv = toGapCsv(new Map([['BR', 2]]), buckets);
    const lines = csv.split('\n');
    // Header + 198 countries.
    expect(lines[0]).toContain('code2');
    expect(lines[0]).toContain('bucket');
    expect(lines.length).toBeGreaterThan(190);
  });

  it('routes covered countries to the correct bucket label', () => {
    const buckets = coverageBuckets(3);
    const csv = toGapCsv(new Map([['BR', 3]]), buckets);
    const brLine = csv.split('\n').find((l) => l.startsWith('BR,'));
    expect(brLine).toBeDefined();
    expect(brLine!).toContain('3');
  });
});
