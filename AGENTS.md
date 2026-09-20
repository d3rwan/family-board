# AGENTS.md

Guidance for coding agents working in this repository.

## Project

Family Board — a React + TypeScript + Vite single-page app that displays
Google Calendar events per family member, with day navigation and per-member
colors/avatars. No backend; config and OAuth tokens live in `localStorage`.

## Commands

Package manager: `npm` (there is a `package-lock.json`; do not introduce pnpm/yarn).

- `npm install` — install dependencies
- `npm run dev` — local dev server (Vite, defaults to http://localhost:5173)
- `npm run build` — typecheck (`tsc -b`) + production build
- `npm run build:gh-pages` — production build with `/family-board` base for GitHub Pages
- `npm run lint` — ESLint over the repo
- `npm run preview` — serve the production build locally

There are no unit/e2e test suites in this repo. CI (`.github/workflows/deploy.yml`)
runs on push to `main`: `npm install` then `npm run build:gh-pages`, deployed to
GitHub Pages.

## Layout

- `src/main.tsx` — React entry point
- `src/App.tsx` — main state, Google OAuth flow, event fetching, day navigation
- `src/components/` — `Calendar.tsx`, `Clock.tsx`, `Weather.tsx`, `AppConfig.tsx`
- `src/hooks/useAppConfig.ts` — family members + env config, persisted to `localStorage`
- `src/styles/global.css` — global styles
- `index.html`, `vite.config.ts`, `tsconfig.*.json`, `eslint.config.js`
- `public/` — static assets

## Conventions

- TypeScript is strict: `noUnusedLocals` and `noUnusedParameters` are on — do not
  leave unused imports/vars.
- Functional components + hooks only; UI strings are in French, code/comments in English.
- Styling via `src/styles/global.css`.
- Dates via `date-fns` (locale `fr`); Google Calendar calls use `fetch` against
  `www.googleapis.com/calendar/v3` and `oauth2.googleapis.com/token` directly.
- `localStorage` keys in use: `appConfig` (via `useAppConfig`), plus
  `googleCalendarToken`, `googleCalendarRefreshToken`, `tokenExpiry`.
- Google OAuth needs a Web Application client with redirect URI
  `http://localhost:5173` for local dev; credentials are entered through the
  in-app settings panel, never committed.
- Never commit secrets, tokens, `.env`, or local config; `.gitignore` already
  covers `node_modules/`, `dist/`, and `.env`.
