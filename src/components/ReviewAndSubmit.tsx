import { useMemo } from 'react';
import type { FormState } from '../types/form';
import { buildRows, findSubmitBlockers, groupDisplayLabel } from '../lib/payload';
import { GROUPS, findGroupContext } from '../data/form-config';

type Props = {
  form: FormState;
  headerHasErrors: boolean;
  submitting: boolean;
  onSubmit: () => void;
};

export function ReviewAndSubmit({ form, headerHasErrors, submitting, onSubmit }: Props) {
  const rows = useMemo(() => buildRows(form), [form]);
  const blockers = useMemo(() => findSubmitBlockers(form), [form]);

  // Group rows by the *original* group id so we can look up category context;
  // the display label may be user-supplied for "otro_grupo".
  const byGroupId = useMemo(() => {
    const map = new Map<string, typeof rows>();
    for (const gid of form.selectedGroupIds) {
      const groupRows = rows.filter((r) => {
        const g = GROUPS.find((x) => x.id === gid);
        if (!g) return false;
        const label = groupDisplayLabel(g, form.customGroupName);
        return r.grupo === label;
      });
      if (groupRows.length > 0) map.set(gid, groupRows);
    }
    return map;
  }, [rows, form.selectedGroupIds, form.customGroupName]);

  const canSubmit = !headerHasErrors && blockers.length === 0 && !submitting;

  return (
    <section
      aria-labelledby="review-title"
      className="rounded-lg border border-border bg-surface p-6"
    >
      <h2 id="review-title" className="text-lg font-semibold text-primary">
        Revisar y enviar
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        Verifique el resumen a continuación antes de enviar.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <SummaryLine label="Razón social" value={form.company.razonSocial || '—'} />
        <SummaryLine label="País de origen" value={form.company.paisOrigen || '—'} />
        <SummaryLine
          label="Contacto principal"
          value={
            form.company.contactoPrincipalNombre
              ? `${form.company.contactoPrincipalNombre} · ${form.company.contactoPrincipalCorreo || '—'}`
              : '—'
          }
        />
        <SummaryLine
          label="Grupos seleccionados"
          value={form.selectedGroupIds.length.toString()}
        />
        <SummaryLine label="Celdas marcadas" value={rows.length.toString()} />
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-text">
          Detalle por grupo
        </h3>
        {byGroupId.size === 0 ? (
          <p className="mt-2 text-sm text-text-subtle">
            No hay celdas marcadas todavía.
          </p>
        ) : (
          <ul className="mt-2 space-y-3">
            {Array.from(byGroupId.entries()).map(([gid, rs]) => {
              const ctx = findGroupContext(gid);
              const grupoLabel = rs[0]?.grupo ?? gid;
              const contextTag = ctx
                ? `${ctx.category.label}${ctx.subcategory ? ' · ' + ctx.subcategory.label : ''}`
                : null;
              return (
                <li
                  key={gid}
                  className="rounded border border-border bg-surface-muted p-3"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="font-medium text-primary">{grupoLabel}</span>
                      {contextTag && (
                        <span className="text-xs text-text-subtle">{contextTag}</span>
                      )}
                    </div>
                    <span className="text-xs text-text-muted">
                      {rs.length} celda(s)
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-text">
                    {rs.map((r, i) => (
                      <li key={i}>
                        <span className="font-mono">{r.paisAplicacion}</span>
                        {' — '}
                        {r.servicio || <em>(sin subservicio)</em>}
                        {' · '}
                        <ModalidadBadge modalidad={r.modalidad} />
                        {r.servicioOtroDetalle && (
                          <span className="ml-1 text-text-subtle">
                            — “{r.servicioOtroDetalle}”
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {(headerHasErrors || blockers.length > 0) && (
        <div
          role="alert"
          className="mt-6 rounded border border-danger/40 bg-red-50 p-3 text-sm text-danger"
        >
          <p className="font-semibold">Corrija lo siguiente antes de enviar:</p>
          <ul className="mt-1 list-disc pl-5">
            {headerHasErrors && (
              <li>Complete los campos obligatorios del encabezado y corrija los correos.</li>
            )}
            {blockers.map((b) => (
              <li key={b.code}>{b.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex items-center justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="rounded bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Enviando…' : 'Enviar'}
        </button>
      </div>
    </section>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 rounded border border-border bg-surface-muted px-3 py-2">
      <span className="text-text-muted">{label}</span>
      <span className="text-right font-medium text-text">{value}</span>
    </div>
  );
}

function ModalidadBadge({ modalidad }: { modalidad: 'Directo' | 'Tercerizado' }) {
  if (modalidad === 'Directo') {
    return (
      <span className="inline-flex items-center rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
        Directo
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
      Tercerizado
    </span>
  );
}
