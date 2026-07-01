import type { SubmissionPayload } from './payload';

export type SubmitResult = { ok: true; inserted: number } | { ok: false; error: string };

/**
 * Sends the payload to the Google Apps Script Web App. When the env var is
 * empty we fall through to a dev fallback that logs the payload and pretends
 * the write succeeded, so the UI can be exercised before the backend exists.
 *
 * Uses Content-Type: text/plain to avoid the CORS preflight — Apps Script
 * cannot answer OPTIONS requests. The request body is still a JSON string;
 * the doPost handler parses it with JSON.parse.
 */
export async function submitForm(payload: SubmissionPayload): Promise<SubmitResult> {
  const endpoint = import.meta.env.VITE_SHEETS_ENDPOINT as string | undefined;

  if (!endpoint) {
    // eslint-disable-next-line no-console
    console.info('[submitForm] VITE_SHEETS_ENDPOINT is empty; logging payload only:', payload);
    return { ok: true, inserted: payload.rows.length };
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });
  } catch (err) {
    return {
      ok: false,
      error: `Error de red al enviar el formulario: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  if (!response.ok) {
    return { ok: false, error: `Respuesta HTTP ${response.status} del servidor.` };
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return { ok: false, error: 'Respuesta del servidor no es JSON válido.' };
  }

  if (isResult(data)) {
    if (data.ok) return { ok: true, inserted: typeof data.inserted === 'number' ? data.inserted : 0 };
    return { ok: false, error: data.error || 'Error desconocido del servidor.' };
  }

  return { ok: false, error: 'Respuesta del servidor con formato inesperado.' };
}

type ServerResult =
  | { ok: true; inserted?: number }
  | { ok: false; error?: string };

function isResult(x: unknown): x is ServerResult {
  return typeof x === 'object' && x !== null && 'ok' in x && typeof (x as { ok: unknown }).ok === 'boolean';
}
