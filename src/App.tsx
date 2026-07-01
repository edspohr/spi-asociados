import { useMemo, useState } from 'react';
import { CompanyHeaderForm } from './components/CompanyHeaderForm';
import { GroupSelector } from './components/GroupSelector';
import { GroupSection } from './components/GroupSection';
import { GROUPS, type Country, type ServiceKey } from './data/form-config';
import { EMPTY_COMPANY, makeCellKey, type CompanyInfo, type GroupMatrix } from './types/form';
import { nextCellState } from './components/MatrixCell';
import { validateCompany } from './lib/validation';

const SPI_LOGO = 'https://spiamericas.com/wp-content/uploads/2024/11/cropped-Logos-02-132x64.png';

export default function App() {
  const [company, setCompany] = useState<CompanyInfo>(EMPTY_COMPANY);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [customGroupName, setCustomGroupName] = useState('');
  const [matrices, setMatrices] = useState<Record<string, GroupMatrix>>({});
  const [otherDetails, setOtherDetails] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => validateCompany(company), [company]);
  const displayErrors = submitted ? errors : {};

  const selectedGroups = useMemo(
    () => GROUPS.filter((g) => selectedGroupIds.includes(g.id)),
    [selectedGroupIds],
  );

  function toggleGroup(id: string, next: boolean) {
    setSelectedGroupIds((prev) =>
      next ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id),
    );
  }

  function cycleCell(groupId: string, service: ServiceKey | '', country: Country) {
    setMatrices((prev) => {
      const m: GroupMatrix = { ...(prev[groupId] ?? {}) };
      const key = makeCellKey(service, country);
      const current = m[key] ?? 'empty';
      const next = nextCellState(current);
      if (next === 'empty') delete m[key];
      else m[key] = next;
      return { ...prev, [groupId]: m };
    });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <img src={SPI_LOGO} alt="SPI Americas" className="h-12 w-auto" />
          <div>
            <h1 className="text-xl font-semibold text-[color:var(--color-primary)]">
              Hoja de Vida de Asociados
            </h1>
            <p className="text-sm text-[color:var(--color-text-muted)]">
              Formulario para caracterizar los servicios que presta su firma.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
        <CompanyHeaderForm value={company} errors={displayErrors} onChange={setCompany} />

        <GroupSelector
          selectedIds={selectedGroupIds}
          customGroupName={customGroupName}
          onToggle={toggleGroup}
          onCustomNameChange={setCustomGroupName}
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
                matrix={matrices[g.id] ?? {}}
                otherDetail={otherDetails[g.id] ?? ''}
                displayLabel={
                  g.id === 'otro_grupo' && customGroupName.trim()
                    ? `Otro grupo: ${customGroupName.trim()}`
                    : undefined
                }
                onCellCycle={(service, country) => cycleCell(g.id, service, country)}
                onOtherDetailChange={(v) =>
                  setOtherDetails((prev) => ({ ...prev, [g.id]: v }))
                }
              />
            ))}
          </section>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[color:var(--color-text-muted)]">
            Los siguientes pasos (autoguardado, revisión y envío) se agregarán en fases posteriores.
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
