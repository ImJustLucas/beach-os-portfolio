# Plan 01 — Scaffold & thème

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Projet TanStack Start opérationnel avec les tokens de la DA Beach OS, les fonts, le store de préférences, le cœur i18n et l'outillage de test.

**Architecture:** Scaffold CLI TanStack + Tailwind v4 en config CSS-first (`@theme` dans `styles.css`). Préférences utilisateur (CRT/son/langue) dans un store zustand persisté. i18n = dictionnaire TS typé, sans lib.

**Tech Stack:** TanStack Start, Tailwind v4, shadcn/ui, zustand, Vitest, @fontsource.

**Référence spec :** `docs/superpowers/specs/2026-07-06-beach-os-portfolio-design.md` sections 2, 7, 8.

---

### Task 1: Scaffold du projet

**Files:**
- Create: tout le squelette TanStack Start à la racine du repo (le repo ne contient que `docs/` pour l'instant)

- [ ] **Step 1: Scaffolder dans un dossier temporaire puis rapatrier**

```bash
cd /tmp && npx @tanstack/cli@latest create beach-os-scaffold
```

Choix aux prompts : package manager **pnpm**, add-on **Tailwind CSS**, aucun exemple/démo, pas d'auth, TypeScript. (Si le CLI propose « Start » vs « Router », choisir **Start**.)

```bash
rsync -a --exclude=node_modules --exclude=.git /tmp/beach-os-scaffold/ <racine-du-repo>/
cd <racine-du-repo> && pnpm install
```

- [ ] **Step 2: Vérifier que le dev server démarre**

Run: `pnpm dev`
Expected: serveur Vite démarré sans erreur (page d'accueil par défaut sur http://localhost:3000). Arrêter avec Ctrl-C.

- [ ] **Step 3: Nettoyer les routes de démo**

Supprimer tout dossier `src/routes/demo*` et fichiers d'exemple non nécessaires. Garder `src/routes/__root.tsx` et `src/routes/index.tsx`. Si `index.tsx` référence du contenu démo, le réduire à :

```tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomeRoute,
});

function HomeRoute() {
  return null;
}
```

- [ ] **Step 4: Vérifier l'alias `@/`**

Dans `tsconfig.json`, s'assurer que `compilerOptions.paths` contient `"@/*": ["./src/*"]` (l'ajouter sinon, avec `"baseUrl": "."`). Si le scaffold utilise l'alias `~/`, remplacer par `@/` partout (tsconfig + occurrences dans `src/`). Vérifier que `vite.config.ts` résout les paths tsconfig (plugin `vite-tsconfig-paths` présent dans les scaffolds récents ; sinon `pnpm add -D vite-tsconfig-paths` et l'ajouter aux plugins Vite).

- [ ] **Step 5: Scripts package.json**

S'assurer que `package.json` contient (ajouter les manquants) :

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "start": "node .output/server/index.mjs",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

