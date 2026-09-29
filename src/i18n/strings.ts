/**
 * UI copy for the public form, in Spanish (default) and English. Group,
 * service, region and country names are translated separately in labels.ts.
 */
const es = {
  documentTitle: 'SPI Americas — Hoja de Vida de Asociados',
  appTitle: 'Hoja de Vida de Asociados',
  appSubtitle: 'Formulario para caracterizar los servicios que presta su firma.',
  languageLabel: 'Idioma',
  draftSaved: 'Borrador guardado',
  startOver: 'Empezar de nuevo',
  confirmReset:
    '¿Está seguro que desea empezar de nuevo? Se perderán todos los datos ingresados.',
  progressLabel: 'Progreso del formulario',
  steps: ['Datos y alcance', 'Servicios', 'Revisar y enviar'],
  moreInfo: 'Más información',

  // Stage navigation
  fixBeforeContinue: 'Corrija lo siguiente antes de continuar:',
  fixBeforeSubmit: 'Corrija lo siguiente antes de enviar:',
  headerFieldsError: 'Complete los campos obligatorios del encabezado y corrija los correos.',
  continueToStep2: 'Continuar al paso 2 →',
  backToStep1: '← Volver al paso 1',
  continueToReview: 'Continuar a revisión →',
  backToStep2: '← Volver al paso 2',
  submitFailed: 'No fue posible enviar el formulario:',

  // Stage-1/submit blockers, keyed by SubmitBlocker.code
  blockers: {
    'no-countries': 'Seleccione al menos un país de operación.',
    'no-groups': 'Seleccione al menos un grupo de producto.',
    'otro-grupo-sin-nombre': 'Indique el nombre del “Otro grupo”.',
    'no-cells': 'Marque al menos una celda en las matrices seleccionadas.',
  } as Record<string, string>,

  // Company header
  companyTitle: 'Datos de la empresa',
  requiredNotePre: 'Los campos marcados con',
  requiredNotePost: 'son obligatorios.',
  razonSocial: 'Razón social',
  razonSocialHint: 'Nombre completo de la sociedad.',
  dba: 'DBA',
  dbaHint: 'Nombre comercial (si aplica).',
  paisOrigen: 'País de origen',
  anioInicio: 'Año de inicio de operaciones',
  numEmpleados: 'Número de empleados',
  repLegal: 'Representante legal',
  contactoPrincipal: 'Contacto principal',
  contactoRegulatorio: 'Contacto regulatorio',
  nombre: 'Nombre',
  correo: 'Correo',
  telefono: 'Teléfono',
  extraEmails: 'Correos adicionales',
  extraEmailsHint: 'Opcional. Para enviar copias de esta información a más personas.',
  noExtraEmails: 'Aún no ha agregado correos.',
  emailPlaceholder: 'correo@ejemplo.com',
  remove: 'Quitar',
  addEmail: '+ Agregar correo',

  // Validation, keyed by validation code
  validation: {
    required: 'Este campo es obligatorio.',
    email: 'Ingrese un correo electrónico válido.',
    emailOrRemove: 'Ingrese un correo o elimine este campo.',
    year: 'Ingrese un año válido (por ejemplo, 1998).',
    number: 'Ingrese un número válido.',
  },

  // Regions & countries
  regionsTitle: 'Regiones y países de operación',
  regionsIntro: [
    'Los países comienzan ',
    'sin marcar',
    '. Abra cada región y tilde los países en los que su firma opera, o use ',
    '“Marcar todos”',
    ' para seleccionar la región completa. Sólo los países seleccionados aparecerán como columnas en el paso siguiente.',
  ],
  selectAll: 'Marcar todos',
  deselectAll: 'Desmarcar todos',
  noCountries: 'Aún no ha seleccionado ningún país.',
  countriesSelected: (n: number) => `${n} país(es) seleccionados`,
  inRegions: (n: number) => ` en ${n} región(es): `,

  // Groups
  groupsTitle: 'Selección de grupos de producto',
  groupsIntro:
    'Marque únicamente los grupos con los que su firma trabaja. Solo se le pedirá completar las matrices de los grupos seleccionados.',
  otherGroupName: 'Nombre del otro grupo',
  otherGroupPlaceholder: 'Especifique el nombre del grupo',
  otherGroupPrefix: 'Otro grupo',
  noGroups: 'Aún no ha seleccionado ningún grupo.',
  groupsSelected: (n: number) => `${n} grupo(s) seleccionados.`,

  // Stage 2 — matrices
  matricesAria: 'Matrices por grupo',
  step2Title: 'Paso 2: Servicios por grupo y país',
  step2Intro: [
    'Haga clic en cada celda para alternar entre ',
    ' y ',
    '. Use las flechas del teclado y la barra espaciadora / Enter para navegar más rápido. Clic en el nombre de un país o servicio marca/desmarca toda la columna o fila.',
  ],
  noGroupsSelected: 'No hay grupos seleccionados. Vuelva al paso 1 para elegir.',
  cellEmpty: 'No ofrecido',
  cellDirecto: 'Directo',
  cellTercerizado: 'Tercerizado',
  cellLetterDirecto: 'D',
  cellLetterTercerizado: 'T',
  unmarked: 'Sin marcar',
  cellsMarked: (n: number) => `${n} celda(s) marcada(s)`,
  matrixTip: 'Consejo: clic en un país o servicio para marcar/desmarcar toda la columna o fila.',
  matrixNeedsCountry:
    'Seleccione al menos un país en el paso anterior para completar esta matriz.',
  serviceHeader: 'Servicio',
  toggleColumn: (country: string) => `${country} — marcar/desmarcar toda la columna`,
  toggleRow: (service: string) => `${service} — marcar/desmarcar toda la fila`,
  cellAria: (service: string, country: string) => `${service} en ${country}`,

  // Stage 3 — review
  reviewTitle: 'Revisar y enviar',
  reviewIntro: 'Verifique el resumen a continuación antes de enviar.',
  operatingCountries: 'Países de operación',
  selectedGroups: 'Grupos seleccionados',
  markedCells: 'Celdas marcadas',
  detailByGroup: 'Detalle por grupo',
  noMarkedCells: 'No hay celdas marcadas todavía.',
  cellsCount: (n: number) => `${n} celda(s)`,
  noSubservice: '(sin subservicio)',
  submitting: 'Enviando…',
  submit: 'Enviar',

  // Success
  successTitle: '¡Formulario enviado con éxito!',
  successBody: (n: number) => [
    'Gracias por completar la hoja de vida. Se registraron ',
    String(n),
    ' fila(s) en la base de datos de SPI Americas.',
  ],
  successFollowUp:
    'Si desea corregir o ampliar la información, comuníquese con su contacto en SPI.',
  submitAnother: 'Enviar otra empresa',
};

