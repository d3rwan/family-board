# AGENTS.md — Family Board

> Instructions pour les agents IA qui ajoutent des features, surtout sur le **calendrier**.

## 1. Projet

Family Board : tableau familial qui affiche les événements Google Calendar par membre, avec navigation jour par jour. UI en **français**, dates via `date-fns` + locale `fr`.

Stack : React 19 + TypeScript strict + Vite 6 + `date-fns@4.1.0`.

## 2. Commandes

```bash
npm install
npm run dev      # dev local (http://localhost:5173)
npm run lint     # eslint, à faire passer avant tout commit
npm run build    # tsc -b && vite build (référence : doit passer)
npm run preview  # preview du build
npm run build:gh-pages  # build avec --base=/family-board (déploiement, cf .github/workflows/deploy.yml)
```

Pas de tests unitaires / e2e dans le repo. Vérification = `lint` + `build` + test manuel (auth Google + navigation jour).

## 3. Structure

```
src/
  App.tsx                  # auth OAuth2 Google, fetch events, navigation jour, layout
  components/Calendar.tsx  # affichage timeline 1 jour / N personnes (CIBLE principale des features calendrier)
  components/AppConfig.tsx # modale config (membres + credentials Google)
  components/Clock.tsx     # horloge (refresh 60s)
  components/Weather.tsx   # Open-Meteo + géolocalisation navigateur
  hooks/useAppConfig.ts    # config persistée en localStorage
  styles/global.css        # TOUT le CSS est ici (malgré README qui parle de CSS Modules)
public/avatars/            # dad.png, mom.png, son.png, daughter.png
public/google-logo.svg
```

## 4. Calendrier — où toucher

### 4.1 Récupération (`src/App.tsx`)

- `fetchEvents(accessToken, calendarId, person, color, date)` : un appel REST par membre et par jour :
  `GET https://www.googleapis.com/calendar/v3/calendars/{encodeURIComponent(calendarId)}/events?timeMin={startOfDay(date)}&timeMax={endOfDay(date)}&singleEvents=true&orderBy=startTime` avec `Authorization: Bearer`.
- `fetchAllEvents` : `Promise.all` sur `config.people` filtrés sur `calendarId` non vide, puis `flat()` + tri par `start`.
- État : `events: CalendarEvent[]`, `selectedDate: Date`, `loading`, `isAuthenticated`.
- Navigation : `handlePreviousDay / handleNextDay` avec `subDays / addDays`. Header formaté `format(selectedDate, "EEEE d MMMM", { locale: fr })`.

Types à réutiliser / étendre (définis dans `App.tsx`) :

```ts
interface CalendarEvent { id: string; title: string; start: Date; end: Date; person: string; color: string; }
```

Mapping Google → interne : `summary → title` (fallback `"Sans titre"`), `start.dateTime || start.date → start` (idem `end`). Attention : les événements **journée entière** n'ont que `date` (pas d'heure) — toute feature doit les gérer explicitement.

### 4.2 Affichage (`src/components/Calendar.tsx`)

Props : `{ events: Event[]; selectedDate: Date; people: Person[] }`.

- Filtrage jour : compare `startOfDay(event.start)` à `startOfDay(selectedDate)`.
- Rendu : 1 colonne par `person` (`people.map`), événements filtrés par `event.person === person.name`.
- Positionnement : `calculateEventPosition(start, end)` → `top = (startHour - 8) * 60 + startMinutes` en px, `height` = durée en minutes en px. Convention **1 px = 1 min**, origine **8h00**.
- Grille temps : `timeMarkers = 8..18`, `.events-list { min-height: 720px }`, `.time-marker { height: 60px }`.

### 4.3 Config (`src/hooks/useAppConfig.ts`)

```ts
interface Person { name: string; color: string; avatar?: string; calendarId?: string; }
```

