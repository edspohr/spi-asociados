# SPI Asociados — Google Apps Script backend (DEPRECATED)

> **Deprecated as of 2026-07-30.** The frontend now submits to a Cloud
> Function (`submitAssociate`) that writes to Firestore. See
> [`functions/src/index.ts`](../functions/src/index.ts) and the top-level
> `firebase.json`. This folder is kept for reference only; do not point new
> deployments here.

This is the original Google Apps Script Web App that appended form submissions
from the SPI Americas "Hoja de Vida de Asociados" web form into a Google Sheet.

It writes rows in **long / tidy format** — one row per marked
`(group × service × country)` cell — so SPI could pivot the data directly in
Sheets.

## Prerequisites

- A Google account with permission to create Sheets and Apps Script projects.
- An empty Google Sheet that will hold the responses.

## Deploy steps

1. Create a new Google Sheet (e.g. "SPI Asociados — Respuestas"). Copy the
   **Sheet ID** from the URL — it's the long string between `/d/` and `/edit`.

2. In the Sheet, open **Extensions ▸ Apps Script**. Delete the default
   `Code.gs` contents and paste in the contents of `Code.gs` from this folder.

3. In the Apps Script editor, open **Project Settings** (⚙︎ in the left rail)
   and scroll to **Script properties**. Add:

   - Key: `SHEET_ID`
   - Value: *(the Sheet ID from step 1)*

   Save.

4. Click **Deploy ▸ New deployment ▸ Web app**.

   - Description: `spi-asociados v1` (or similar)
   - Execute as: **Me** (your Google account)
   - Who has access: **Anyone**

   Deploy. Google will ask you to authorize the script — accept.

5. Copy the **Web app URL** it gives you. It ends in `/exec`.

6. In the frontend, set the env var:

   ```
   VITE_SHEETS_ENDPOINT=<paste the /exec URL here>
   ```

   Rebuild (`npm run build`) or restart `npm run dev`.

## Column order

The sheet is populated with a header row on first write:

```
timestamp, razon_social, dba, pais_origen, anio_inicio, num_empleados,
rep_legal, contacto_principal_nombre, contacto_principal_correo,
contacto_principal_telefono, contacto_regulatorio_nombre,
contacto_regulatorio_correo, contacto_regulatorio_telefono, correo_adicional,
categoria, subcategoria, grupo, servicio, servicio_otro_detalle, modalidad,
pais_aplicacion
```

- `categoria` is one of `Propiedad Intelectual`, `Derecho Comercial`,
  `Asuntos Regulatorios`, `Otro grupo`.
- `subcategoria` is `Uso Humano`, `Veterinarios`, or `Uso Agrícola` for
  regulatorios rows; empty for the others.
- `correo_adicional` holds all additional emails joined by `; `.

Every submission shares the same `timestamp` across all its rows; pivot on
`timestamp` (or filter to the max per `razon_social`) to get the latest
snapshot per associate.

## CORS

The frontend POSTs with `Content-Type: text/plain;charset=utf-8` so the
browser does not send a CORS preflight — Apps Script does not respond to
`OPTIONS`. The request body is still a JSON string, and Apps Script parses it
via `JSON.parse(e.postData.contents)`.

## Updating the script

Every time you edit `Code.gs`, you have to redeploy: **Deploy ▸ Manage
deployments ▸** the pencil icon on the active deployment **▸** *New version*
**▸ Deploy**. The `/exec` URL stays the same.

### Schema changes to an existing sheet

When `HEADERS` changes (e.g. new columns added like `categoria`/`subcategoria`),
the existing header row in the "Respuestas" sheet is out of date. `doPost`
only writes the header when the sheet is empty, so you must **delete row 1 of
the "Respuestas" sheet** (or rename the tab so a fresh one is created). On the
next submission, `doPost` will re-append the current `HEADERS` row and future
data will align.

If you don't do this, incoming data still lands in the correct columns
(writes go by index, not by header name), but the visible header row will not
match the data.
