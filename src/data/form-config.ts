export const COUNTRIES = [
  'Argentina',
  'Bolivia',
  'Brasil',
  'Chile',
  'Colombia',
  'Ecuador',
  'Guyana',
  'Paraguay',
  'Perú',
  'Surinam',
  'Uruguay',
  'Venezuela',
] as const;
export type Country = (typeof COUNTRIES)[number];

export type ServiceKey =
  | 'CONSULTORIA'
  | 'HOSTING'
  | 'PROF_RESP'
  | 'VIGILANCIA'
  | 'IMPORT_DIST'
  | 'SERV_TECNICO'
  | 'ALMACENAMIENTO'
  | 'ENSAYOS'
  | 'OTRO';

export const SERVICE_LABELS: Record<ServiceKey, string> = {
  CONSULTORIA: 'Consultoría regulatoria',
  HOSTING: 'Hosting',
  PROF_RESP: 'Profesional responsable',
  VIGILANCIA: 'Vigilancia pos mercado',
  IMPORT_DIST: 'Importación y distribución',
  SERV_TECNICO: 'Servicio técnico',
  ALMACENAMIENTO: 'Almacenamiento',
  ENSAYOS: 'Ensayos clínicos',
  OTRO: 'Otro',
};

/**
 * Tooltip glossary: alternative/colloquial names per service.
 * Only HOSTING is confirmed today. Empty strings are TODO(SPI) placeholders —
 * the UI renders a tooltip only when a non-empty string exists.
 */
export const SERVICE_TOOLTIPS: Partial<Record<ServiceKey, string>> = {
  HOSTING: 'También conocido como “representación legal”.',
  CONSULTORIA: '', // TODO(SPI): nombre(s) alternativo(s)
  PROF_RESP: '', // TODO(SPI): nombre(s) alternativo(s)
  VIGILANCIA: '', // TODO(SPI): p. ej. tecnovigilancia / farmacovigilancia
  IMPORT_DIST: '', // TODO(SPI)
  SERV_TECNICO: '', // TODO(SPI)
  ALMACENAMIENTO: '', // TODO(SPI)
  ENSAYOS: '', // TODO(SPI)
};

export type Group = {
  id: string;
  label: string;
  singleRow?: boolean;
  allowCustomName?: boolean;
  services?: ServiceKey[];
};

const FULL: ServiceKey[] = [
  'CONSULTORIA',
  'HOSTING',
  'PROF_RESP',
  'VIGILANCIA',
  'IMPORT_DIST',
  'ALMACENAMIENTO',
  'ENSAYOS',
  'OTRO',
];

const BASIC: ServiceKey[] = [
  'CONSULTORIA',
  'HOSTING',
  'PROF_RESP',
  'IMPORT_DIST',
  'ALMACENAMIENTO',
  'OTRO',
];

export const GROUPS: Group[] = [
  { id: 'propiedad_intelectual', label: 'Propiedad Intelectual', singleRow: true },
  { id: 'servicios_legales', label: 'Servicios Legales', singleRow: true },

  {
    id: 'dispositivos_medicos',
    label: 'Dispositivos médicos',
    services: [
      'CONSULTORIA',
      'HOSTING',
      'PROF_RESP',
      'VIGILANCIA',
      'IMPORT_DIST',
      'SERV_TECNICO',
      'ALMACENAMIENTO',
      'ENSAYOS',
      'OTRO',
    ],
  },

  { id: 'alimentos', label: 'Alimentos', services: BASIC },
  { id: 'bebidas_alcoholicas', label: 'Bebidas alcohólicas', services: BASIC },
  { id: 'cosmeticos', label: 'Cosméticos', services: FULL },
  { id: 'medicamentos', label: 'Medicamentos', services: FULL },
  { id: 'homeopaticos', label: 'Homeopáticos', services: FULL },
  {
    id: 'fitoterapeuticos',
    label: 'Fito terapéuticos (productos herbales)',
    services: FULL,
  },
  { id: 'suplementos_dietarios', label: 'Suplementos dietarios', services: BASIC },

  { id: 'vet_alimentos', label: 'Productos veterinarios: alimentos', services: BASIC },
  { id: 'vet_medicamentos', label: 'Productos veterinarios: medicamentos', services: FULL },
  { id: 'vet_homeopaticos', label: 'Productos veterinarios: homeopáticos', services: FULL },
  {
    id: 'vet_fitoterapeuticos',
    label: 'Productos veterinarios: fito terapéuticos (productos herbales)',
    services: FULL,
  },
  { id: 'vet_suplementos', label: 'Productos veterinarios: suplementos', services: BASIC },

  { id: 'agricolas', label: 'Productos agrícolas', services: BASIC },
  { id: 'agropecuarios', label: 'Productos agropecuarios', services: BASIC },
  {
    id: 'aseo_domestico',
    label: 'Productos de aseo e higiene de uso doméstico',
    services: BASIC,
  },
  {
    id: 'aseo_industrial',
    label: 'Productos de aseo e higiene de uso industrial',
    services: BASIC,
  },
  { id: 'plaguicidas_domesticos', label: 'Plaguicidas de uso doméstico', services: BASIC },

  {
    id: 'otro_grupo',
    label: 'Otro grupo',
    allowCustomName: true,
    services: [
      'CONSULTORIA',
      'HOSTING',
      'PROF_RESP',
      'VIGILANCIA',
      'IMPORT_DIST',
      'SERV_TECNICO',
      'ALMACENAMIENTO',
      'ENSAYOS',
      'OTRO',
    ],
  },
];
