import type { AssociateDoc } from './types';
import type { Filters } from './filters';
import { filteredRows } from './filters';

type Props = {
  all: AssociateDoc[];
  filters: Filters;
};

export function KpiCards({ all, filters }: Props) {
  const rows = filteredRows(all, filters);

  const associates = new Set<string>();
  const countries = new Set<string>();
  const services = new Set<string>();
  for (const { associate, row } of rows) {
    associates.add(associate.id);
    countries.add(row.paisAplicacion);
    services.add(row.servicio);
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Kpi label="Asociados" value={associates.size} sublabel="con al menos una coincidencia" />
      <Kpi label="Países cubiertos" value={countries.size} sublabel="según los filtros" />
      <Kpi label="Servicios distintos" value={services.size} sublabel="según los filtros" />
      <Kpi label="Celdas totales" value={rows.length} sublabel="filas que coinciden" />
    </div>
  );
}

function Kpi({ label, value, sublabel }: { label: string; value: number; sublabel: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-wide text-text-subtle">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-primary">{value}</p>
      <p className="text-xs text-text-muted">{sublabel}</p>
    </div>
  );
}
