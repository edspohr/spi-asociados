import { GROUPS } from '../data/form-config';

type Props = {
  selectedIds: string[];
  customGroupName: string;
  onToggle: (groupId: string, next: boolean) => void;
  onCustomNameChange: (name: string) => void;
};

export function GroupSelector({
  selectedIds,
  customGroupName,
  onToggle,
  onCustomNameChange,
}: Props) {
  const selectedSet = new Set(selectedIds);
  const otroSelected = selectedSet.has('otro_grupo');

  return (
    <section
      aria-labelledby="groups-title"
      className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6"
    >
      <header className="mb-4">
        <h2
          id="groups-title"
          className="text-lg font-semibold text-[color:var(--color-primary)]"
        >
          Selección de grupos de producto
        </h2>
        <p className="text-sm text-[color:var(--color-text-muted)]">
          Marque únicamente los grupos con los que su firma trabaja. Solo se le pedirá completar
          las matrices de los grupos seleccionados.
        </p>
      </header>

      <ul
        role="group"
        aria-label="Grupos de producto"
        className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3"
      >
        {GROUPS.map((g) => {
          const checked = selectedSet.has(g.id);
          return (
            <li key={g.id}>
              <label
                className={`flex items-start gap-2 rounded border p-2 text-sm transition ${
                  checked
                    ? 'border-[color:var(--color-primary)] bg-[color:var(--color-surface-muted)]'
                    : 'border-[color:var(--color-border)] hover:border-[color:var(--color-accent-600)]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => onToggle(g.id, e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[color:var(--color-primary)]"
                />
                <span className="text-[color:var(--color-text)]">{g.label}</span>
              </label>
            </li>
          );
        })}
      </ul>

      {otroSelected && (
        <div className="mt-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[color:var(--color-text)]">
              Nombre del otro grupo
              <span className="ml-1 text-[color:var(--color-danger)]">★</span>
            </span>
            <input
              type="text"
              value={customGroupName}
              onChange={(e) => onCustomNameChange(e.target.value)}
              placeholder="Especifique el nombre del grupo"
              className="w-full rounded border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
            />
          </label>
        </div>
      )}

      <p className="mt-4 text-xs text-[color:var(--color-text-subtle)]">
        {selectedIds.length === 0
          ? 'Aún no ha seleccionado ningún grupo.'
          : `${selectedIds.length} grupo(s) seleccionados.`}
      </p>
    </section>
  );
}
