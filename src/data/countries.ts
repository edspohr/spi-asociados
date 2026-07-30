export type Region =
  | 'Norteamérica'
  | 'Centroamérica'
  | 'Caribe'
  | 'Sudamérica'
  | 'Europa'
  | 'Asia'
  | 'África'
  | 'Oceanía';

export const REGIONS: Region[] = [
  'Sudamérica',
  'Centroamérica',
  'Norteamérica',
  'Caribe',
  'Europa',
  'Asia',
  'África',
  'Oceanía',
];

export type CountryDef = {
  code2: string;
  code3: string;
  nameEs: string;
  region: Region;
};

export const COUNTRIES: CountryDef[] = [
  { code2: 'AR', code3: 'ARG', nameEs: 'Argentina', region: 'Sudamérica' },
  { code2: 'BO', code3: 'BOL', nameEs: 'Bolivia', region: 'Sudamérica' },
  { code2: 'BR', code3: 'BRA', nameEs: 'Brasil', region: 'Sudamérica' },
  { code2: 'CL', code3: 'CHL', nameEs: 'Chile', region: 'Sudamérica' },
  { code2: 'CO', code3: 'COL', nameEs: 'Colombia', region: 'Sudamérica' },
  { code2: 'EC', code3: 'ECU', nameEs: 'Ecuador', region: 'Sudamérica' },
  { code2: 'GY', code3: 'GUY', nameEs: 'Guyana', region: 'Sudamérica' },
  { code2: 'PY', code3: 'PRY', nameEs: 'Paraguay', region: 'Sudamérica' },
  { code2: 'PE', code3: 'PER', nameEs: 'Perú', region: 'Sudamérica' },
  { code2: 'SR', code3: 'SUR', nameEs: 'Surinam', region: 'Sudamérica' },
  { code2: 'UY', code3: 'URY', nameEs: 'Uruguay', region: 'Sudamérica' },
  { code2: 'VE', code3: 'VEN', nameEs: 'Venezuela', region: 'Sudamérica' },

  { code2: 'BZ', code3: 'BLZ', nameEs: 'Belice', region: 'Centroamérica' },
  { code2: 'CR', code3: 'CRI', nameEs: 'Costa Rica', region: 'Centroamérica' },
  { code2: 'SV', code3: 'SLV', nameEs: 'El Salvador', region: 'Centroamérica' },
  { code2: 'GT', code3: 'GTM', nameEs: 'Guatemala', region: 'Centroamérica' },
  { code2: 'HN', code3: 'HND', nameEs: 'Honduras', region: 'Centroamérica' },
  { code2: 'NI', code3: 'NIC', nameEs: 'Nicaragua', region: 'Centroamérica' },
  { code2: 'PA', code3: 'PAN', nameEs: 'Panamá', region: 'Centroamérica' },

  { code2: 'CA', code3: 'CAN', nameEs: 'Canadá', region: 'Norteamérica' },
  { code2: 'MX', code3: 'MEX', nameEs: 'México', region: 'Norteamérica' },
  { code2: 'US', code3: 'USA', nameEs: 'Estados Unidos', region: 'Norteamérica' },

  { code2: 'AG', code3: 'ATG', nameEs: 'Antigua y Barbuda', region: 'Caribe' },
  { code2: 'BS', code3: 'BHS', nameEs: 'Bahamas', region: 'Caribe' },
  { code2: 'BB', code3: 'BRB', nameEs: 'Barbados', region: 'Caribe' },
  { code2: 'CU', code3: 'CUB', nameEs: 'Cuba', region: 'Caribe' },
  { code2: 'DM', code3: 'DMA', nameEs: 'Dominica', region: 'Caribe' },
  { code2: 'DO', code3: 'DOM', nameEs: 'República Dominicana', region: 'Caribe' },
  { code2: 'GD', code3: 'GRD', nameEs: 'Granada', region: 'Caribe' },
  { code2: 'HT', code3: 'HTI', nameEs: 'Haití', region: 'Caribe' },
  { code2: 'JM', code3: 'JAM', nameEs: 'Jamaica', region: 'Caribe' },
  { code2: 'KN', code3: 'KNA', nameEs: 'San Cristóbal y Nieves', region: 'Caribe' },
  { code2: 'LC', code3: 'LCA', nameEs: 'Santa Lucía', region: 'Caribe' },
  { code2: 'PR', code3: 'PRI', nameEs: 'Puerto Rico', region: 'Caribe' },
  { code2: 'TT', code3: 'TTO', nameEs: 'Trinidad y Tobago', region: 'Caribe' },
  { code2: 'VC', code3: 'VCT', nameEs: 'San Vicente y las Granadinas', region: 'Caribe' },

  { code2: 'AL', code3: 'ALB', nameEs: 'Albania', region: 'Europa' },
  { code2: 'AT', code3: 'AUT', nameEs: 'Austria', region: 'Europa' },
  { code2: 'BE', code3: 'BEL', nameEs: 'Bélgica', region: 'Europa' },
  { code2: 'BA', code3: 'BIH', nameEs: 'Bosnia y Herzegovina', region: 'Europa' },
  { code2: 'BG', code3: 'BGR', nameEs: 'Bulgaria', region: 'Europa' },
  { code2: 'BY', code3: 'BLR', nameEs: 'Bielorrusia', region: 'Europa' },
  { code2: 'CH', code3: 'CHE', nameEs: 'Suiza', region: 'Europa' },
  { code2: 'CY', code3: 'CYP', nameEs: 'Chipre', region: 'Europa' },
  { code2: 'CZ', code3: 'CZE', nameEs: 'República Checa', region: 'Europa' },
  { code2: 'DE', code3: 'DEU', nameEs: 'Alemania', region: 'Europa' },
  { code2: 'DK', code3: 'DNK', nameEs: 'Dinamarca', region: 'Europa' },
  { code2: 'EE', code3: 'EST', nameEs: 'Estonia', region: 'Europa' },
  { code2: 'ES', code3: 'ESP', nameEs: 'España', region: 'Europa' },
  { code2: 'FI', code3: 'FIN', nameEs: 'Finlandia', region: 'Europa' },
  { code2: 'FR', code3: 'FRA', nameEs: 'Francia', region: 'Europa' },
  { code2: 'GB', code3: 'GBR', nameEs: 'Reino Unido', region: 'Europa' },
  { code2: 'GR', code3: 'GRC', nameEs: 'Grecia', region: 'Europa' },
  { code2: 'HR', code3: 'HRV', nameEs: 'Croacia', region: 'Europa' },
  { code2: 'HU', code3: 'HUN', nameEs: 'Hungría', region: 'Europa' },
  { code2: 'IE', code3: 'IRL', nameEs: 'Irlanda', region: 'Europa' },
  { code2: 'IS', code3: 'ISL', nameEs: 'Islandia', region: 'Europa' },
  { code2: 'IT', code3: 'ITA', nameEs: 'Italia', region: 'Europa' },
  { code2: 'LT', code3: 'LTU', nameEs: 'Lituania', region: 'Europa' },
  { code2: 'LU', code3: 'LUX', nameEs: 'Luxemburgo', region: 'Europa' },
  { code2: 'LV', code3: 'LVA', nameEs: 'Letonia', region: 'Europa' },
  { code2: 'MD', code3: 'MDA', nameEs: 'Moldavia', region: 'Europa' },
  { code2: 'ME', code3: 'MNE', nameEs: 'Montenegro', region: 'Europa' },
  { code2: 'MK', code3: 'MKD', nameEs: 'Macedonia del Norte', region: 'Europa' },
  { code2: 'MT', code3: 'MLT', nameEs: 'Malta', region: 'Europa' },
  { code2: 'NL', code3: 'NLD', nameEs: 'Países Bajos', region: 'Europa' },
  { code2: 'NO', code3: 'NOR', nameEs: 'Noruega', region: 'Europa' },
  { code2: 'PL', code3: 'POL', nameEs: 'Polonia', region: 'Europa' },
  { code2: 'PT', code3: 'PRT', nameEs: 'Portugal', region: 'Europa' },
  { code2: 'RO', code3: 'ROU', nameEs: 'Rumania', region: 'Europa' },
  { code2: 'RS', code3: 'SRB', nameEs: 'Serbia', region: 'Europa' },
  { code2: 'RU', code3: 'RUS', nameEs: 'Rusia', region: 'Europa' },
  { code2: 'SE', code3: 'SWE', nameEs: 'Suecia', region: 'Europa' },
  { code2: 'SI', code3: 'SVN', nameEs: 'Eslovenia', region: 'Europa' },
  { code2: 'SK', code3: 'SVK', nameEs: 'Eslovaquia', region: 'Europa' },
  { code2: 'UA', code3: 'UKR', nameEs: 'Ucrania', region: 'Europa' },

  { code2: 'AE', code3: 'ARE', nameEs: 'Emiratos Árabes Unidos', region: 'Asia' },
  { code2: 'AF', code3: 'AFG', nameEs: 'Afganistán', region: 'Asia' },
  { code2: 'AM', code3: 'ARM', nameEs: 'Armenia', region: 'Asia' },
  { code2: 'AZ', code3: 'AZE', nameEs: 'Azerbaiyán', region: 'Asia' },
  { code2: 'BD', code3: 'BGD', nameEs: 'Bangladés', region: 'Asia' },
  { code2: 'BH', code3: 'BHR', nameEs: 'Baréin', region: 'Asia' },
  { code2: 'BN', code3: 'BRN', nameEs: 'Brunéi', region: 'Asia' },
  { code2: 'BT', code3: 'BTN', nameEs: 'Bután', region: 'Asia' },
  { code2: 'CN', code3: 'CHN', nameEs: 'China', region: 'Asia' },
  { code2: 'GE', code3: 'GEO', nameEs: 'Georgia', region: 'Asia' },
  { code2: 'HK', code3: 'HKG', nameEs: 'Hong Kong', region: 'Asia' },
  { code2: 'ID', code3: 'IDN', nameEs: 'Indonesia', region: 'Asia' },
  { code2: 'IL', code3: 'ISR', nameEs: 'Israel', region: 'Asia' },
  { code2: 'IN', code3: 'IND', nameEs: 'India', region: 'Asia' },
  { code2: 'IQ', code3: 'IRQ', nameEs: 'Irak', region: 'Asia' },
  { code2: 'IR', code3: 'IRN', nameEs: 'Irán', region: 'Asia' },
  { code2: 'JO', code3: 'JOR', nameEs: 'Jordania', region: 'Asia' },
  { code2: 'JP', code3: 'JPN', nameEs: 'Japón', region: 'Asia' },
  { code2: 'KG', code3: 'KGZ', nameEs: 'Kirguistán', region: 'Asia' },
  { code2: 'KH', code3: 'KHM', nameEs: 'Camboya', region: 'Asia' },
  { code2: 'KR', code3: 'KOR', nameEs: 'Corea del Sur', region: 'Asia' },
  { code2: 'KW', code3: 'KWT', nameEs: 'Kuwait', region: 'Asia' },
  { code2: 'KZ', code3: 'KAZ', nameEs: 'Kazajistán', region: 'Asia' },
  { code2: 'LA', code3: 'LAO', nameEs: 'Laos', region: 'Asia' },
  { code2: 'LB', code3: 'LBN', nameEs: 'Líbano', region: 'Asia' },
  { code2: 'LK', code3: 'LKA', nameEs: 'Sri Lanka', region: 'Asia' },
  { code2: 'MM', code3: 'MMR', nameEs: 'Birmania', region: 'Asia' },
  { code2: 'MN', code3: 'MNG', nameEs: 'Mongolia', region: 'Asia' },
  { code2: 'MO', code3: 'MAC', nameEs: 'Macao', region: 'Asia' },
  { code2: 'MY', code3: 'MYS', nameEs: 'Malasia', region: 'Asia' },
  { code2: 'NP', code3: 'NPL', nameEs: 'Nepal', region: 'Asia' },
  { code2: 'OM', code3: 'OMN', nameEs: 'Omán', region: 'Asia' },
  { code2: 'PH', code3: 'PHL', nameEs: 'Filipinas', region: 'Asia' },
  { code2: 'PK', code3: 'PAK', nameEs: 'Pakistán', region: 'Asia' },
  { code2: 'PS', code3: 'PSE', nameEs: 'Palestina', region: 'Asia' },
  { code2: 'QA', code3: 'QAT', nameEs: 'Catar', region: 'Asia' },
  { code2: 'SA', code3: 'SAU', nameEs: 'Arabia Saudita', region: 'Asia' },
  { code2: 'SG', code3: 'SGP', nameEs: 'Singapur', region: 'Asia' },
  { code2: 'SY', code3: 'SYR', nameEs: 'Siria', region: 'Asia' },
  { code2: 'TH', code3: 'THA', nameEs: 'Tailandia', region: 'Asia' },
  { code2: 'TJ', code3: 'TJK', nameEs: 'Tayikistán', region: 'Asia' },
  { code2: 'TM', code3: 'TKM', nameEs: 'Turkmenistán', region: 'Asia' },
  { code2: 'TR', code3: 'TUR', nameEs: 'Turquía', region: 'Asia' },
  { code2: 'TW', code3: 'TWN', nameEs: 'Taiwán', region: 'Asia' },
  { code2: 'UZ', code3: 'UZB', nameEs: 'Uzbekistán', region: 'Asia' },
  { code2: 'VN', code3: 'VNM', nameEs: 'Vietnam', region: 'Asia' },
  { code2: 'YE', code3: 'YEM', nameEs: 'Yemen', region: 'Asia' },

  { code2: 'AO', code3: 'AGO', nameEs: 'Angola', region: 'África' },
  { code2: 'BF', code3: 'BFA', nameEs: 'Burkina Faso', region: 'África' },
  { code2: 'BI', code3: 'BDI', nameEs: 'Burundi', region: 'África' },
  { code2: 'BJ', code3: 'BEN', nameEs: 'Benín', region: 'África' },
  { code2: 'BW', code3: 'BWA', nameEs: 'Botsuana', region: 'África' },
  { code2: 'CD', code3: 'COD', nameEs: 'República Democrática del Congo', region: 'África' },
  { code2: 'CF', code3: 'CAF', nameEs: 'República Centroafricana', region: 'África' },
  { code2: 'CG', code3: 'COG', nameEs: 'República del Congo', region: 'África' },
  { code2: 'CI', code3: 'CIV', nameEs: 'Costa de Marfil', region: 'África' },
  { code2: 'CM', code3: 'CMR', nameEs: 'Camerún', region: 'África' },
  { code2: 'CV', code3: 'CPV', nameEs: 'Cabo Verde', region: 'África' },
  { code2: 'DJ', code3: 'DJI', nameEs: 'Yibuti', region: 'África' },
  { code2: 'DZ', code3: 'DZA', nameEs: 'Argelia', region: 'África' },
  { code2: 'EG', code3: 'EGY', nameEs: 'Egipto', region: 'África' },
  { code2: 'ER', code3: 'ERI', nameEs: 'Eritrea', region: 'África' },
  { code2: 'ET', code3: 'ETH', nameEs: 'Etiopía', region: 'África' },
  { code2: 'GA', code3: 'GAB', nameEs: 'Gabón', region: 'África' },
  { code2: 'GH', code3: 'GHA', nameEs: 'Ghana', region: 'África' },
  { code2: 'GM', code3: 'GMB', nameEs: 'Gambia', region: 'África' },
  { code2: 'GN', code3: 'GIN', nameEs: 'Guinea', region: 'África' },
  { code2: 'GQ', code3: 'GNQ', nameEs: 'Guinea Ecuatorial', region: 'África' },
  { code2: 'KE', code3: 'KEN', nameEs: 'Kenia', region: 'África' },
  { code2: 'LR', code3: 'LBR', nameEs: 'Liberia', region: 'África' },
  { code2: 'LS', code3: 'LSO', nameEs: 'Lesoto', region: 'África' },
  { code2: 'LY', code3: 'LBY', nameEs: 'Libia', region: 'África' },
  { code2: 'MA', code3: 'MAR', nameEs: 'Marruecos', region: 'África' },
  { code2: 'MG', code3: 'MDG', nameEs: 'Madagascar', region: 'África' },
  { code2: 'ML', code3: 'MLI', nameEs: 'Malí', region: 'África' },
  { code2: 'MR', code3: 'MRT', nameEs: 'Mauritania', region: 'África' },
  { code2: 'MU', code3: 'MUS', nameEs: 'Mauricio', region: 'África' },
  { code2: 'MW', code3: 'MWI', nameEs: 'Malaui', region: 'África' },
  { code2: 'MZ', code3: 'MOZ', nameEs: 'Mozambique', region: 'África' },
  { code2: 'NA', code3: 'NAM', nameEs: 'Namibia', region: 'África' },
  { code2: 'NE', code3: 'NER', nameEs: 'Níger', region: 'África' },
  { code2: 'NG', code3: 'NGA', nameEs: 'Nigeria', region: 'África' },
  { code2: 'RW', code3: 'RWA', nameEs: 'Ruanda', region: 'África' },
  { code2: 'SD', code3: 'SDN', nameEs: 'Sudán', region: 'África' },
  { code2: 'SL', code3: 'SLE', nameEs: 'Sierra Leona', region: 'África' },
  { code2: 'SN', code3: 'SEN', nameEs: 'Senegal', region: 'África' },
  { code2: 'SO', code3: 'SOM', nameEs: 'Somalia', region: 'África' },
  { code2: 'SS', code3: 'SSD', nameEs: 'Sudán del Sur', region: 'África' },
  { code2: 'SZ', code3: 'SWZ', nameEs: 'Esuatini', region: 'África' },
  { code2: 'TD', code3: 'TCD', nameEs: 'Chad', region: 'África' },
  { code2: 'TG', code3: 'TGO', nameEs: 'Togo', region: 'África' },
  { code2: 'TN', code3: 'TUN', nameEs: 'Túnez', region: 'África' },
  { code2: 'TZ', code3: 'TZA', nameEs: 'Tanzania', region: 'África' },
  { code2: 'UG', code3: 'UGA', nameEs: 'Uganda', region: 'África' },
  { code2: 'ZA', code3: 'ZAF', nameEs: 'Sudáfrica', region: 'África' },
  { code2: 'ZM', code3: 'ZMB', nameEs: 'Zambia', region: 'África' },
  { code2: 'ZW', code3: 'ZWE', nameEs: 'Zimbabue', region: 'África' },

  { code2: 'AU', code3: 'AUS', nameEs: 'Australia', region: 'Oceanía' },
  { code2: 'FJ', code3: 'FJI', nameEs: 'Fiyi', region: 'Oceanía' },
  { code2: 'NZ', code3: 'NZL', nameEs: 'Nueva Zelanda', region: 'Oceanía' },
  { code2: 'PG', code3: 'PNG', nameEs: 'Papúa Nueva Guinea', region: 'Oceanía' },
  { code2: 'SB', code3: 'SLB', nameEs: 'Islas Salomón', region: 'Oceanía' },
  { code2: 'VU', code3: 'VUT', nameEs: 'Vanuatu', region: 'Oceanía' },
  { code2: 'WS', code3: 'WSM', nameEs: 'Samoa', region: 'Oceanía' },
];

