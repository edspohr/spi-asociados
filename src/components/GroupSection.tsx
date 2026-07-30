import { useCallback, useRef, useState } from 'react';
import {
  COUNTRIES,
  isOtherService,
  type Country,
  type Group,
} from '../data/form-config';
import type { CellState, GroupMatrix } from '../types/form';
import { makeCellKey } from '../types/form';
import { MatrixCell, MatrixLegend } from './MatrixCell';

type Props = {
  group: Group;
  matrix: GroupMatrix;
  otherDetail: string;
  displayLabel?: string;
  onCellCycle: (service: string, country: Country) => void;
  onOtherDetailChange: (v: string) => void;
};

function getCell(matrix: GroupMatrix, service: string, country: Country): CellState {
  return matrix[makeCellKey(service, country)] ?? 'empty';
}

export function GroupSection({
  group,
  matrix,
  otherDetail,
  displayLabel,
  onCellCycle,
  onOtherDetailChange,
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

  const focusCell = useCallback((r: number, c: number) => {
    const rowMax = rows.length - 1;
    const colMax = COUNTRIES.length - 1;
    const rr = Math.max(0, Math.min(r, rowMax));
    const cc = Math.max(0, Math.min(c, colMax));
    cellRefs.current[rr]?.[cc]?.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length]);

  const countMarked = Object.keys(matrix).length;

  const label = displayLabel ?? group.label;

  const showOtherDetail = Object.keys(matrix).some((k) => {
    const idx = k.indexOf('::');
    if (idx === -1) return false;
    return isOtherService(k.slice(0, idx));
  });

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
          <span
            id={`group-${group.id}-title`}
            className="font-semibold text-primary"
          >
            {label}
          </span>
        </span>
        <span className="text-xs text-text-muted">
          {countMarked === 0 ? 'Sin marcar' : `${countMarked} celda(s) marcada(s)`}
        </span>
      </button>

      {open && (
        <div id={`group-${group.id}-body`} className="border-t border-border p-4">
          <div className="mb-3">
            <MatrixLegend />
          </div>

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
                  {COUNTRIES.map((c) => (
                    <th
                      key={c}
                      scope="col"
                      className="sticky top-0 z-10 whitespace-nowrap bg-surface-muted px-2 py-2 text-center text-xs font-semibold text-text"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((service, rIdx) => (
                  <tr key={service}>
                    <th
                      scope="row"
                      className="sticky left-0 z-10 min-w-56 bg-white px-3 py-2 text-left font-normal text-text"
                    >
                      {service}
                    </th>
                    {COUNTRIES.map((country, cIdx) => {
                      const state = getCell(matrix, service, country);
                      return (
                        <td key={country} className="px-1 py-1 text-center align-middle">
                          <div className="inline-flex">
                            <MatrixCell
                              cellRef={registerRef(rIdx, cIdx)}
                              state={state}
                              onCycle={() => onCellCycle(service, country)}
                              onKeyNav={(dir) => {
                                if (dir === 'up') focusCell(rIdx - 1, cIdx);
                                else if (dir === 'down') focusCell(rIdx + 1, cIdx);
                                else if (dir === 'left') focusCell(rIdx, cIdx - 1);
                                else focusCell(rIdx, cIdx + 1);
                              }}
                              ariaLabel={`${service} en ${country}`}
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

          {showOtherDetail && (
            <label className="mt-4 flex flex-col gap-1 text-sm">
              <span className="font-medium text-text">
                Especifique “Otro” servicio
              </span>
              <input
                type="text"
                value={otherDetail}
                onChange={(e) => onOtherDetailChange(e.target.value)}
                placeholder="Nombre del servicio"
                className="w-full max-w-md rounded border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          )}
        </div>
      )}
    </section>
  );
}
