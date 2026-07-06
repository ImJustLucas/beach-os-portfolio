# Beach OS — Refonte du portfolio imjustlucas.dev

**Date** : 2026-07-06
**Statut** : validé en brainstorming, en attente de relecture finale
**Remplace** : le portfolio actuel (Next.js 15 + shadcn, sobre, sans couleur)

## 1. Vision

Un portfolio « vitrine perso / fun » qui provoque un effet wow à l'arrivée : **Beach OS**, un
système d'exploitation rétro fictif habillé plage / surf / soleil / skate. Le visiteur allume
une vieille machine de plage et explore le contenu à travers des fenêtres, un dock et des apps.
La liberté créative prime, mais le contenu (projets, parcours, vidéos, contact) reste accessible
en quelques clics et par URL directe.

## 2. Direction artistique (traitement « C-soft », validé sur maquettes)

- **Fond** : dégradé coucher de soleil **fondu** (pas de bandes dures) :
  `#FFD34E` (jaune soleil) → `#FF9A3C` (orange) → `#FF5E62` / `#FF6B6B` (corail) →
  `#3EC9B9` → `#2BB3A3` → `#1F8F84` (turquoise/teal, l'océan). Soleil pixelisé (carré à
  redans) `#FFF3C4` avec glow.
- **Pixel-art dans les éléments, pas dans le fond** : sprites (palmier, planche, skate),
  fenêtres à bordures épaisses `#7A2E0E` (brun foncé) avec **ombres dures décalées**
  (`5px 5px 0`), surfaces crème `#FFF8E1`, radius quasi nul.
- **Typo** : police bitmap/pixel pour les titres et libellés système (piste : Press Start 2P ou
  Silkscreen), mono lisible pour le corps de texte (piste : IBM Plex Mono). Choix final à
  l'implémentation sur critère de lisibilité FR/EN.
- **Effet CRT discret** : scanlines ~10 % d'opacité, vignettage léger, coins d'écran bombés.
  **Toggle [CRT:ON/OFF] dans la barre de menu** (le cadre « écran » disparaît quand OFF).
- **Glitch chromatique rouge/cyan** : réservé aux moments forts (hover, transitions,
  allumage) — jamais permanent sur du texte de lecture.
- **Ton rédactionnel** : décontracté, fidèle au « Yoooo, I'm Lucas! » actuel. Libellés système
  rétro (`PROJECTS.SRF`, `CAREER.LOG`…) traduits selon la locale.

## 3. Structure : le bureau et les apps

Le site est un bureau (desktop) : barre de menu en haut, icônes d'apps, dock en bas,
fenêtres draggables. Les 4 piliers de contenu validés (projets, parcours, contenu créateur,
personnalité) se répartissent en apps :

| App | Contenu | Forme |
|---|---|---|
| 🏄 `PROJECTS.SRF` | Projets & réalisations | Finder rétro ; chaque projet s'ouvre dans sa propre fenêtre (visuels, description, stack, liens démo/repo) |
| 🗺️ `CAREER.LOG` | Expériences & compétences | Timeline rétro + bouton de téléchargement du CV (PDF) |
| 📺 `BEACH-TV` | Vidéos YouTube | Télé cathodique avec embed player + liste des vidéos |
| 📝 `ABOUT-ME.TXT` | Bio, passions, personnalité | Fichier texte ouvert dans un éditeur rétro |
| 📻 `RADIO-PLAGE.FM` | Easter egg ambiance | Player audio lofi/surf-rock (pistes libres de droits), mini-fenêtre avec visualiseur |
| ✉️ `POSTCARD.EXE` | Contact | Carte postale à remplir ; « Envoyer » ouvre un `mailto:` pré-rempli ; liens sociaux (LinkedIn, GitHub, YouTube, Instagram) en stickers |

**Barre de menu** : logo vague + nom BEACH-OS, menus décoratifs, puis à droite :
`[CRT:ON/OFF]`, volume/mute, sélecteur `[FR|EN]`, horloge + météo décorative.

**Dock** : raccourcis des apps ; les fenêtres minimisées y retournent.

### Routes et deep-linking

Chaque app correspond à une route (`/`, `/projects`, `/projects/:slug`, `/career`, `/tv`,
`/about`, `/contact`). Ouvrir/fermer une fenêtre synchronise l'URL (et inversement) : les
liens sont partageables et le contenu indexable via le SSR de TanStack Start.

## 4. Séquence d'arrivée (le wow)

1. Écran noir, texte de boot façon BIOS (`BEACH-OS v1.0 — checking waves… OK`) avec
   bips chiptune.
2. Flash d'allumage télé (balayage + glitch bref).
3. Le bureau se révèle sur le coucher de soleil, son de vague discret si le son est activé.

Contraintes : **skippable au premier clic/touche**, jouée **une fois par session**
(`sessionStorage`), désactivée si `prefers-reduced-motion`.

## 5. Interactions & sons

- **Fenêtres** : drag à la souris, focus/z-index au clic, minimiser vers le dock, fermer.
  Pas de resize en v1 (tailles prédéfinies par app).
