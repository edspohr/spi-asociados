import { useMemo, useState } from 'react';
import { CompanyHeaderForm } from './components/CompanyHeaderForm';
import { GroupSelector } from './components/GroupSelector';
import { GROUPS } from './data/form-config';
import { EMPTY_COMPANY, type CompanyInfo } from './types/form';
import { validateCompany } from './lib/validation';

const SPI_LOGO = 'https://spiamericas.com/wp-content/uploads/2024/11/cropped-Logos-02-132x64.png';

export default function App() {
  const [company, setCompany] = useState<CompanyInfo>(EMPTY_COMPANY);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [customGroupName, setCustomGroupName] = useState('');
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
          <section
            aria-labelledby="preview-title"
            className="rounded-lg border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6"
          >
            <h2
              id="preview-title"
              className="mb-2 text-lg font-semibold text-[color:var(--color-primary)]"
            >
              Vista previa: grupos seleccionados (matrices en P5)
            </h2>
            <ul className="list-disc pl-6 text-sm text-[color:var(--color-text)]">
              {selectedGroups.map((g) => (
                <li key={g.id}>
                  {g.id === 'otro_grupo' && customGroupName.trim()
                    ? `${g.label} — "${customGroupName.trim()}"`
                    : g.label}
                  {g.singleRow && (
                    <span className="ml-2 text-xs text-[color:var(--color-text-subtle)]">
                      (una sola fila)
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[color:var(--color-text-muted)]">
            Los siguientes pasos (matriz de servicios × países, revisión y envío) se agregarán en
            fases posteriores.
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
