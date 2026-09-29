import { useMemo } from 'react';
import type { FormState } from '../types/form';
import { buildRows, findSubmitBlockers, groupDisplayLabel } from '../lib/payload';
import { GROUPS, findGroupContext } from '../data/form-config';
import { useLang } from '../i18n/lang';
import { countryLabel, label } from '../i18n/labels';

type Props = {
  form: FormState;
  headerHasErrors: boolean;
  submitting: boolean;
  onSubmit: () => void;
  onBack?: () => void;
};

export function ReviewAndSubmit({ form, headerHasErrors, submitting, onSubmit, onBack }: Props) {
  const { lang, t } = useLang();
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
        {t.reviewTitle}
      </h2>
      <p className="mt-1 text-sm text-text-muted">{t.reviewIntro}</p>

      <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <SummaryLine label={t.razonSocial} value={form.company.razonSocial || '—'} />
        <SummaryLine label={t.paisOrigen} value={form.company.paisOrigen || '—'} />
        <SummaryLine
          label={t.contactoPrincipal}
          value={
            form.company.contactoPrincipalNombre
              ? `${form.company.contactoPrincipalNombre} · ${form.company.contactoPrincipalCorreo || '—'}`
              : '—'
          }
        />
        <SummaryLine
          label={t.operatingCountries}
          value={
            form.selectedCountries.length === 0
              ? '—'
              : `${form.selectedCountries.length} — ${form.selectedCountries
                  .map((c) => countryLabel(c, lang))
                  .join(', ')}`
          }
        />
        <SummaryLine
          label={t.selectedGroups}
          value={form.selectedGroupIds.length.toString()}
        />
        <SummaryLine label={t.markedCells} value={rows.length.toString()} />
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-text">
          {t.detailByGroup}
        </h3>
        {byGroupId.size === 0 ? (
          <p className="mt-2 text-sm text-text-subtle">{t.noMarkedCells}</p>
        ) : (
          <ul className="mt-2 space-y-3">
            {Array.from(byGroupId.entries()).map(([gid, rs]) => {
              const ctx = findGroupContext(gid);
              const grupoLabel = label(rs[0]?.grupo ?? gid, lang);
              const contextTag = ctx
                ? `${label(ctx.category.label, lang)}${
                    ctx.subcategory ? ' · ' + label(ctx.subcategory.label, lang) : ''
                  }`
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
                      {t.cellsCount(rs.length)}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-text">
                    {rs.map((r, i) => (
                      <li key={i}>
                        <span className="font-mono">{countryLabel(r.paisAplicacion, lang)}</span>
                        {' — '}
                        {r.servicio ? label(r.servicio, lang) : <em>{t.noSubservice}</em>}
                        {' · '}
                        <ModalidadBadge modalidad={r.modalidad} />
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
          <p className="font-semibold">{t.fixBeforeSubmit}</p>
          <ul className="mt-1 list-disc pl-5">
            {headerHasErrors && <li>{t.headerFieldsError}</li>}
            {blockers.map((b) => (
              <li key={b.code}>{t.blockers[b.code] ?? b.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded border border-border bg-white px-4 py-2 text-sm font-medium text-text hover:border-primary"
          >
            {t.backToStep2}
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="rounded bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? t.submitting : t.submit}
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
  const { t } = useLang();
  if (modalidad === 'Directo') {
    return (
      <span className="inline-flex items-center rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
        {t.cellDirecto}
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
      {t.cellTercerizado}
    </span>
  );
}
