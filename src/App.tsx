const SPI_LOGO = 'https://spiamericas.com/wp-content/uploads/2024/11/cropped-Logos-02-132x64.png';

export default function App() {
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
        <section className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[color:var(--color-primary)]">
            Vista previa de tokens de marca (P1)
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Swatch label="Primary" varName="--color-primary" />
            <Swatch label="Primary 700" varName="--color-primary-700" />
            <Swatch label="Accent" varName="--color-accent" />
            <Swatch label="Accent 600" varName="--color-accent-600" />
            <Swatch label="Outsourced" varName="--color-outsourced" />
            <Swatch label="Surface muted" varName="--color-surface-muted" dark />
            <Swatch label="Text" varName="--color-text" />
            <Swatch label="Border" varName="--color-border" dark />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <StateCell state="empty" />
            <StateCell state="directo" />
            <StateCell state="tercerizado" />
            <span className="text-sm text-[color:var(--color-text-muted)]">
              Vista previa del control de estado (final en P5).
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}

function Swatch({ label, varName, dark = false }: { label: string; varName: string; dark?: boolean }) {
  return (
    <div className="overflow-hidden rounded border border-[color:var(--color-border)]">
      <div
        className="h-14"
        style={{ backgroundColor: `var(${varName})` }}
        aria-hidden
      />
      <div className="px-2 py-1 text-xs">
        <div className={dark ? 'text-[color:var(--color-text)]' : 'text-[color:var(--color-text)]'}>
          {label}
        </div>
        <div className="text-[color:var(--color-text-subtle)]">{varName}</div>
      </div>
    </div>
  );
}

function StateCell({ state }: { state: 'empty' | 'directo' | 'tercerizado' }) {
  if (state === 'directo') {
    return (
      <span className="inline-flex h-10 w-10 items-center justify-center rounded bg-[color:var(--color-primary)] font-semibold text-white">
        D
      </span>
    );
  }
  if (state === 'tercerizado') {
    return (
      <span
        className="inline-flex h-10 w-10 items-center justify-center rounded font-semibold text-white"
        style={{
          backgroundColor: 'var(--color-outsourced)',
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0 4px, transparent 4px 8px)',
        }}
      >
        T
      </span>
    );
  }
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text-subtle)]">
      —
    </span>
  );
}
