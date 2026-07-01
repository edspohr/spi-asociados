const SPI_LOGO = 'https://spiamericas.com/wp-content/uploads/2024/11/cropped-Logos-02-132x64.png';

type Props = { inserted: number; onNew: () => void };

export function SuccessScreen({ inserted, onNew }: Props) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-4">
          <img src={SPI_LOGO} alt="SPI Americas" className="h-12 w-auto" />
          <h1 className="text-xl font-semibold text-[color:var(--color-primary)]">
            Hoja de Vida de Asociados
          </h1>
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col items-start gap-4 px-6 py-12">
        <div
          role="status"
          className="w-full rounded-lg border border-[color:var(--color-success)]/40 bg-emerald-50 p-6"
        >
          <h2 className="text-lg font-semibold text-[color:var(--color-success)]">
            ¡Formulario enviado con éxito!
          </h2>
          <p className="mt-2 text-sm text-[color:var(--color-text)]">
            Gracias por completar la hoja de vida. Se registraron{' '}
            <strong>{inserted}</strong> fila(s) en la base de datos de SPI Americas.
          </p>
          <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">
            Si desea corregir o ampliar la información, comuníquese con su contacto en SPI.
          </p>
        </div>

        <button
          type="button"
          onClick={onNew}
          className="rounded border border-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-[color:var(--color-primary)] hover:bg-[color:var(--color-surface-muted)]"
        >
          Enviar otra empresa
        </button>
      </main>
    </div>
  );
}
