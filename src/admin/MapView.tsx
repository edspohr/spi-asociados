import { useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import worldTopoJson from 'world-atlas/countries-50m.json';
import type { AssociateDoc } from './types';
import type { Filters } from './filters';
import { associatesByCountry, coverageByCountry } from './filters';
import {
  COUNTRIES,
  code2FromM49,
  countryName,
  type CountryCode,
} from '../data/countries';
import {
  SPOF_STROKE,
  bucketFor,
  coverageBuckets,
} from './coverage-scale';

type Props = {
  all: AssociateDoc[];
  filters: Filters;
  onSelectCountry: (code: CountryCode) => void;
};

// A universe country geometry that is not in COUNTRIES-with-associates still
// gets the neutral bucket fill. Non-universe territories (dependencies,
// Antarctica, W. Sahara, etc.) get this fainter tone and no border so the
// universe boundary is visible.
const COLOR_NON_UNIVERSE = '#f4f6f8';

// Selected-country highlight. High-contrast against both the neutral grey
// bucket and the darkest blue in the ramp.
const SELECTED_STROKE = '#111827'; // slate-900
const SELECTED_HALO = '#facc15'; // yellow-400

// Approximate country centroids [lng, lat] for the label allowlist. Only
// countries large enough to fit a small number label at scale 155 are
// listed — everything else stays unlabelled so the resting map is clean.
const LABEL_CENTROIDS: Record<string, [number, number]> = {
  RU: [95, 62], CA: [-105, 60], CN: [104, 36], US: [-98, 40], BR: [-53, -10],
  AU: [134, -25], IN: [79, 22], AR: [-64, -35], KZ: [67, 48], DZ: [3, 28],
  CD: [23, -3], SA: [45, 25], MX: [-102, 24], ID: [118, -3], SD: [30, 15],
  LY: [17, 27], IR: [53, 32], MN: [104, 46], PE: [-75, -10], TD: [19, 15],
  NE: [10, 17], AO: [17, -12], ML: [-4, 17], ZA: [24, -29], CO: [-73, 4],
  ET: [40, 8], BO: [-64, -17], MR: [-10, 20], EG: [30, 27], TZ: [35, -6],
  NG: [8, 10], VE: [-66, 7], NA: [17, -22], MZ: [35, -18], PK: [70, 30],
  TR: [35, 39], CL: [-71, -37], ZM: [28, -14], MM: [96, 21], AF: [67, 33],
  SO: [46, 6], CF: [21, 7], MG: [47, -19], BW: [24, -22], KE: [38, 1],
  FR: [2, 47], YE: [48, 15], TH: [101, 15], ES: [-3, 40], TM: [59, 39],
  CM: [12, 6], PG: [145, -6], SE: [17, 63], MA: [-6, 32], UZ: [64, 41],
  IQ: [44, 33], PY: [-58, -23], ZW: [30, -19], JP: [138, 37], DE: [10, 51],
  FI: [26, 64], VN: [107, 16], NO: [10, 62], PL: [19, 52], UA: [32, 49],
  IT: [12, 43], EC: [-78, -1], BF: [-2, 12], RO: [25, 46], GB: [-2, 54],
};

type Tooltip = {
  x: number;
  y: number;
  countryLabel: string;
  count: number;
  bucketLabel: string;
  associates: AssociateDoc[];
  inUniverse: boolean;
};

export function MapView({ all, filters, onSelectCountry }: Props) {
  const coverage = useMemo(() => coverageByCountry(all, filters), [all, filters]);
  const bag = useMemo(() => associatesByCountry(all, filters), [all, filters]);

  // Universe = every country SPI operates in per the static list. A country
  // with zero associates is still part of the universe and stays clickable.
  const universe = useMemo(() => new Set(COUNTRIES.map((c) => c.code2)), []);

  const maxCount = useMemo(() => {
    let m = 0;
    for (const n of coverage.values()) if (n > m) m = n;
    return m;
  }, [coverage]);
  const buckets = useMemo(() => coverageBuckets(maxCount), [maxCount]);

  const [tt, setTt] = useState<Tooltip | null>(null);
  const selected = filters.pais || null;

  const labels = useMemo(() => {
    const out: Array<{ code: string; coord: [number, number]; count: number }> = [];
    for (const [code, coord] of Object.entries(LABEL_CENTROIDS)) {
      const count = coverage.get(code) ?? 0;
      if (count >= 1) out.push({ code, coord, count });
    }
    return out;
  }, [coverage]);

  return (
    <section
      aria-labelledby="map-title"
      className="rounded-lg border border-border bg-surface p-4"
    >
      <header className="mb-2 flex items-baseline justify-between gap-2">
        <h3 id="map-title" className="text-sm font-semibold text-primary">
          Cobertura por país
        </h3>
        <p className="text-xs text-text-subtle">
          Escala: cantidad de asociados por país (más oscuro, más asociados).
          Refleja los filtros aplicados abajo.
        </p>
      </header>

      <div className="relative">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 155 }}
          style={{ width: '100%', height: 'auto' }}
        >
          <ZoomableGroup center={[0, 20]} zoom={1}>
            <Geographies geography={worldTopoJson}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const code2 = code2FromM49(geo.id as string);
                  const inUniverse = Boolean(code2 && universe.has(code2));
                  const count = (code2 && coverage.get(code2)) || 0;
                  const bucket = inUniverse ? bucketFor(count, buckets) : null;
                  const isSelected = Boolean(selected && code2 === selected);
                  const isSpof = inUniverse && count === 1;

                  const fill = bucket ? bucket.color : COLOR_NON_UNIVERSE;
                  let stroke: string;
                  let strokeWidth: number;
                  if (isSelected) {
                    stroke = SELECTED_STROKE;
                    strokeWidth = 2.2;
                  } else if (isSpof) {
                    stroke = SPOF_STROKE;
                    strokeWidth = 1.1;
                  } else if (inUniverse) {
                    stroke = '#ffffff';
                    strokeWidth = 0.4;
                  } else {
                    // Non-universe: no border so the universe outline pops.
                    stroke = 'transparent';
                    strokeWidth = 0;
                  }

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={(e) => {
                        if (!inUniverse || !code2) return;
                        setTt({
                          x: e.clientX,
                          y: e.clientY,
                          countryLabel: countryName(code2),
                          count,
                          bucketLabel: bucket?.labelEs ?? '',
                          associates: bag.get(code2) ?? [],
                          inUniverse: true,
                        });
                      }}
                      onMouseMove={(e) =>
                        setTt((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : prev))
                      }
                      onMouseLeave={() => setTt(null)}
                      onClick={() => {
                        if (inUniverse && code2) onSelectCountry(code2);
                      }}
                      style={{
                        default: {
                          fill,
                          stroke,
                          strokeWidth,
                          outline: 'none',
                          cursor: inUniverse ? 'pointer' : 'default',
                        },
                        hover: {
                          fill,
                          stroke: isSelected
                            ? SELECTED_STROKE
                            : inUniverse
                              ? isSpof
                                ? SPOF_STROKE
                                : '#043356'
                              : 'transparent',
                          strokeWidth: isSelected ? 2.6 : inUniverse ? (isSpof ? 1.4 : 0.8) : 0,
                          outline: 'none',
                        },
                        pressed: { fill, outline: 'none' },
                      }}
                    />
                  );
                })
              }
            </Geographies>
            {labels.map((l) => {
              const bucket = bucketFor(l.count, buckets);
              const useLight = bucket.textOnColor === 'light';
              return (
                <Marker key={l.code} coordinates={l.coord}>
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      fill: useLight ? '#ffffff' : '#0f172a',
                      pointerEvents: 'none',
                      paintOrder: 'stroke',
                      stroke: useLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.85)',
                      strokeWidth: 1.4,
                    }}
                  >
                    {l.count}
                  </text>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        {tt && (
          <div
            role="tooltip"
            style={{
              position: 'fixed',
              left: tt.x + 12,
              top: tt.y + 12,
              pointerEvents: 'none',
              zIndex: 30,
            }}
            className="max-w-xs rounded border border-border bg-white p-2 text-xs shadow-md"
          >
            <p className="font-semibold text-primary">{tt.countryLabel}</p>
            <p className="text-text-muted">
              {tt.count === 0
                ? `Sin asociados${tt.bucketLabel ? ` · ${tt.bucketLabel}` : ''}`
                : `${tt.count} asociado${tt.count === 1 ? '' : 's'} · ${tt.bucketLabel}`}
            </p>
            {tt.associates.length > 0 && (
              <ul className="mt-1 space-y-0.5 text-text">
                {tt.associates.slice(0, 5).map((a) => (
                  <li key={a.id} className="truncate">
                    · {a.company.razonSocial}
                  </li>
                ))}
                {tt.associates.length > 5 && (
                  <li className="text-text-subtle">…y {tt.associates.length - 5} más</li>
                )}
              </ul>
            )}
            {tt.count === 1 && (
              <p className="mt-1 text-[11px] text-amber-800">
                Un solo asociado — sin respaldo si no puede atender.
              </p>
            )}
          </div>
        )}
      </div>

      <ul className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-muted">
        {buckets.map((b) => (
          <li key={b.id} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-3 w-4 rounded-sm"
              style={{
                backgroundColor: b.color,
                border:
                  b.id === 'un_solo'
                    ? `1.5px solid ${SPOF_STROKE}`
                    : '1px solid rgba(0,0,0,0.08)',
              }}
            />
            <span>{b.labelEs}</span>
          </li>
        ))}
        {selected && (
          <li className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-3 w-4 rounded-sm"
              style={{
                backgroundColor: '#ffffff',
                border: `2px solid ${SELECTED_STROKE}`,
                boxShadow: `0 0 0 1px ${SELECTED_HALO}`,
              }}
            />
            <span>Seleccionado — clic para quitar el filtro</span>
          </li>
        )}
      </ul>
    </section>
  );
}
