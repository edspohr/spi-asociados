const SHEET_NAME = 'Respuestas';
const HEADERS = [
  'timestamp',
  'razon_social',
  'dba',
  'pais_origen',
  'anio_inicio',
  'num_empleados',
  'rep_legal',
  'contacto_principal_nombre',
  'contacto_principal_correo',
  'contacto_principal_telefono',
  'contacto_regulatorio_nombre',
  'contacto_regulatorio_correo',
  'contacto_regulatorio_telefono',
  'correo_adicional',
  'grupo',
  'servicio',
  'servicio_otro_detalle',
  'modalidad',
  'pais_aplicacion',
];

function doPost(e) {
  try {
    const sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
    if (!sheetId) {
      return jsonResponse({ ok: false, error: 'SHEET_ID script property is not set.' });
    }

    const ss = SpreadsheetApp.openById(sheetId);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

    const payload = JSON.parse(e.postData.contents);
    const c = payload.company || {};
    const ts = new Date();

    const rows = (payload.rows || []).map(function (r) {
      return [
        ts,
        c.razonSocial || '',
        c.dba || '',
        c.paisOrigen || '',
        c.anioInicio || '',
        c.numEmpleados || '',
        c.repLegal || '',
        c.contactoPrincipalNombre || '',
        c.contactoPrincipalCorreo || '',
        c.contactoPrincipalTelefono || '',
        c.contactoRegulatorioNombre || '',
        c.contactoRegulatorioCorreo || '',
        c.contactoRegulatorioTelefono || '',
        c.correoAdicional || '',
        r.grupo || '',
        r.servicio || '',
        r.servicioOtroDetalle || '',
        r.modalidad || '',
        r.paisAplicacion || '',
      ];
    });

    if (rows.length) {
      sheet
        .getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length)
        .setValues(rows);
    }

    return jsonResponse({ ok: true, inserted: rows.length });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonResponse({ ok: true, service: 'spi-asociados', hint: 'POST JSON here.' });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
