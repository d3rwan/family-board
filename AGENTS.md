# AGENTS.md — family-board

Family calendar dashboard: React 19 + TypeScript 5.8 + Vite 6, Google Calendar API. Deployed to GitHub Pages.

## Structure

- `src/main.tsx`, `src/App.tsx` — entry
- `src/components/` — `Calendar.tsx`, `Clock.tsx`, `Weather.tsx`, `AppConfig.tsx` (settings ⚙️ UI)
- `src/hooks/useAppConfig.ts` — config state
- `src/styles/global.css` — global styles (components use CSS Modules)
- `index.html`, `public/`, `vite.config.ts` (plain react plugin, no base — base is CLI-passed for gh-pages)

Runtime config lives in browser `localStorage` under `family-board-config`: people list (name, color, avatar URL, Google Calendar ID) + Google OAuth (client ID, client secret, redirect URI). No backend, no `.env`.

Key deps: `react`/`react-dom@19`, `date-fns@4.1.0`, `googleapis@146`, `@vitejs/plugin-react@4.3.4`.

## Commands

```bash
npm install
npm run dev        # vite dev server (default http://localhost:5173 — must match Google OAuth redirect URI)
npm run build      # tsc -b && vite build
npm run build:gh-pages  # same with --base=/family-board — use for Pages deploys
npm run lint       # eslint .
npm run preview    # serve dist locally
```

CI (`.github/`): check workflows before adding new checks; Pages deploy relies on `build:gh-pages`.

## Conventions for agents

- Strict TS (`tsconfig.app.json`): `noUnusedLocals`, `noUnusedParameters`, `noUncheckedSideEffectImports` — `npm run build` fails on unused vars/imports; fix, don't loosen flags.
- ESLint 9 flat config (`eslint.config.js`): `typescript-eslint` recommended + `react-hooks` + `react-refresh/only-export-components`. Keep `dist/` ignored.
- Functional components + hooks only; styling via CSS Modules + `global.css`, responsive layout expected (board display).
- Google Calendar setup (OAuth Web app, Calendar API enabled) is manual per README — do not commit client secrets; config stays in localStorage via settings UI.
- Test page navigation (day switching), settings persistence, and `build:gh-pages` base path when touching routing or assets.
