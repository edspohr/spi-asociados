import type { CountryCode, CountryDef } from '../data/countries';
import { findCountry } from '../data/countries';

/**
 * Single source of truth for the "how many associates cover this country"
 * scale. Consumed by MapView (choropleth fills), GapPanel (section headers +
 * chip badges) and KpiCards (population aggregates). All three must render
 * from the same bucket array so the legends line up.
 */

export type CoverageBucket = {
  id: string;
  labelEs: string;
  color: string;
  /** Text colour to use on top of `color` — needed because the darkest blues
   *  fail contrast against dark text. */
  textOnColor: 'dark' | 'light';
  /** Inclusive lower bound. */
  min: number;
  /** Inclusive upper bound, or null for open-ended (top bucket). */
  max: number | null;
};

// Neutral "empty map" grey. Deliberately not red — the map should read as
// "we haven't reached here yet", not "danger".
const NEUTRAL_GREY = '#e2e8f0';
// Blue ramp from lightest → darkest. Endpoints derive from the brand tokens
// in styles/index.css (accent → accent-600 → primary → primary-700).
const BLUE_LIGHTEST = '#c7e2f6';
const BLUE_LIGHT = '#7cc7ff';
const BLUE_MID = '#016cae';
const BLUE_DARK = '#00538b';
const BLUE_DARKEST = '#033e65';

// The "1 asociado" bucket shares the blue ramp, but keeps a distinct outline
// on the map and a "1" badge on chips so single-point-of-failure countries
// stay identifiable through the non-colour channel too.
export const SPOF_STROKE = '#7c2d12'; // amber-900

const BLUE_RAMP: string[] = [BLUE_LIGHT, BLUE_MID, BLUE_DARK, BLUE_DARKEST];

function bucketTextColor(color: string): 'dark' | 'light' {
  // Rough perceived-lightness gate: our two darker blues need white text; the
  // lighter half is legible with the default dark text token.
  return color === BLUE_DARK || color === BLUE_DARKEST || color === BLUE_MID
    ? 'light'
    : 'dark';
}

/**
 * Build the ordered bucket array for the given observed maximum. Rules:
 *   maxCount ≤ 0: only "sin cobertura"
 *   maxCount = 1: sin + un_solo (lightest blue)
 *   maxCount = 2: sin + un_solo + one extra "2+" tier
 *   maxCount 3–4: sin + un_solo + two tiers
 *   maxCount ≥ 5: sin + un_solo + three tiers
 * All ranges are contiguous and non-overlapping. The top tier is open-ended.
 */
export function coverageBuckets(maxCount: number): CoverageBucket[] {
  const sin: CoverageBucket = {
    id: 'sin_cobertura',
    labelEs: 'Sin cobertura',
    color: NEUTRAL_GREY,
    textOnColor: 'dark',
    min: 0,
    max: 0,
  };
  if (maxCount <= 0) return [sin];

  const unSolo: CoverageBucket = {
    id: 'un_solo',
    labelEs: '1 asociado',
    color: BLUE_LIGHTEST,
    textOnColor: 'dark',
    min: 1,
    max: 1,
  };
  if (maxCount <= 1) return [sin, unSolo];

  const tierCount = maxCount <= 2 ? 1 : maxCount <= 4 ? 2 : 3;
  const tiers: CoverageBucket[] = [];
  // Break the closed interval [2, maxCount] into `tierCount` roughly-equal
  // sub-intervals, then leave the top one open-ended.
  const breakpoints: number[] = [2];
  for (let i = 1; i < tierCount; i++) {
    breakpoints.push(Math.round(2 + (i / tierCount) * (maxCount - 1)));
  }
  breakpoints.push(maxCount + 1); // exclusive upper for the last real slot

  for (let i = 0; i < tierCount; i++) {
    const lo = breakpoints[i];
    const isLast = i === tierCount - 1;
    const hi = isLast ? null : Math.max(lo, breakpoints[i + 1] - 1);
    const label = isLast
      ? `${lo}+ asociados`
      : lo === hi
        ? `${lo} asociados`
        : `${lo}–${hi} asociados`;
    const color = BLUE_RAMP[Math.min(i, BLUE_RAMP.length - 1)];
    tiers.push({
      id: `tier_${i + 1}`,
      labelEs: label,
      color,
      textOnColor: bucketTextColor(color),
      min: lo,
      max: hi,
    });
  }

  return [sin, unSolo, ...tiers];
}

/** Resolve which bucket a raw count belongs to. Guaranteed to hit exactly one
 *  bucket because ranges are contiguous and the top is open-ended. */
export function bucketFor(count: number, buckets: CoverageBucket[]): CoverageBucket {
  const n = Math.max(0, count);
  for (const b of buckets) {
    if (n >= b.min && (b.max === null || n <= b.max)) return b;
  }
  // Should be unreachable when buckets came from coverageBuckets(); fall back
  // to the last one so callers never have to null-check.
  return buckets[buckets.length - 1];
}

// ── Population-weighted aggregates ──────────────────────────────────────────

export type PopulationCoverage = {
  /** Combined population (in millions) of countries with zero associates. */
  sinCobertura: number;
  /** Combined population of countries with exactly one associate. */
  unSolo: number;
  /** Combined population of countries with two or more associates. */
  conRespaldo: number;
  /** Combined population of the universe under consideration. */
  total: number;
};

/**
 * Sum populations across a universe, bucketing by how many associates cover
 * each country. Passed `coverage` should already reflect the current filter
 * scope (compute with `coverageByCountry`). Any country in `universe` that
 * has no entry in `coverage` counts as zero associates.
 */
export function populationCovered(
  coverage: Map<CountryCode, number>,
  universe: CountryCode[],
): PopulationCoverage {
  let sinCobertura = 0;
  let unSolo = 0;
  let conRespaldo = 0;
  let total = 0;
  for (const code of universe) {
    const def: CountryDef | undefined = findCountry(code);
    if (!def) continue;
    const pop = def.population;
    total += pop;
    const n = coverage.get(code) ?? 0;
    if (n === 0) sinCobertura += pop;
    else if (n === 1) unSolo += pop;
    else conRespaldo += pop;
  }
  return { sinCobertura, unSolo, conRespaldo, total };
}
