# Beach OS — Plan d'implémentation (vue d'ensemble)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire le portfolio « Beach OS » : un OS rétro fictif thème plage/surf/skate (pixel-art, CRT discret désactivable, sons, FR/EN, mobile en console portable), défini dans la spec `docs/superpowers/specs/2026-07-06-beach-os-portfolio-design.md`.

**Architecture:** SPA server-rendered TanStack Start (Vite). Un shell « bureau » permanent dans la route racine (barre de menu, icônes, dock, fond coucher de soleil) ; les apps s'ouvrent en fenêtres draggables gérées par un reducer React (contexte), synchronisées avec les routes pour le deep-linking. Contenu typé dans `src/content/`, vidéos YouTube récupérées par server function au chargement de `/tv` avec fallback snapshot committé.

**Tech Stack:** TanStack Start (React 19, Vite), Tailwind CSS v4 (config CSS-first `@theme`), shadcn/ui (thémé), zustand (préférences persistées), Vitest + Testing Library, pnpm.

---

## Ordre d'exécution des plans

Chaque fichier de plan est autoportant et laisse le projet dans un état qui compile, teste et build. **Exécuter dans l'ordre** :

| # | Fichier | Livre |
|---|---|---|
| 1 | `01-scaffold-and-theme.md` | Projet scaffoldé, tokens DA, fonts, stores préférences, cœur i18n, Vitest |
| 2 | `02-window-manager.md` | Reducer de fenêtres testé, mapping routes↔fenêtres, provider |
| 3 | `03-content-apps.md` | Contenu typé + apps PROJECTS.SRF, CAREER.LOG, ABOUT-ME.TXT, POSTCARD.EXE |
| 4 | `04-desktop-shell.md` | Bureau visible : wallpaper, icônes, fenêtres, dock, barre de menu, CRT, routes |
| 5 | `05-media-apps.md` | BEACH-TV (RSS YouTube + fallback) et RADIO-PLAGE.FM |
| 6 | `06-boot-and-sound.md` | Séquence de boot, sound design, glitchs |
| 7 | `07-i18n-mobile-polish.md` | Sélecteur FR/EN, mobile « BEACH-OS GO », a11y, build final |

## Conventions (valables pour tous les plans)

- **Package manager** : pnpm. **Répertoire projet** : la racine de ce repo.
- **Commits** : après chaque tâche, message conventionnel en français (`feat: …`, `test: …`, `chore: …`). **Ne jamais mentionner Claude/IA dans les commits.**
- **Alias d'import** : `@/` → `src/` (configuré au plan 01).
- **Aucun `any`**, pas de suppression d'erreurs TS.
- **Vérification par tâche** : la commande et le résultat attendu sont donnés à chaque étape. `pnpm typecheck`, `pnpm test`, `pnpm build` doivent passer à la fin de chaque plan.
- Les textes UI passent **toujours** par `useTranslation()` (défini au plan 01) — jamais de chaîne en dur dans les composants, les clés sont ajoutées au fil des plans.

## Contrats partagés (définis une fois, utilisés partout)

### Identifiants de fenêtres — `src/windows/window-types.ts` (plan 02)

```ts
export const WINDOW_IDS = ['projects', 'career', 'tv', 'about', 'radio', 'contact'] as const;
export type WindowId = (typeof WINDOW_IDS)[number];
```

### Window manager — `src/windows/` (plan 02)

- `windowReducer(state, action)` — actions `OPEN | CLOSE | MINIMIZE | RESTORE | FOCUS | MOVE`.
- `pathnameToWindowId(pathname): WindowId | null` — `/projects/x` → `'projects'`, `/` → `null`.
- `useWindowManager()` (via `WindowManagerProvider`) expose :
  `{ windows, openWindow(id), closeWindow(id), minimizeWindow(id), restoreWindow(id), focusWindow(id), moveWindow(id, x, y) }`.
  `closeWindow` navigue vers `/` si la fenêtre fermée correspond à la route courante ; `openWindow` navigue vers la route de l'app si elle en a une (RADIO n'a pas de route).

