import type { Project } from "./content-types";

export const PROJECTS: Project[] = [
  {
    slug: "karaoke-platform",
    name: "Karaoke Platform",
    emoji: "🏄",
    tagline: {
      en: "B2B karaoke platform — player, admin & API",
      fr: "Plateforme de karaoké B2B — player, admin & API",
    },
    description: {
      en: "A full karaoke ecosystem: NestJS API, React admin dashboard and an offline-first B2B player.",
      fr: "Un écosystème karaoké complet : API NestJS, dashboard admin React et player B2B offline-first.",
    },
    stack: ["NestJS", "React", "PostgreSQL", "Redis"],
    demoUrl: null,
    repoUrl: null,
    imagePath: null,
  },
  {
    slug: "imjustlucas-dev",
    name: "imjustlucas.dev v1",
    emoji: "🌴",
    tagline: { en: "My previous portfolio", fr: "Mon ancien portfolio" },
    description: {
      en: "The sober black & white portfolio this very site replaced.",
      fr: "Le portfolio sobre en noir et blanc que ce site remplace.",
    },
    stack: ["Next.js", "Tailwind"],
    demoUrl: null,
    repoUrl: "https://github.com/ImJustLucas/imjustlucas.dev",
    imagePath: null,
  },
];