export type Strings = typeof es;

const en: Strings = {
  documentTitle: 'SPI Americas — Associate Profile',
  appTitle: 'Associate Profile',
  appSubtitle: 'Form to describe the services your firm provides.',
  languageLabel: 'Language',
  draftSaved: 'Draft saved',
  startOver: 'Start over',
  confirmReset: 'Are you sure you want to start over? All the data you entered will be lost.',
  progressLabel: 'Form progress',
  steps: ['Company & scope', 'Services', 'Review & submit'],
  moreInfo: 'More information',

  fixBeforeContinue: 'Please fix the following before continuing:',
  fixBeforeSubmit: 'Please fix the following before submitting:',
  headerFieldsError: 'Complete the required company fields and fix any invalid emails.',
  continueToStep2: 'Continue to step 2 →',
  backToStep1: '← Back to step 1',
  continueToReview: 'Continue to review →',
  backToStep2: '← Back to step 2',
  submitFailed: 'The form could not be submitted:',

  blockers: {
    'no-countries': 'Select at least one country of operation.',
    'no-groups': 'Select at least one product group.',
    'otro-grupo-sin-nombre': 'Enter the name of the “Other group”.',
    'no-cells': 'Mark at least one cell in the selected matrices.',
  },

  companyTitle: 'Company information',
  requiredNotePre: 'Fields marked with',
  requiredNotePost: 'are required.',
  razonSocial: 'Legal name',
  razonSocialHint: 'Full registered company name.',
  dba: 'DBA',
  dbaHint: 'Trade name (if applicable).',
  paisOrigen: 'Country of origin',
  anioInicio: 'Year operations began',
  numEmpleados: 'Number of employees',
  repLegal: 'Legal representative',
  contactoPrincipal: 'Main contact',
  contactoRegulatorio: 'Regulatory contact',
  nombre: 'Name',
  correo: 'Email',
  telefono: 'Phone',
  extraEmails: 'Additional emails',
  extraEmailsHint: 'Optional. To send copies of this information to more people.',
  noExtraEmails: 'No emails added yet.',
  emailPlaceholder: 'email@example.com',
  remove: 'Remove',
  addEmail: '+ Add email',

  validation: {
    required: 'This field is required.',
    email: 'Enter a valid email address.',
    emailOrRemove: 'Enter an email or remove this field.',
    year: 'Enter a valid year (for example, 1998).',
    number: 'Enter a valid number.',
  },

  regionsTitle: 'Regions and countries of operation',
  regionsIntro: [
    'Countries start ',
    'unchecked',
    '. Open each region and tick the countries where your firm operates, or use ',
    '“Select all”',
    ' to select the whole region. Only the selected countries will appear as columns in the next step.',
  ],
  selectAll: 'Select all',
  deselectAll: 'Deselect all',
  noCountries: 'No countries selected yet.',
  countriesSelected: (n) => `${n} ${n === 1 ? 'country' : 'countries'} selected`,
  inRegions: (n) => ` in ${n} ${n === 1 ? 'region' : 'regions'}: `,

  groupsTitle: 'Product group selection',
  groupsIntro:
    'Check only the groups your firm works with. You will only be asked to complete the matrices for the selected groups.',
  otherGroupName: 'Other group name',
  otherGroupPlaceholder: 'Specify the group name',
  otherGroupPrefix: 'Other group',
  noGroups: 'No groups selected yet.',
  groupsSelected: (n) => `${n} ${n === 1 ? 'group' : 'groups'} selected.`,

  matricesAria: 'Matrices by group',
  step2Title: 'Step 2: Services by group and country',
  step2Intro: [
    'Click each cell to cycle between ',
    ' and ',
    '. Use the arrow keys and Space / Enter to move faster. Clicking a country or service name checks/unchecks the whole column or row.',
  ],
  noGroupsSelected: 'No groups selected. Go back to step 1 to choose.',
  cellEmpty: 'Not offered',
  cellDirecto: 'Direct',
  cellTercerizado: 'Outsourced',
  cellLetterDirecto: 'D',
  cellLetterTercerizado: 'O',
  unmarked: 'Not marked',
  cellsMarked: (n) => `${n} ${n === 1 ? 'cell' : 'cells'} marked`,
  matrixTip: 'Tip: click a country or service to check/uncheck the whole column or row.',
  matrixNeedsCountry: 'Select at least one country in the previous step to complete this matrix.',
  serviceHeader: 'Service',
  toggleColumn: (country) => `${country} — check/uncheck the whole column`,
  toggleRow: (service) => `${service} — check/uncheck the whole row`,
  cellAria: (service, country) => `${service} in ${country}`,

  reviewTitle: 'Review and submit',
  reviewIntro: 'Check the summary below before submitting.',
  operatingCountries: 'Countries of operation',
  selectedGroups: 'Selected groups',
  markedCells: 'Marked cells',
  detailByGroup: 'Detail by group',
  noMarkedCells: 'No cells marked yet.',
  cellsCount: (n) => `${n} ${n === 1 ? 'cell' : 'cells'}`,
  noSubservice: '(no sub-service)',
  submitting: 'Submitting…',
  submit: 'Submit',

  successTitle: 'Form submitted successfully!',
  successBody: (n) => [
    'Thank you for completing your profile. ',
    String(n),
    ` ${n === 1 ? 'row was' : 'rows were'} recorded in the SPI Americas database.`,
  ],
  successFollowUp:
    'If you want to correct or add to the information, please contact your SPI representative.',
  submitAnother: 'Submit another company',
};

export const STRINGS: Record<'es' | 'en', Strings> = { es, en };
