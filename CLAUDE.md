# SPI Americas — Hoja de Vida de Asociados

Public, single-page data-capture form. SPI Americas sends the link to its foreign
associates (~48) so they can declare which **services** they offer, for which
**product groups**, in which **countries**, and whether each service is
**Directo** (in-house) or **Tercerizado** (outsourced).

## Language rule (non-negotiable)

- **UI text, labels, tooltips, validation, success screens → Spanish (neutral LatAm).**
- **Code, identifiers, comments, commit messages, file names, this file → English.**

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite`; tokens defined in `src/styles/index.css`)
- Firebase Hosting (static) + Cloud Functions v2 (Node 22) + Firestore. Two
  HTTPS Functions in `functions/src/index.ts`:
  - `submitAssociate` — public POST, validates payload, writes to Firestore.
  - `listAssociates` — private GET, gated by an admin key (Functions secret
    `ADMIN_KEY`, passed as `x-admin-key` header or `?key=` query).
  Firestore rules deny all client access — every read/write goes through the
  Functions using the admin SDK.
- Frontend env vars: `VITE_SUBMIT_URL` (submitAssociate URL), `VITE_ADMIN_URL`
  (listAssociates URL). If `VITE_SUBMIT_URL` is empty the form logs the
  payload to the console instead of hitting the backend — useful for local UI
  work before Functions are deployed.
- No end-user authentication. Public form link; analytics view protected by
  the admin key in the URL.
- The Google Apps Script backend under `apps-script/` is deprecated (kept for
  reference only).

## Data shape

Groups are organized as a hierarchy: 4 top-level categories
(Propiedad Intelectual, Derecho Comercial, Asuntos Regulatorios, Otro grupo).
Asuntos Regulatorios has 3 subcategories (Uso Humano, Veterinarios, Uso
Agrícola). Each leaf subgroup declares its own list of service labels
(free-form Spanish strings, not enum keys), so different subgroups can have
different services. See `CATEGORIES` in `src/data/form-config.ts`.

Countries are ISO 3166-1 alpha-2 codes (see `src/data/countries.ts`), grouped
into 8 regions. `paisAplicacion` in submissions holds the code (e.g. `CL`),
never the display name; UI resolves the Spanish name at render.

Each submission is stored as **one Firestore document** in the `associates`
collection with shape:

```
{
  company: CompanyInfo,          // full header block (name, contacts, ...)
  rows: SubmissionRow[],         // one entry per marked (group × service × country) cell
  submittedAt: Timestamp,
  submissionSource: 'form' | 'admin',
}
```

`SubmissionRow` is `{ categoria, subcategoria, grupo, servicio, modalidad,
paisAplicacion }`. Submissions are append-only — associates who resubmit get a
new document; the analytics view chooses which one to show by
`contactoPrincipalCorreo` + most recent `submittedAt`.

## Run

Frontend only (no backend needed):

```
cp .env.example .env        # leave VITE_SUBMIT_URL empty to log payloads locally
npm install
npm run dev
```

Full stack against the Firebase emulators:

```
firebase emulators:start --only functions,firestore   # in one terminal
# then in .env set VITE_SUBMIT_URL and VITE_ADMIN_URL to the emulator URLs
# (printed at emulator startup, roughly
#  http://127.0.0.1:5001/spi-asociados/us-east1/submitAssociate)
npm run dev                                           # in another terminal
```

## Build & deploy

Frontend (Firebase Hosting):

```
firebase login              # once, opens a browser
npm run build               # tsc + vite build → dist/
firebase deploy --only hosting
```

Backend (Cloud Functions + Firestore rules):

```
# Set the admin key once (rotate any time by re-running):
firebase functions:secrets:set ADMIN_KEY

# Deploy both Functions and the deny-all Firestore rules:
firebase deploy --only functions,firestore
```

After first deploy, copy the printed HTTPS URLs of `submitAssociate` and
`listAssociates` into `.env` (`VITE_SUBMIT_URL`, `VITE_ADMIN_URL`) and
rebuild the frontend so it points at production.

Project id `spi-asociados` is pinned in `.firebaserc`; `firebase.json` points
Hosting at `dist/`, rewrites all paths to `index.html` (SPA), sets long-cache
headers on hashed assets with `no-cache` on `index.html`, and configures the
`functions/` codebase + `firestore.rules`.

## Folder layout

```
src/
  components/   React components (matrix cell, group section, header form, review, admin)
  data/         Static config (groups, services, countries, tooltips)
  hooks/        useLocalStorageState and friends
  lib/          Payload builders, validation helpers, fetch client, matrix bulk ops
  styles/       Global CSS + Tailwind tokens
  types/        Shared TS types
functions/      Cloud Functions v2 (TypeScript) — submitAssociate + listAssociates
apps-script/    DEPRECATED — original Google Apps Script Web App
firestore.rules Deny-all client access; all reads/writes go through Functions
```

## Conventions

- Spanish strings live inline in components (no i18n framework in v1).
- All identifiers, props, and file names are English.
- Autosave the entire draft to `localStorage` on every change; restore on load.
- Append-only submissions; no editing of prior responses in v1.
