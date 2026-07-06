# Plan 05 — Apps média : BEACH-TV & RADIO-PLAGE.FM

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** BEACH-TV (vidéos YouTube auto-récupérées par RSS, fallback snapshot committé, lazy-embed façade) et RADIO-PLAGE.FM (player audio lofi/surf). Les deux entrent au registre des apps.

**Architecture:** Parseur RSS pur et testé (regex sur le XML du flux public YouTube, zéro dépendance). Une server function TanStack Start fait le fetch côté serveur (pas de CORS). La TvApp rend d'abord le snapshot committé (SSR-safe), puis rafraîchit via la server function au montage ; toute erreur laisse le snapshot — le site ne casse jamais. Façade YouTube : thumbnail cliquable, l'iframe ne charge qu'au clic.

**Tech Stack:** @tanstack/react-start (`createServerFn`), Vitest.

**Prérequis :** plans 01–04. **Référence spec :** sections 3, 8, 9.

---

### Task 1: Parseur RSS YouTube (TDD)

**Files:**
- Create: `src/lib/youtube-rss.ts`
- Test: `src/lib/youtube-rss.test.ts`

- [ ] **Step 1: Écrire le test qui échoue**

```ts
import { describe, expect, it } from 'vitest';
import { parseYoutubeFeed } from './youtube-rss';

const SAMPLE_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
  <title>ImJustLucas</title>
  <entry>
    <yt:videoId>abc123XYZ_-</yt:videoId>
    <title>Building a karaoke app in 24h</title>
    <published>2026-05-01T10:00:00+00:00</published>
    <media:group>
      <media:thumbnail url="https://i2.ytimg.com/vi/abc123XYZ_-/hqdefault.jpg" width="480" height="360"/>
    </media:group>
  </entry>
  <entry>
    <yt:videoId>def456</yt:videoId>
    <title>Surf &amp; code</title>
    <published>2026-04-01T10:00:00+00:00</published>
    <media:group>
      <media:thumbnail url="https://i2.ytimg.com/vi/def456/hqdefault.jpg" width="480" height="360"/>
    </media:group>
  </entry>
</feed>`;

describe('parseYoutubeFeed', () => {
  it('extracts id, title, thumbnail and date for each entry', () => {
    const videos = parseYoutubeFeed(SAMPLE_FEED);
    expect(videos).toHaveLength(2);
    expect(videos[0]).toEqual({
      id: 'abc123XYZ_-',
      title: 'Building a karaoke app in 24h',
      thumbnailUrl: 'https://i2.ytimg.com/vi/abc123XYZ_-/hqdefault.jpg',
      publishedAt: '2026-05-01T10:00:00+00:00',
    });
  });

  it('decodes XML entities in titles', () => {
    const videos = parseYoutubeFeed(SAMPLE_FEED);
    expect(videos[1].title).toBe('Surf & code');
  });

  it('returns an empty array for garbage input', () => {
    expect(parseYoutubeFeed('not xml at all')).toEqual([]);
  });
});
```

- [ ] **Step 2: Vérifier l'échec** — Run: `pnpm test src/lib/youtube-rss` — Expected: FAIL.

- [ ] **Step 3: Implémenter `src/lib/youtube-rss.ts`**

```ts
export interface YoutubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
}

