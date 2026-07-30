# SPI Americas — Hoja de Vida de Asociados

Public single-page form that SPI Americas' foreign associates use to declare
which services they offer, for which product groups, in which countries, and
whether each service is provided directly (Directo) or outsourced
(Tercerizado).

React 19 + Vite + TypeScript + Tailwind CSS v4. Static hosting on Firebase.
Submissions POST JSON to a Google Apps Script Web App that appends rows to a
Google Sheet — no backend runtime.

## Run

```
cp .env.example .env        # then paste the Apps Script /exec URL
npm install
npm run dev
```

If `VITE_SHEETS_ENDPOINT` is empty, submissions log to the console instead of
posting — useful for local UI work before the backend is deployed.

## Test & build

```
npm test                    # vitest
npm run build               # tsc + vite build → dist/
```

## Deploy

Frontend (Firebase Hosting):

```
firebase login              # once
npm run build
firebase deploy --only hosting
```

Backend (Google Apps Script): see [`apps-script/README.md`](apps-script/README.md).

## Docs

- [`CLAUDE.md`](CLAUDE.md) — project conventions, data shape, folder layout.
- [`apps-script/README.md`](apps-script/README.md) — Apps Script deploy and
  schema-change instructions.
