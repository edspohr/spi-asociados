import type { CoverageBucket } from './coverage-scale';
import { bucketFor } from './coverage-scale';
import { COUNTRIES, findCountry, type CountryCode } from '../data/countries';

export type BucketGroup = {
  bucket: CoverageBucket;
  /** Country codes assigned to this bucket, sorted by population DESC (ties
   *  broken by Spanish name). */
  codes: CountryCode[];
  /** Number of countries in this group. */
  count: number;
  /** Sum of populations across the group's countries, in millions. */
  population: number;
};

/**
 * Pure grouping helper: assign each universe country to its bucket, then sort
 * within each bucket by population DESC. Kept out of GapPanel so it can be
 * unit-tested without React.
 */
export function groupUniverseByBucket(
  universe: CountryCode[],
  coverage: Map<CountryCode, number>,
  buckets: CoverageBucket[],
): BucketGroup[] {
  const perBucket = new Map<string, CountryCode[]>();
  for (const b of buckets) perBucket.set(b.id, []);

  for (const code of universe) {
    if (!findCountry(code)) continue;
    const n = coverage.get(code) ?? 0;
    const bucket = bucketFor(n, buckets);
    perBucket.get(bucket.id)?.push(code);
  }

  return buckets.map((bucket) => {
    const raw = perBucket.get(bucket.id) ?? [];
    const sorted = [...raw].sort((a, b) => {
      const pa = findCountry(a)?.population ?? 0;
      const pb = findCountry(b)?.population ?? 0;
      if (pb !== pa) return pb - pa;
      return (findCountry(a)?.nameEs ?? '').localeCompare(
        findCountry(b)?.nameEs ?? '',
        'es',
      );
    });
    const population = sorted.reduce(
      (acc, c) => acc + (findCountry(c)?.population ?? 0),
      0,
    );
    return { bucket, codes: sorted, count: sorted.length, population };
  });
}

/**
 * Build CSV rows for "Exportar brechas": one row per universe country with
 * name, region, population, associate count and bucket label. Reused by
 * GapPanel via the shared downloadCsv() plumbing.
 */
export function toGapCsv(
  coverage: Map<CountryCode, number>,
  buckets: CoverageBucket[],
): string {
  const header = [
    'code2',
    'pais_nombre',
    'region',
    'poblacion_millones',
    'asociados',
    'bucket',
  ];
  const rows: string[] = [header.map(csvCell).join(',')];
  const sorted = [...COUNTRIES].sort((a, b) => b.population - a.population);
  for (const c of sorted) {
    const n = coverage.get(c.code2) ?? 0;
    const bucket = bucketFor(n, buckets);
    rows.push(
      [c.code2, c.nameEs, c.region, c.population, n, bucket.labelEs]
        .map(csvCell)
        .join(','),
    );
  }
  return rows.join('\n');
}

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
