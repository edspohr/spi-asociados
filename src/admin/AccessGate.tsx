import { useState } from 'react';

type Props = {
  onKey: (key: string) => void;
  error?: string;
};

/**
 * Fallback screen shown when the URL has no `?key=` or the provided key was
 * rejected by listAssociates. The user can paste a key and retry — we do not
 * expose the field until the URL-based flow has already failed, so paste-in is
 * a rescue path rather than the primary entry point.
 */
export function AccessGate({ onKey, error }: Props) {
  const [value, setValue] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onKey(trimmed);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <form
        onSubmit={submit}
        className="w-full rounded-lg border border-border bg-surface p-8 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-primary">Panel de asociados</h1>
        <p className="mt-2 text-sm text-text-muted">
          Este panel es privado. Ingrese la clave de acceso que le fue compartida.
        </p>
        {error && (
          <p role="alert" className="mt-4 rounded border border-danger/40 bg-red-50 p-2 text-sm text-danger">
            {error}
          </p>
        )}
        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="font-medium text-text">Clave de acceso</span>
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            className="w-full rounded border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <button
          type="submit"
          disabled={!value.trim()}
          className="mt-4 w-full rounded bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}
