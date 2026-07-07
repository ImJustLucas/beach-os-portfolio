# Données à remplacer (placeholders)

Ce fichier remplace les commentaires `// TODO(lucas):` : le code du portfolio n'a **aucun commentaire**, donc les données d'exemple à remplacer par du vrai contenu sont listées ici. Coche au fur et à mesure.

## Contenu (`src/content/`)

- [ ] `site.ts` — `youtubeChannelId` (vide pour l'instant → BEACH-TV tombe sur le snapshot). Vérifier aussi email et liens sociaux.
- [ ] `projects.ts` — remplacer les projets d'exemple par les vrais (⚠️ `slug` stable : il fait l'URL `/projects/<slug>`).
- [ ] `experiences.ts` — remplacer par le vrai parcours.
- [ ] `about.ts` — remplacer les textes de bio (`ABOUT_INTRO`, `ABOUT_PASSIONS`) FR + EN.
- [ ] `videos-snapshot.json` — régénérer une fois `youtubeChannelId` renseigné (fallback BEACH-TV). Voir méthode dans `docs/.../05-media-apps.md`.
- [ ] `radio.ts` — vérifier les titres des pistes une fois les MP3 déposés.

## Assets (`public/`)

- [ ] `public/cv.pdf` — le vrai CV (téléchargé par CAREER.LOG).
- [ ] `public/audio/*.mp3` — pistes RADIO-PLAGE.FM (voir `public/audio/README.md`).
- [ ] `public/sounds/*.mp3` — sons UI 8-bit (voir `public/sounds/README.md`).
- [ ] `public/images/cursor.png` — curseur pixel-art (optionnel, fallback `auto`).
