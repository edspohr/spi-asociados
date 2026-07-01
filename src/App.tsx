import { useMemo, useState } from 'react';
import { CompanyHeaderForm } from './components/CompanyHeaderForm';
import { GroupSelector } from './components/GroupSelector';
import { GroupSection } from './components/GroupSection';
import { DraftIndicator } from './components/DraftIndicator';
import { GROUPS, type Country, type ServiceKey } from './data/form-config';
import { EMPTY_FORM, makeCellKey, type FormState, type GroupMatrix } from './types/form';
import { nextCellState } from './components/MatrixCell';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { validateCompany } from './lib/validation';

const SPI_LOGO = 'https://spiamericas.com/wp-content/uploads/2024/11/cropped-Logos-02-132x64.png';
const DRAFT_KEY = 'spi-asociados-draft';

export default function App() {
  const [form, setForm, clearDraft] = useLocalStorageState<FormState>(DRAFT_KEY, EMPTY_FORM, {
    version: 1,
  });
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => validateCompany(form.company), [form.company]);
  const displayErrors = submitted ? errors : {};

  const selectedGroups = useMemo(
    () => GROUPS.filter((g) => form.selectedGroupIds.includes(g.id)),
    [form.selectedGroupIds],
  );

  function toggleGroup(id: string, next: boolean) {
    setForm((prev) => {
      const selected = next
        ? Array.from(new Set([...prev.selectedGroupIds, id]))
        : prev.selectedGroupIds.filter((x) => x !== id);
      // Keep matrices/details for de-selected groups so users don't lose work
      // if they toggle by accident. They're pruned at submit time (P7).
      return { ...prev, selectedGroupIds: selected };
    });
  }

  function cycleCell(groupId: string, service: ServiceKey | '', country: Country) {
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
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <img src={SPI_LOGO} alt="SPI Americas" className="h-12 w-auto" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-[color:var(--color-primary)]">
              Hoja de Vida de Asociados
            </h1>
            <p className="text-sm text-[color:var(--color-text-muted)]">
              Formulario para caracterizar los servicios que presta su firma.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <DraftIndicator dep={form} />
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-[color:var(--color-text-subtle)] underline hover:text-[color:var(--color-primary)]"
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
          onCustomNameChange={(customGroupName) =>
            setForm((prev) => ({ ...prev, customGroupName }))
          }
        />

        {selectedGroups.length > 0 && (
          <section aria-label="Matrices por grupo" className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-[color:var(--color-primary)]">
              Matrices por grupo
            </h2>
            <p className="text-sm text-[color:var(--color-text-muted)]">
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

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[color:var(--color-text-muted)]">
            Revisión y envío se agregarán en la próxima fase.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="rounded bg-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[color:var(--color-primary-600)]"
          >
            Validar encabezado
          </button>
        </div>
      </main>
    </div>
  );
}
