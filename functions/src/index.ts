import { onRequest, HttpsOptions } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

initializeApp();

// The admin key protects the analytics endpoint. Set with:
//   firebase functions:secrets:set ADMIN_KEY
// and rotate any time by re-running that command.
const ADMIN_KEY = defineSecret('ADMIN_KEY');

const REGION = 'us-east1';

// Frontends allowed to call these functions. Firebase Hosting adds the runtime
// origin automatically; keep localhost for the dev server. Add more entries
// here if a staging domain shows up.
const ALLOWED_ORIGINS = [
  'https://spi-asociados.web.app',
  'https://spi-asociados.firebaseapp.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const SUBMIT_OPTIONS: HttpsOptions = {
  region: REGION,
  cors: ALLOWED_ORIGINS,
  memory: '256MiB',
  timeoutSeconds: 30,
};

const LIST_OPTIONS: HttpsOptions = {
  region: REGION,
  cors: ALLOWED_ORIGINS,
  memory: '256MiB',
  timeoutSeconds: 60,
  secrets: [ADMIN_KEY],
};

// Kept in sync by hand with src/lib/payload.ts (SubmissionRow) and
// src/types/form.ts (CompanyInfo). Duplication is deliberate — the Function
// deploys standalone and shouldn't depend on the frontend build.
type CompanyInfo = {
  razonSocial: string;
  dba: string;
  paisOrigen: string;
  anioInicio: string;
  numEmpleados: string;
  repLegal: string;
  contactoPrincipalNombre: string;
  contactoPrincipalCorreo: string;
  contactoPrincipalTelefono: string;
  contactoRegulatorioNombre: string;
  contactoRegulatorioCorreo: string;
  contactoRegulatorioTelefono: string;
  correosAdicionales: string[];
};

type SubmissionRow = {
  categoria: string;
  subcategoria: string;
  grupo: string;
  servicio: string;
  modalidad: 'Directo' | 'Tercerizado';
  paisAplicacion: string;
};

type SubmissionPayload = {
  company: CompanyInfo;
  rows: SubmissionRow[];
};

const COLLECTION = 'associates';
const MAX_ROWS = 10_000; // hard cap to guard against payload abuse

// ─── submitAssociate ─────────────────────────────────────────────────────────

/**
 * Public POST endpoint. Validates a SubmissionPayload and writes it as a new
 * document in the `associates` collection. Returns { ok, inserted } compatible
 * with the previous Apps Script contract so the frontend fetch client did not
 * need a shape change.
 */
export const submitAssociate = onRequest(SUBMIT_OPTIONS, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Método no permitido; use POST.' });
    return;
  }

  const payload = parsePayload(req.body);
  if (!payload.ok) {
    res.status(400).json({ ok: false, error: payload.error });
    return;
  }

  try {
    const db = getFirestore();
    await db.collection(COLLECTION).add({
      company: payload.value.company,
      rows: payload.value.rows,
      submittedAt: FieldValue.serverTimestamp(),
      submissionSource: 'form',
    });
    res.status(200).json({ ok: true, inserted: payload.value.rows.length });
  } catch (err) {
    logger.error('submitAssociate failed', err);
    res.status(500).json({ ok: false, error: 'Error interno al guardar la respuesta.' });
  }
});

// ─── listAssociates ──────────────────────────────────────────────────────────

/**
 * Private GET endpoint used by the analytics view. Requires the admin key
 * either as `?key=…` or the `x-admin-key` header. Returns every submission —
 * the collection is small (~48 associates × ~payload) so no pagination.
 */
export const listAssociates = onRequest(LIST_OPTIONS, async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Método no permitido; use GET.' });
    return;
  }

  const provided =
    (req.header('x-admin-key') ?? '') ||
    (typeof req.query.key === 'string' ? req.query.key : '');

  const expected = ADMIN_KEY.value();
  if (!expected || !provided || !safeEqual(provided, expected)) {
    res.status(401).json({ ok: false, error: 'Acceso denegado.' });
    return;
  }

  try {
    const db = getFirestore();
    const snap = await db.collection(COLLECTION).orderBy('submittedAt', 'desc').get();
    const associates = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        company: data.company,
        rows: data.rows,
        submissionSource: data.submissionSource ?? 'form',
        // Firestore Timestamp → ISO for JSON serializability.
        submittedAt: data.submittedAt?.toDate?.().toISOString() ?? null,
      };
    });
    res.status(200).json({ ok: true, associates });
  } catch (err) {
    logger.error('listAssociates failed', err);
    res.status(500).json({ ok: false, error: 'Error interno al leer los datos.' });
  }
});

