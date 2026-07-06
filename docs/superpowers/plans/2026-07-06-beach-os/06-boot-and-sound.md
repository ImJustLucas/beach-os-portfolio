# Plan 06 — Boot screen & sound design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** L'effet wow d'arrivée (séquence de boot façon BIOS + allumage télé) et le sound design (sons UI sur les actions de fenêtres, toggle volume dans la barre de menu). Tout respecte `prefers-reduced-motion` et la politique « son coupé par défaut ».

**Architecture:** `src/lib/sound.ts` est le point unique de lecture audio : il vérifie la préférence `soundEnabled` à chaque appel et avale proprement les erreurs de fichiers absents. Les sons sont déclenchés dans l'API du `WindowManagerProvider` (un seul endroit). Le boot est un overlay client-only gardé par `sessionStorage`.

**Tech Stack:** Web Audio via `HTMLAudioElement`, CSS keyframes, Vitest.

**Prérequis :** plans 01–05. **Référence spec :** sections 4, 5, 9.

---

### Task 1: Sound manager (TDD)

**Files:**
- Create: `src/lib/sound.ts`, `public/sounds/README.md`
- Test: `src/lib/sound.test.ts`

- [ ] **Step 1: Écrire le test qui échoue**

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePreferences } from '@/stores/preferences-store';
import { playSound } from './sound';

const playMock = vi.fn().mockResolvedValue(undefined);

vi.stubGlobal(
  'Audio',
  class {
    src: string;
    volume = 1;
    constructor(src: string) {
      this.src = src;
    }
    play = playMock;
  },
);

