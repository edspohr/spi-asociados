import type { SubmissionPayload } from './payload';

export type SubmitResult = { ok: true; inserted: number } | { ok: false; error: string };

/**
 * POSTs the payload to the `submitAssociate` Cloud Function. When
 * VITE_SUBMIT_URL is empty (local UI work without a backend), logs the payload
 * and pretends the write succeeded.
 */
export async function submitForm(payload: SubmissionPayload): Promise<SubmitResult> {
  const endpoint = import.meta.env.VITE_SUBMIT_URL as string | undefined;

  if (!endpoint) {
    // eslint-disable-next-line no-console
    console.info('[submitForm] VITE_SUBMIT_URL is empty; logging payload only:', payload);
    return { ok: true, inserted: payload.rows.length };
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    return {
      ok: false,
      error: `Error de red al enviar el formulario: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return { ok: false, error: `Respuesta HTTP ${response.status} sin JSON válido.` };
  }

  if (isResult(data)) {
    if (data.ok) {
      return { ok: true, inserted: typeof data.inserted === 'number' ? data.inserted : 0 };
    }
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
