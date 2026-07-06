# Plan 02 — Window manager

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Le cerveau du Beach OS : un reducer testé qui gère l'état des fenêtres (ouvrir/fermer/minimiser/focus/déplacer), le mapping routes↔fenêtres, et le provider React qui relie les deux au router.

**Architecture:** Reducer pur (React `useReducer` dans un contexte, SSR-safe car état de composant — pas de singleton module partagé entre requêtes). La navigation est la source de vérité pour OUVRIR une app à route : cliquer une icône navigue, un effet dans le provider ouvre la fenêtre correspondante. Fermer une fenêtre dont la route est active navigue vers `/`. RADIO n'a pas de route : ouverture directe par dispatch.

**Tech Stack:** React 19, @tanstack/react-router (hooks `useLocation`, `useNavigate`), Vitest.

**Prérequis :** plan 01 exécuté. **Référence spec :** sections 3 et 5.

---

### Task 1: Types et état initial

**Files:**
- Create: `src/windows/window-types.ts`
- Test: `src/windows/window-reducer.test.ts` (créé ici, complété aux tâches suivantes)

- [ ] **Step 1: Écrire le test qui échoue**

```ts
import { describe, expect, it } from 'vitest';
import { createInitialWindowState } from './window-types';

describe('createInitialWindowState', () => {
  it('starts with every window closed when no initial window', () => {
    const state = createInitialWindowState(null);
    expect(Object.values(state.windows).every((w) => !w.open)).toBe(true);
    expect(state.nextZ).toBe(1);
  });

  it('opens and focuses the initial window (deep-link SSR)', () => {
    const state = createInitialWindowState('projects');
    expect(state.windows.projects.open).toBe(true);
    expect(state.windows.projects.z).toBe(1);
    expect(state.nextZ).toBe(2);
  });
});
```

- [ ] **Step 2: Vérifier l'échec** — Run: `pnpm test src/windows` — Expected: FAIL (module introuvable).

- [ ] **Step 3: Implémenter `src/windows/window-types.ts`**

```ts
export const WINDOW_IDS = ['projects', 'career', 'tv', 'about', 'radio', 'contact'] as const;
export type WindowId = (typeof WINDOW_IDS)[number];

export interface WindowState {
  open: boolean;
  minimized: boolean;
  x: number;
  y: number;
  z: number;
}

export interface WindowManagerState {
  windows: Record<WindowId, WindowState>;
  nextZ: number;
}

export const DEFAULT_POSITIONS: Record<WindowId, { x: number; y: number }> = {
  projects: { x: 60, y: 70 },
  career: { x: 120, y: 110 },
  tv: { x: 180, y: 90 },
  about: { x: 260, y: 140 },
  radio: { x: 40, y: 300 },
  contact: { x: 220, y: 180 },
};

function closedWindow(id: WindowId): WindowState {
  return { open: false, minimized: false, ...DEFAULT_POSITIONS[id], z: 0 };
}

export function createInitialWindowState(initialOpen: WindowId | null): WindowManagerState {
  const windows = Object.fromEntries(
    WINDOW_IDS.map((id) => [id, closedWindow(id)]),
  ) as Record<WindowId, WindowState>;
  if (!initialOpen) {
    return { windows, nextZ: 1 };
  }
  windows[initialOpen] = { ...windows[initialOpen], open: true, z: 1 };
  return { windows, nextZ: 2 };
}
```

- [ ] **Step 4: Vérifier** — Run: `pnpm test src/windows` — Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: types et état initial du window manager"
```

---

### Task 2: Reducer — OPEN / CLOSE / FOCUS

**Files:**
- Create: `src/windows/window-reducer.ts`
- Modify: `src/windows/window-reducer.test.ts`

- [ ] **Step 1: Ajouter les tests qui échouent**

```ts
import { describe, expect, it } from 'vitest';
import { createInitialWindowState } from './window-types';
import { windowReducer } from './window-reducer';

describe('windowReducer OPEN/CLOSE/FOCUS', () => {
  it('OPEN opens the window on top', () => {
    let state = createInitialWindowState(null);
    state = windowReducer(state, { type: 'OPEN', id: 'about' });
    expect(state.windows.about.open).toBe(true);
    expect(state.windows.about.z).toBe(1);
    expect(state.nextZ).toBe(2);
  });

  it('OPEN on an already open window re-focuses it and un-minimizes it', () => {
    let state = createInitialWindowState('about');
    state = windowReducer(state, { type: 'OPEN', id: 'projects' });
    state = windowReducer(state, { type: 'MINIMIZE', id: 'about' });
    state = windowReducer(state, { type: 'OPEN', id: 'about' });
    expect(state.windows.about.minimized).toBe(false);
    expect(state.windows.about.z).toBeGreaterThan(state.windows.projects.z);
  });

  it('CLOSE closes and resets minimized', () => {
    let state = createInitialWindowState('about');
    state = windowReducer(state, { type: 'CLOSE', id: 'about' });
    expect(state.windows.about.open).toBe(false);
    expect(state.windows.about.minimized).toBe(false);
  });

  it('FOCUS raises the window above the others', () => {
    let state = createInitialWindowState('about');
    state = windowReducer(state, { type: 'OPEN', id: 'projects' });
    state = windowReducer(state, { type: 'FOCUS', id: 'about' });
    expect(state.windows.about.z).toBeGreaterThan(state.windows.projects.z);
  });
});
```

- [ ] **Step 2: Vérifier l'échec** — Run: `pnpm test src/windows` — Expected: FAIL.

- [ ] **Step 3: Implémenter `src/windows/window-reducer.ts`**

```ts
import type { WindowId, WindowManagerState } from './window-types';

