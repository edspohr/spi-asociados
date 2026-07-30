import { useEffect, useMemo } from 'react';
import type { AssociateDoc } from './types';
import { countryName } from '../data/countries';

type Props = {
  associate: AssociateDoc | null;
  onClose: () => void;
};

/**
 * Right-side drawer with the full associate profile: contact info + a
 * (service × country) matrix showing every marked cell with its modalidad
 * (D = Directo, T = Tercerizado). Rendered as an overlay panel so filters and
 * map stay visible behind it.
 */
export function AssociateDrawer({ associate, onClose }: Props) {
  useEffect(() => {
    if (!associate) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [associate, onClose]);

  const groupedRows = useMemo(() => {
    if (!associate) return new Map<string, Array<{ servicio: string; pais: string; modalidad: string }>>();
    const map = new Map<string, Array<{ servicio: string; pais: string; modalidad: string }>>();
    for (const r of associate.rows) {
      const key = r.categoria + (r.subcategoria ? ' · ' + r.subcategoria : '') + ' · ' + r.grupo;
      const arr = map.get(key) ?? [];
      arr.push({ servicio: r.servicio, pais: r.paisAplicacion, modalidad: r.modalidad });
      map.set(key, arr);
    }
    return map;
  }, [associate]);

  if (!associate) return null;

  const c = associate.company;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      className="fixed inset-0 z-40 flex justify-end bg-black/40"
      onClick={onClose}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border bg-surface p-4">
          <div>
            <h2 id="drawer-title" className="text-lg font-semibold text-primary">
              {c.razonSocial}
            </h2>
            {c.dba && <p className="text-sm text-text-muted">DBA: {c.dba}</p>}
            <p className="text-xs text-text-subtle">
              País origen: {c.paisOrigen || '—'}
              {c.anioInicio ? ` · Desde ${c.anioInicio}` : ''}
              {c.numEmpleados ? ` · ${c.numEmpleados} empleados` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded border border-border px-2 py-1 text-sm text-text-muted hover:border-primary hover:text-primary"
          >
            Cerrar ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <section aria-label="Contactos" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ContactCard
              title="Contacto principal"
              nombre={c.contactoPrincipalNombre}
              correo={c.contactoPrincipalCorreo}
              telefono={c.contactoPrincipalTelefono}
            />
            <ContactCard
              title="Contacto regulatorio"
              nombre={c.contactoRegulatorioNombre}
              correo={c.contactoRegulatorioCorreo}
              telefono={c.contactoRegulatorioTelefono}
            />
          </section>

          {c.repLegal && (
            <p className="mt-3 text-xs text-text-muted">
              Representante legal: <span className="text-text">{c.repLegal}</span>
            </p>
          )}
          {c.correosAdicionales.length > 0 && (
            <p className="mt-1 text-xs text-text-muted">
              Correos adicionales:{' '}
              <span className="text-text">{c.correosAdicionales.join(', ')}</span>
            </p>
          )}

          <section aria-label="Servicios ofrecidos" className="mt-6">
            <h3 className="text-sm font-semibold text-primary">Servicios ofrecidos</h3>
            {groupedRows.size === 0 && (
              <p className="mt-2 text-sm text-text-muted">Sin datos de servicios.</p>
            )}
            <ul className="mt-2 space-y-3">
              {Array.from(groupedRows.entries()).map(([groupLabel, rows]) => (
                <li key={groupLabel} className="rounded border border-border bg-surface-muted p-3">
                  <p className="text-xs font-semibold text-primary">{groupLabel}</p>
                  <ul className="mt-1 space-y-0.5 text-xs text-text">
                    {rows.map((r, i) => (
                      <li key={i} className="flex items-baseline gap-2">
                        <ModalidadBadge modalidad={r.modalidad} />
                        <span>{r.servicio}</span>
                        <span className="text-text-subtle">— {countryName(r.pais)}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </aside>
    </div>
  );
}

function ContactCard({
  title,
  nombre,
  correo,
  telefono,
}: {
  title: string;
  nombre?: string;
  correo?: string;
  telefono?: string;
}) {
  if (!nombre && !correo && !telefono) {
    return (
      <div className="rounded border border-border bg-surface-muted p-3">
        <p className="text-xs font-semibold uppercase text-text-muted">{title}</p>
        <p className="mt-1 text-xs text-text-subtle">Sin datos.</p>
      </div>
    );
  }
  return (
    <div className="rounded border border-border bg-surface-muted p-3">
      <p className="text-xs font-semibold uppercase text-text-muted">{title}</p>
      {nombre && <p className="mt-1 text-sm text-text">{nombre}</p>}
      {correo && (
        <p className="text-xs">
          <a href={`mailto:${correo}`} className="text-primary underline hover:opacity-80">
            {correo}
          </a>
        </p>
      )}
      {telefono && <p className="text-xs text-text-muted">{telefono}</p>}
    </div>
  );
}

function ModalidadBadge({ modalidad }: { modalidad: string }) {
  if (modalidad === 'Directo') {
    return (
      <span className="inline-flex items-center rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
        D
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
      style={{
        backgroundColor: 'var(--color-outsourced)',
        backgroundImage:
          'repeating-linear-gradient(45deg, rgba(255,255,255,0.28) 0 3px, transparent 3px 6px)',
      }}
    >
      T
    </span>
  );
}
