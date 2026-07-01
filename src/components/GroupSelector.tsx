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
      className="rounded-lg border border-border bg-surface p-6"
    >
      <header className="mb-4">
        <h2
          id="groups-title"
          className="text-lg font-semibold text-primary"
        >
          Selección de grupos de producto
        </h2>
        <p className="text-sm text-text-muted">
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
                    ? 'border-primary bg-surface-muted'
                    : 'border-border hover:border-accent-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => onToggle(g.id, e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-primary"
                />
                <span className="text-text">{g.label}</span>
              </label>
            </li>
          );
        })}
      </ul>

      {otroSelected && (
        <div className="mt-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-text">
              Nombre del otro grupo
              <span className="ml-1 text-danger">★</span>
            </span>
            <input
              type="text"
              value={customGroupName}
              onChange={(e) => onCustomNameChange(e.target.value)}
              placeholder="Especifique el nombre del grupo"
              className="w-full rounded border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>
      )}

      <p className="mt-4 text-xs text-text-subtle">
        {selectedIds.length === 0
          ? 'Aún no ha seleccionado ningún grupo.'
          : `${selectedIds.length} grupo(s) seleccionados.`}
      </p>
    </section>
  );
}
