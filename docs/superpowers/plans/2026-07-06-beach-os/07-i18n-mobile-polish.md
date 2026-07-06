# Plan 07 — Sélecteur FR/EN, mobile « BEACH-OS GO » & finitions

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Boucler la v1 : sélecteur de langue avec détection navigateur, version mobile en console portable rétro, passe d'accessibilité et vérification finale complète.

**Architecture:** La détection de langue ne s'exécute qu'à la première visite (si rien n'est persisté). Le mobile ne réutilise pas le window manager : sous 768 px, un `HandheldShell` rend l'app de la route courante en plein écran dans un cadre de console, la navigation passe par des `Link` (dock bas). Le choix desktop/mobile se fait au montage (client) pour rester SSR-safe.

**Tech Stack:** React, matchMedia, TanStack Router.

**Prérequis :** plans 01–06. **Référence spec :** sections 6, 7, 9, 10.

---

### Task 1: Détection de la langue navigateur (TDD)

**Files:**
- Create: `src/i18n/detect-locale.ts`
- Test: `src/i18n/detect-locale.test.ts`

- [ ] **Step 1: Écrire le test qui échoue**

```ts
import { describe, expect, it } from 'vitest';
import { detectLocale } from './detect-locale';

describe('detectLocale', () => {
  it('returns fr for french browser languages', () => {
    expect(detectLocale('fr')).toBe('fr');
    expect(detectLocale('fr-FR')).toBe('fr');
  });

  it('falls back to en for anything else', () => {
    expect(detectLocale('en-US')).toBe('en');
    expect(detectLocale('de-DE')).toBe('en');
    expect(detectLocale(undefined)).toBe('en');
  });
});
```

- [ ] **Step 2: Vérifier l'échec** — Run: `pnpm test src/i18n/detect-locale` — Expected: FAIL.

- [ ] **Step 3: Implémenter `src/i18n/detect-locale.ts`**

```ts
import type { Locale } from '@/stores/preferences-store';

export function detectLocale(browserLanguage: string | undefined): Locale {
  return browserLanguage?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}
```

- [ ] **Step 4: Appliquer à la première visite** — dans `src/routes/__root.tsx`, ajouter dans `RootComponent` (avec les imports `detectLocale` et `usePreferences`) :

```tsx
  React.useEffect(() => {
    const hasStoredPrefs = localStorage.getItem('beach-os-prefs') !== null;
    if (!hasStoredPrefs) {
      usePreferences.getState().setLocale(detectLocale(navigator.language));
    }
  }, []);
```

Et faire suivre la langue au document : remplacer `<html lang="en">` par

```tsx
function RootComponent() {
  const locale = usePreferences((state) => state.locale);
  // …
  return (
    <html lang={locale} suppressHydrationWarning>
```

(`suppressHydrationWarning` : le serveur rend toujours `en`, le client peut hydrater en `fr` persisté.)

- [ ] **Step 5: Vérifier + commit** — Run: `pnpm test src/i18n && pnpm typecheck` — Expected: verts.

```bash
git add -A && git commit -m "feat: détection de langue à la première visite"
```

---

### Task 2: Sélecteur [FR|EN] dans la barre de menu

**Files:**
- Modify: `src/components/desktop/menu-bar.tsx`

- [ ] **Step 1: Ajouter le sélecteur**

Sélecteurs :

```tsx
  const locale = usePreferences((state) => state.locale);
  const setLocale = usePreferences((state) => state.setLocale);
```

Bouton à insérer après le toggle son :

```tsx
        <button
          type="button"
          aria-label="Language / Langue"
          onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
          className="border-2 border-ink px-1 hover:bg-sun-glow"
        >
          [{locale === 'fr' ? 'FR' : 'EN'}]
        </button>
```

- [ ] **Step 2: Vérification manuelle** — `pnpm dev` : cliquer `[EN]` → tous les libellés passent en français (icônes, fenêtres, dock), recharger → la langue persiste.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: sélecteur de langue FR/EN dans la barre de menu"
```

---

### Task 3: Hook useIsMobile (TDD)

**Files:**
- Create: `src/lib/use-is-mobile.ts`
- Test: `src/lib/use-is-mobile.test.ts`

- [ ] **Step 1: Écrire le test qui échoue**

```ts
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useIsMobile } from './use-is-mobile';

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe('useIsMobile', () => {
  it('returns true under the mobile breakpoint', () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('returns false on desktop', () => {
    stubMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
});
```

- [ ] **Step 2: Vérifier l'échec** — Run: `pnpm test src/lib/use-is-mobile` — Expected: FAIL.

- [ ] **Step 3: Implémenter `src/lib/use-is-mobile.ts`** (démarre à `false` — le serveur rend la version desktop — puis se corrige au montage)

```ts
import * as React from 'react';

const MOBILE_QUERY = '(max-width: 767px)';

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    setIsMobile(mediaQuery.matches);
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}
```

- [ ] **Step 4: Vérifier** — Run: `pnpm test src/lib/use-is-mobile` — Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: hook useIsMobile"
```

---

### Task 4: HandheldShell (BEACH-OS GO)

**Files:**
- Create: `src/components/handheld/handheld-shell.tsx`
- Modify: `src/routes/__root.tsx`, `src/i18n/translations.ts`

- [ ] **Step 1: Clés i18n** (dans `en` puis `fr`)

```ts
  // en :
  'handheld.title': 'BEACH-OS GO',
  'handheld.home': 'HOME',
  // fr :
  'handheld.title': 'BEACH-OS GO',
  'handheld.home': 'ACCUEIL',
```

- [ ] **Step 2: Implémenter `src/components/handheld/handheld-shell.tsx`**

Cadre console autour de l'écran ; route `/` = menu des apps ; route d'app = app plein écran. RADIO (sans route) est accessible depuis le menu via un état local.

```tsx
import { Link, useLocation } from '@tanstack/react-router';
import * as React from 'react';
import { listApps } from '@/components/apps/registry';
import { PixelSun } from '@/components/desktop/pixel-sun';
import type { TranslationKey } from '@/i18n/translations';
import { useTranslation } from '@/i18n/use-translation';
import { pathnameToWindowId } from '@/windows/route-window';

export function HandheldShell() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [localAppId, setLocalAppId] = React.useState<'radio' | null>(null);
  const routeAppId = pathnameToWindowId(pathname);
  const activeApp = listApps().find((app) => app.id === (routeAppId ?? localAppId)) ?? null;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink/90 p-3">
      <div className="shadow-hard w-full max-w-md rounded-2xl border-[3px] border-ink bg-sun-glow p-3 pb-5">
        <div className="bg-sunset relative overflow-hidden rounded-md border-[3px] border-ink">
          <header className="flex h-7 items-center border-b-2 border-ink bg-cream px-2 font-pixel text-[9px] text-ink">
            ▓ {t('handheld.title')}
          </header>
          <div className="relative min-h-[60dvh]">
            {activeApp ? (
              <div className="relative z-10 max-h-[60dvh] overflow-y-auto bg-cream">
                <activeApp.Component />
              </div>
            ) : (
              <>
                <PixelSun />
                <nav aria-label="Applications" className="relative z-10 space-y-2 p-4 pt-16">
                  {listApps().map((app) =>
                    app.route ? (
                      <Link
                        key={app.id}
                        to={app.route}
                        onClick={() => setLocalAppId(null)}
                        className="shadow-hard-sm block border-2 border-ink bg-cream px-3 py-2 font-terminal text-xs font-bold text-ink"
                      >
                        {app.icon} <AppTitle titleKey={app.titleKey} />
                      </Link>
                    ) : (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setLocalAppId('radio')}
                        className="shadow-hard-sm block w-full border-2 border-ink bg-cream px-3 py-2 text-left font-terminal text-xs font-bold text-ink"
                      >
                        {app.icon} <AppTitle titleKey={app.titleKey} />
                      </button>
                    ),
                  )}
                </nav>
              </>
            )}
          </div>
          <nav
            aria-label="Dock"
            className="flex h-9 items-center justify-around border-t-2 border-ink bg-cream text-lg"
          >
            <Link to="/" onClick={() => setLocalAppId(null)} aria-label={t('handheld.home')}>
              🏠
            </Link>
            {listApps()
              .filter((app) => app.route)
              .map((app) => (
                <Link key={app.id} to={app.route ?? '/'} onClick={() => setLocalAppId(null)}>
                  {app.icon}
                </Link>
              ))}
          </nav>
        </div>
        <div className="mt-3 flex items-center justify-between px-2" aria-hidden="true">
          <div className="relative size-9">
            <div className="absolute left-0 top-3 h-3 w-9 rounded-sm bg-ink" />
            <div className="absolute left-3 top-0 h-9 w-3 rounded-sm bg-ink" />
          </div>
          <div className="flex gap-2">
            <div className="size-4 rounded-full border-2 border-ink bg-coral-soft" />
            <div className="size-4 rounded-full border-2 border-ink bg-lagoon" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AppTitle({ titleKey }: { titleKey: TranslationKey }) {
  const { t } = useTranslation();
  return <>{t(titleKey)}</>;
}
```

- [ ] **Step 3: Basculer selon l'écran dans `src/routes/__root.tsx`**

Remplacer le bloc shell du `<body>` par :

```tsx
        <div className={isBooted ? 'animate-turn-on' : undefined}>
          {isMobile ? (
            <HandheldShell />
          ) : (
            <WindowManagerProvider>
              <MenuBar />
              <Desktop />
              <Dock />
              <Outlet />
            </WindowManagerProvider>
          )}
        </div>
```

avec les imports et le hook :

```tsx
import { HandheldShell } from '@/components/handheld/handheld-shell';
import { useIsMobile } from '@/lib/use-is-mobile';
// dans RootComponent :
  const isMobile = useIsMobile();
```

Sur mobile, `<Outlet />` n'est plus rendu : les routes ne rendent que `null` de toute façon, le HandheldShell lit le pathname directement.

- [ ] **Step 4: Vérification manuelle**

`pnpm dev`, DevTools en mode responsive (375 px) :
- cadre console visible, menu des apps sur `/` ;
- tap PROJECTS → app plein écran, URL `/projects` ;
- dock bas : 🏠 revient au menu ;
- RADIO s'ouvre depuis le menu sans changer l'URL ;
- repasser en large (>768 px) → le bureau fenêtré revient.

- [ ] **Step 5: Vérifier + commit** — Run: `pnpm typecheck && pnpm test && pnpm build` — Expected: verts.

```bash
git add -A && git commit -m "feat: version mobile BEACH-OS GO (console portable)"
```

---

### Task 5: Passe d'accessibilité et finitions

**Files:**
- Modify: CSS global, `README.md`

- [ ] **Step 1: Focus visible global + curseur pixel (desktop)** — ajouter au CSS global :

```css
:focus-visible {
  outline: 3px solid var(--color-ink);
  outline-offset: 2px;
}

@media (pointer: fine) {
  body {
    cursor: url('/images/cursor.png') 2 2, auto;
  }
}
```

Déposer un curseur pixel-art 24×24 dans `public/images/cursor.png` (flèche pixel brune `#7A2E0E` sur fond transparent — se dessine en 2 min dans n'importe quel éditeur pixel type piskelapp.com, ou asset CC0). Sans le fichier, le navigateur retombe sur `auto` — rien ne casse.

- [ ] **Step 2: Audit manuel a11y**

- Parcours complet au clavier (desktop et mobile) : icônes → fenêtres → boutons de fenêtre → dock → barre de menu, ordre logique, aucun piège de focus.
- Vérifier chaque `button`/`Link` a un nom accessible (inspecteur d'accessibilité des DevTools).
- Contraste : textes de lecture uniquement en `text-ink` sur fond `bg-cream` / `bg-sun-glow`.
- `prefers-reduced-motion` : re-vérifier boot + glitchs désactivés.

- [ ] **Step 3: Réécrire `README.md`**

```markdown
# 🌊 Beach OS — imjustlucas.dev

Mon portfolio en forme d'OS rétro de plage. Pixel-art, CRT désactivable, sons 8-bit, FR/EN.

## Stack
TanStack Start (React 19, Vite) · Tailwind CSS v4 · shadcn/ui thémé · zustand · Vitest

## Développement
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # tests unitaires
pnpm typecheck  # TypeScript
pnpm build      # build de production

## Ajouter du contenu
- Projet / expérience / bio : éditer `src/content/*.ts` (typé — le compilateur te guide), commit, push.
- Vidéos YouTube : automatique via le flux RSS de la chaîne (`src/content/site.ts` → `youtubeChannelId`),
  fallback committé dans `src/content/videos-snapshot.json`.
- CV : remplacer `public/cv.pdf`. Sons : voir `public/sounds/README.md`. Radio : `public/audio/README.md`.
```

- [ ] **Step 4: Vérification finale de la v1**

Run: `pnpm typecheck && pnpm test && pnpm build`
Expected: verts.

Checklist wow (desktop, onglet privé) :
- [ ] boot BIOS → flash → bureau sunset ;
- [ ] fenêtres draggables, dock, CRT ON/OFF, FR/EN, sons (si fichiers présents) ;
- [ ] deep-link `/projects/<slug>` fonctionne et a un `<title>` propre ;
- [ ] mobile 375 px = console portable complète.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: passe a11y, focus visible et README v1"
```

---

## Vérification finale du plan 07 (= fin de la v1)

- [ ] Tout `pnpm typecheck && pnpm test && pnpm build` ✅
- [ ] Checklist wow validée.
- [ ] Restent à fournir par Lucas (données, pas du code) : contenus `src/content/`, `youtubeChannelId`, `public/cv.pdf`, MP3 sons/radio.
