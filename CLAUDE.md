# Beach OS — imjustlucas.dev

Portfolio de Lucas sous forme d'OS rétro fictif (thème plage / surf / skate) : pixel-art, CRT discret désactivable, sons 8-bit, FR/EN, version mobile en console portable.

## Statut

Le code n'est pas encore scaffoldé — le repo ne contient pour l'instant que `docs/`. L'implémentation suit les plans de `docs/superpowers/plans/2026-07-06-beach-os/` (7 phases séquentielles) et la spec `docs/superpowers/specs/2026-07-06-beach-os-portfolio-design.md`.

## Stack

TanStack Start (React 19, Vite) · Tailwind CSS v4 (config CSS-first `@theme`) · shadcn/ui (thémé rétro) · zustand (préférences persistées) · Vitest + Testing Library · **pnpm**.

## Commandes

```bash
pnpm dev        # serveur Vite — http://localhost:3000
pnpm test       # Vitest (run unique)
pnpm typecheck  # tsc --noEmit
pnpm build      # build de production
```

`pnpm typecheck && pnpm test && pnpm build` doivent être **verts après chaque tâche**.

## Architecture

- SPA server-rendered. `__root.tsx` rend un **shell « bureau » permanent** (barre de menu, icônes, dock, wallpaper coucher de soleil, overlay CRT).
- Les apps s'ouvrent en **fenêtres draggables** gérées par un reducer pur (`src/windows/`) dans un contexte React — pas de singleton module (SSR-safe). L'état est synchronisé avec les routes pour le deep-linking.
- **Contenu typé** dans `src/content/*.ts` (« git est le back-office »), avec textes FR **et** EN par entrée.
- Vidéos YouTube récupérées par server function (RSS) au chargement de `/tv`, avec fallback snapshot committé.
- Mobile (<768 px) : `HandheldShell` plein écran, ne réutilise pas le window manager.

### Contrats partagés (source de vérité = `docs/.../00-overview.md`)

- `src/windows/window-types.ts` — `WINDOW_IDS`, `WindowId`, état initial.
- `src/stores/preferences-store.ts` — `usePreferences()` (zustand persisté, clé `beach-os-prefs`) : `crtEnabled`, `soundEnabled`, `locale`.
- `src/i18n/` — `useTranslation()`, dictionnaire unique typé (`en` = source des clés, `fr: Record<TranslationKey, string>`).
- `src/components/apps/registry.tsx` — `APP_REGISTRY` : id, icône, titre, route, composant.

## Code Conventions

### General (all apps)

- **Language:** TypeScript (strict mode)
- **Package manager:** pnpm (backend/frontend)
- **Formatting:** Prettier — 2 spaces, `printWidth: 80`, double quotes, `trailingComma: "all"`, `arrowParens: "always"`, semicolons, LF line endings (config partagée avec mes autres projets ; `prettier-plugin-tailwindcss` pour trier les classes Tailwind)
- **Linting:** ESLint flat config with `simple-import-sort` and `unused-imports` plugins
- **Validation:** Zod for runtime schema validation (shared version 4.3.6)
- **No `any` types** — ESLint enforces this as error
- **Strict equality** — always `===`
- **Function names must explicitly describe what they do** — prefer `findUserByEmail` over `getUser`, `validateSubscriptionStatus` over `check`
- **Single responsibility** — "Functions should do one thing. They should do it well. They should do it only." If a function does more than one thing, split it.
- **No comments** — code must be self-explanatory through naming. **Zero comments, including no `TODO` markers.** Example/placeholder data that Lucas must replace with real content is tracked exclusively in `src/content/PLACEHOLDERS.md`, never via in-code comments. (This overrides the `// TODO(lucas):` convention still shown in the plan files under `docs/`.)

### Naming

| Element            | Convention | Example                               |
| ------------------ | ---------- | ------------------------------------- |
| Files (TS)         | kebab-case | `user-service.ts`                     |
| Files (TSX)        | kebab-case | `login-form.tsx`                      |
| Components (usage) | PascalCase | `<LoginForm />`                       |
| Classes            | PascalCase | `UserService`, `UserRepository`       |
| Functions/vars     | camelCase  | `fetchUser`, `isAuthenticated`        |
| Enums/Types        | PascalCase | `SupportedCMS`, `CreateCompanyData`   |
| DB columns         | snake_case | `created_at`, `user_id`               |
| Directories        | kebab-case | `company-forms/`, `dashboard-charts/` |

## Commits

- Messages conventionnels **en anglais** (`feat: …`, `test: …`, `chore: …`), un commit par tâche.
- **Ne jamais mentionner Claude / IA / assistant** dans les messages de commit.
