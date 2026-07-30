import { useEffect, useState } from 'react';
import type { AssociateDoc, ListAssociatesResponse } from './types';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string; unauthorized?: boolean }
  | { status: 'ready'; data: AssociateDoc[] };

/**
 * Fetches the associates snapshot from the listAssociates Cloud Function.
 * Sends the admin key as `x-admin-key` header. `null`/empty key skips the
 * request and lands in `unauthorized` immediately (used by AccessGate before
 * the user has provided a key).
 *
 * Latest-per-email de-duplication is done here so downstream components always
 * work on the "current picture" of each associate; older submissions are still
 * available in `history` on the same shape as `data`.
 */
export function useAssociates(adminKey: string | null): State & {
  history: AssociateDoc[];
  refetch: () => void;
} {
  const [state, setState] = useState<State>({ status: 'idle' });
  const [tick, setTick] = useState(0);
  const [history, setHistory] = useState<AssociateDoc[]>([]);

  useEffect(() => {
    if (!adminKey) {
      setState({ status: 'error', error: 'Falta la clave de acceso.', unauthorized: true });
      return;
    }
    const endpoint = import.meta.env.VITE_ADMIN_URL as string | undefined;
    if (!endpoint) {
      setState({
        status: 'error',
        error: 'VITE_ADMIN_URL no está configurada. Vea .env.example.',
      });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    fetch(endpoint, {
      method: 'GET',
      headers: { 'x-admin-key': adminKey },
    })
      .then(async (r) => {
        let body: unknown;
        try {
          body = await r.json();
        } catch {
          throw new Error(`Respuesta HTTP ${r.status} sin JSON.`);
        }
        if (!isListResponse(body)) {
          throw new Error('Respuesta con formato inesperado.');
        }
        if (!body.ok) {
          const err = new Error(body.error);
          (err as Error & { status?: number }).status = r.status;
          throw err;
        }
        return body.associates;
      })
      .then((all) => {
        if (cancelled) return;
        setHistory(all);
        setState({ status: 'ready', data: latestPerEmail(all) });
      })
      .catch((err: Error & { status?: number }) => {
        if (cancelled) return;
        setState({
          status: 'error',
          error: err.message,
          unauthorized: err.status === 401,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [adminKey, tick]);

  return { ...state, history, refetch: () => setTick((t) => t + 1) };
}

/**
 * Keep only the most recent submission per contactoPrincipalCorreo. Docs
 * without a submittedAt fall to the end (undated → oldest). The order of the
 * input array is respected as a tiebreaker.
 */
function latestPerEmail(all: AssociateDoc[]): AssociateDoc[] {
  const byEmail = new Map<string, AssociateDoc>();
  for (const doc of all) {
    const email = doc.company?.contactoPrincipalCorreo?.trim().toLowerCase() || `__no-email::${doc.id}`;
    const prev = byEmail.get(email);
    if (!prev) {
      byEmail.set(email, doc);
      continue;
    }
    if (compareSubmittedAt(doc.submittedAt, prev.submittedAt) > 0) {
      byEmail.set(email, doc);
    }
  }
  return Array.from(byEmail.values());
}

function compareSubmittedAt(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  return a < b ? -1 : 1;
}

function isListResponse(x: unknown): x is ListAssociatesResponse {
  return typeof x === 'object' && x !== null && 'ok' in x && typeof (x as { ok: unknown }).ok === 'boolean';
}