export type CountryCode = string;

const BY_CODE2 = new Map(COUNTRIES.map((c) => [c.code2, c]));
const BY_CODE3 = new Map(COUNTRIES.map((c) => [c.code3, c]));

export function findCountry(code2: string): CountryDef | undefined {
  return BY_CODE2.get(code2);
}

export function findCountryByCode3(code3: string): CountryDef | undefined {
  return BY_CODE3.get(code3);
}

export function countryName(code2: string): string {
  return BY_CODE2.get(code2)?.nameEs ?? code2;
}

export function countriesByRegion(region: Region): CountryDef[] {
  return COUNTRIES.filter((c) => c.region === region);
}

/**
 * Bridge to `world-atlas` topojson (`countries-110m.json`). Every geometry
 * there is keyed by an ISO 3166-1 numeric code (a.k.a. UN M49). We map those
 * to our alpha-2 codes here so the MapView can colour features without
 * bringing in an extra dependency. Only entries for countries in COUNTRIES
 * need to be present — geometries without a match render as "no data".
 */
export const M49_TO_CODE2: Record<string, string> = {
  '004': 'AF', '008': 'AL', '012': 'DZ', '024': 'AO', '031': 'AZ',
  '032': 'AR', '036': 'AU', '040': 'AT', '044': 'BS', '050': 'BD',
  '051': 'AM', '056': 'BE', '064': 'BT', '068': 'BO', '070': 'BA',
  '072': 'BW', '076': 'BR', '084': 'BZ', '096': 'BN', '100': 'BG',
  '104': 'MM', '108': 'BI', '112': 'BY', '116': 'KH', '120': 'CM',
  '124': 'CA', '140': 'CF', '144': 'LK', '148': 'TD', '152': 'CL',
  '156': 'CN', '158': 'TW', '170': 'CO', '178': 'CG', '180': 'CD',
  '188': 'CR', '191': 'HR', '192': 'CU', '196': 'CY', '203': 'CZ',
  '204': 'BJ', '208': 'DK', '214': 'DO', '218': 'EC', '222': 'SV',
  '226': 'GQ', '231': 'ET', '232': 'ER', '233': 'EE', '242': 'FJ',
  '246': 'FI', '250': 'FR', '262': 'DJ', '266': 'GA', '268': 'GE',
  '270': 'GM', '275': 'PS', '276': 'DE', '288': 'GH', '300': 'GR',
  '320': 'GT', '324': 'GN', '328': 'GY', '332': 'HT', '340': 'HN',
  '348': 'HU', '352': 'IS', '356': 'IN', '360': 'ID', '364': 'IR',
  '368': 'IQ', '372': 'IE', '376': 'IL', '380': 'IT', '384': 'CI',
  '388': 'JM', '392': 'JP', '398': 'KZ', '400': 'JO', '404': 'KE',
  '410': 'KR', '414': 'KW', '417': 'KG', '418': 'LA', '422': 'LB',
  '426': 'LS', '428': 'LV', '430': 'LR', '434': 'LY', '440': 'LT',
  '442': 'LU', '450': 'MG', '454': 'MW', '458': 'MY', '466': 'ML',
  '478': 'MR', '484': 'MX', '496': 'MN', '498': 'MD', '499': 'ME',
  '504': 'MA', '508': 'MZ', '512': 'OM', '516': 'NA', '524': 'NP',
  '528': 'NL', '548': 'VU', '554': 'NZ', '558': 'NI', '562': 'NE',
  '566': 'NG', '578': 'NO', '586': 'PK', '591': 'PA', '598': 'PG',
  '600': 'PY', '604': 'PE', '608': 'PH', '616': 'PL', '620': 'PT',
  '626': 'TL', '630': 'PR', '634': 'QA', '642': 'RO', '643': 'RU',
  '646': 'RW', '682': 'SA', '686': 'SN', '688': 'RS', '694': 'SL',
  '703': 'SK', '704': 'VN', '705': 'SI', '706': 'SO', '710': 'ZA',
  '716': 'ZW', '724': 'ES', '728': 'SS', '729': 'SD', '740': 'SR',
  '748': 'SZ', '752': 'SE', '756': 'CH', '760': 'SY', '762': 'TJ',
  '764': 'TH', '768': 'TG', '780': 'TT', '784': 'AE', '788': 'TN',
  '792': 'TR', '795': 'TM', '800': 'UG', '804': 'UA', '807': 'MK',
  '818': 'EG', '826': 'GB', '834': 'TZ', '840': 'US', '854': 'BF',
  '858': 'UY', '860': 'UZ', '862': 'VE', '887': 'YE', '894': 'ZM',
};

export function code2FromM49(m49: string | number): string | undefined {
  const key = typeof m49 === 'number' ? String(m49).padStart(3, '0') : String(m49).padStart(3, '0');
  return M49_TO_CODE2[key];
}
