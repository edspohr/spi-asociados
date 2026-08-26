import { useMemo, useState } from 'react';
import type { AssociateDoc } from './types';
import { countryName } from '../data/countries';

type Props = {
  associates: AssociateDoc[];
  onSelect: (doc: AssociateDoc) => void;
};

type SortKey = 'razonSocial' | 'paisOrigen' | 'nCountries' | 'nServices' | 'submittedAt';
type SortDir = 'asc' | 'desc';

/**
 * Precomputes derived counts on the associate so sort/render don't rebuild
 * these on every row on every re-render.
 */
type Row = {
  doc: AssociateDoc;
  nCountries: number;
  nServices: number;
};

export function AssociatesTable({ associates, onSelect }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('razonSocial');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const rows: Row[] = useMemo(() => {
    return associates.map((doc) => {
      const countries = new Set<string>();
      const services = new Set<string>();
      for (const r of doc.rows) {
        countries.add(r.paisAplicacion);
        services.add(r.servicio);
      }
      return { doc, nCountries: countries.size, nServices: services.size };
    });
  }, [associates]);

  const sorted = useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      const sign = sortDir === 'asc' ? 1 : -1;
      switch (sortKey) {
        case 'razonSocial':
          return a.doc.company.razonSocial.localeCompare(b.doc.company.razonSocial, 'es') * sign;
        case 'paisOrigen':
          return a.doc.company.paisOrigen.localeCompare(b.doc.company.paisOrigen, 'es') * sign;
        case 'nCountries':
          return (a.nCountries - b.nCountries) * sign;
        case 'nServices':
          return (a.nServices - b.nServices) * sign;
        case 'submittedAt': {
          const av = a.doc.submittedAt ?? '';
          const bv = b.doc.submittedAt ?? '';
          if (av === bv) return 0;
          return (av < bv ? -1 : 1) * sign;
        }
      }
    });
    return arr;
  }, [rows, sortKey, sortDir]);

  function toggleSort(k: SortKey) {
    if (k === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(k);
      setSortDir(k === 'nCountries' || k === 'nServices' || k === 'submittedAt' ? 'desc' : 'asc');
    }
  }

  return (
    <section aria-labelledby="table-title" className="bg-surface">
      <header className="flex items-baseline justify-between gap-2 px-4 py-3">
        <h3 id="table-title" className="text-sm font-semibold text-primary">
          Asociados que coinciden
        </h3>
        <span className="text-xs text-text-muted">{sorted.length} resultado(s)</span>
      </header>
      <div className="overflow-x-auto border-t border-border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-surface-muted text-xs uppercase tracking-wide text-text-muted">
              <Th onClick={() => toggleSort('razonSocial')} active={sortKey === 'razonSocial'} dir={sortDir}>
                Razón social
              </Th>
              <Th onClick={() => toggleSort('paisOrigen')} active={sortKey === 'paisOrigen'} dir={sortDir}>
                País origen
              </Th>
              <Th
                align="right"
                onClick={() => toggleSort('nCountries')}
                active={sortKey === 'nCountries'}
                dir={sortDir}
              >
                # países
              </Th>
              <Th
                align="right"
                onClick={() => toggleSort('nServices')}
                active={sortKey === 'nServices'}
                dir={sortDir}
              >
                # servicios
              </Th>
              <Th onClick={() => toggleSort('submittedAt')} active={sortKey === 'submittedAt'} dir={sortDir}>
                Recibido
              </Th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-text-muted">
                  Ningún asociado coincide con los filtros actuales.
                </td>
              </tr>
            )}
            {sorted.map(({ doc, nCountries, nServices }) => (
              <tr
                key={doc.id}
                onClick={() => onSelect(doc)}
                className="cursor-pointer border-t border-border hover:bg-surface-muted"
              >
                <td className="px-3 py-2">
                  <div className="font-medium text-text">{doc.company.razonSocial}</div>
                  <div className="text-xs text-text-subtle">
                    {doc.company.contactoPrincipalCorreo || '—'}
                  </div>
                </td>
                <td className="px-3 py-2 text-text">{countryOrRaw(doc.company.paisOrigen)}</td>
                <td className="px-3 py-2 text-right font-mono text-text">{nCountries}</td>
                <td className="px-3 py-2 text-right font-mono text-text">{nServices}</td>
                <td className="px-3 py-2 text-xs text-text-muted">
                  {formatDate(doc.submittedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Th({
  children,
  onClick,
  active,
  dir,
  align,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  dir: SortDir;
  align?: 'right';
}) {
  return (
    <th
      className={`px-3 py-2 font-semibold ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 ${active ? 'text-primary' : ''}`}
      >
        {children}
        {active && <span aria-hidden>{dir === 'asc' ? '▲' : '▼'}</span>}
      </button>
    </th>
  );
}

function countryOrRaw(v: string): string {
  if (v && v.length === 2) {
    const name = countryName(v);
    if (name !== v) return name;
  }
  return v || '—';
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
