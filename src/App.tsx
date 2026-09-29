import { useMemo, useState } from 'react';
import { CompanyHeaderForm } from './components/CompanyHeaderForm';
import { GroupSelector } from './components/GroupSelector';
import { GroupSection } from './components/GroupSection';
import { RegionCountrySelector } from './components/RegionCountrySelector';
import { DraftIndicator } from './components/DraftIndicator';
import { ReviewAndSubmit } from './components/ReviewAndSubmit';
import { SuccessScreen } from './components/SuccessScreen';
import { StepIndicator } from './components/StepIndicator';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useLang } from './i18n/lang';
import { label } from './i18n/labels';
import { GROUPS, groupSelectedByCategory } from './data/form-config';
import { COUNTRIES, type CountryCode, type CountryDef } from './data/countries';
import { EMPTY_FORM, makeCellKey, type FormState, type GroupMatrix } from './types/form';
import { nextCellState } from './components/MatrixCell';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { hasErrors, validateCompany } from './lib/validation';
import { buildPayload, findStage1Blockers } from './lib/payload';
import { submitForm } from './lib/submit';
import {
  applyBulk,
  columnKeys,
  nextBulkState,
  readStates,
  rowKeys,
} from './lib/matrix';

const SPI_LOGO = '/logo.png';
const DRAFT_KEY = 'spi-asociados-draft';

type Stage = 1 | 2 | 3;

