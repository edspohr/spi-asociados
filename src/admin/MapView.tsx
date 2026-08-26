import { useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import worldTopoJson from 'world-atlas/countries-110m.json';
import type { AssociateDoc } from './types';
import type { Filters } from './filters';
import { associatesByCountry, coverageByCountry } from './filters';
import { code2FromM49, countryName, type CountryCode } from '../data/countries';

type Props = {
  all: AssociateDoc[];
  filters: Filters;
  /** Countries considered part of the operating universe (usually the countries
   *  that appear anywhere in the data). Countries outside this set stay neutral
   *  regardless of coverage. When empty, all countries are considered. */
  focus?: CountryCode[];
  onSelectCountry: (code: CountryCode) => void;
};

// Coverage colors read as a gap map: red = no associates in the universe;
// yellow = at least one; neutral grey = country is outside the current focus.
const COLOR_NEUTRAL = '#e8ecef';
const COLOR_RED = '#ef4444'; // red-500
const COLOR_YELLOW = '#fbbf24'; // amber-400
// SPOF (single-point-of-failure) countries stay yellow but get a distinct dark
// outline so the "one associate = no backup" signal survives without adding a
// third colour — also serves as the non-colour channel for color-blind users.
const COLOR_SPOF_STROKE = '#7c2d12'; // amber-900

type Tooltip = {
  x: number;
  y: number;
  countryLabel: string;
  count: number;
  associates: AssociateDoc[];
};

export function MapView({ all, filters, focus, onSelectCountry }: Props) {
  const coverage = useMemo(() => coverageByCountry(all, filters), [all, filters]);
  const bag = useMemo(() => associatesByCountry(all, filters), [all, filters]);
  const focusSet = useMemo(
    () => (focus && focus.length > 0 ? new Set(focus) : null),
    [focus],
  );
  const [tt, setTt] = useState<Tooltip | null>(null);

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
          Escala: cantidad de asociados por país{filters.servicio ? ` para “${filters.servicio}”` : ''}.
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
                  const inFocus = code2 && (!focusSet || focusSet.has(code2));
                  const count = (code2 && coverage.get(code2)) || 0;
                  const color = !inFocus
                    ? COLOR_NEUTRAL
                    : count === 0
                      ? COLOR_RED
                      : COLOR_YELLOW;
                  const isSpof = Boolean(inFocus) && count === 1;
                  const baseStroke = isSpof ? COLOR_SPOF_STROKE : '#ffffff';
                  const baseStrokeWidth = isSpof ? 1.1 : 0.4;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={(e) => {
                        if (!code2) return;
                        setTt({
                          x: e.clientX,
                          y: e.clientY,
                          countryLabel: countryName(code2),
                          count,
                          associates: bag.get(code2) ?? [],
                        });
                      }}
                      onMouseMove={(e) =>
                        setTt((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : prev))
                      }
                      onMouseLeave={() => setTt(null)}
                      onClick={() => {
                        if (code2) onSelectCountry(code2);
                      }}
                      style={{
                        default: {
                          fill: color,
                          stroke: baseStroke,
                          strokeWidth: baseStrokeWidth,
                          outline: 'none',
                          cursor: code2 ? 'pointer' : 'default',
                        },
                        hover: {
                          fill: color,
                          stroke: isSpof ? COLOR_SPOF_STROKE : '#043356',
                          strokeWidth: isSpof ? 1.4 : 0.8,
                          outline: 'none',
                        },
                        pressed: { fill: color, outline: 'none' },
                      }}
                    />
                  );
                })
              }
            </Geographies>
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
                ? 'Sin asociados'
                : `${tt.count} asociado${tt.count === 1 ? '' : 's'}`}
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
        <li className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-3 w-4 rounded-sm border border-black/10"
            style={{ backgroundColor: COLOR_RED }}
          />
          <span>Rojo · sin asociados</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-3 w-4 rounded-sm border border-black/10"
            style={{ backgroundColor: COLOR_YELLOW }}
          />
          <span>Amarillo · con asociados</span>
        </li>
        <li className="flex items-center gap-1.5" title="Un solo asociado — sin respaldo.">
          <span
            aria-hidden
            className="inline-block h-3 w-4 rounded-sm"
            style={{
              backgroundColor: COLOR_YELLOW,
              border: `1.5px solid ${COLOR_SPOF_STROKE}`,
            }}
          />
          <span>Borde oscuro · con un solo asociado</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-3 w-4 rounded-sm border border-black/10"
            style={{ backgroundColor: COLOR_NEUTRAL }}
          />
          <span>Gris · fuera del alcance</span>
        </li>
      </ul>
    </section>
  );
}
