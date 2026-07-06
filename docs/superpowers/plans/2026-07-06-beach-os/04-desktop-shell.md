# Plan 04 — Le bureau (shell visible)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Le Beach OS devient visible et navigable au clavier comme à la souris : wallpaper coucher de soleil, icônes, fenêtres draggables avec chrome rétro, dock, barre de menu avec toggle CRT, overlay CRT, et toutes les routes des apps de contenu.

**Architecture:** `__root.tsx` rend le shell permanent (`WindowManagerProvider` > `Desktop` + `MenuBar` + `Dock` + `CrtOverlay`) ; les composants de route retournent `null` (la fenêtre est rendue par le Desktop d'après l'état du window manager, initialisé depuis l'URL — le contenu est donc bien server-rendered). Le registre des apps est `Partial` à ce stade : TV et RADIO arrivent au plan 05.

**Tech Stack:** React 19, TanStack Router, Tailwind v4.

**Prérequis :** plans 01–03. **Référence spec :** sections 2, 3, 5, 9.

---

### Task 1: Registre des apps

**Files:**
- Create: `src/components/apps/registry.tsx`

- [ ] **Step 1: Implémenter**

```tsx
import type * as React from 'react';
import type { TranslationKey } from '@/i18n/translations';
import type { WindowId } from '@/windows/window-types';
import { AboutApp } from './about/about-app';
import { CareerApp } from './career/career-app';
import { ContactApp } from './contact/contact-app';
import { ProjectsApp } from './projects/projects-app';

export interface AppDefinition {
  id: WindowId;
  icon: string;
  titleKey: TranslationKey;
  route: string | null;
  Component: React.ComponentType;
  defaultSize: { width: number };
}

export const APP_REGISTRY: Partial<Record<WindowId, AppDefinition>> = {
  projects: {
    id: 'projects',
    icon: '🏄',
    titleKey: 'app.projects',
    route: '/projects',
    Component: ProjectsApp,
    defaultSize: { width: 460 },
  },
  career: {
    id: 'career',
    icon: '🗺️',
    titleKey: 'app.career',
    route: '/career',
    Component: CareerApp,
    defaultSize: { width: 420 },
  },
  about: {
    id: 'about',
    icon: '📝',
    titleKey: 'app.about',
    route: '/about',
    Component: AboutApp,
    defaultSize: { width: 380 },
  },
  contact: {
    id: 'contact',
    icon: '✉️',
    titleKey: 'app.contact',
    route: '/contact',
    Component: ContactApp,
    defaultSize: { width: 440 },
  },
};

export function listApps(): AppDefinition[] {
  return Object.values(APP_REGISTRY).filter(
    (app): app is AppDefinition => app !== undefined,
  );
}
```

- [ ] **Step 2: Vérifier + commit** — Run: `pnpm typecheck` — Expected: vert.

```bash
git add -A && git commit -m "feat: registre des apps du bureau"
```

---

### Task 2: Wallpaper + soleil pixel

**Files:**
- Create: `src/components/desktop/pixel-sun.tsx`, `src/components/desktop/wallpaper.tsx`

- [ ] **Step 1: Créer `src/components/desktop/pixel-sun.tsx`** (soleil « carré à redans » comme sur les maquettes)

```tsx
export function PixelSun() {
  return (
    <div
      aria-hidden="true"
      className="absolute left-[62%] top-[8%] size-14 bg-sun-glow"
      style={{
        boxShadow: [
          '0 -10px 0 -4px var(--color-sun-glow)',
          '0 10px 0 -4px var(--color-sun-glow)',
          '-10px 0 0 -4px var(--color-sun-glow)',
          '10px 0 0 -4px var(--color-sun-glow)',
          '0 0 48px 18px rgb(255 243 196 / 0.55)',
        ].join(', '),
      }}
    />
  );
}
```

- [ ] **Step 2: Créer `src/components/desktop/wallpaper.tsx`**

```tsx
import { PixelSun } from './pixel-sun';

export function Wallpaper() {
  return (
    <div aria-hidden="true" className="bg-sunset absolute inset-0 overflow-hidden">
      <PixelSun />
      <div className="absolute left-0 right-0 top-[53%] h-2 rounded-[50%] bg-white/40" />
      <span className="absolute bottom-[18%] left-[6%] text-4xl">🌴</span>
      <span className="absolute bottom-[14%] right-[10%] text-3xl">🛹</span>
    </div>
  );
}
```

- [ ] **Step 3: Vérifier + commit** — Run: `pnpm typecheck` — Expected: vert.

```bash
git add -A && git commit -m "feat: wallpaper sunset + soleil pixel"
```

---

### Task 3: Composant Window (chrome rétro + drag)

**Files:**
- Create: `src/components/windows/window.tsx`

- [ ] **Step 1: Implémenter**

```tsx
import * as React from 'react';
import { useTranslation } from '@/i18n/use-translation';
import { useWindowManager } from '@/windows/window-manager-provider';
import type { AppDefinition } from '@/components/apps/registry';

export function Window({ app }: { app: AppDefinition }) {
  const { t } = useTranslation();
  const { windows, closeWindow, minimizeWindow, focusWindow, moveWindow } = useWindowManager();
  const windowState = windows[app.id];
  const dragOrigin = React.useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null);

  if (!windowState.open) {
    return null;
  }

  const handleTitlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOrigin.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: windowState.x,
      y: windowState.y,
    };
  };

  const handleTitlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragOrigin.current) {
      return;
    }
    const deltaX = event.clientX - dragOrigin.current.pointerX;
    const deltaY = event.clientY - dragOrigin.current.pointerY;
    moveWindow(
      app.id,
      Math.max(0, dragOrigin.current.x + deltaX),
      Math.max(0, dragOrigin.current.y + deltaY),
    );
  };

  const handleTitlePointerUp = () => {
    dragOrigin.current = null;
  };

  return (
    <section
      role="dialog"
      aria-label={t(app.titleKey)}
      hidden={windowState.minimized}
      onPointerDown={() => focusWindow(app.id)}
      className="shadow-hard absolute border-[3px] border-ink bg-cream"
      style={{
        left: windowState.x,
        top: windowState.y,
        width: app.defaultSize.width,
        zIndex: windowState.z,
      }}
    >
      <div
        onPointerDown={handleTitlePointerDown}
        onPointerMove={handleTitlePointerMove}
        onPointerUp={handleTitlePointerUp}
        className="flex cursor-grab touch-none select-none items-center gap-2 bg-ink px-2 py-1 font-terminal text-xs font-bold text-cream active:cursor-grabbing"
      >
        <span aria-hidden="true" className="text-coral-soft">■</span>
        <span aria-hidden="true" className="text-sun">■</span>
        <span aria-hidden="true" className="text-lagoon">■</span>
        <span className="ml-1">{app.icon} {t(app.titleKey)}</span>
        <span className="ml-auto flex gap-1">
          <button
            type="button"
            aria-label={t('window.minimize')}
            onClick={() => minimizeWindow(app.id)}
            className="border border-cream px-1 leading-none hover:bg-cream hover:text-ink"
          >
            _
          </button>
          <button
            type="button"
            aria-label={t('window.close')}
            onClick={() => closeWindow(app.id)}
            className="border border-cream px-1 leading-none hover:bg-coral hover:text-cream"
          >
            ×
          </button>
        </span>
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        <app.Component />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Vérifier + commit** — Run: `pnpm typecheck` — Expected: vert.

```bash
git add -A && git commit -m "feat: composant Window (chrome rétro, drag, minimize, close)"
```

---

### Task 4: Icônes de bureau + Desktop

**Files:**
- Create: `src/components/desktop/desktop-icon.tsx`, `src/components/desktop/desktop.tsx`

- [ ] **Step 1: Créer `src/components/desktop/desktop-icon.tsx`**

```tsx
import { useTranslation } from '@/i18n/use-translation';
import { useWindowManager } from '@/windows/window-manager-provider';
import type { AppDefinition } from '@/components/apps/registry';

export function DesktopIcon({ app }: { app: AppDefinition }) {
  const { t } = useTranslation();
  const { openWindow } = useWindowManager();
  return (
    <button
      type="button"
      onDoubleClick={() => openWindow(app.id)}
      onClick={() => openWindow(app.id)}
      className="shadow-hard-sm flex w-24 flex-col items-center gap-1 border-2 border-ink bg-cream/80 px-2 py-2 font-terminal text-[10px] font-bold text-ink hover:bg-sun-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
    >
      <span aria-hidden="true" className="text-2xl">{app.icon}</span>
      {t(app.titleKey)}
    </button>
  );
}
```

- [ ] **Step 2: Créer `src/components/desktop/desktop.tsx`**

```tsx
import { listApps } from '@/components/apps/registry';
import { Window } from '@/components/windows/window';
import { DesktopIcon } from './desktop-icon';
import { Wallpaper } from './wallpaper';

export function Desktop() {
  const apps = listApps();
  return (
    <main className="relative min-h-[calc(100dvh-2rem)] overflow-hidden">
      <Wallpaper />
      <nav aria-label="Applications" className="absolute right-4 top-4 flex flex-col gap-3">
        {apps.map((app) => (
          <DesktopIcon key={app.id} app={app} />
        ))}
      </nav>
      {apps.map((app) => (
        <Window key={app.id} app={app} />
      ))}
    </main>
  );
}
```

- [ ] **Step 3: Vérifier + commit** — Run: `pnpm typecheck` — Expected: vert.

```bash
git add -A && git commit -m "feat: bureau avec icônes et fenêtres"
```

---

### Task 5: Dock

**Files:**
- Create: `src/components/desktop/dock.tsx`

- [ ] **Step 1: Implémenter** (clic : ouvre, ou restaure si minimisée ; point sous l'icône si ouverte)

```tsx
import { listApps } from '@/components/apps/registry';
import { useTranslation } from '@/i18n/use-translation';
import { useWindowManager } from '@/windows/window-manager-provider';

export function Dock() {
  const { t } = useTranslation();
  const { windows, openWindow, restoreWindow } = useWindowManager();
  return (
    <nav
      aria-label="Dock"
      className="shadow-hard-sm absolute bottom-3 left-1/2 z-50 flex -translate-x-1/2 gap-3 rounded border-2 border-ink bg-cream/90 px-4 py-2"
    >
      {listApps().map((app) => {
        const state = windows[app.id];
        const handleClick = () => {
          if (state.open && state.minimized) {
            restoreWindow(app.id);
            return;
          }
          openWindow(app.id);
        };
        return (
          <button
            key={app.id}
            type="button"
            aria-label={t(app.titleKey)}
            onClick={handleClick}
            className="relative text-2xl transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
          >
            {app.icon}
            {state.open && (
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-ink"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Vérifier + commit** — Run: `pnpm typecheck` — Expected: vert.

```bash
git add -A && git commit -m "feat: dock avec indicateur de fenêtres ouvertes"
```

---

### Task 6: Barre de menu avec toggle CRT + horloge

**Files:**
- Create: `src/components/desktop/menu-bar.tsx`

- [ ] **Step 1: Implémenter** (l'horloge ne s'affiche qu'après montage pour éviter un mismatch SSR ; le bouton son et le sélecteur de langue seront ajoutés aux plans 06/07)

```tsx
import * as React from 'react';
import { usePreferences } from '@/stores/preferences-store';
import { useTranslation } from '@/i18n/use-translation';

function useClock(): string | null {
  const [time, setTime] = React.useState<string | null>(null);
  React.useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, []);
  return time;
}

export function MenuBar() {
  const { t } = useTranslation();
  const crtEnabled = usePreferences((state) => state.crtEnabled);
  const toggleCrt = usePreferences((state) => state.toggleCrt);
  const time = useClock();

  return (
    <header className="relative z-50 flex h-8 items-center gap-4 border-b-2 border-ink bg-cream px-3 font-terminal text-xs font-bold text-ink">
      <span className="font-pixel text-[10px]">🌊 {t('menu.system')}</span>
      <span className="hidden sm:inline">{t('menu.files')}</span>
      <span className="hidden sm:inline">{t('menu.sessions')}</span>
      <span className="ml-auto flex items-center gap-3">
        <button
          type="button"
          aria-pressed={crtEnabled}
          onClick={toggleCrt}
          className="border-2 border-ink px-1 hover:bg-sun-glow"
        >
          [{t('menu.crt')}:{crtEnabled ? 'ON' : 'OFF'}]
        </button>
        <span aria-hidden="true">☀ 28°C{time ? ` — ${time}` : ''}</span>
      </span>
    </header>
  );
}
```

- [ ] **Step 2: Vérifier + commit** — Run: `pnpm typecheck` — Expected: vert.

```bash
git add -A && git commit -m "feat: barre de menu (toggle CRT, horloge)"
```

---

### Task 7: Overlay CRT

**Files:**
- Create: `src/components/desktop/crt-overlay.tsx`
- Modify: CSS global (Task 3 du plan 01)

- [ ] **Step 1: Ajouter au CSS global**

```css
.crt-scanlines {
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, rgb(0 0 0 / 0.09) 0 1px, transparent 1px 4px);
}

.crt-vignette {
  position: fixed;
  inset: 0;
  z-index: 101;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 68%, rgb(0 0 0 / 0.22) 100%);
}
```

- [ ] **Step 2: Créer `src/components/desktop/crt-overlay.tsx`**

```tsx
import { usePreferences } from '@/stores/preferences-store';

export function CrtOverlay() {
  const crtEnabled = usePreferences((state) => state.crtEnabled);
  if (!crtEnabled) {
    return null;
  }
  return (
    <>
      <div aria-hidden="true" className="crt-scanlines" />
      <div aria-hidden="true" className="crt-vignette" />
    </>
  );
}
```

- [ ] **Step 3: Vérifier + commit** — Run: `pnpm typecheck` — Expected: vert.

```bash
git add -A && git commit -m "feat: overlay CRT désactivable"
```

---

### Task 8: Routes + assemblage dans __root

**Files:**
- Modify: `src/routes/__root.tsx`, `src/routes/index.tsx`
- Create: `src/routes/projects.tsx`, `src/routes/projects.$slug.tsx`, `src/routes/career.tsx`, `src/routes/about.tsx`, `src/routes/contact.tsx`

- [ ] **Step 1: Réécrire `src/routes/__root.tsx`** (adapter les imports CSS/`HeadContent`/`Scripts` au squelette généré par le scaffold — la structure `<html>` existante du scaffold reste, on remplace le layout)

```tsx
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';
import appCss from '@/styles.css?url';
import { CrtOverlay } from '@/components/desktop/crt-overlay';
import { Desktop } from '@/components/desktop/desktop';
import { Dock } from '@/components/desktop/dock';
import { MenuBar } from '@/components/desktop/menu-bar';
import { WindowManagerProvider } from '@/windows/window-manager-provider';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Lucas — Beach OS' },
      {
        name: 'description',
        content: 'Portfolio of Lucas, French software developer. Welcome to Beach OS 🌊',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="overflow-hidden">
        <WindowManagerProvider>
          <MenuBar />
          <Desktop />
          <Dock />
          <Outlet />
        </WindowManagerProvider>
        <CrtOverlay />
        <Scripts />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Créer les routes d'apps** — chaque composant retourne `null` (la fenêtre est rendue par le Desktop), la route ne sert que le deep-linking + les meta. `src/routes/projects.tsx` :

```tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/projects')({
  head: () => ({ meta: [{ title: 'Projects — Lucas · Beach OS' }] }),
  component: () => null,
});
```

`src/routes/projects.$slug.tsx` :

```tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/projects/$slug')({
  head: ({ params }) => ({ meta: [{ title: `${params.slug} — Lucas · Beach OS` }] }),
  component: () => null,
});
```

`career.tsx`, `about.tsx`, `contact.tsx` : même gabarit que `projects.tsx` en remplaçant le chemin (`'/career'`, `'/about'`, `'/contact'`) et le titre (`'Career — …'`, `'About — …'`, `'Contact — …'`).

- [ ] **Step 3: Vérification manuelle complète**

Run: `pnpm dev` puis ouvrir http://localhost:3000 et vérifier :
- le wallpaper sunset, la barre de menu, les 4 icônes, le dock ;
- clic icône PROJECTS → fenêtre ouverte ET URL `/projects` ;
- drag de la fenêtre par sa barre de titre ;
- `_` minimise (fenêtre disparaît, point dans le dock, clic dock la restaure) ;
- `×` ferme et l'URL revient à `/` ;
- ouvrir 2 fenêtres, cliquer l'arrière-plan de l'une → elle passe devant ;
- accès direct à http://localhost:3000/projects/karaoke-platform → fenêtre projets ouverte sur le détail ;
- `[CRT:ON]` → OFF fait disparaître scanlines/vignette ;
- navigation clavier : Tab atteint icônes, dock et boutons de fenêtre.

- [ ] **Step 4: Vérifier + commit**

Run: `pnpm typecheck && pnpm test && pnpm build`
Expected: verts.

```bash
git add -A && git commit -m "feat: assemblage du bureau Beach OS (routes, shell, deep-linking)"
```

---

## Vérification finale du plan 04

- [ ] Checklist manuelle du Step 3 de la Task 8 validée intégralement.
- [ ] `pnpm typecheck` ✅ — `pnpm test` ✅ — `pnpm build` ✅
