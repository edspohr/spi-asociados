import type { CompanyInfo } from '../types/form';
import type { SubmissionRow } from '../lib/payload';

/** Shape returned by the listAssociates Cloud Function. Stays in sync with
 *  functions/src/index.ts. */
export type AssociateDoc = {
  id: string;
  company: CompanyInfo;
  rows: SubmissionRow[];
  submissionSource: 'form' | 'admin';
  submittedAt: string | null; // ISO string
};

export type ListAssociatesResponse =
  | { ok: true; associates: AssociateDoc[] }
  | { ok: false; error: string };