// ─── helpers ─────────────────────────────────────────────────────────────────

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

function parsePayload(body: unknown): ParseResult<SubmissionPayload> {
  if (!isPlainObject(body)) {
    return { ok: false, error: 'Cuerpo de la solicitud no es un objeto JSON válido.' };
  }
  const company = (body as Record<string, unknown>).company;
  const rows = (body as Record<string, unknown>).rows;

  if (!isPlainObject(company)) {
    return { ok: false, error: 'Falta el bloque `company`.' };
  }
  if (!Array.isArray(rows)) {
    return { ok: false, error: 'Falta el arreglo `rows`.' };
  }
  if (rows.length === 0) {
    return { ok: false, error: 'El arreglo `rows` está vacío.' };
  }
  if (rows.length > MAX_ROWS) {
    return { ok: false, error: `Se excedió el máximo de ${MAX_ROWS} filas por envío.` };
  }

  const companyResult = normalizeCompany(company as Record<string, unknown>);
  if (!companyResult.ok) return companyResult;

  const normalizedRows: SubmissionRow[] = [];
  for (let i = 0; i < rows.length; i++) {
    const rowResult = normalizeRow(rows[i], i);
    if (!rowResult.ok) return rowResult;
    normalizedRows.push(rowResult.value);
  }

  return {
    ok: true,
    value: { company: companyResult.value, rows: normalizedRows },
  };
}

function normalizeCompany(raw: Record<string, unknown>): ParseResult<CompanyInfo> {
  const razonSocial = trimString(raw.razonSocial);
  if (!razonSocial) {
    return { ok: false, error: 'company.razonSocial es obligatorio.' };
  }
  const paisOrigen = trimString(raw.paisOrigen);
  if (!paisOrigen) {
    return { ok: false, error: 'company.paisOrigen es obligatorio.' };
  }
  const contactoPrincipalNombre = trimString(raw.contactoPrincipalNombre);
  if (!contactoPrincipalNombre) {
    return { ok: false, error: 'company.contactoPrincipalNombre es obligatorio.' };
  }
  const contactoPrincipalCorreo = trimString(raw.contactoPrincipalCorreo);
  if (!contactoPrincipalCorreo || !EMAIL_RE.test(contactoPrincipalCorreo)) {
    return { ok: false, error: 'company.contactoPrincipalCorreo es inválido.' };
  }

  const correosAdicionalesRaw = raw.correosAdicionales;
  const correosAdicionales: string[] = [];
  if (Array.isArray(correosAdicionalesRaw)) {
    for (const c of correosAdicionalesRaw) {
      const v = trimString(c);
      if (v) correosAdicionales.push(v);
    }
  }

  return {
    ok: true,
    value: {
      razonSocial,
      dba: trimString(raw.dba),
      paisOrigen,
      anioInicio: trimString(raw.anioInicio),
      numEmpleados: trimString(raw.numEmpleados),
      repLegal: trimString(raw.repLegal),
      contactoPrincipalNombre,
      contactoPrincipalCorreo,
      contactoPrincipalTelefono: trimString(raw.contactoPrincipalTelefono),
      contactoRegulatorioNombre: trimString(raw.contactoRegulatorioNombre),
      contactoRegulatorioCorreo: trimString(raw.contactoRegulatorioCorreo),
      contactoRegulatorioTelefono: trimString(raw.contactoRegulatorioTelefono),
      correosAdicionales,
    },
  };
}

function normalizeRow(raw: unknown, index: number): ParseResult<SubmissionRow> {
  if (!isPlainObject(raw)) {
    return { ok: false, error: `rows[${index}] no es un objeto.` };
  }
  const r = raw as Record<string, unknown>;
  const modalidad = trimString(r.modalidad);
  if (modalidad !== 'Directo' && modalidad !== 'Tercerizado') {
    return { ok: false, error: `rows[${index}].modalidad debe ser "Directo" o "Tercerizado".` };
  }
  const paisAplicacion = trimString(r.paisAplicacion);
  if (!paisAplicacion) {
    return { ok: false, error: `rows[${index}].paisAplicacion es obligatorio.` };
  }
  return {
    ok: true,
    value: {
      categoria: trimString(r.categoria),
      subcategoria: trimString(r.subcategoria),
      grupo: trimString(r.grupo),
      servicio: trimString(r.servicio),
      modalidad,
      paisAplicacion,
    },
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Constant-time comparison to avoid leaking key length via timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
