import type { SubmissionPayload } from './payload';

export type SubmitResult = { ok: true; inserted: number } | { ok: false; error: string };

/**
 * Sends the payload to the Google Apps Script Web App. If the endpoint env var
 * is empty we fall through to a dev fallback that logs the payload and pretends
 * the write succeeded, so the UI can be exercised before the backend exists.
 *
 * The endpoint is wired in P8. This module currently only implements the dev
 * fallback and a placeholder branch so callers can integrate now.
 */
export async function submitForm(payload: SubmissionPayload): Promise<SubmitResult> {
  const endpoint = import.meta.env.VITE_SHEETS_ENDPOINT as string | undefined;
  if (!endpoint) {
    // eslint-disable-next-line no-console
    console.info('[submitForm] VITE_SHEETS_ENDPOINT is empty; logging payload only:', payload);
    return { ok: true, inserted: payload.rows.length };
  }
  // Real POST is implemented in P8.
  return { ok: false, error: 'Endpoint configurado pero cliente aún no implementado (P8).' };
}