export type WindowAction =
  | { type: 'OPEN'; id: WindowId }
  | { type: 'CLOSE'; id: WindowId }
  | { type: 'MINIMIZE'; id: WindowId }
  | { type: 'RESTORE'; id: WindowId }
  | { type: 'FOCUS'; id: WindowId }
  | { type: 'MOVE'; id: WindowId; x: number; y: number };

function withWindow(
  state: WindowManagerState,
  id: WindowId,
  patch: Partial<WindowManagerState['windows'][WindowId]>,
): WindowManagerState {
  return {
    ...state,
    windows: { ...state.windows, [id]: { ...state.windows[id], ...patch } },
  };
}

export function windowReducer(
  state: WindowManagerState,
  action: WindowAction,
): WindowManagerState {
  switch (action.type) {
    case 'OPEN': {
      const next = withWindow(state, action.id, {
        open: true,
        minimized: false,
        z: state.nextZ,
      });
      return { ...next, nextZ: state.nextZ + 1 };
    }
    case 'CLOSE':
      return withWindow(state, action.id, { open: false, minimized: false });
    case 'MINIMIZE':
      return withWindow(state, action.id, { minimized: true });
    case 'RESTORE': {
      const next = withWindow(state, action.id, { minimized: false, z: state.nextZ });
      return { ...next, nextZ: state.nextZ + 1 };
    }
    case 'FOCUS': {
      if (state.windows[action.id].z === state.nextZ - 1) {
        return state;
      }
      const next = withWindow(state, action.id, { z: state.nextZ });
      return { ...next, nextZ: state.nextZ + 1 };
    }
    case 'MOVE':
      return withWindow(state, action.id, { x: action.x, y: action.y });
  }
}
```

- [ ] **Step 4: Vérifier** — Run: `pnpm test src/windows` — Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: reducer de fenêtres (open/close/focus)"
```

---

### Task 3: Reducer — MINIMIZE / RESTORE / MOVE

**Files:**
- Modify: `src/windows/window-reducer.test.ts`

