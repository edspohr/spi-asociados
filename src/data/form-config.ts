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

export type Group = {
  id: string;
  label: string;
  services: string[];
  allowCustomName?: boolean;
};

export type Subcategory = {
  id: string;
  label: string;
  groups: Group[];
};

export type Category = {
  id: string;
  label: string;
  groups?: Group[];
  subcategories?: Subcategory[];
};

// Regulatorios "para todos" — común a cada subgrupo de la categoría.
const COMMON_REGULATORIOS: string[] = [
  'Consultoría regulatoria',
  'Hosting/tenencia de registro',
  'Profesional responsable/responsable técnico',
  'Importación',
  'Almacenamiento',
  'Distribución',
  'Consultoría para certificaciones GMP/GLP/similares',
  'Otros',
];

const SERVICES_PI: string[] = [
  'Marcas y signos distintivos',
  'Patentes',
  'Derechos de autor',
  'Competencia desleal',
  'Litigios',
  'Consultoría de diseño de marca',
  'Valoración de activos intangibles',
  'Protección al consumidor',
  'Diseño e implementación de políticas de protección de datos personales',
  'Procesos sancionatorios',
];

const SERVICES_DERECHO_COMERCIAL: string[] = [
  'Constitución y derecho societario',
  'Contratos comerciales',
  'Fusiones, adquisiciones y due diligence',
  'Inversión extranjera y aterrizaje en Colombia',
  'Derecho tributario',
  'Asesoría en obligaciones y planeación tributaria',
  'Derecho de aduanas',
  'Protección de datos personales (Habeas Data)',
  'Protección al consumidor',
];

const SERVICES_OTRO_GRUPO: string[] = [
  'Consultoría regulatoria',
  'Hosting',
  'Profesional responsable',
  'Vigilancia postmercado',
  'Importación y distribución',
  'Servicio técnico',
  'Almacenamiento',
  'Ensayos clínicos',
  'Otro',
];

function regGroup(id: string, label: string, specifics: string[] = []): Group {
  return { id, label, services: [...COMMON_REGULATORIOS, ...specifics] };
}

export const CATEGORIES: Category[] = [
  {
    id: 'propiedad_intelectual',
    label: 'Propiedad Intelectual',
    groups: [
      { id: 'pi', label: 'Propiedad Intelectual', services: SERVICES_PI },
    ],
  },
  {
    id: 'derecho_comercial',
    label: 'Derecho Comercial',
    groups: [
      {
        id: 'derecho_comercial',
        label: 'Derecho Comercial',
        services: SERVICES_DERECHO_COMERCIAL,
      },
    ],
  },
  {
    id: 'asuntos_regulatorios',
    label: 'Asuntos Regulatorios',
    subcategories: [
      {
        id: 'reg_uso_humano',
        label: 'Uso Humano',
        groups: [
          regGroup('reg_dispositivos_medicos', 'Dispositivos Médicos', [
            'Servicio técnico',
            'Ensayos clínicos',
            'Vigilancia postmercado/tecnovigilancia',
            'Reportes UDI DI',
          ]),
          regGroup('reg_alimentos', 'Alimentos', [
            'Inscripción de planta',
            'Ensayos de control de calidad',
            'Elaboración de tablas nutricionales/información nutricional',
          ]),
          regGroup('reg_bebidas_alcoholicas', 'Bebidas alcohólicas', [
            'Inscripción de planta',
            'Ensayos de control de calidad',
          ]),
          regGroup('reg_cosmeticos', 'Cosméticos', [
            'Ensayos de control de calidad',
            'Vigilancia postmercado/cosmetovigilancia',
          ]),
          regGroup('reg_med_sintesis', 'Medicamentos de síntesis química', [
            'Vigilancia postmercado/farmacovigilancia',
            'Ensayos clínicos',
          ]),
          regGroup('reg_med_biologicos', 'Medicamentos biológicos', [
            'Vigilancia postmercado/farmacovigilancia',
            'Ensayos clínicos',
          ]),
          regGroup('reg_homeopaticos', 'Homeopáticos', [
            'Vigilancia postmercado/farmacovigilancia',
            'Ensayos clínicos',
          ]),
          regGroup('reg_fitoterapeuticos', 'Fito terapéuticos (productos herbales)', [
            'Inclusión de nuevos ingredientes/indicaciones en listados aprobados',
          ]),
          regGroup('reg_suplementos', 'Suplementos dietarios', [
            'Ensayos de control de calidad',
            'Elaboración de tablas nutricionales/información nutricional',
            'Evaluación de seguridad y eficacia de ingredientes',
            'Inclusión de nuevos ingredientes en listados aprobados',
          ]),
          regGroup('reg_aseo_domestico', 'Productos de aseo e higiene de uso doméstico'),
          regGroup('reg_aseo_industrial', 'Productos de aseo e higiene de uso industrial'),
          regGroup('reg_plaguicidas', 'Plaguicidas de uso doméstico', [
            'Ensayos de toxicidad',
          ]),
        ],
      },
      {
        id: 'reg_veterinarios',
        label: 'Veterinarios',
        groups: [
          regGroup('vet_alimentos', 'Alimentos'),
          regGroup('vet_medicamentos', 'Medicamentos'),
          regGroup('vet_insumos_medicos', 'Insumos médicos'),
          regGroup('vet_suplementos', 'Suplementos dietarios'),
        ],
      },
      {
        id: 'reg_uso_agricola',
        label: 'Uso Agrícola',
        groups: [
          regGroup('reg_agricolas', 'Productos agrícolas', [
            'Ensayos de eficacia agronómica',
            'Ensayos de toxicidad',
          ]),
        ],
      },
    ],
  },
  {
    id: 'otro',
    label: 'Otro grupo',
    groups: [
      {
        id: 'otro_grupo',
        label: 'Otro grupo',
        allowCustomName: true,
        services: SERVICES_OTRO_GRUPO,
      },
    ],
  },
];

function flattenGroups(categories: Category[]): Group[] {
  const out: Group[] = [];
  for (const cat of categories) {
    if (cat.groups) out.push(...cat.groups);
    if (cat.subcategories) {
      for (const sub of cat.subcategories) out.push(...sub.groups);
    }
  }
  return out;
}

export const GROUPS: Group[] = flattenGroups(CATEGORIES);

export type GroupContext = {
  category: Category;
  subcategory?: Subcategory;
  group: Group;
};

export function findGroupContext(groupId: string): GroupContext | undefined {
  for (const category of CATEGORIES) {
    if (category.groups) {
      const g = category.groups.find((x) => x.id === groupId);
      if (g) return { category, group: g };
    }
    if (category.subcategories) {
      for (const subcategory of category.subcategories) {
        const g = subcategory.groups.find((x) => x.id === groupId);
        if (g) return { category, subcategory, group: g };
      }
    }
  }
  return undefined;
}

/**
 * The list has two spellings intentionally: Regulatorios uses "Otros" (plural),
 * "Otro grupo" and other groups use "Otro" (singular). Both must trigger the
 * detail field.
 */
export function isOtherService(service: string): boolean {
  return service === 'Otro' || service === 'Otros';
}
