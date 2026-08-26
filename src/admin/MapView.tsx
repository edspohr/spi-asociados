import { useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { scaleThreshold } from 'd3-scale';
import worldTopoJson from 'world-atlas/countries-110m.json';
import type { AssociateDoc } from './types';
import type { Filters } from './filters';
import { associatesByCountry, coverageByCountry } from './filters';
import { code2FromM49, countryName, type CountryCode } from '../data/countries';

type Props = {
  all: AssociateDoc[];
  filters: Filters;
  onSelectCountry: (code: CountryCode) => void;
};

// Discrete choropleth scale. 0 associates → light grey (no data). Uses a
// single-hue blue ramp so the eye can rank counts intuitively.
const COLOR_SCALE = scaleThreshold<number, string>()
  .domain([1, 2, 3, 5])
  .range(['#e8ecef', '#c9deed', '#78b4dd', '#2e86c1', '#134e75']);

const LEGEND: Array<{ label: string; color: string }> = [
  { label: '0', color: '#e8ecef' },
  { label: '1', color: '#c9deed' },
  { label: '2', color: '#78b4dd' },
  { label: '3–4', color: '#2e86c1' },
  { label: '5+', color: '#134e75' },
];

type Tooltip = {
  x: number;
  y: number;
  countryLabel: string;
  count: number;
  associates: AssociateDoc[];
};

export function MapView({ all, filters, onSelectCountry }: Props) {
  const coverage = useMemo(() => coverageByCountry(all, filters), [all, filters]);
  const bag = useMemo(() => associatesByCountry(all, filters), [all, filters]);
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
                  const count = (code2 && coverage.get(code2)) || 0;
                  const color = COLOR_SCALE(count);
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
                          stroke: '#ffffff',
                          strokeWidth: 0.4,
                          outline: 'none',
                          cursor: code2 ? 'pointer' : 'default',
                        },
                        hover: {
                          fill: color,
                          stroke: '#043356',
                          strokeWidth: 0.8,
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
          </div>
        )}
      </div>

      <ul className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-muted">
        {LEGEND.map((l) => (
          <li key={l.label} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-3 w-4 rounded-sm border border-black/10"
              style={{ backgroundColor: l.color }}
            />
            <span>{l.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