function decodeXmlEntities(value: string): string {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

export function parseYoutubeFeed(xml: string): YoutubeVideo[] {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  const videos: YoutubeVideo[] = [];
  for (const entry of entries) {
    const id = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
    const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const thumbnailUrl = entry.match(/<media:thumbnail url="(.*?)"/)?.[1];
    const publishedAt = entry.match(/<published>(.*?)<\/published>/)?.[1];
    if (!id || !title || !thumbnailUrl || !publishedAt) {
      continue;
    }
    videos.push({ id, title: decodeXmlEntities(title), thumbnailUrl, publishedAt });
  }
  return videos;
}
```

- [ ] **Step 4: Vérifier** — Run: `pnpm test src/lib/youtube-rss` — Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: parseur RSS YouTube sans dépendance"
```

---

### Task 2: Snapshot committé + server function

**Files:**
- Create: `src/content/videos-snapshot.json`, `src/server/get-latest-videos.ts`

- [ ] **Step 1: Créer `src/content/videos-snapshot.json`** (fallback ; sera remplacé par de vraies données au premier fetch réussi — voir note en fin de tâche)

```json
[
  {
    "id": "dQw4w9WgXcQ",
    "title": "TODO(lucas): snapshot à régénérer avec tes vraies vidéos",
    "thumbnailUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    "publishedAt": "2026-01-01T00:00:00+00:00"
  }
]
```

- [ ] **Step 2: Créer `src/server/get-latest-videos.ts`**

```ts
import { createServerFn } from '@tanstack/react-start';
import { parseYoutubeFeed, type YoutubeVideo } from '@/lib/youtube-rss';
import { SITE } from '@/content/site';

const MAX_VIDEOS = 12;

export const getLatestVideos = createServerFn({ method: 'GET' }).handler(
  async (): Promise<YoutubeVideo[]> => {
    if (!SITE.youtubeChannelId) {
      return [];
    }
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${SITE.youtubeChannelId}`;
    const response = await fetch(feedUrl);
    if (!response.ok) {
      throw new Error(`YouTube RSS responded ${response.status}`);
    }
    return parseYoutubeFeed(await response.text()).slice(0, MAX_VIDEOS);
  },
);
```

**Note régénération du snapshot** : une fois `SITE.youtubeChannelId` renseigné par Lucas, exécuter dans un terminal `curl -s "https://www.youtube.com/feeds/videos.xml?channel_id=<ID>"`, passer le XML dans le parseur (ou copier le JSON depuis les DevTools après un chargement réussi de la TvApp) et remplacer le contenu de `videos-snapshot.json`.

- [ ] **Step 3: Vérifier + commit** — Run: `pnpm typecheck` — Expected: vert.

```bash
git add -A && git commit -m "feat: server function vidéos YouTube + snapshot de secours"
```

---

### Task 3: Clés i18n des apps média

**Files:**
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: Ajouter dans `en` et `fr`**

```ts
  // en :
  'tv.watch': 'Press ▸ to play',
  'tv.onYoutube': 'Watch on YouTube',
  'radio.play': 'PLAY ▸',
  'radio.pause': 'PAUSE ▮▮',
  'radio.next': 'NEXT ▸▸',

  // fr :
  'tv.watch': 'Appuie sur ▸ pour lancer',
  'tv.onYoutube': 'Voir sur YouTube',
  'radio.play': 'LECTURE ▸',
  'radio.pause': 'PAUSE ▮▮',
  'radio.next': 'SUIVANT ▸▸',
```

- [ ] **Step 2: Vérifier + commit** — Run: `pnpm typecheck` — Expected: vert.

```bash
git add -A && git commit -m "feat: clés i18n BEACH-TV et RADIO"
```

---

### Task 4: App BEACH-TV (façade + refresh serveur)

**Files:**
- Create: `src/components/apps/tv/tv-app.tsx`
- Test: `src/components/apps/tv/tv-app.test.tsx`

- [ ] **Step 1: Écrire le test qui échoue** (la server function est mockée ; le snapshot s'affiche immédiatement, l'iframe n'existe qu'après clic)

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/server/get-latest-videos', () => ({
  getLatestVideos: vi.fn().mockResolvedValue([
    {
      id: 'live001',
      title: 'Fresh from the feed',
      thumbnailUrl: 'https://i.ytimg.com/vi/live001/hqdefault.jpg',
      publishedAt: '2026-06-01T00:00:00+00:00',
    },
  ]),
}));

import { TvApp } from './tv-app';

describe('TvApp', () => {
  it('renders snapshot immediately then live videos, and lazy-loads the iframe', async () => {
    render(<TvApp />);
    await waitFor(() => expect(screen.getByText('Fresh from the feed')).toBeInTheDocument());
    expect(document.querySelector('iframe')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: /Fresh from the feed/ }));
    expect(document.querySelector('iframe')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Vérifier l'échec** — Run: `pnpm test src/components/apps/tv` — Expected: FAIL.

- [ ] **Step 3: Implémenter `src/components/apps/tv/tv-app.tsx`**

```tsx
import * as React from 'react';
import snapshot from '@/content/videos-snapshot.json';
import type { YoutubeVideo } from '@/lib/youtube-rss';
import { getLatestVideos } from '@/server/get-latest-videos';
import { useTranslation } from '@/i18n/use-translation';

