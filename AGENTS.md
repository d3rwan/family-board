# AGENTS.md — Family Board

## Project overview
Family Board is a React + TypeScript + Vite web app that displays Google Calendar events per family member on a shared board. Config lives in browser `localStorage` under `family-board-config` (people list, colors, avatars, calendar IDs + Google OAuth client settings).

## Tech stack
- React 19, TypeScript (strict), Vite 6
- `date-fns` for date handling, `googleapis` for Calendar API
- CSS Modules / plain CSS in `src/styles/`
- ESLint (flat config) + `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`

## Commands
```bash
npm install        # install dependencies
npm run dev        # dev server (http://localhost:5173)
npm run build      # typecheck (tsc -b) + production build
npm run build:gh-pages  # build with /family-board base for GitHub Pages
npm run lint       # eslint .
npm run preview    # preview production build
```

No test framework is configured. If you add tests, prefer Vitest + Testing Library and document the command here.

## Repository structure
- `src/main.tsx` — entry point
- `src/App.tsx` — root component
- `src/components/` — `Calendar.tsx`, `Clock.tsx`, `Weather.tsx`, `AppConfig.tsx` (settings UI)
- `src/hooks/useAppConfig.ts` — loads/saves `family-board-config` from localStorage
- `src/styles/global.css` — global styles
- `vite.config.ts`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js`
- `.github/` — CI / Pages deploy workflow

## Conventions for agents
- Keep changes minimal and scoped; follow existing component/hook patterns.
- TypeScript is strict with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`. Run `npm run build` to verify typecheck before committing.
- Run `npm run lint` and fix warnings related to your changes.
- Functional components + hooks only; CSS Modules / existing global CSS for styling.
- Do not introduce new state libraries, routers, or UI frameworks without justification.
- Do not commit secrets: Google Client ID / Secret belong in the in-app settings (localStorage), never in code or `.env` files committed to the repo.
- Redirect URI for local dev is `http://localhost:5173`; keep docs in sync if this changes.
- Update `README.md` when adding user-facing config, scripts, or setup steps.

## Pull requests
- One focused change per PR, with a clear description and test steps (`npm run build`, `npm run lint`).
- Base branch is `main` unless instructed otherwise.
