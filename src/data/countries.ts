export type Region =
  | 'Sudamérica'
  | 'Centroamérica'
  | 'Caribe'
  | 'Norteamérica'
  | 'Europa'
  | 'Asia'
  | 'África'
  | 'Oceanía';

// Display order: Americas first (and more granular), then the rest of the
// world. The picker in the form and every legend renders in this order.
export const REGIONS: Region[] = [
  'Sudamérica',
  'Centroamérica',
  'Caribe',
  'Norteamérica',
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
  /** Population in millions, one decimal. Approximate 2024 figures from
   *  World Bank / UN mid-year estimates — precision is intentional (±). */
  population: number;
};

// Every entry must have a matching M49 mapping below so MapView can colour
// its geography. Sorted alphabetically by nameEs within each region.
export const COUNTRIES: CountryDef[] = [
  // ── Sudamérica ────────────────────────────────────────────────────────────
  { code2: 'AR', code3: 'ARG', nameEs: 'Argentina', region: 'Sudamérica', population: 45.5 },
  { code2: 'BO', code3: 'BOL', nameEs: 'Bolivia', region: 'Sudamérica', population: 12.4 },
  { code2: 'BR', code3: 'BRA', nameEs: 'Brasil', region: 'Sudamérica', population: 216.4 },
  { code2: 'CL', code3: 'CHL', nameEs: 'Chile', region: 'Sudamérica', population: 19.6 },
  { code2: 'CO', code3: 'COL', nameEs: 'Colombia', region: 'Sudamérica', population: 52.1 },
  { code2: 'EC', code3: 'ECU', nameEs: 'Ecuador', region: 'Sudamérica', population: 17.5 },
  { code2: 'GY', code3: 'GUY', nameEs: 'Guyana', region: 'Sudamérica', population: 0.8 },
  { code2: 'PY', code3: 'PRY', nameEs: 'Paraguay', region: 'Sudamérica', population: 6.9 },
  { code2: 'PE', code3: 'PER', nameEs: 'Perú', region: 'Sudamérica', population: 34.0 },
  { code2: 'SR', code3: 'SUR', nameEs: 'Surinam', region: 'Sudamérica', population: 0.6 },
  { code2: 'UY', code3: 'URY', nameEs: 'Uruguay', region: 'Sudamérica', population: 3.4 },
  { code2: 'VE', code3: 'VEN', nameEs: 'Venezuela', region: 'Sudamérica', population: 28.4 },

  // ── Centroamérica ─────────────────────────────────────────────────────────
  { code2: 'BZ', code3: 'BLZ', nameEs: 'Belice', region: 'Centroamérica', population: 0.4 },
  { code2: 'CR', code3: 'CRI', nameEs: 'Costa Rica', region: 'Centroamérica', population: 5.2 },
  { code2: 'SV', code3: 'SLV', nameEs: 'El Salvador', region: 'Centroamérica', population: 6.3 },
  { code2: 'GT', code3: 'GTM', nameEs: 'Guatemala', region: 'Centroamérica', population: 17.8 },
  { code2: 'HN', code3: 'HND', nameEs: 'Honduras', region: 'Centroamérica', population: 10.4 },
  { code2: 'NI', code3: 'NIC', nameEs: 'Nicaragua', region: 'Centroamérica', population: 6.9 },
  { code2: 'PA', code3: 'PAN', nameEs: 'Panamá', region: 'Centroamérica', population: 4.5 },

  // ── Caribe ────────────────────────────────────────────────────────────────
  { code2: 'AG', code3: 'ATG', nameEs: 'Antigua y Barbuda', region: 'Caribe', population: 0.1 },
  { code2: 'BS', code3: 'BHS', nameEs: 'Bahamas', region: 'Caribe', population: 0.4 },
  { code2: 'BB', code3: 'BRB', nameEs: 'Barbados', region: 'Caribe', population: 0.3 },
  { code2: 'CU', code3: 'CUB', nameEs: 'Cuba', region: 'Caribe', population: 11.2 },
  { code2: 'DM', code3: 'DMA', nameEs: 'Dominica', region: 'Caribe', population: 0.1 },
  { code2: 'GD', code3: 'GRD', nameEs: 'Granada', region: 'Caribe', population: 0.1 },
  { code2: 'HT', code3: 'HTI', nameEs: 'Haití', region: 'Caribe', population: 11.5 },
  { code2: 'JM', code3: 'JAM', nameEs: 'Jamaica', region: 'Caribe', population: 2.8 },
  { code2: 'PR', code3: 'PRI', nameEs: 'Puerto Rico', region: 'Caribe', population: 3.2 },
  { code2: 'DO', code3: 'DOM', nameEs: 'República Dominicana', region: 'Caribe', population: 11.2 },
  { code2: 'KN', code3: 'KNA', nameEs: 'San Cristóbal y Nieves', region: 'Caribe', population: 0.1 },
  { code2: 'VC', code3: 'VCT', nameEs: 'San Vicente y las Granadinas', region: 'Caribe', population: 0.1 },
  { code2: 'LC', code3: 'LCA', nameEs: 'Santa Lucía', region: 'Caribe', population: 0.2 },
  { code2: 'TT', code3: 'TTO', nameEs: 'Trinidad y Tobago', region: 'Caribe', population: 1.5 },

  // ── Norteamérica ──────────────────────────────────────────────────────────
  { code2: 'CA', code3: 'CAN', nameEs: 'Canadá', region: 'Norteamérica', population: 40.1 },
  { code2: 'US', code3: 'USA', nameEs: 'Estados Unidos', region: 'Norteamérica', population: 334.9 },
  { code2: 'MX', code3: 'MEX', nameEs: 'México', region: 'Norteamérica', population: 128.5 },

  // ── Europa ────────────────────────────────────────────────────────────────
  { code2: 'AL', code3: 'ALB', nameEs: 'Albania', region: 'Europa', population: 2.8 },
  { code2: 'DE', code3: 'DEU', nameEs: 'Alemania', region: 'Europa', population: 84.5 },
  { code2: 'AD', code3: 'AND', nameEs: 'Andorra', region: 'Europa', population: 0.1 },
  { code2: 'AT', code3: 'AUT', nameEs: 'Austria', region: 'Europa', population: 9.1 },
  { code2: 'BE', code3: 'BEL', nameEs: 'Bélgica', region: 'Europa', population: 11.7 },
  { code2: 'BY', code3: 'BLR', nameEs: 'Bielorrusia', region: 'Europa', population: 9.5 },
  { code2: 'BA', code3: 'BIH', nameEs: 'Bosnia y Herzegovina', region: 'Europa', population: 3.2 },
  { code2: 'BG', code3: 'BGR', nameEs: 'Bulgaria', region: 'Europa', population: 6.9 },
  { code2: 'CY', code3: 'CYP', nameEs: 'Chipre', region: 'Europa', population: 1.3 },
  { code2: 'VA', code3: 'VAT', nameEs: 'Ciudad del Vaticano', region: 'Europa', population: 0.001 },
  { code2: 'HR', code3: 'HRV', nameEs: 'Croacia', region: 'Europa', population: 3.9 },
  { code2: 'DK', code3: 'DNK', nameEs: 'Dinamarca', region: 'Europa', population: 5.9 },
  { code2: 'SK', code3: 'SVK', nameEs: 'Eslovaquia', region: 'Europa', population: 5.4 },
  { code2: 'SI', code3: 'SVN', nameEs: 'Eslovenia', region: 'Europa', population: 2.1 },
  { code2: 'ES', code3: 'ESP', nameEs: 'España', region: 'Europa', population: 48.4 },
  { code2: 'EE', code3: 'EST', nameEs: 'Estonia', region: 'Europa', population: 1.3 },
  { code2: 'FI', code3: 'FIN', nameEs: 'Finlandia', region: 'Europa', population: 5.6 },
  { code2: 'FR', code3: 'FRA', nameEs: 'Francia', region: 'Europa', population: 68.2 },
  { code2: 'GR', code3: 'GRC', nameEs: 'Grecia', region: 'Europa', population: 10.4 },
  { code2: 'HU', code3: 'HUN', nameEs: 'Hungría', region: 'Europa', population: 9.6 },
  { code2: 'IE', code3: 'IRL', nameEs: 'Irlanda', region: 'Europa', population: 5.1 },
  { code2: 'IS', code3: 'ISL', nameEs: 'Islandia', region: 'Europa', population: 0.4 },
  { code2: 'IT', code3: 'ITA', nameEs: 'Italia', region: 'Europa', population: 58.9 },
  { code2: 'LV', code3: 'LVA', nameEs: 'Letonia', region: 'Europa', population: 1.9 },
  { code2: 'LI', code3: 'LIE', nameEs: 'Liechtenstein', region: 'Europa', population: 0.04 },
  { code2: 'LT', code3: 'LTU', nameEs: 'Lituania', region: 'Europa', population: 2.9 },
  { code2: 'LU', code3: 'LUX', nameEs: 'Luxemburgo', region: 'Europa', population: 0.7 },
  { code2: 'MK', code3: 'MKD', nameEs: 'Macedonia del Norte', region: 'Europa', population: 2.1 },
  { code2: 'MT', code3: 'MLT', nameEs: 'Malta', region: 'Europa', population: 0.5 },
  { code2: 'MD', code3: 'MDA', nameEs: 'Moldavia', region: 'Europa', population: 2.6 },
  { code2: 'MC', code3: 'MCO', nameEs: 'Mónaco', region: 'Europa', population: 0.04 },
  { code2: 'ME', code3: 'MNE', nameEs: 'Montenegro', region: 'Europa', population: 0.6 },
  { code2: 'NO', code3: 'NOR', nameEs: 'Noruega', region: 'Europa', population: 5.5 },
  { code2: 'NL', code3: 'NLD', nameEs: 'Países Bajos', region: 'Europa', population: 17.8 },
  { code2: 'PL', code3: 'POL', nameEs: 'Polonia', region: 'Europa', population: 37.7 },
  { code2: 'PT', code3: 'PRT', nameEs: 'Portugal', region: 'Europa', population: 10.4 },
  { code2: 'GB', code3: 'GBR', nameEs: 'Reino Unido', region: 'Europa', population: 67.8 },
  { code2: 'CZ', code3: 'CZE', nameEs: 'República Checa', region: 'Europa', population: 10.5 },
  { code2: 'RO', code3: 'ROU', nameEs: 'Rumania', region: 'Europa', population: 19.1 },
  { code2: 'RU', code3: 'RUS', nameEs: 'Rusia', region: 'Europa', population: 143.8 },
  { code2: 'SM', code3: 'SMR', nameEs: 'San Marino', region: 'Europa', population: 0.03 },
  { code2: 'RS', code3: 'SRB', nameEs: 'Serbia', region: 'Europa', population: 6.7 },
  { code2: 'SE', code3: 'SWE', nameEs: 'Suecia', region: 'Europa', population: 10.6 },
  { code2: 'CH', code3: 'CHE', nameEs: 'Suiza', region: 'Europa', population: 8.8 },
  { code2: 'UA', code3: 'UKR', nameEs: 'Ucrania', region: 'Europa', population: 37.0 },

  // ── Asia ──────────────────────────────────────────────────────────────────
  { code2: 'AF', code3: 'AFG', nameEs: 'Afganistán', region: 'Asia', population: 42.2 },
  { code2: 'SA', code3: 'SAU', nameEs: 'Arabia Saudita', region: 'Asia', population: 36.9 },
  { code2: 'AM', code3: 'ARM', nameEs: 'Armenia', region: 'Asia', population: 3.0 },
  { code2: 'AZ', code3: 'AZE', nameEs: 'Azerbaiyán', region: 'Asia', population: 10.4 },
  { code2: 'BD', code3: 'BGD', nameEs: 'Bangladés', region: 'Asia', population: 172.9 },
  { code2: 'BH', code3: 'BHR', nameEs: 'Baréin', region: 'Asia', population: 1.5 },
  { code2: 'MM', code3: 'MMR', nameEs: 'Birmania', region: 'Asia', population: 54.5 },
  { code2: 'BN', code3: 'BRN', nameEs: 'Brunéi', region: 'Asia', population: 0.5 },
  { code2: 'BT', code3: 'BTN', nameEs: 'Bután', region: 'Asia', population: 0.8 },
  { code2: 'KH', code3: 'KHM', nameEs: 'Camboya', region: 'Asia', population: 16.8 },
  { code2: 'QA', code3: 'QAT', nameEs: 'Catar', region: 'Asia', population: 2.7 },
  { code2: 'CN', code3: 'CHN', nameEs: 'China', region: 'Asia', population: 1410.7 },
  { code2: 'KP', code3: 'PRK', nameEs: 'Corea del Norte', region: 'Asia', population: 26.2 },
  { code2: 'KR', code3: 'KOR', nameEs: 'Corea del Sur', region: 'Asia', population: 51.8 },
  { code2: 'AE', code3: 'ARE', nameEs: 'Emiratos Árabes Unidos', region: 'Asia', population: 9.5 },
  { code2: 'PH', code3: 'PHL', nameEs: 'Filipinas', region: 'Asia', population: 117.3 },
  { code2: 'GE', code3: 'GEO', nameEs: 'Georgia', region: 'Asia', population: 3.7 },
  { code2: 'HK', code3: 'HKG', nameEs: 'Hong Kong', region: 'Asia', population: 7.5 },
  { code2: 'IN', code3: 'IND', nameEs: 'India', region: 'Asia', population: 1428.6 },
  { code2: 'ID', code3: 'IDN', nameEs: 'Indonesia', region: 'Asia', population: 277.5 },
  { code2: 'IQ', code3: 'IRQ', nameEs: 'Irak', region: 'Asia', population: 45.5 },
  { code2: 'IR', code3: 'IRN', nameEs: 'Irán', region: 'Asia', population: 89.2 },
  { code2: 'IL', code3: 'ISR', nameEs: 'Israel', region: 'Asia', population: 9.8 },
  { code2: 'JP', code3: 'JPN', nameEs: 'Japón', region: 'Asia', population: 124.5 },
  { code2: 'JO', code3: 'JOR', nameEs: 'Jordania', region: 'Asia', population: 11.3 },
  { code2: 'KZ', code3: 'KAZ', nameEs: 'Kazajistán', region: 'Asia', population: 20.1 },
  { code2: 'KG', code3: 'KGZ', nameEs: 'Kirguistán', region: 'Asia', population: 6.7 },
  { code2: 'KW', code3: 'KWT', nameEs: 'Kuwait', region: 'Asia', population: 4.3 },
  { code2: 'LA', code3: 'LAO', nameEs: 'Laos', region: 'Asia', population: 7.6 },
  { code2: 'LB', code3: 'LBN', nameEs: 'Líbano', region: 'Asia', population: 5.4 },
  { code2: 'MO', code3: 'MAC', nameEs: 'Macao', region: 'Asia', population: 0.7 },
  { code2: 'MY', code3: 'MYS', nameEs: 'Malasia', region: 'Asia', population: 34.3 },
  { code2: 'MV', code3: 'MDV', nameEs: 'Maldivas', region: 'Asia', population: 0.5 },
  { code2: 'MN', code3: 'MNG', nameEs: 'Mongolia', region: 'Asia', population: 3.4 },
  { code2: 'NP', code3: 'NPL', nameEs: 'Nepal', region: 'Asia', population: 30.9 },
  { code2: 'OM', code3: 'OMN', nameEs: 'Omán', region: 'Asia', population: 4.6 },
  { code2: 'PK', code3: 'PAK', nameEs: 'Pakistán', region: 'Asia', population: 240.5 },
  { code2: 'PS', code3: 'PSE', nameEs: 'Palestina', region: 'Asia', population: 5.4 },
  { code2: 'SG', code3: 'SGP', nameEs: 'Singapur', region: 'Asia', population: 5.9 },
  { code2: 'SY', code3: 'SYR', nameEs: 'Siria', region: 'Asia', population: 23.2 },
  { code2: 'LK', code3: 'LKA', nameEs: 'Sri Lanka', region: 'Asia', population: 21.9 },
  { code2: 'TH', code3: 'THA', nameEs: 'Tailandia', region: 'Asia', population: 71.7 },
  { code2: 'TW', code3: 'TWN', nameEs: 'Taiwán', region: 'Asia', population: 23.4 },
  { code2: 'TJ', code3: 'TJK', nameEs: 'Tayikistán', region: 'Asia', population: 10.1 },
  { code2: 'TL', code3: 'TLS', nameEs: 'Timor Oriental', region: 'Asia', population: 1.4 },
  { code2: 'TM', code3: 'TKM', nameEs: 'Turkmenistán', region: 'Asia', population: 6.5 },
  { code2: 'TR', code3: 'TUR', nameEs: 'Turquía', region: 'Asia', population: 85.3 },
  { code2: 'UZ', code3: 'UZB', nameEs: 'Uzbekistán', region: 'Asia', population: 35.6 },
  { code2: 'VN', code3: 'VNM', nameEs: 'Vietnam', region: 'Asia', population: 98.9 },
  { code2: 'YE', code3: 'YEM', nameEs: 'Yemen', region: 'Asia', population: 34.4 },

  // ── África ────────────────────────────────────────────────────────────────
  { code2: 'AO', code3: 'AGO', nameEs: 'Angola', region: 'África', population: 36.7 },
  { code2: 'DZ', code3: 'DZA', nameEs: 'Argelia', region: 'África', population: 45.6 },
  { code2: 'BJ', code3: 'BEN', nameEs: 'Benín', region: 'África', population: 13.7 },
  { code2: 'BW', code3: 'BWA', nameEs: 'Botsuana', region: 'África', population: 2.7 },
  { code2: 'BF', code3: 'BFA', nameEs: 'Burkina Faso', region: 'África', population: 23.3 },
  { code2: 'BI', code3: 'BDI', nameEs: 'Burundi', region: 'África', population: 13.2 },
  { code2: 'CV', code3: 'CPV', nameEs: 'Cabo Verde', region: 'África', population: 0.6 },
  { code2: 'CM', code3: 'CMR', nameEs: 'Camerún', region: 'África', population: 28.6 },
  { code2: 'TD', code3: 'TCD', nameEs: 'Chad', region: 'África', population: 18.3 },
  { code2: 'KM', code3: 'COM', nameEs: 'Comoras', region: 'África', population: 0.8 },
  { code2: 'CI', code3: 'CIV', nameEs: 'Costa de Marfil', region: 'África', population: 28.9 },
  { code2: 'EG', code3: 'EGY', nameEs: 'Egipto', region: 'África', population: 112.7 },
  { code2: 'ER', code3: 'ERI', nameEs: 'Eritrea', region: 'África', population: 3.7 },
  { code2: 'SZ', code3: 'SWZ', nameEs: 'Esuatini', region: 'África', population: 1.2 },
  { code2: 'ET', code3: 'ETH', nameEs: 'Etiopía', region: 'África', population: 126.5 },
  { code2: 'GA', code3: 'GAB', nameEs: 'Gabón', region: 'África', population: 2.4 },
  { code2: 'GM', code3: 'GMB', nameEs: 'Gambia', region: 'África', population: 2.7 },
  { code2: 'GH', code3: 'GHA', nameEs: 'Ghana', region: 'África', population: 33.5 },
  { code2: 'GN', code3: 'GIN', nameEs: 'Guinea', region: 'África', population: 14.0 },
  { code2: 'GQ', code3: 'GNQ', nameEs: 'Guinea Ecuatorial', region: 'África', population: 1.7 },
  { code2: 'GW', code3: 'GNB', nameEs: 'Guinea-Bisáu', region: 'África', population: 2.2 },
  { code2: 'KE', code3: 'KEN', nameEs: 'Kenia', region: 'África', population: 55.1 },
  { code2: 'LS', code3: 'LSO', nameEs: 'Lesoto', region: 'África', population: 2.3 },
  { code2: 'LR', code3: 'LBR', nameEs: 'Liberia', region: 'África', population: 5.4 },
  { code2: 'LY', code3: 'LBY', nameEs: 'Libia', region: 'África', population: 6.9 },
  { code2: 'MG', code3: 'MDG', nameEs: 'Madagascar', region: 'África', population: 30.3 },
  { code2: 'MW', code3: 'MWI', nameEs: 'Malaui', region: 'África', population: 20.9 },
  { code2: 'ML', code3: 'MLI', nameEs: 'Malí', region: 'África', population: 23.3 },
  { code2: 'MA', code3: 'MAR', nameEs: 'Marruecos', region: 'África', population: 37.8 },
  { code2: 'MU', code3: 'MUS', nameEs: 'Mauricio', region: 'África', population: 1.3 },
  { code2: 'MR', code3: 'MRT', nameEs: 'Mauritania', region: 'África', population: 4.9 },
  { code2: 'MZ', code3: 'MOZ', nameEs: 'Mozambique', region: 'África', population: 33.9 },
  { code2: 'NA', code3: 'NAM', nameEs: 'Namibia', region: 'África', population: 2.6 },
  { code2: 'NE', code3: 'NER', nameEs: 'Níger', region: 'África', population: 26.2 },
  { code2: 'NG', code3: 'NGA', nameEs: 'Nigeria', region: 'África', population: 223.8 },
  { code2: 'CF', code3: 'CAF', nameEs: 'República Centroafricana', region: 'África', population: 5.7 },
  { code2: 'CG', code3: 'COG', nameEs: 'República del Congo', region: 'África', population: 6.1 },
  { code2: 'CD', code3: 'COD', nameEs: 'República Democrática del Congo', region: 'África', population: 102.3 },
  { code2: 'RW', code3: 'RWA', nameEs: 'Ruanda', region: 'África', population: 14.0 },
  { code2: 'ST', code3: 'STP', nameEs: 'Santo Tomé y Príncipe', region: 'África', population: 0.2 },
  { code2: 'SN', code3: 'SEN', nameEs: 'Senegal', region: 'África', population: 17.8 },
  { code2: 'SC', code3: 'SYC', nameEs: 'Seychelles', region: 'África', population: 0.1 },
  { code2: 'SL', code3: 'SLE', nameEs: 'Sierra Leona', region: 'África', population: 8.6 },
  { code2: 'SO', code3: 'SOM', nameEs: 'Somalia', region: 'África', population: 18.1 },
  { code2: 'ZA', code3: 'ZAF', nameEs: 'Sudáfrica', region: 'África', population: 60.4 },
  { code2: 'SD', code3: 'SDN', nameEs: 'Sudán', region: 'África', population: 48.1 },
  { code2: 'SS', code3: 'SSD', nameEs: 'Sudán del Sur', region: 'África', population: 11.1 },
  { code2: 'TZ', code3: 'TZA', nameEs: 'Tanzania', region: 'África', population: 67.4 },
  { code2: 'TG', code3: 'TGO', nameEs: 'Togo', region: 'África', population: 9.1 },
  { code2: 'TN', code3: 'TUN', nameEs: 'Túnez', region: 'África', population: 12.5 },
  { code2: 'UG', code3: 'UGA', nameEs: 'Uganda', region: 'África', population: 48.6 },
  { code2: 'DJ', code3: 'DJI', nameEs: 'Yibuti', region: 'África', population: 1.1 },
  { code2: 'ZM', code3: 'ZMB', nameEs: 'Zambia', region: 'África', population: 20.6 },
  { code2: 'ZW', code3: 'ZWE', nameEs: 'Zimbabue', region: 'África', population: 16.7 },

  // ── Oceanía ───────────────────────────────────────────────────────────────
  { code2: 'AU', code3: 'AUS', nameEs: 'Australia', region: 'Oceanía', population: 26.6 },
  { code2: 'FJ', code3: 'FJI', nameEs: 'Fiyi', region: 'Oceanía', population: 0.9 },
  { code2: 'MH', code3: 'MHL', nameEs: 'Islas Marshall', region: 'Oceanía', population: 0.04 },
  { code2: 'SB', code3: 'SLB', nameEs: 'Islas Salomón', region: 'Oceanía', population: 0.7 },
  { code2: 'KI', code3: 'KIR', nameEs: 'Kiribati', region: 'Oceanía', population: 0.1 },
  { code2: 'FM', code3: 'FSM', nameEs: 'Micronesia', region: 'Oceanía', population: 0.1 },
  { code2: 'NR', code3: 'NRU', nameEs: 'Nauru', region: 'Oceanía', population: 0.01 },
  { code2: 'NZ', code3: 'NZL', nameEs: 'Nueva Zelanda', region: 'Oceanía', population: 5.2 },
  { code2: 'PW', code3: 'PLW', nameEs: 'Palaos', region: 'Oceanía', population: 0.02 },
  { code2: 'PG', code3: 'PNG', nameEs: 'Papúa Nueva Guinea', region: 'Oceanía', population: 10.3 },
  { code2: 'WS', code3: 'WSM', nameEs: 'Samoa', region: 'Oceanía', population: 0.2 },
  { code2: 'TO', code3: 'TON', nameEs: 'Tonga', region: 'Oceanía', population: 0.1 },
  { code2: 'VU', code3: 'VUT', nameEs: 'Vanuatu', region: 'Oceanía', population: 0.3 },
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
 * Bridge to `world-atlas` topojson (`countries-50m.json`). Every geometry
 * there is keyed by an ISO 3166-1 numeric code (a.k.a. UN M49). We map those
 * to our alpha-2 codes here so the MapView can colour features without
 * bringing in an extra dependency. Every country in COUNTRIES must have an
 * entry here — geometries without a match render as "no data" (dependencies,
 * disputed territories, Antarctica).
 */
export const M49_TO_CODE2: Record<string, string> = {
  '004': 'AF', '008': 'AL', '012': 'DZ', '020': 'AD', '024': 'AO',
  '028': 'AG', '031': 'AZ', '032': 'AR', '036': 'AU', '040': 'AT',
  '044': 'BS', '048': 'BH', '050': 'BD', '051': 'AM', '052': 'BB',
  '056': 'BE', '064': 'BT', '068': 'BO', '070': 'BA', '072': 'BW',
  '076': 'BR', '084': 'BZ', '090': 'SB', '096': 'BN', '100': 'BG',
  '104': 'MM', '108': 'BI', '112': 'BY', '116': 'KH', '120': 'CM',
  '124': 'CA', '132': 'CV', '140': 'CF', '144': 'LK', '148': 'TD',
  '152': 'CL', '156': 'CN', '158': 'TW', '170': 'CO', '174': 'KM',
  '178': 'CG', '180': 'CD', '188': 'CR', '191': 'HR', '192': 'CU',
  '196': 'CY', '203': 'CZ', '204': 'BJ', '208': 'DK', '212': 'DM',
  '214': 'DO', '218': 'EC', '222': 'SV', '226': 'GQ', '231': 'ET',
  '232': 'ER', '233': 'EE', '242': 'FJ', '246': 'FI', '250': 'FR',
  '262': 'DJ', '266': 'GA', '268': 'GE', '270': 'GM', '275': 'PS',
  '276': 'DE', '288': 'GH', '296': 'KI', '300': 'GR', '308': 'GD',
  '320': 'GT', '324': 'GN', '328': 'GY', '332': 'HT', '336': 'VA',
  '340': 'HN', '344': 'HK', '348': 'HU', '352': 'IS', '356': 'IN',
  '360': 'ID', '364': 'IR', '368': 'IQ', '372': 'IE', '376': 'IL',
  '380': 'IT', '384': 'CI', '388': 'JM', '392': 'JP', '398': 'KZ',
  '400': 'JO', '404': 'KE', '408': 'KP', '410': 'KR', '414': 'KW',
  '417': 'KG', '418': 'LA', '422': 'LB', '426': 'LS', '428': 'LV',
  '430': 'LR', '434': 'LY', '438': 'LI', '440': 'LT', '442': 'LU',
  '446': 'MO', '450': 'MG', '454': 'MW', '458': 'MY', '462': 'MV',
  '466': 'ML', '470': 'MT', '478': 'MR', '480': 'MU', '484': 'MX',
  '492': 'MC', '496': 'MN', '498': 'MD', '499': 'ME', '504': 'MA',
  '508': 'MZ', '512': 'OM', '516': 'NA', '520': 'NR', '524': 'NP',
  '528': 'NL', '548': 'VU', '554': 'NZ', '558': 'NI',
  '562': 'NE', '566': 'NG', '578': 'NO', '583': 'FM', '584': 'MH',
  '585': 'PW', '586': 'PK', '591': 'PA', '598': 'PG', '600': 'PY',
  '604': 'PE', '608': 'PH', '616': 'PL', '620': 'PT', '624': 'GW',
  '626': 'TL', '630': 'PR', '634': 'QA', '642': 'RO', '643': 'RU',
  '646': 'RW', '659': 'KN', '662': 'LC', '670': 'VC', '674': 'SM',
  '678': 'ST', '682': 'SA', '686': 'SN', '688': 'RS', '690': 'SC',
  '694': 'SL', '702': 'SG', '703': 'SK', '704': 'VN', '705': 'SI',
  '706': 'SO', '710': 'ZA', '716': 'ZW', '724': 'ES', '728': 'SS',
  '729': 'SD', '740': 'SR', '748': 'SZ', '752': 'SE', '756': 'CH',
  '760': 'SY', '762': 'TJ', '764': 'TH', '768': 'TG', '776': 'TO',
  '780': 'TT', '784': 'AE', '788': 'TN', '792': 'TR', '795': 'TM',
  '800': 'UG', '804': 'UA', '807': 'MK', '818': 'EG', '826': 'GB',
  '834': 'TZ', '840': 'US', '854': 'BF', '858': 'UY', '860': 'UZ',
  '862': 'VE', '882': 'WS', '887': 'YE', '894': 'ZM',
};

export function code2FromM49(m49: string | number): string | undefined {
  const key = typeof m49 === 'number' ? String(m49).padStart(3, '0') : String(m49).padStart(3, '0');
  return M49_TO_CODE2[key];
}