export function TvApp() {
  const { t } = useTranslation();
  const [videos, setVideos] = React.useState<YoutubeVideo[]>(snapshot as YoutubeVideo[]);
  const [playingId, setPlayingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    getLatestVideos()
      .then((liveVideos) => {
        if (liveVideos.length > 0) {
          setVideos(liveVideos);
        }
      })
      .catch((error: unknown) => {
        console.warn('BEACH-TV: falling back to snapshot', error);
      });
  }, []);

  return (
    <div className="space-y-3 p-4">
      <p className="font-terminal text-xs">{t('tv.watch')}</p>
      <ul className="grid grid-cols-2 gap-3">
        {videos.map((video) => (
          <li key={video.id} className="border-2 border-ink bg-black shadow-hard-sm">
            {playingId === video.id ? (
              <iframe
                title={video.title}
                src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full"
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlayingId(video.id)}
                className="group relative block w-full"
              >
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  loading="lazy"
                  className="aspect-video w-full object-cover opacity-90 group-hover:opacity-100"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 grid place-items-center font-pixel text-2xl text-cream drop-shadow"
                >
                  ▸
                </span>
                <span className="block truncate bg-cream p-1 font-terminal text-[10px] font-bold text-ink">
                  {video.title}
                </span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Vérifier** — Run: `pnpm test src/components/apps/tv` — Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: app BEACH-TV (snapshot + refresh RSS + façade lazy)"
```

---

### Task 5: App RADIO-PLAGE.FM

**Files:**
- Create: `src/content/radio.ts`, `src/components/apps/radio/radio-app.tsx`, `public/audio/README.md`

- [ ] **Step 1: Créer `src/content/radio.ts`**

```ts
export interface RadioTrack {
  title: string;
  src: string;
}

// TODO(lucas): déposer des MP3 libres de droits dans public/audio/ (voir public/audio/README.md)
export const RADIO_TRACKS: RadioTrack[] = [
  { title: 'Sunset Session', src: '/audio/sunset-session.mp3' },
  { title: 'Lagoon Drive', src: '/audio/lagoon-drive.mp3' },
];
```

- [ ] **Step 2: Créer `public/audio/README.md`**

```markdown
# Pistes RADIO-PLAGE.FM

Déposer ici des MP3 **libres de droits** (CC0 / licence libre) nommés exactement :
- `sunset-session.mp3`
- `lagoon-drive.mp3`

Sources suggérées : pixabay.com/music (filtres « surf rock », « lofi »), freemusicarchive.org (filtre licence CC0).
Ambiance cible : lofi / surf-rock instrumental. ~2-4 Mo par piste maximum.
Si les fichiers manquent, la radio affiche un état silencieux sans casser le site.
```

- [ ] **Step 3: Implémenter `src/components/apps/radio/radio-app.tsx`** (lecture tolérante : un `play()` qui échoue — fichier absent — est signalé sans crash)

```tsx
import * as React from 'react';
import { RADIO_TRACKS } from '@/content/radio';
import { useTranslation } from '@/i18n/use-translation';

export function RadioApp() {
  const { t } = useTranslation();
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [trackIndex, setTrackIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const track = RADIO_TRACKS[trackIndex];

  const play = async () => {
    try {
      await audioRef.current?.play();
      setIsPlaying(true);
      setHasError(false);
    } catch {
      setHasError(true);
      setIsPlaying(false);
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const next = () => {
    setTrackIndex((index) => (index + 1) % RADIO_TRACKS.length);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-3 p-4 font-terminal text-xs">
      <audio ref={audioRef} src={track.src} onEnded={next} />
      <p className="border-2 border-ink bg-ink px-2 py-1 font-bold text-sun">
        ♪ {track.title} {isPlaying && <span aria-hidden="true">▂▃▅▃▂</span>}
      </p>
      {hasError && <p role="alert">📻 … no signal (fichier audio manquant)</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={isPlaying ? pause : play}
          className="border-2 border-ink bg-sun px-2 py-1 font-bold shadow-hard-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
        >
          {isPlaying ? t('radio.pause') : t('radio.play')}
        </button>
        <button
          type="button"
          onClick={next}
          className="border-2 border-ink bg-lagoon px-2 py-1 font-bold text-white shadow-hard-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
        >
          {t('radio.next')}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Vérifier + commit** — Run: `pnpm typecheck` — Expected: vert.

```bash
git add -A && git commit -m "feat: app RADIO-PLAGE.FM (player tolérant aux fichiers absents)"
```

---

### Task 6: Enregistrer TV et RADIO au registre + route /tv

**Files:**
- Modify: `src/components/apps/registry.tsx`
- Create: `src/routes/tv.tsx`

- [ ] **Step 1: Ajouter au `APP_REGISTRY`** (après l'entrée `career`)

```tsx
  tv: {
    id: 'tv',
    icon: '📺',
    titleKey: 'app.tv',
    route: '/tv',
    Component: TvApp,
    defaultSize: { width: 520 },
  },
  radio: {
    id: 'radio',
    icon: '📻',
    titleKey: 'app.radio',
    route: null,
    Component: RadioApp,
    defaultSize: { width: 300 },
  },
```

avec les imports :

```tsx
import { RadioApp } from './radio/radio-app';
import { TvApp } from './tv/tv-app';
```

- [ ] **Step 2: Créer `src/routes/tv.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/tv')({
  head: () => ({ meta: [{ title: 'Beach TV — Lucas · Beach OS' }] }),
  component: () => null,
});
```

- [ ] **Step 3: Vérification manuelle**

Run: `pnpm dev` puis :
- icône 📺 → fenêtre TV, URL `/tv`, thumbnails snapshot visibles, clic → iframe YouTube ;
- icône 📻 → fenêtre radio, **l'URL ne change pas** (pas de route) ; PLAY sans fichiers audio → « no signal » sans crash.

- [ ] **Step 4: Vérifier + commit**

Run: `pnpm typecheck && pnpm test && pnpm build`
Expected: verts.

```bash
git add -A && git commit -m "feat: BEACH-TV et RADIO au registre du bureau"
```

---

## Vérification finale du plan 05

- [ ] `pnpm typecheck` ✅ — `pnpm test` ✅ — `pnpm build` ✅
- [ ] TV et radio fonctionnelles dans le bureau, fallbacks vérifiés.
