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
- No backend runtime. Submissions POST JSON to a Google Apps Script Web App
  (URL from `VITE_SHEETS_ENDPOINT`), which appends rows to a Google Sheet.
- Firebase Hosting for static output only. No Firebase runtime services.
- No authentication. Public link.

## Data shape

Submissions are written in **long / tidy format**: one row per marked
`(group × service × country)` cell. Single-row groups (Propiedad Intelectual,
Servicios Legales) emit rows with `servicio: ""`. See `apps-script/Code.gs` for
the exact header order.

## Run

```
cp .env.example .env        # then paste the Apps Script /exec URL
npm install
npm run dev
```

If `VITE_SHEETS_ENDPOINT` is empty, submissions are logged to the console
instead of POSTed — useful for local UI work before the backend is deployed.

## Build & deploy

Frontend (Firebase Hosting):

```
firebase login              # once, opens a browser
npm run build               # tsc + vite build → dist/
firebase deploy --only hosting
```

Project id `spi-asociados` is pinned in `.firebaserc`; `firebase.json` points
Hosting at `dist/`, rewrites all paths to `index.html` (SPA), and sets
long-cache headers on hashed assets with `no-cache` on `index.html`.

Backend deploy: see `apps-script/README.md`.

## Folder layout

```
src/
  components/   React components (matrix cell, group section, header form, review)
  data/         Static config (groups, services, countries, tooltips)
  hooks/        useLocalStorageState and friends
  lib/          Payload builders, validation helpers, fetch client
  styles/       Global CSS + Tailwind tokens
  types/        Shared TS types
apps-script/    Google Apps Script Web App source + deploy README
```

## Conventions

- Spanish strings live inline in components (no i18n framework in v1).
- All identifiers, props, and file names are English.
- Autosave the entire draft to `localStorage` on every change; restore on load.
- Append-only submissions; no editing of prior responses in v1.
