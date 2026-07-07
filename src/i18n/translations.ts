export const en = {
  "menu.system": "BEACH-OS",
  "menu.files": "Files",
  "menu.sessions": "Sessions",
  "menu.crt": "CRT",
  "menu.sound": "Sound",
  "hero.tagline": "software developer — Paris",
  "app.projects": "PROJECTS.SRF",
  "app.career": "CAREER.LOG",
  "app.tv": "BEACH-TV",
  "app.about": "ABOUT-ME.TXT",
  "app.radio": "RADIO-PLAGE.FM",
  "app.contact": "POSTCARD.EXE",
  "window.close": "Close",
  "window.minimize": "Minimize",
} as const;

export type TranslationKey = keyof typeof en;

export const fr: Record<TranslationKey, string> = {
  "menu.system": "BEACH-OS",
  "menu.files": "Fichiers",
  "menu.sessions": "Sessions",
  "menu.crt": "CRT",
  "menu.sound": "Son",
  "hero.tagline": "développeur logiciel — Paris",
  "app.projects": "PROJETS.SRF",
  "app.career": "PARCOURS.LOG",
  "app.tv": "PLAGE-TV",
  "app.about": "A-PROPOS.TXT",
  "app.radio": "RADIO-PLAGE.FM",
  "app.contact": "CARTE-POSTALE.EXE",
  "window.close": "Fermer",
  "window.minimize": "Réduire",
};

export const translations = { en, fr };
