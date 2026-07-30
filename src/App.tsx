import { useMemo, useState } from 'react';
import { CompanyHeaderForm } from './components/CompanyHeaderForm';
import { GroupSelector } from './components/GroupSelector';
import { GroupSection } from './components/GroupSection';
import { DraftIndicator } from './components/DraftIndicator';
import { ReviewAndSubmit } from './components/ReviewAndSubmit';
import { SuccessScreen } from './components/SuccessScreen';
import { GROUPS, type Country } from './data/form-config';
import { EMPTY_FORM, makeCellKey, type FormState, type GroupMatrix } from './types/form';
import { nextCellState } from './components/MatrixCell';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { hasErrors, validateCompany } from './lib/validation';
import { buildPayload } from './lib/payload';
import { submitForm } from './lib/submit';

const SPI_LOGO = '/logo.png';
const DRAFT_KEY = 'spi-asociados-draft';

export default function App() {
  const [form, setForm, clearDraft] = useLocalStorageState<FormState>(DRAFT_KEY, EMPTY_FORM, {
    version: 2,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const errors = useMemo(() => validateCompany(form.company), [form.company]);
  const headerHasErrors = hasErrors(errors);
  const displayErrors = submitted ? errors : {};

  const selectedGroups = useMemo(
    () => GROUPS.filter((g) => form.selectedGroupIds.includes(g.id)),
    [form.selectedGroupIds],
  );

  function toggleGroup(id: string, next: boolean) {
    setForm((prev) => ({
      ...prev,
      selectedGroupIds: next
        ? Array.from(new Set([...prev.selectedGroupIds, id]))
        : prev.selectedGroupIds.filter((x) => x !== id),
    }));
  }

  function toggleGroupMany(ids: string[], next: boolean) {
    setForm((prev) => {
      const current = new Set(prev.selectedGroupIds);
      if (next) ids.forEach((id) => current.add(id));
      else ids.forEach((id) => current.delete(id));
      return { ...prev, selectedGroupIds: Array.from(current) };
    });
  }

  function cycleCell(groupId: string, service: string, country: Country) {
    setForm((prev) => {
      const m: GroupMatrix = { ...(prev.matrices[groupId] ?? {}) };
      const key = makeCellKey(service, country);
      const current = m[key] ?? 'empty';
      const next = nextCellState(current);
      if (next === 'empty') delete m[key];
      else m[key] = next;
      return { ...prev, matrices: { ...prev.matrices, [groupId]: m } };
    });
  }

  function handleReset() {
    if (
      window.confirm(
        '¿Está seguro que desea empezar de nuevo? Se perderán todos los datos ingresados.',
      )
    ) {
      clearDraft();
      setSubmitted(false);
      setSubmitError(null);
      setSuccessCount(null);
    }
  }

  async function handleSubmit() {
    setSubmitted(true);
    if (headerHasErrors) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = buildPayload(form);
      const result = await submitForm(payload);
      if (result.ok) {
        setSuccessCount(result.inserted);
        clearDraft();
      } else {
        setSubmitError(result.error);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (successCount !== null) {
    return (
      <SuccessScreen
        inserted={successCount}
        onNew={() => {
          setSuccessCount(null);
          setSubmitted(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <img src={SPI_LOGO} alt="SPI Americas" className="h-14 w-auto" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-primary">
              Hoja de Vida de Asociados
            </h1>
            <p className="text-sm text-text-muted">
              Formulario para caracterizar los servicios que presta su firma.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <DraftIndicator dep={form} />
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-text-subtle underline hover:text-primary"
            >
              Empezar de nuevo
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
        <CompanyHeaderForm
          value={form.company}
          errors={displayErrors}
          onChange={(company) => setForm((prev) => ({ ...prev, company }))}
        />

        <GroupSelector
          selectedIds={form.selectedGroupIds}
          customGroupName={form.customGroupName}
          onToggle={toggleGroup}
          onToggleMany={toggleGroupMany}
          onCustomNameChange={(customGroupName) =>
            setForm((prev) => ({ ...prev, customGroupName }))
          }
        />

        {selectedGroups.length > 0 && (
          <section aria-label="Matrices por grupo" className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-primary">
              Matrices por grupo
            </h2>
            <p className="text-sm text-text-muted">
              Haga clic en cada celda para alternar entre <strong>No ofrecido</strong>,{' '}
              <strong>Directo</strong> y <strong>Tercerizado</strong>. También puede usar las
              flechas del teclado para moverse y la barra espaciadora / Enter para cambiar el
              estado.
            </p>
            {selectedGroups.map((g) => (
              <GroupSection
                key={g.id}
                group={g}
                matrix={form.matrices[g.id] ?? {}}
                otherDetail={form.otherServiceDetail[g.id] ?? ''}
                displayLabel={
                  g.id === 'otro_grupo' && form.customGroupName.trim()
                    ? `Otro grupo: ${form.customGroupName.trim()}`
                    : undefined
                }
                onCellCycle={(service, country) => cycleCell(g.id, service, country)}
                onOtherDetailChange={(v) =>
                  setForm((prev) => ({
                    ...prev,
                    otherServiceDetail: { ...prev.otherServiceDetail, [g.id]: v },
                  }))
                }
              />
            ))}
          </section>
        )}

        <ReviewAndSubmit
          form={form}
          headerHasErrors={headerHasErrors}
          submitting={submitting}
          onSubmit={handleSubmit}
        />

        {submitError && (
          <div
            role="alert"
            className="rounded border border-danger/40 bg-red-50 p-3 text-sm text-danger"
          >
            No fue posible enviar el formulario: {submitError}
          </div>
        )}
      </main>
    </div>
  );
}
