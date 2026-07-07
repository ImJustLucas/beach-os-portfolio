# 🌊 Beach OS — imjustlucas.dev

Mon portfolio en forme d'OS rétro de plage. Pixel-art, CRT désactivable, sons 8-bit, FR/EN.

## Stack

TanStack Start (React 19, Vite) · Tailwind CSS v4 · shadcn/ui thémé · zustand · Vitest

## Développement

pnpm install
pnpm dev # http://localhost:3000
pnpm test # tests unitaires
pnpm typecheck # TypeScript
pnpm build # build de production

## Ajouter du contenu

- Projet / expérience / bio : éditer `src/content/*.ts` (typé — le compilateur te guide), commit, push.
- Vidéos YouTube : automatique via le flux RSS de la chaîne (`src/content/site.ts` → `youtubeChannelId`),
  fallback committé dans `src/content/videos-snapshot.json`.
- CV : remplacer `public/cv.pdf`. Sons : voir `public/sounds/README.md`. Radio : `public/audio/README.md`.