export default function App() {
  const { lang, t } = useLang();
  const [form, setForm, clearDraft] = useLocalStorageState<FormState>(DRAFT_KEY, EMPTY_FORM, {
    version: 4,
  });
  const [stage, setStage] = useState<Stage>(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const errors = useMemo(
    () => validateCompany(form.company, t.validation),
    [form.company, t.validation],
  );
  const headerHasErrors = hasErrors(errors);
  const displayErrors = submitted ? errors : {};
  const stage1Blockers = useMemo(() => findStage1Blockers(form), [form]);

  const selectedGroups = useMemo(
    () => GROUPS.filter((g) => form.selectedGroupIds.includes(g.id)),
    [form.selectedGroupIds],
  );

  const groupedSelection = useMemo(
    () => groupSelectedByCategory(form.selectedGroupIds),
    [form.selectedGroupIds],
  );

  // Preserve the ISO ordering of COUNTRIES (Sudamérica first, then the rest)
  // regardless of the order the user checks countries in.
  const activeCountries: CountryDef[] = useMemo(() => {
    const set = new Set(form.selectedCountries);
    return COUNTRIES.filter((c) => set.has(c.code2));
  }, [form.selectedCountries]);

  const steps = t.steps.map((stepLabel, i) => ({ n: i + 1, label: stepLabel }));

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

  function cycleCell(groupId: string, service: string, country: CountryCode) {
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

  function cycleColumn(groupId: string, country: CountryCode) {
    setForm((prev) => {
      const group = GROUPS.find((g) => g.id === groupId);
      if (!group) return prev;
      const m = prev.matrices[groupId] ?? {};
      const keys = columnKeys(group.services, country);
      const next = nextBulkState(readStates(m, keys));
      return {
        ...prev,
        matrices: { ...prev.matrices, [groupId]: applyBulk(m, keys, next) },
      };
    });
  }

  function cycleRow(groupId: string, service: string) {
    setForm((prev) => {
      const m = prev.matrices[groupId] ?? {};
      const keys = rowKeys(service, form.selectedCountries);
      const next = nextBulkState(readStates(m, keys));
      return {
        ...prev,
        matrices: { ...prev.matrices, [groupId]: applyBulk(m, keys, next) },
      };
    });
  }

  function handleReset() {
    if (
      window.confirm(t.confirmReset)
    ) {
      clearDraft();
      setSubmitted(false);
      setSubmitError(null);
      setSuccessCount(null);
      setStage(1);
    }
  }

  function goToStage2() {
    setSubmitted(true);
    if (headerHasErrors || stage1Blockers.length > 0) return;
    setStage(2);
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goToStage3() {
    setStage(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack(to: Stage) {
    setStage(to);
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          setStage(1);
        }}
      />
    );
  }

  const canAdvanceStage1 = !headerHasErrors && stage1Blockers.length === 0;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <img src={SPI_LOGO} alt="SPI Americas" className="h-14 w-auto" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-primary">{t.appTitle}</h1>
            <p className="text-sm text-text-muted">{t.appSubtitle}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <LanguageSwitcher />
            <DraftIndicator dep={form} />
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-text-subtle underline hover:text-primary"
            >
              {t.startOver}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
        <StepIndicator steps={steps} current={stage} onJump={(n) => goBack(n as Stage)} />

        {stage === 1 && (
          <>
            <CompanyHeaderForm
              value={form.company}
              errors={displayErrors}
              onChange={(company) => setForm((prev) => ({ ...prev, company }))}
            />

            <RegionCountrySelector
              selected={form.selectedCountries}
              onChange={(selectedCountries) =>
                setForm((prev) => ({ ...prev, selectedCountries }))
              }
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

            {submitted && (headerHasErrors || stage1Blockers.length > 0) && (
              <div
                role="alert"
                className="rounded border border-danger/40 bg-red-50 p-3 text-sm text-danger"
              >
                <p className="font-semibold">{t.fixBeforeContinue}</p>
                <ul className="mt-1 list-disc pl-5">
                  {headerHasErrors && <li>{t.headerFieldsError}</li>}
                  {stage1Blockers.map((b) => (
                    <li key={b.code}>{t.blockers[b.code] ?? b.message}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={goToStage2}
                disabled={submitted && !canAdvanceStage1}
                className="rounded bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.continueToStep2}
              </button>
            </div>
          </>
        )}

        {stage === 2 && (
          <>
            <section
              aria-label={t.matricesAria}
              className="flex flex-col gap-3"
            >
              <h2 className="text-lg font-semibold text-primary">{t.step2Title}</h2>
              <p className="text-sm text-text-muted">
                {t.step2Intro[0]}
                <strong>{t.cellEmpty}</strong>, <strong>{t.cellDirecto}</strong>
                {t.step2Intro[1]}
                <strong>{t.cellTercerizado}</strong>
                {t.step2Intro[2]}
              </p>
              {selectedGroups.length === 0 ? (
                <p className="rounded border border-border bg-surface p-4 text-sm text-text-muted">
                  {t.noGroupsSelected}
                </p>
              ) : (
                groupedSelection.map((bucket) => (
                  <div key={bucket.category.id} className="flex flex-col gap-3">
                    <h3 className="mt-2 text-base font-semibold text-primary">
                      {label(bucket.category.label, lang)}
                    </h3>
                    {bucket.directGroups.map((g) => (
                      <GroupSection
                        key={g.id}
                        group={g}
                        countries={activeCountries}
                        matrix={form.matrices[g.id] ?? {}}
                        displayLabel={
                          g.id === 'otro_grupo' && form.customGroupName.trim()
                            ? `${t.otherGroupPrefix}: ${form.customGroupName.trim()}`
                            : undefined
                        }
                        onCellCycle={(service, country) => cycleCell(g.id, service, country)}
                        onColumnCycle={(country) => cycleColumn(g.id, country)}
                        onRowCycle={(service) => cycleRow(g.id, service)}
                      />
                    ))}
                    {bucket.subcategories.map(({ subcategory, groups }) => (
                      <div key={subcategory.id} className="flex flex-col gap-3">
                        {groups.map((g) => (
                          <GroupSection
                            key={g.id}
                            group={g}
                            countries={activeCountries}
                            matrix={form.matrices[g.id] ?? {}}
                            onCellCycle={(service, country) => cycleCell(g.id, service, country)}
                            onColumnCycle={(country) => cycleColumn(g.id, country)}
                            onRowCycle={(service) => cycleRow(g.id, service)}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </section>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => goBack(1)}
                className="rounded border border-border bg-white px-4 py-2 text-sm font-medium text-text hover:border-primary"
              >
                {t.backToStep1}
              </button>
              <button
                type="button"
                onClick={goToStage3}
                className="rounded bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-600"
              >
                {t.continueToReview}
              </button>
            </div>
          </>
        )}

        {stage === 3 && (
          <>
            <ReviewAndSubmit
              form={form}
              headerHasErrors={headerHasErrors}
              submitting={submitting}
              onSubmit={handleSubmit}
              onBack={() => goBack(2)}
            />

            {submitError && (
              <div
                role="alert"
                className="rounded border border-danger/40 bg-red-50 p-3 text-sm text-danger"
              >
                {t.submitFailed} {submitError}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
