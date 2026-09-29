import type { Lang } from './lang';
import { findCountry, type CountryCode, type Region } from '../data/countries';

/**
 * English display names for the Spanish labels declared in
 * `src/data/form-config.ts` (categories, subcategories, groups, services).
 *
 * The Spanish label stays the canonical value: it is what gets stored in the
 * matrix cell keys and in submitted rows, so analytics stay consistent no
 * matter which language the associate filled the form in. Translation is
 * display-only.
 */
const EN_LABELS: Record<string, string> = {
  // Categories / subcategories
  'Propiedad Intelectual': 'Intellectual Property',
  'Derecho Comercial': 'Commercial Law',
  'Asuntos Regulatorios': 'Regulatory Affairs',
  'Otro grupo': 'Other group',
  'Uso Humano': 'Human Use',
  Veterinarios: 'Veterinary',
  'Uso Agrícola': 'Agricultural Use',

  // Groups
  'Dispositivos Médicos': 'Medical Devices',
  Alimentos: 'Food',
  'Bebidas alcohólicas': 'Alcoholic beverages',
  Cosméticos: 'Cosmetics',
  'Medicamentos de síntesis química': 'Chemically synthesized drugs',
  'Medicamentos biológicos': 'Biologic drugs',
  Homeopáticos: 'Homeopathic products',
  'Fito terapéuticos (productos herbales)': 'Phytotherapeutics (herbal products)',
  'Suplementos dietarios': 'Dietary supplements',
  'Productos de aseo e higiene de uso doméstico': 'Household cleaning and hygiene products',
  'Productos de aseo e higiene de uso industrial': 'Industrial cleaning and hygiene products',
  'Plaguicidas de uso doméstico': 'Household pesticides',
  Medicamentos: 'Medicines',
  'Insumos médicos': 'Medical supplies',
  'Productos agrícolas': 'Agricultural products',

  // Services — regulatory common set
  'Consultoría regulatoria': 'Regulatory consulting',
  'Hosting/tenencia de registro': 'Registration hosting/holding',
  'Profesional responsable/responsable técnico': 'Responsible professional/technical director',
  Importación: 'Importation',
  'Consultoría para certificaciones GMP/GLP/similares':
    'Consulting for GMP/GLP/similar certifications',

  // Services — regulatory specifics
  'Servicio técnico': 'Technical service',
  'Ensayos clínicos': 'Clinical trials',
  'Vigilancia postmercado/tecnovigilancia': 'Post-market surveillance/technovigilance',
  'Reportes UDI DI': 'UDI-DI reporting',
  'Inscripción de planta': 'Plant registration',
  'Ensayos de control de calidad': 'Quality control testing',
  'Elaboración de tablas nutricionales/información nutricional':
    'Nutrition facts panels/nutritional information',
  'Vigilancia postmercado/cosmetovigilancia': 'Post-market surveillance/cosmetovigilance',
  'Vigilancia postmercado/farmacovigilancia': 'Post-market surveillance/pharmacovigilance',
  'Inclusión de nuevos ingredientes/indicaciones en listados aprobados':
    'Inclusion of new ingredients/indications in approved lists',
  'Evaluación de seguridad y eficacia de ingredientes':
    'Ingredient safety and efficacy assessment',
  'Inclusión de nuevos ingredientes en listados aprobados':
    'Inclusion of new ingredients in approved lists',
  'Ensayos de toxicidad': 'Toxicity testing',
  'Ensayos de eficacia agronómica': 'Agronomic efficacy trials',

  // Services — Propiedad Intelectual
  'Marcas y signos distintivos': 'Trademarks and distinctive signs',
  Patentes: 'Patents',
  'Derechos de autor': 'Copyright',
  'Competencia desleal': 'Unfair competition',
  Litigios: 'Litigation',
  'Consultoría de diseño de marca': 'Brand design consulting',
  'Valoración de activos intangibles': 'Intangible asset valuation',
  'Protección al consumidor': 'Consumer protection',
  'Diseño e implementación de políticas de protección de datos personales':
    'Design and implementation of personal data protection policies',
  'Procesos sancionatorios': 'Administrative sanction proceedings',

  // Services — Derecho Comercial
  'Constitución y derecho societario': 'Company formation and corporate law',
  'Contratos comerciales': 'Commercial contracts',
  'Fusiones, adquisiciones y due diligence': 'Mergers, acquisitions and due diligence',
  'Inversión extranjera y aterrizaje en Colombia':
    'Foreign investment and market entry into Colombia',
  'Derecho tributario': 'Tax law',
  'Asesoría en obligaciones y planeación tributaria': 'Tax compliance and planning advice',
  'Derecho de aduanas': 'Customs law',
  'Protección de datos personales (Habeas Data)': 'Personal data protection (Habeas Data)',

  // Services — Otro grupo
  Hosting: 'Hosting',
  'Profesional responsable': 'Responsible professional',
  'Vigilancia postmercado': 'Post-market surveillance',
  'Importación y distribución': 'Importation and distribution',
  Almacenamiento: 'Storage',
};

/** Translate a form-config label (category, group or service) for display. */
export function label(es: string, lang: Lang): string {
  if (lang === 'es') return es;
  return EN_LABELS[es] ?? es;
}

/** Exposed for the coverage test in labels.test.ts. */
export function hasEnglishLabel(es: string): boolean {
  return es in EN_LABELS;
}

const EN_REGIONS: Record<Region, string> = {
  Sudamérica: 'South America',
  Centroamérica: 'Central America',
  Caribe: 'Caribbean',
  Norteamérica: 'North America',
  Europa: 'Europe',
  Asia: 'Asia',
  África: 'Africa',
  Oceanía: 'Oceania',
};

export function regionLabel(region: Region, lang: Lang): string {
  return lang === 'es' ? region : EN_REGIONS[region];
}

let enRegionNames: Intl.DisplayNames | null | undefined;

/** Country display name in the active language. English comes from Intl. */
export function countryLabel(code: CountryCode, lang: Lang): string {
  const def = findCountry(code);
  if (lang === 'es') return def?.nameEs ?? code;
  if (enRegionNames === undefined) {
    try {
      enRegionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    } catch {
      enRegionNames = null;
    }
  }
  return enRegionNames?.of(code) ?? def?.nameEs ?? code;
}