### Préférences — `src/stores/preferences-store.ts` (plan 01)

```ts
usePreferences() // zustand, persisté en localStorage sous la clé 'beach-os-prefs'
// { crtEnabled: boolean, soundEnabled: boolean, locale: 'fr' | 'en',
//   toggleCrt(), toggleSound(), setLocale(locale) }
```

### i18n — `src/i18n/` (plan 01)

```ts
useTranslation() // => { t: (key: TranslationKey) => string, locale: Locale }
```

Dictionnaire unique `src/i18n/translations.ts` : objet `en` (source des clés) + objet `fr` typé `Record<TranslationKey, string>` — TS casse si une clé manque.

### Registre des apps — `src/components/apps/registry.tsx` (plan 04, étendu au 05)

```ts
export interface AppDefinition {
  id: WindowId;
  icon: string;               // emoji sprite v1
  titleKey: TranslationKey;   // libellé système, ex. 'app.projects' => 'PROJECTS.SRF'
  route: string | null;       // '/projects'… ; null pour 'radio'
  Component: React.ComponentType;
  defaultSize: { width: number };
}
export const APP_REGISTRY: Record<WindowId, AppDefinition>;
```

### Palette (tokens Tailwind v4, plan 01)

`--color-sun #FFD34E · --color-sun-glow #FFF3C4 · --color-tangerine #FF9A3C · --color-coral #FF5E62 · --color-coral-soft #FF6B6B · --color-lagoon #3EC9B9 · --color-ocean #2BB3A3 · --color-abyss #1F8F84 · --color-cream #FFF8E1 · --color-ink #7A2E0E` + fonts `--font-pixel` (Press Start 2P) / `--font-terminal` (IBM Plex Mono) + utilities `shadow-hard`, `shadow-hard-sm`, `bg-sunset`.

## Carte des fichiers cible (état final)

```
src/
├── routes/
│   ├── __root.tsx            # shell Beach OS (Desktop + providers + CRT + boot)
│   ├── index.tsx             # bureau nu
│   ├── projects.tsx  projects.$slug.tsx  career.tsx  tv.tsx  about.tsx  contact.tsx
├── components/
│   ├── desktop/              # Desktop, Wallpaper, PixelSun, DesktopIcon, Dock, MenuBar, CrtOverlay, BootScreen
│   ├── windows/              # Window.tsx (chrome + drag)
│   ├── apps/                 # registry.tsx + un dossier par app
│   └── ui/                   # shadcn (tooltip, slider, dropdown-menu)
├── windows/                  # window-types, window-reducer, route-window, WindowManagerProvider
├── stores/preferences-store.ts
├── i18n/translations.ts + use-translation.ts
├── content/                  # site.ts, projects.ts, experiences.ts, about.ts, videos-snapshot.json
├── lib/                      # sound.ts, youtube-rss.ts, mailto.ts, utils.ts (shadcn)
└── styles.css                # @theme tokens + utilities + CRT css
public/ sounds/ audio/ images/ cv.pdf
```

## Données à fournir par Lucas (pas du code — à demander si absentes)

- Contenu réel de `src/content/*.ts` (les plans posent des données d'exemple typées, clairement marquées `// TODO(lucas): remplacer par tes vraies données` — c'est le SEUL TODO autorisé, c'est de la saisie de données, pas du code).
- `YOUTUBE_CHANNEL_ID` dans `src/content/site.ts` (le code gère le cas vide → snapshot).
- `public/cv.pdf`, sons CC0 dans `public/sounds/`, pistes audio dans `public/audio/`.

## Definition of Done globale

- `pnpm typecheck` + `pnpm test` + `pnpm build` verts après chaque plan.
- Checklist manuelle du plan 07 validée (boot, fenêtres, mobile, FR/EN, CRT toggle, sons).
- Le site est déployable tel quel (SSR Vercel/Netlify) — le déploiement effectif et la bascule DNS de imjustlucas.dev sont **hors périmètre** de ces plans.
