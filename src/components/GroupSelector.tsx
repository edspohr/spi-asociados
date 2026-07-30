import { useState } from 'react';
import { CATEGORIES, type Group } from '../data/form-config';

type Props = {
  selectedIds: string[];
  customGroupName: string;
  onToggle: (groupId: string, next: boolean) => void;
  onToggleMany: (groupIds: string[], next: boolean) => void;
  onCustomNameChange: (name: string) => void;
};

function GroupCheckboxGrid({
  groups,
  selectedSet,
  onToggle,
}: {
  groups: Group[];
  selectedSet: Set<string>;
  onToggle: (id: string, next: boolean) => void;
}) {
  return (
    <ul
      role="group"
      className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3"
    >
      {groups.map((g) => {
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
  );
}

function BulkToggleButton({
  ids,
  selectedSet,
  onToggleMany,
}: {
  ids: string[];
  selectedSet: Set<string>;
  onToggleMany: (ids: string[], next: boolean) => void;
}) {
  const allSelected = ids.length > 0 && ids.every((id) => selectedSet.has(id));
  return (
    <button
      type="button"
      onClick={() => onToggleMany(ids, !allSelected)}
      className="text-xs text-primary underline hover:opacity-80"
    >
      {allSelected ? 'Desmarcar todos' : 'Marcar todos'}
    </button>
  );
}

function CollapsibleSection({
  id,
  title,
  defaultOpen = true,
  bulkIds,
  selectedSet,
  onToggleMany,
  children,
}: {
  id: string;
  title: string;
  defaultOpen?: boolean;
  bulkIds?: string[];
  selectedSet: Set<string>;
  onToggleMany: (ids: string[], next: boolean) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const markedCount = bulkIds ? bulkIds.filter((x) => selectedSet.has(x)).length : 0;
  return (
    <section aria-labelledby={`${id}-title`} className="rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={`${id}-body`}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <span aria-hidden className={`inline-block transition ${open ? 'rotate-90' : ''}`}>
            ▶
          </span>
          <span id={`${id}-title`} className="font-semibold text-primary">
            {title}
          </span>
          {bulkIds && bulkIds.length > 0 && (
            <span className="text-xs text-text-muted">
              ({markedCount}/{bulkIds.length})
            </span>
          )}
        </button>
        {bulkIds && bulkIds.length > 0 && (
          <BulkToggleButton
            ids={bulkIds}
            selectedSet={selectedSet}
            onToggleMany={onToggleMany}
          />
        )}
      </div>
      {open && (
        <div id={`${id}-body`} className="border-t border-border p-4">
          {children}
        </div>
      )}
    </section>
  );
}

export function GroupSelector({
  selectedIds,
  customGroupName,
  onToggle,
  onToggleMany,
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
        <h2 id="groups-title" className="text-lg font-semibold text-primary">
          Selección de grupos de producto
        </h2>
        <p className="text-sm text-text-muted">
          Marque únicamente los grupos con los que su firma trabaja. Solo se le pedirá completar
          las matrices de los grupos seleccionados.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {CATEGORIES.map((category) => {
          // Flat categories (PI, Derecho Comercial, Otro grupo)
          if (category.groups) {
            const ids = category.groups.map((g) => g.id);
            // "Otro grupo" is a singleton — no bulk toggle; render the name input when checked.
            const isOtroCategory = category.id === 'otro';
            return (
              <CollapsibleSection
                key={category.id}
                id={`cat-${category.id}`}
                title={category.label}
                bulkIds={isOtroCategory ? undefined : ids}
                selectedSet={selectedSet}
                onToggleMany={onToggleMany}
              >
                <GroupCheckboxGrid
                  groups={category.groups}
                  selectedSet={selectedSet}
                  onToggle={onToggle}
                />
                {isOtroCategory && otroSelected && (
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
              </CollapsibleSection>
            );
          }

          // Nested category (Asuntos Regulatorios)
          if (category.subcategories) {
            const allIds = category.subcategories.flatMap((s) => s.groups.map((g) => g.id));
            return (
              <CollapsibleSection
                key={category.id}
                id={`cat-${category.id}`}
                title={category.label}
                bulkIds={allIds}
                selectedSet={selectedSet}
                onToggleMany={onToggleMany}
              >
                <div className="flex flex-col gap-3">
                  {category.subcategories.map((sub) => {
                    const ids = sub.groups.map((g) => g.id);
                    return (
                      <CollapsibleSection
                        key={sub.id}
                        id={`subcat-${sub.id}`}
                        title={sub.label}
                        bulkIds={ids}
                        selectedSet={selectedSet}
                        onToggleMany={onToggleMany}
                      >
                        <GroupCheckboxGrid
                          groups={sub.groups}
                          selectedSet={selectedSet}
                          onToggle={onToggle}
                        />
                      </CollapsibleSection>
                    );
                  })}
                </div>
              </CollapsibleSection>
            );
          }

          return null;
        })}
      </div>

      <p className="mt-4 text-xs text-text-subtle">
        {selectedIds.length === 0
          ? 'Aún no ha seleccionado ningún grupo.'
          : `${selectedIds.length} grupo(s) seleccionados.`}
      </p>
    </section>
  );
}