(Ne pas écraser les valeurs `dev`/`build`/`start` du scaffold si elles diffèrent — n'ajouter que `typecheck` et `test`.)

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: scaffold TanStack Start + Tailwind"
```

---

### Task 2: Outillage de test (Vitest + Testing Library)

**Files:**
- Create: `vitest.config.ts`, `src/test/setup.ts`, `src/test/smoke.test.ts`

- [ ] **Step 1: Installer les dépendances**

```bash
pnpm add -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Créer `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

- [ ] **Step 3: Créer `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Créer un smoke test `src/test/smoke.test.ts`**

```ts
import { describe, expect, it } from 'vitest';

describe('vitest setup', () => {
  it('runs with jsdom', () => {
    expect(typeof document).toBe('object');
  });
});
```

- [ ] **Step 5: Vérifier**

Run: `pnpm test`
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: configuration Vitest + Testing Library"
```

---

### Task 3: Tokens DA + fonts (le thème Beach OS)

**Files:**
- Modify: `src/styles.css` (le fichier CSS global importé par `__root.tsx` — nom exact selon scaffold, parfois `src/styles/app.css`)

- [ ] **Step 1: Installer les fonts**

```bash
pnpm add @fontsource/press-start-2p @fontsource/ibm-plex-mono
```

- [ ] **Step 2: Remplacer le contenu du CSS global**

```css
@import 'tailwindcss';
@import '@fontsource/press-start-2p';
@import '@fontsource/ibm-plex-mono/400.css';
@import '@fontsource/ibm-plex-mono/700.css';

@theme {
  --color-sun: #ffd34e;
  --color-sun-glow: #fff3c4;
  --color-tangerine: #ff9a3c;
  --color-coral: #ff5e62;
  --color-coral-soft: #ff6b6b;
  --color-lagoon: #3ec9b9;
  --color-ocean: #2bb3a3;
  --color-abyss: #1f8f84;
  --color-cream: #fff8e1;
  --color-ink: #7a2e0e;
  --font-pixel: 'Press Start 2P', monospace;
  --font-terminal: 'IBM Plex Mono', monospace;
}

@utility shadow-hard {
  box-shadow: 5px 5px 0 var(--color-ink);
}

@utility shadow-hard-sm {
  box-shadow: 3px 3px 0 var(--color-ink);
}

@utility bg-sunset {
  background: linear-gradient(
    180deg,
    var(--color-sun) 0%,
    var(--color-tangerine) 28%,
    var(--color-coral) 46%,
    var(--color-coral-soft) 53%,
    var(--color-lagoon) 54%,
    var(--color-ocean) 82%,
    var(--color-abyss) 100%
  );
}

body {
  font-family: var(--font-terminal);
  color: var(--color-ink);
}
```

- [ ] **Step 3: Vérifier**

Run: `pnpm build`
Expected: build sans erreur (les utilities inconnues feraient échouer Tailwind v4).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: tokens DA Beach OS (palette sunset, fonts pixel/terminal, ombres dures)"
```

---

### Task 4: Store de préférences (CRT / son / langue)

**Files:**
- Create: `src/stores/preferences-store.ts`
- Test: `src/stores/preferences-store.test.ts`

- [ ] **Step 1: Installer zustand**

```bash
pnpm add zustand
```

- [ ] **Step 2: Écrire le test qui échoue**

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { usePreferences } from './preferences-store';

describe('preferences store', () => {
  beforeEach(() => {
    localStorage.clear();
    usePreferences.setState({ crtEnabled: true, soundEnabled: false, locale: 'en' });
  });

  it('has retro-friendly defaults: CRT on, sound off, english', () => {
    const state = usePreferences.getState();
    expect(state.crtEnabled).toBe(true);
    expect(state.soundEnabled).toBe(false);
    expect(state.locale).toBe('en');
  });

  it('toggles CRT and persists to localStorage', () => {
    usePreferences.getState().toggleCrt();
    expect(usePreferences.getState().crtEnabled).toBe(false);
    const raw = localStorage.getItem('beach-os-prefs');
    expect(raw).toContain('"crtEnabled":false');
  });

  it('switches locale', () => {
    usePreferences.getState().setLocale('fr');
    expect(usePreferences.getState().locale).toBe('fr');
  });
});
```

- [ ] **Step 3: Vérifier que le test échoue**

Run: `pnpm test src/stores`
Expected: FAIL (module `./preferences-store` introuvable).

- [ ] **Step 4: Implémenter le store**

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'fr' | 'en';

interface PreferencesState {
  crtEnabled: boolean;
  soundEnabled: boolean;
  locale: Locale;
  toggleCrt: () => void;
  toggleSound: () => void;
  setLocale: (locale: Locale) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      crtEnabled: true,
      soundEnabled: false,
      locale: 'en',
      toggleCrt: () => set((state) => ({ crtEnabled: !state.crtEnabled })),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'beach-os-prefs' },
  ),
);
```

- [ ] **Step 5: Vérifier que les tests passent**

Run: `pnpm test src/stores`
Expected: 3 passed.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: store de préférences persisté (CRT, son, langue)"
```

---

### Task 5: Cœur i18n (dictionnaire typé + hook)

**Files:**
- Create: `src/i18n/translations.ts`, `src/i18n/use-translation.ts`
- Test: `src/i18n/use-translation.test.tsx`

- [ ] **Step 1: Écrire le test qui échoue**

```tsx
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { usePreferences } from '@/stores/preferences-store';
import { useTranslation } from './use-translation';

describe('useTranslation', () => {
  beforeEach(() => {
    usePreferences.setState({ locale: 'en' });
  });

  it('returns the english value by default', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('menu.system')).toBe('BEACH-OS');
  });

  it('returns the french value when locale is fr', () => {
    usePreferences.setState({ locale: 'fr' });
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('hero.tagline')).toBe('développeur logiciel — Paris');
  });
});
```

- [ ] **Step 2: Vérifier que le test échoue**

Run: `pnpm test src/i18n`
Expected: FAIL (modules introuvables).

- [ ] **Step 3: Créer `src/i18n/translations.ts`**

La structure : `en` est la source de vérité des clés ; `fr` est contraint par le type — oublier une clé française casse le typecheck. Les plans suivants ajoutent leurs clés dans CES DEUX objets.

```ts
export const en = {
  'menu.system': 'BEACH-OS',
  'menu.files': 'Files',
  'menu.sessions': 'Sessions',
  'menu.crt': 'CRT',
  'menu.sound': 'Sound',
  'hero.tagline': 'software developer — Paris',
  'app.projects': 'PROJECTS.SRF',
  'app.career': 'CAREER.LOG',
  'app.tv': 'BEACH-TV',
  'app.about': 'ABOUT-ME.TXT',
  'app.radio': 'RADIO-PLAGE.FM',
  'app.contact': 'POSTCARD.EXE',
  'window.close': 'Close',
  'window.minimize': 'Minimize',
} as const;