describe('playSound', () => {
  beforeEach(() => {
    playMock.mockClear();
    usePreferences.setState({ soundEnabled: true });
  });

  it('plays the requested sound when sound is enabled', () => {
    playSound('click');
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it('stays silent when sound is disabled', () => {
    usePreferences.setState({ soundEnabled: false });
    playSound('click');
    expect(playMock).not.toHaveBeenCalled();
  });

  it('swallows playback errors (missing file)', () => {
    playMock.mockRejectedValueOnce(new Error('no source'));
    expect(() => playSound('open')).not.toThrow();
  });
});
```

- [ ] **Step 2: Vérifier l'échec** — Run: `pnpm test src/lib/sound` — Expected: FAIL.

- [ ] **Step 3: Implémenter `src/lib/sound.ts`**

```ts
import { usePreferences } from '@/stores/preferences-store';

export type SoundName = 'click' | 'open' | 'close' | 'minimize' | 'boot' | 'error';

const SOUND_FILES: Record<SoundName, string> = {
  click: '/sounds/click.mp3',
  open: '/sounds/open.mp3',
  close: '/sounds/close.mp3',
  minimize: '/sounds/minimize.mp3',
  boot: '/sounds/boot.mp3',
  error: '/sounds/error.mp3',
};

const UI_VOLUME = 0.4;

export function playSound(name: SoundName): void {
  if (typeof window === 'undefined') {
    return;
  }
  if (!usePreferences.getState().soundEnabled) {
    return;
  }
  const audio = new Audio(SOUND_FILES[name]);
  audio.volume = UI_VOLUME;
  void Promise.resolve(audio.play()).catch(() => {
    // fichier absent ou autoplay bloqué : silence assumé, jamais de crash
  });
}
```

- [ ] **Step 4: Créer `public/sounds/README.md`**

```markdown
# Sons UI Beach OS

Déposer ici des sons courts **libres de droits** (CC0) nommés exactement :
`click.mp3`, `open.mp3`, `close.mp3`, `minimize.mp3`, `boot.mp3`, `error.mp3`.

Ambiance : bips 8-bit / chiptune doux, < 1 s chacun (boot.mp3 peut durer ~2 s), < 50 Ko par fichier.
Sources suggérées : pixabay.com/sound-effects (recherche « 8-bit click », « retro beep »), freesound.org (filtre CC0).
Sans ces fichiers le site fonctionne, simplement muet.
```

- [ ] **Step 5: Vérifier** — Run: `pnpm test src/lib/sound` — Expected: 3 passed.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: sound manager gardé par les préférences"
```

---

### Task 2: Sons branchés sur les actions de fenêtres

**Files:**
- Modify: `src/windows/window-manager-provider.tsx`

- [ ] **Step 1: Brancher les sons dans l'API du provider**

Ajouter l'import :

```tsx
import { playSound } from '@/lib/sound';
```

Puis dans le `useMemo` de l'API, ajouter les appels (le reste ne change pas) :

```tsx
      openWindow: (id) => {
        playSound('open');
        const route = windowIdToRoute(id);
        if (route) {
          navigate({ to: route });
        }
        send({ type: 'OPEN', id });
      },
      closeWindow: (id) => {
        playSound('close');
        send({ type: 'CLOSE', id });
        if (pathnameToWindowId(location.pathname) === id) {
          navigate({ to: '/' });
        }
      },
      minimizeWindow: (id) => {
        playSound('minimize');
        send({ type: 'MINIMIZE', id });
      },
      restoreWindow: (id) => {
        playSound('open');
        send({ type: 'RESTORE', id });
      },
```

- [ ] **Step 2: Vérifier + commit** — Run: `pnpm typecheck && pnpm test` — Expected: verts (le mock des tests fenêtres n'est pas impacté : `playSound` est no-op quand `soundEnabled` est false, valeur par défaut).

```bash
git add -A && git commit -m "feat: sons UI sur les actions de fenêtres"
```

---

### Task 3: Toggle son dans la barre de menu

**Files:**
- Modify: `src/components/desktop/menu-bar.tsx`

- [ ] **Step 1: Ajouter le bouton**

Ajouter les sélecteurs près de ceux du CRT :

```tsx
  const soundEnabled = usePreferences((state) => state.soundEnabled);
  const toggleSound = usePreferences((state) => state.toggleSound);
```

Puis insérer ce bouton juste après le bouton CRT (dans le `<span className="ml-auto …">`) :

```tsx
        <button
          type="button"
          aria-pressed={soundEnabled}
          onClick={toggleSound}
          className={`border-2 border-ink px-1 hover:bg-sun-glow ${soundEnabled ? '' : 'animate-pulse'}`}
        >
          [{t('menu.sound')}:{soundEnabled ? '🔊' : '🔇'}]
        </button>
```

(Le `animate-pulse` quand le son est coupé est l'« invitation visuelle » à activer le son demandée par la spec §5 — il s'arrête dès que le son est activé, et il est neutralisé par `prefers-reduced-motion` à la Task 4.)

- [ ] **Step 2: Vérifier + commit** — Run: `pnpm typecheck` — Expected: vert.

```bash
git add -A && git commit -m "feat: toggle son dans la barre de menu"
```

---

### Task 4: Animations CSS (allumage, glitch, reduced-motion)

**Files:**
- Modify: CSS global

- [ ] **Step 1: Ajouter à la fin du CSS global**

```css
@keyframes crt-turn-on {
  0% {
    transform: scaleY(0.004) scaleX(0.6);
    filter: brightness(6);
  }
  55% {
    transform: scaleY(0.004) scaleX(1);
    filter: brightness(6);
  }
  75% {
    transform: scaleY(1) scaleX(1);
    filter: brightness(2);
  }
  100% {
    transform: none;
    filter: none;
  }
}

.animate-turn-on {
  animation: crt-turn-on 0.7s ease-out both;
}

@keyframes glitch-shift {
  0%, 100% { text-shadow: none; }
  30% { text-shadow: -2px 0 0 rgb(255 0 80 / 0.8), 2px 0 0 rgb(0 255 255 / 0.8); }
  60% { text-shadow: 2px 0 0 rgb(255 0 80 / 0.8), -2px 0 0 rgb(0 255 255 / 0.8); }
}

.glitch-hover:hover {
  animation: glitch-shift 0.3s steps(2) 1;
}

@media (prefers-reduced-motion: reduce) {
  .animate-turn-on,
  .glitch-hover:hover,
  .animate-pulse {
    animation: none !important;
  }
}
```

- [ ] **Step 2: Appliquer `glitch-hover`** — dans `src/components/desktop/menu-bar.tsx`, sur le span du titre système :

```tsx
      <span className="glitch-hover font-pixel text-[10px]">🌊 {t('menu.system')}</span>
```

- [ ] **Step 3: Vérifier + commit** — Run: `pnpm build` — Expected: vert.

```bash
git add -A && git commit -m "feat: animations allumage CRT et glitch, respect reduced-motion"
```

---

### Task 5: Boot screen

**Files:**
- Create: `src/components/desktop/boot-screen.tsx`
- Modify: `src/routes/__root.tsx`, `src/i18n/translations.ts`

- [ ] **Step 1: Ajouter les clés i18n** (dans `en` puis `fr`)

```ts
  // en :
  'boot.skip': 'click to skip',
  // fr :
  'boot.skip': 'clique pour passer',
```

- [ ] **Step 2: Implémenter `src/components/desktop/boot-screen.tsx`**

Client-only (rendu après montage), gardé par `sessionStorage`, skippable au clic/touche, sauté si `prefers-reduced-motion`. Les lignes de boot apparaissent une à une, puis l'overlay disparaît avec l'animation d'allumage appliquée au bureau.

```tsx
import * as React from 'react';
import { playSound } from '@/lib/sound';
import { useTranslation } from '@/i18n/use-translation';

const BOOT_LINES = [
  'BEACH-OS v1.0 — BIOS 1986-2026',
  'checking sun ............ OK',
  'checking waves .......... OK',
  'waxing surfboard ........ OK',
  'mounting /dev/beach ..... OK',
  'starting session for: visitor',
];

const LINE_INTERVAL_MS = 350;
const SESSION_KEY = 'beach-os-booted';

function shouldSkipBoot(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return reducedMotion || sessionStorage.getItem(SESSION_KEY) === '1';
}

export function BootScreen({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const [visibleLines, setVisibleLines] = React.useState(0);
  const [isFinished, setIsFinished] = React.useState(() => shouldSkipBoot());

  const finish = React.useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setIsFinished(true);
    onDone();
  }, [onDone]);

  React.useEffect(() => {
    if (isFinished) {
      onDone();
      return;
    }
    playSound('boot');
    const interval = setInterval(() => {
      setVisibleLines((count) => {
        if (count >= BOOT_LINES.length) {
          clearInterval(interval);
          setTimeout(finish, 500);
          return count;
        }
        return count + 1;
      });
    }, LINE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isFinished, finish, onDone]);

  React.useEffect(() => {
    if (isFinished) {
      return;
    }
    window.addEventListener('pointerdown', finish);
    window.addEventListener('keydown', finish);
    return () => {
      window.removeEventListener('pointerdown', finish);
      window.removeEventListener('keydown', finish);
    };
  }, [isFinished, finish]);

  if (isFinished) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black p-8 font-terminal text-sm text-lagoon">
      {BOOT_LINES.slice(0, visibleLines).map((line) => (
        <p key={line}>{line}</p>
      ))}
      <p className="absolute bottom-4 right-4 text-xs opacity-60">{t('boot.skip')}</p>
    </div>
  );
}
```

- [ ] **Step 3: Brancher dans `src/routes/__root.tsx`**

Le boot n'est rendu qu'après montage (client-only, pas de mismatch SSR) et déclenche l'animation d'allumage du bureau à sa disparition. Remplacer le `RootComponent` :

```tsx
import * as React from 'react';
import { BootScreen } from '@/components/desktop/boot-screen';

function RootComponent() {
  const [isMounted, setIsMounted] = React.useState(false);
  const [isBooted, setIsBooted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="overflow-hidden">
        <div className={isBooted ? 'animate-turn-on' : undefined}>
          <WindowManagerProvider>
            <MenuBar />
            <Desktop />
            <Dock />
            <Outlet />
          </WindowManagerProvider>
        </div>
        {isMounted && !isBooted && <BootScreen onDone={() => setIsBooted(true)} />}
        <CrtOverlay />
        <Scripts />
      </body>
    </html>
  );
}
```

(Note : quand le boot est sauté — session déjà bootée ou reduced-motion — `onDone` est appelé immédiatement au montage ; `animate-turn-on` est neutralisée par la media query reduced-motion de la Task 4.)

- [ ] **Step 4: Vérification manuelle**

Run: `pnpm dev` puis :
- premier chargement (onglet privé) : lignes de boot, puis flash d'allumage, bureau visible ;
- clic pendant le boot : passage immédiat ;
- rechargement : pas de boot (sessionStorage) ;
- DevTools > Rendering > émuler `prefers-reduced-motion: reduce` + nouvel onglet privé : aucun boot, aucune animation ;
- activer le son + déposer des MP3 tests dans `public/sounds/` : bips au boot et à l'ouverture de fenêtres.

- [ ] **Step 5: Vérifier + commit**

Run: `pnpm typecheck && pnpm test && pnpm build`
Expected: verts.

```bash
git add -A && git commit -m "feat: séquence de boot skippable jouée une fois par session"
```

---

## Vérification finale du plan 06

- [ ] `pnpm typecheck` ✅ — `pnpm test` ✅ — `pnpm build` ✅
- [ ] Boot, sons et animations vérifiés manuellement (dont reduced-motion).
