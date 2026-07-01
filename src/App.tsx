import { useMemo, useState } from 'react';
import { CompanyHeaderForm } from './components/CompanyHeaderForm';
import { EMPTY_COMPANY, type CompanyInfo } from './types/form';
import { hasErrors, validateCompany } from './lib/validation';

const SPI_LOGO = 'https://spiamericas.com/wp-content/uploads/2024/11/cropped-Logos-02-132x64.png';

export default function App() {
  const [company, setCompany] = useState<CompanyInfo>(EMPTY_COMPANY);
  const [submitted, setSubmitted] = useState(false);
  const errors = useMemo(() => validateCompany(company), [company]);
  const showErrors = submitted;
  const displayErrors = showErrors ? errors : {};

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

      <main className="mx-auto max-w-5xl px-6 py-8">
        <CompanyHeaderForm value={company} errors={displayErrors} onChange={setCompany} />

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm text-[color:var(--color-text-muted)]">
            Los siguientes pasos (grupos y matrices) se agregarán en la próxima fase.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="rounded bg-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[color:var(--color-primary-600)]"
          >
            Validar datos
          </button>
        </div>

        {submitted && !hasErrors(errors) && (
          <p
            role="status"
            className="mt-4 rounded border border-[color:var(--color-success)]/40 bg-emerald-50 px-4 py-2 text-sm text-[color:var(--color-success)]"
          >
            Datos de encabezado válidos.
          </p>
        )}
      </main>
    </div>
  );
}