export type TranslationKey = keyof typeof en;

export const fr: Record<TranslationKey, string> = {
  'menu.system': 'BEACH-OS',
  'menu.files': 'Fichiers',
  'menu.sessions': 'Sessions',
  'menu.crt': 'CRT',
  'menu.sound': 'Son',
  'hero.tagline': 'développeur logiciel — Paris',
  'app.projects': 'PROJETS.SRF',
  'app.career': 'PARCOURS.LOG',
  'app.tv': 'PLAGE-TV',
  'app.about': 'A-PROPOS.TXT',
  'app.radio': 'RADIO-PLAGE.FM',
  'app.contact': 'CARTE-POSTALE.EXE',
  'window.close': 'Fermer',
  'window.minimize': 'Réduire',
};

export const translations = { en, fr };
```

- [ ] **Step 4: Créer `src/i18n/use-translation.ts`**

```ts
import { usePreferences } from '@/stores/preferences-store';
import { type TranslationKey, translations } from './translations';

export function useTranslation() {
  const locale = usePreferences((state) => state.locale);
  const t = (key: TranslationKey): string => translations[locale][key];
  return { t, locale };
}
```

- [ ] **Step 5: Vérifier**

Run: `pnpm test src/i18n && pnpm typecheck`
Expected: 2 passed, typecheck vert.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: i18n typé FR/EN (dictionnaire + useTranslation)"
```

---

### Task 6: shadcn/ui initialisé et thémé

**Files:**
- Create: `components.json`, `src/lib/utils.ts`, `src/components/ui/tooltip.tsx`, `src/components/ui/slider.tsx`, `src/components/ui/dropdown-menu.tsx`

- [ ] **Step 1: Initialiser shadcn**

```bash
npx shadcn@latest init
```

Aux prompts : style **default/base**, base color **neutral**, CSS variables **yes**. Le CLI détecte TanStack Start/Vite ; vérifier que `components.json` pointe `tailwind.css` vers le CSS global de la Task 3 et que les alias utilisent `@/`.

- [ ] **Step 2: Ajouter les composants nécessaires**

```bash
npx shadcn@latest add tooltip slider dropdown-menu
```

- [ ] **Step 3: Skin rétro des composants shadcn**

Dans le CSS global, après les `@utility`, ajouter la couche de surcharge (les composants shadcn utilisent des variables `--radius` etc.) :

```css
:root {
  --radius: 2px;
}

[data-slot='tooltip-content'],
[data-slot='dropdown-menu-content'] {
  border: 2px solid var(--color-ink);
  background: var(--color-cream);
  color: var(--color-ink);
  font-family: var(--font-terminal);
  border-radius: 2px;
  box-shadow: 3px 3px 0 var(--color-ink);
}
```

(Si la version de shadcn installée n'émet pas d'attributs `data-slot`, appliquer ces classes directement dans les fichiers `src/components/ui/*.tsx` générés : `border-2 border-ink bg-cream text-ink font-terminal rounded-[2px] shadow-hard-sm`.)

- [ ] **Step 4: Vérifier**

Run: `pnpm typecheck && pnpm build`
Expected: verts.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: shadcn/ui initialisé avec skin rétro Beach OS"
```

---

## Vérification finale du plan 01

- [ ] `pnpm typecheck` ✅ — `pnpm test` ✅ (6 tests) — `pnpm build` ✅
- [ ] `pnpm dev` démarre et sert une page vide sans erreur console.