- Clé localStorage réelle : `"appConfig"` (le README dit `family-board-config` — c'est **obsolète**, faire confiance au code).
- Tokens Google en localStorage : `googleCalendarToken`, `googleCalendarRefreshToken`, `tokenExpiry`.

## 5. Conventions à respecter

- TypeScript strict + `noUnusedLocals` + `noUnusedParameters` : pas d'import/variable morte (le build `tsc -b` échoue sinon).
- ESLint : `react-hooks` recommandé + `react-refresh/only-export-components`. Ne pas exporter autre chose qu'un composant depuis un fichier de composant.
- Dates : toujours `date-fns`, jamais de calcul manuel, toujours `{ locale: fr }` pour l'affichage FR.
- Styles : ajouter des classes dans `src/styles/global.css`, réutiliser le vocabulaire existant (`calendar-*`, `event-*`, `person-*`). Pas de nouvelle lib CSS sans demande explicite.
- Texte UI en français. Couleur d'un event = `person.color`. Avatar : `import.meta.env.BASE_URL + person.avatar` (chemin relatif au base Vite, important pour gh-pages).
- Auth : scope actuel `https://www.googleapis.com/auth/calendar.readonly`. Ne pas élargir (ex. écriture) sans demande explicite ; si lecture seule suffit, ne pas toucher à `initiateAuth` / refresh flow.
- Secrets : ne jamais hardcoder ni committer `client_id / client_secret`. Ils viennent de `config.env` (modale ⚙️).

## 6. Pièges connus (ne pas les aggraver)

1. `grid-template-columns: 100px repeat(4, 1fr)` dans `.calendar-content` est **hardcodé pour 4 personnes**. Si la feature touche au nombre de membres, le rendre dynamique (ex. `repeat(N, 1fr)` inline ou variable CSS).
2. Plage affichée **8h–18h** : les events hors plage donnent un `top` négatif ou > 660px. Gérer le clamp / l'extension de plage si la feature concerne soirées / nuits.
3. Chevauchements intra-colonne non gérés (`position: absolute; left:0; right:0`) : deux events à la même heure se superposent. Une feature d'empilement / colonnes latérales est bienvenue mais doit rester dans `Calendar.tsx`.
4. `Eve` a `color: "#"` invalide dans `defaultConfig` — ne pas copier ce pattern, utiliser un hex valide.
5. `App.tsx` utilise `src="family-board/google-logo.svg"` en dur : préférer `import.meta.env.BASE_URL` pour tout nouvel asset.
6. Effet auth dans `App.tsx` dépend de `[config, isAuthenticated, selectedDate, fetchAllEvents]` : éviter d'ajouter des dépendances qui relancent le flow OAuth en boucle.

## 7. Comment ajouter une feature calendrier (recette)

1. Lecture seule si possible : transformer `events` dans `Calendar.tsx` (filtre, regroupement, badge, vue semaine) plutôt que changer le fetch.
2. Si besoin de nouvelles données Google : étendre `fetchEvents` (ex. `timeMin/timeMax` multi-jours, `q`, `timeZone`) puis étendre `CalendarEvent` — mettre à jour **les deux** interfaces `App.tsx` et `Calendar.tsx` (elles sont dupliquées).
3. Garder le tri par `start` et le filtre jour existant sauf si la feature change explicitement la granularité (semaine/mois).
4. Ajouter le CSS dans `global.css`, responsive min. `min-width: 800px` + scroll horizontal existant à préserver.
5. Valider : `npm run lint && npm run build`, puis test manuel : connecter Google, naviguer J-1/J+1, vérifier event journée entière + event multi-personnes + cas sans `calendarId`.

## 8. Exemples de features bien cadrées

- Vue semaine : étendre `timeMin/timeMax` à la semaine, grouper par jour dans `Calendar.tsx`.
- Indicateur "maintenant" : ligne positionnée comme `calculateEventPosition(new Date(), ...)` + refresh minute (cf. `Clock.tsx`).
- Filtre par membre / masquage : état local `hiddenPersons: string[]`, ne pas toucher au fetch.
- Gestion chevauchements : détecter les intersections dans `filteredEvents` par personne et répartir en largeurs %.