- [ ] **Step 1: Ajouter les tests (l'implémentation de la Task 2 couvre déjà ces actions — on verrouille le comportement)**

```ts
describe('windowReducer MINIMIZE/RESTORE/MOVE', () => {
  it('MINIMIZE keeps the window open but minimized', () => {
    let state = createInitialWindowState('about');
    state = windowReducer(state, { type: 'MINIMIZE', id: 'about' });
    expect(state.windows.about.open).toBe(true);
    expect(state.windows.about.minimized).toBe(true);
  });

  it('RESTORE un-minimizes and re-focuses', () => {
    let state = createInitialWindowState('about');
    state = windowReducer(state, { type: 'OPEN', id: 'projects' });
    state = windowReducer(state, { type: 'MINIMIZE', id: 'about' });
    state = windowReducer(state, { type: 'RESTORE', id: 'about' });
    expect(state.windows.about.minimized).toBe(false);
    expect(state.windows.about.z).toBeGreaterThan(state.windows.projects.z);
  });

  it('MOVE updates coordinates', () => {
    let state = createInitialWindowState('about');
    state = windowReducer(state, { type: 'MOVE', id: 'about', x: 300, y: 200 });
    expect(state.windows.about.x).toBe(300);
    expect(state.windows.about.y).toBe(200);
  });
});
```

- [ ] **Step 2: Vérifier** — Run: `pnpm test src/windows` — Expected: 9 passed.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "test: couverture minimize/restore/move du reducer"
```

---

### Task 4: Mapping routes ↔ fenêtres

**Files:**
- Create: `src/windows/route-window.ts`
- Test: `src/windows/route-window.test.ts`

- [ ] **Step 1: Écrire le test qui échoue**

```ts
import { describe, expect, it } from 'vitest';
import { pathnameToWindowId, windowIdToRoute } from './route-window';

describe('pathnameToWindowId', () => {
  it.each([
    ['/', null],
    ['/projects', 'projects'],
    ['/projects/karaoke-platform', 'projects'],
    ['/career', 'career'],
    ['/tv', 'tv'],
    ['/about', 'about'],
    ['/contact', 'contact'],
    ['/unknown', null],
  ] as const)('%s -> %s', (pathname, expected) => {
    expect(pathnameToWindowId(pathname)).toBe(expected);
  });
});

describe('windowIdToRoute', () => {
  it('maps every routed app and returns null for radio', () => {
    expect(windowIdToRoute('projects')).toBe('/projects');
    expect(windowIdToRoute('radio')).toBeNull();
  });
});
```

- [ ] **Step 2: Vérifier l'échec** — Run: `pnpm test src/windows` — Expected: FAIL.

- [ ] **Step 3: Implémenter `src/windows/route-window.ts`**

```ts
import type { WindowId } from './window-types';

const ROUTE_BY_WINDOW: Record<WindowId, string | null> = {
  projects: '/projects',
  career: '/career',
  tv: '/tv',
  about: '/about',
  radio: null,
  contact: '/contact',
};

export function windowIdToRoute(id: WindowId): string | null {
  return ROUTE_BY_WINDOW[id];
}

export function pathnameToWindowId(pathname: string): WindowId | null {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  if (!firstSegment) {
    return null;
  }
  const match = (Object.entries(ROUTE_BY_WINDOW) as [WindowId, string | null][]).find(
    ([, route]) => route === `/${firstSegment}`,
  );
  return match ? match[0] : null;
}
```

- [ ] **Step 4: Vérifier** — Run: `pnpm test src/windows` — Expected: 11 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: mapping routes vers fenêtres (deep-linking)"
```

---

### Task 5: WindowManagerProvider

**Files:**
- Create: `src/windows/window-manager-provider.tsx`

Pas de test automatisé sur ce provider (il dépend des hooks du router) : la logique risquée vit dans le reducer et le mapping, déjà testés. Vérification par typecheck ici, et manuelle au plan 04 quand le bureau devient visible.

- [ ] **Step 1: Implémenter le provider**

```tsx
import { useLocation, useNavigate } from '@tanstack/react-router';
import * as React from 'react';
import { pathnameToWindowId, windowIdToRoute } from './route-window';
import { windowReducer, type WindowAction } from './window-reducer';
import {
  createInitialWindowState,
  type WindowId,
  type WindowManagerState,
} from './window-types';

interface WindowManagerApi {
  windows: WindowManagerState['windows'];
  openWindow: (id: WindowId) => void;
  closeWindow: (id: WindowId) => void;
  minimizeWindow: (id: WindowId) => void;
  restoreWindow: (id: WindowId) => void;
  focusWindow: (id: WindowId) => void;
  moveWindow: (id: WindowId, x: number, y: number) => void;
}

const WindowManagerContext = React.createContext<WindowManagerApi | null>(null);

export function WindowManagerProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, dispatch] = React.useReducer(
    windowReducer,
    pathnameToWindowId(location.pathname),
    createInitialWindowState,
  );

  const routeWindowId = pathnameToWindowId(location.pathname);

  React.useEffect(() => {
    if (routeWindowId) {
      dispatch({ type: 'OPEN', id: routeWindowId });
    }
  }, [routeWindowId]);

  const api = React.useMemo<WindowManagerApi>(() => {
    const send = (action: WindowAction) => dispatch(action);
    return {
      windows: state.windows,
      openWindow: (id) => {
        const route = windowIdToRoute(id);
        if (route) {
          navigate({ to: route });
        }
        send({ type: 'OPEN', id });
      },
      closeWindow: (id) => {
        send({ type: 'CLOSE', id });
        if (pathnameToWindowId(location.pathname) === id) {
          navigate({ to: '/' });
        }
      },
      minimizeWindow: (id) => send({ type: 'MINIMIZE', id }),
      restoreWindow: (id) => send({ type: 'RESTORE', id }),
      focusWindow: (id) => send({ type: 'FOCUS', id }),
      moveWindow: (id, x, y) => send({ type: 'MOVE', id, x, y }),
    };
  }, [state.windows, navigate, location.pathname]);

  return <WindowManagerContext.Provider value={api}>{children}</WindowManagerContext.Provider>;
}

export function useWindowManager(): WindowManagerApi {
  const context = React.useContext(WindowManagerContext);
  if (!context) {
    throw new Error('useWindowManager must be used inside WindowManagerProvider');
  }
  return context;
}
```

- [ ] **Step 2: Vérifier** — Run: `pnpm typecheck && pnpm test` — Expected: verts (11 tests fenêtres + tests plan 01).

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: WindowManagerProvider synchronisé avec le router"
```

---

## Vérification finale du plan 02

- [ ] `pnpm typecheck` ✅ — `pnpm test` ✅ — `pnpm build` ✅