- **Sons UI** : clic, ouverture (« pop »), fermeture, erreur système rétro. Boucle d'ambiance
  vague très discrète, désactivable. Sources libres de droits (Freesound/Pixabay), fichiers
  courts et légers.
- **Politique audio** : tout est coupé par défaut (autoplay bloqué par les navigateurs de
  toute façon) ; une invitation visuelle sur l'icône volume propose d'activer le son.
- **Curseur** : curseur pixel custom sur desktop.

## 6. Mobile : « BEACH-OS GO »

Sous le breakpoint tablette (< 768 px), le site devient une **console portable rétro** :
cadre de handheld dessiné autour de l'écran (boutons décoratifs, croix directionnelle),
apps en plein écran (pas de fenêtres flottantes), navigation par le dock en bas.
Même DA, mêmes contenus, mêmes routes.

## 7. Stack technique

- **Framework** : TanStack Start (React, Vite) — scaffold via `npx @tanstack/cli@latest create`.
- **Styles** : Tailwind CSS v4 + **shadcn/ui thémé** : on garde les comportements Radix
  (Dialog → fenêtres, DropdownMenu → barre de menu, Slider → volume, Tooltip) et on redéfinit
  la peau via les variables CSS du thème. Composants custom uniquement là où shadcn n'a pas
  d'équivalent : window manager (drag/z-index/minimize), bureau + icônes, dock, overlay CRT,
  cadre handheld mobile.
- **État** : état des fenêtres (ouverte/minimisée/position/z-index) dans un store léger,
  synchronisé avec TanStack Router. Préférences (CRT, son, langue) persistées en
  `localStorage`.
- **Repo** : nouveau projet from scratch (ce dossier), l'actuel imjustlucas.dev reste en ligne
  jusqu'à la bascule. Domaine conservé : imjustlucas.dev.

## 8. Gestion du contenu (admin)

- **Contenu dans le repo, typé** : `content/projects.ts`, `content/experiences.ts`,
  `content/about.ts`… avec des types TS stricts. Ajouter un projet = ajouter un objet,
  commit, déploiement automatique. Images dans `public/`, versionnées par git.
- **Vidéos YouTube automatiques** : `BEACH-TV` se remplit au build via le flux RSS public de
  la chaîne (`youtube.com/feeds/videos.xml?channel_id=…`) — aucune clé API. **Fallback** :
  si le fetch échoue au build, on garde la dernière liste connue committée (snapshot JSON)
  et le build ne casse pas.
- **i18n** : dictionnaire TS simple à deux locales (`fr`, `en`), pas de lib lourde. Langue
  par défaut détectée par le navigateur, persistée, changeable via `[FR|EN]`.

## 9. Accessibilité, performance, garde-fous

- `prefers-reduced-motion` : désactive boot animé, glitchs et animations non essentielles.
- Navigation clavier et focus hérités de Radix ; les icônes du bureau et le dock sont des
  éléments focusables avec labels.
- Contraste : texte brun `#7A2E0E` sur crème `#FFF8E1` (ratio > 7:1) pour tout texte de lecture ;
  les textes sur dégradé sont réservés aux titres décoratifs.
- SSR : le contenu des routes est servi côté serveur — lisible par les crawlers et sans JS.
- Poids : sprites en SVG/PNG optimisés, sons < 50 Ko chacun, lazy-loading des embeds YouTube
  (facade pattern : thumbnail + play).

## 10. Tests

- **Vitest + Testing Library** : window manager (ouvrir/fermer/minimiser/z-index/focus),
  synchro fenêtres ↔ routes, switch de langue, persistance des préférences.
- **Parsing RSS YouTube** : test unitaire sur le parseur + comportement de fallback.
- DA, sons et feeling : vérification manuelle (checklist au moment de l'implémentation).

## 11. Hors périmètre v1 (idées notées, pas de scope creep)

- Mini-jeu easter egg (runner skate/surf pixel) — v2 possible.
- Resize des fenêtres, multi-bureaux, corbeille interactive.
- Envoi d'email serveur (Resend) pour POSTCARD.EXE — v1 reste en `mailto:`.
- CMS externe.

## 12. Décisions clés (récap brainstorming)

1. Concept **B « Beach OS »** retenu contre one-page immersive (A) et hybride (C).
2. Traitement **C-soft** : pixel-art + couleurs fondues + CRT discret, contre CRT/VHS pur et
   pixel-art total (« too much ») ; scanlines fortes rejetées pour la lisibilité.
3. Effet CRT **désactivable** par l'utilisateur (bouton système).
4. **Sound design** validé avec enthousiasme — sons UI + ambiance, coupés par défaut.
5. Mobile = **console portable rétro**, pas de version « page simple ».
6. Contenu : les 4 piliers (projets, parcours, créateur, personnalité), fond retravaillé.
7. Stack : **TanStack Start + Vite + React + Tailwind v4 + shadcn thémé**, nouveau repo.
8. **FR + EN** via réglage système.
9. Admin : **fichiers typés dans le repo + YouTube auto par RSS au build**.
