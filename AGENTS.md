# AGENTS.md — Family Board

> Instructions pour agents automatisés et contributeurs. Vise le minimal qui garde `lint` + `build` verts et le déploiement Pages intact.

## Stack

- Vite 6 + React 19 + TypeScript 5.8 (`jsx: react-jsx`, cible ES2020, mode strict).
- Dépendances : `date-fns`, `googleapis`, `react`, `react-dom`.
- Styles : CSS Modules + `src/styles/global.css`.
- UI en français, dates via `date-fns` avec locale `fr`.
- Voir `README.md` pour le setup Google Cloud (Calendar API + OAuth2).

## Commandes

```bash
npm install
npm run dev        # dev local (http://localhost:5173)
npm run lint       # eslint .
npm run build      # tsc -b && vite build
npm run build:gh-pages  # build Pages avec --base=/family-board
npm run preview    # prévisualiser dist/
```

- Toujours lancer `npm run lint` et `npm run build` avant de proposer un changement.
- Ne pas changer les scripts npm sans justification explicite dans la PR.

## Arborescence

- `src/App.tsx` : point d'entrée logique (auth OAuth2, fetch événements, navigation jour).
- `src/components/` : `AppConfig.tsx`, `Calendar.tsx`, `Clock.tsx`, `Weather.tsx`.
- `src/hooks/useAppConfig.ts` : lecture/écriture de la config.
- `src/styles/` : styles globaux + modules.
- `index.html`, `public/`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`.
- Déploiement : `.github/workflows/deploy.yml` (push `main` → `build:gh-pages` → GitHub Pages).

## Conventions obligatoires

- TypeScript strict : pas de variables/paramètres inutilisés (`noUnusedLocals`, `noUnusedParameters`), pas de `any` implicite.
- ESLint : respecter `typescript-eslint` recommended + `react-hooks` + `react-refresh`. Zéro erreur, zéro warning ajouté.
- Composants fonctionnels + hooks uniquement. CSS Modules pour les styles locaux.
- Dates : utiliser `date-fns`, jamais de parsing manuel. Affichage en français.
- Auth Google : scope `calendar.readonly` uniquement. Fetch Calendar v3 avec `singleEvents=true`, `orderBy=startTime`, bornes `startOfDay`/`endOfDay`.
- Ne pas ajouter de dépendance sans nécessité démontrée.

## Config et secrets — ne jamais committer

- Config runtime en `localStorage` :
  - `family-board-config` (personnes : nom, couleur, avatar URL, calendarId ; env : `googleClientId`, `googleClientSecret`, `googleRedirectUri`).
  - Tokens : `googleCalendarToken`, `googleCalendarRefreshToken`, `tokenExpiry`.
- Réglages via bouton ⚙️ dans l'UI. En dev, redirect URI = `http://localhost:5173`.
- Ne jamais committer de Client ID/Secret, tokens, ou calendar IDs personnels. Pas de `.env` avec secrets, pas de log de tokens.

## Déploiement

- Push sur `main` déclenche le workflow Pages. Ne pas modifier le workflow ni le `base=/family-board` sans valider l'URL publiée.
- Attention au chemin statique `family-board/google-logo.svg` utilisé dans `App.tsx`.

## Ne pas faire

- Pas de refactor large, reformatage, renommage, ni changement de workflow dans le même changement.
- Pas de nouveau fichier de doc (`CONTRIBUTING.md`, etc.) sans demande explicite.
- Pas de modification du comportement auth/fetch sans test manuel décrit dans la PR.
