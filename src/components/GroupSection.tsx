import { useCallback, useRef, useState } from 'react';
import { type Group } from '../data/form-config';
import type { CountryCode, CountryDef } from '../data/countries';
import type { CellState, GroupMatrix } from '../types/form';
import { makeCellKey } from '../types/form';
import { MatrixCell, MatrixLegend } from './MatrixCell';

type Props = {
  group: Group;
  countries: CountryDef[];
  matrix: GroupMatrix;
  displayLabel?: string;
  /** Optional "Categoría · Subcategoría" line shown in the collapsed header
   *  to disambiguate groups that share a label across subcategories. */
  breadcrumb?: string;
  onCellCycle: (service: string, country: CountryCode) => void;
  /** Cycle the whole column (all services under `country`) as one uniform state. */
  onColumnCycle: (country: CountryCode) => void;
  /** Cycle the whole row (all countries under `service`) as one uniform state. */
  onRowCycle: (service: string) => void;
};

function getCell(matrix: GroupMatrix, service: string, country: CountryCode): CellState {
  return matrix[makeCellKey(service, country)] ?? 'empty';
}

export function GroupSection({
  group,
  countries,
  matrix,
  displayLabel,
  breadcrumb,
  onCellCycle,
  onColumnCycle,
  onRowCycle,
}: Props) {
  const [open, setOpen] = useState(false);
  const rows = group.services;
  const cellRefs = useRef<Array<Array<HTMLButtonElement | null>>>([]);

  const registerRef = useCallback(
    (r: number, c: number) => (el: HTMLButtonElement | null) => {
      if (!cellRefs.current[r]) cellRefs.current[r] = [];
      cellRefs.current[r][c] = el;
    },
    [],
  );

  const focusCell = useCallback(
    (r: number, c: number) => {
      const rowMax = rows.length - 1;
      const colMax = countries.length - 1;
      const rr = Math.max(0, Math.min(r, rowMax));
      const cc = Math.max(0, Math.min(c, colMax));
      cellRefs.current[rr]?.[cc]?.focus();
    },
    [rows.length, countries.length],
  );

  const countMarked = Object.keys(matrix).length;
  const label = displayLabel ?? group.label;

  return (
    <section
      aria-labelledby={`group-${group.id}-title`}
      className="rounded-lg border border-border bg-surface"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`group-${group.id}-body`}
        className="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left hover:bg-surface-muted"
      >
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className={`inline-block transition ${open ? 'rotate-90' : ''}`}
          >
            ▶
          </span>
          <span className="flex flex-col">
            <span
              id={`group-${group.id}-title`}
              className="font-semibold text-primary"
            >
              {label}
            </span>
            {breadcrumb && (
              <span className="text-xs text-text-subtle">{breadcrumb}</span>
            )}
          </span>
        </span>
        <span className="text-xs text-text-muted">
          {countMarked === 0 ? 'Sin marcar' : `${countMarked} celda(s) marcada(s)`}
        </span>
      </button>

      {open && (
        <div id={`group-${group.id}-body`} className="border-t border-border p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <MatrixLegend />
            <span className="text-xs text-text-subtle">
              Consejo: clic en un país o servicio para marcar/desmarcar toda la columna o fila.
            </span>
          </div>

          {countries.length === 0 ? (
            <p className="text-sm text-text-muted">
              Seleccione al menos un país en el paso anterior para completar esta matriz.
            </p>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="sticky left-0 top-0 z-20 min-w-56 bg-surface-muted px-3 py-2 text-left font-semibold text-text"
                    >
                      Servicio
                    </th>
                    {countries.map((c) => (
                      <th
                        key={c.code2}
                        scope="col"
                        className="sticky top-0 z-10 whitespace-nowrap bg-surface-muted p-0 text-center text-xs font-semibold text-text"
                      >
                        <button
                          type="button"
                          onClick={() => onColumnCycle(c.code2)}
                          title={`${c.nameEs} — marcar/desmarcar toda la columna`}
                          className="w-full px-2 py-2 hover:bg-accent-100 focus-visible:bg-accent-100 outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                          {c.nameEs}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((service, rIdx) => (
                    <tr key={service}>
                      <th
                        scope="row"
                        className="sticky left-0 z-10 min-w-56 bg-white p-0 text-left font-normal text-text"
                      >
                        <button
                          type="button"
                          onClick={() => onRowCycle(service)}
                          title={`${service} — marcar/desmarcar toda la fila`}
                          className="w-full px-3 py-2 text-left hover:bg-accent-100 focus-visible:bg-accent-100 outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                          {service}
                        </button>
                      </th>
                      {countries.map((country, cIdx) => {
                        const state = getCell(matrix, service, country.code2);
                        return (
                          <td
                            key={country.code2}
                            className="px-1 py-1 text-center align-middle"
                          >
                            <div className="inline-flex">
                              <MatrixCell
                                cellRef={registerRef(rIdx, cIdx)}
                                state={state}
                                onCycle={() => onCellCycle(service, country.code2)}
                                onKeyNav={(dir) => {
                                  if (dir === 'up') focusCell(rIdx - 1, cIdx);
                                  else if (dir === 'down') focusCell(rIdx + 1, cIdx);
                                  else if (dir === 'left') focusCell(rIdx, cIdx - 1);
                                  else focusCell(rIdx, cIdx + 1);
                                }}
                                ariaLabel={`${service} en ${country.nameEs}`}
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
