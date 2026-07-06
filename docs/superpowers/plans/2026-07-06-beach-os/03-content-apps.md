# Plan 03 — Contenu typé & apps de contenu

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Le contenu du portfolio en fichiers TS typés (« git est le back-office ») et les quatre apps de contenu : PROJECTS.SRF, CAREER.LOG, ABOUT-ME.TXT, POSTCARD.EXE. Composants purs, pas encore reliés au bureau (plan 04).

**Architecture:** `src/content/` contient les données (typées par `content-types.ts`) avec des textes FR **et** EN par entrée (`LocalizedText`). Les apps sont des composants sans props qui lisent le contenu + la locale. Le contact est un `mailto:` construit par un helper pur testé.

**Tech Stack:** React, TypeScript strict, Vitest.

**Prérequis :** plans 01–02. **Référence spec :** sections 3 et 8.

---

### Task 1: Types de contenu et données

**Files:**
- Create: `src/content/content-types.ts`, `src/content/site.ts`, `src/content/projects.ts`, `src/content/experiences.ts`, `src/content/about.ts`

- [ ] **Step 1: Créer `src/content/content-types.ts`**

```ts
import type { Locale } from '@/stores/preferences-store';

export type LocalizedText = Record<Locale, string>;

export interface Project {
  slug: string;
  name: string;
  emoji: string;
  tagline: LocalizedText;
  description: LocalizedText;
  stack: string[];
  demoUrl: string | null;
  repoUrl: string | null;
  imagePath: string | null;
}

export interface Experience {
  company: string;
  role: LocalizedText;
  period: LocalizedText;
  summary: LocalizedText;
}

export interface SiteInfo {
  email: string;
  cvPath: string;
  youtubeChannelId: string;
  socials: { label: string; url: string }[];
}
```

- [ ] **Step 2: Créer `src/content/site.ts`**

```ts
import type { SiteInfo } from './content-types';

// TODO(lucas): remplacer par tes vraies données (email, channel ID YouTube, liens)
export const SITE: SiteInfo = {
  email: 'bellierlucas.pro@gmail.com',
  cvPath: '/cv.pdf',
  youtubeChannelId: '',
  socials: [
    { label: 'GitHub', url: 'https://github.com/ImJustLucas' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/lucasbellier' },
    { label: 'YouTube', url: 'https://www.youtube.com/@imjustlucas' },
    { label: 'Instagram', url: 'https://www.instagram.com/imjustlucas' },
  ],
};
```

- [ ] **Step 3: Créer `src/content/projects.ts`** (données d'exemple typées — structure définitive)

```ts
import type { Project } from './content-types';

// TODO(lucas): remplacer par tes vrais projets (slugs stables : ils font les URLs)
export const PROJECTS: Project[] = [
  {
    slug: 'karaoke-platform',
    name: 'Karaoke Platform',
    emoji: '🏄',
    tagline: {
      en: 'B2B karaoke platform — player, admin & API',
      fr: 'Plateforme de karaoké B2B — player, admin & API',
    },
    description: {
      en: 'A full karaoke ecosystem: NestJS API, React admin dashboard and an offline-first B2B player.',
      fr: 'Un écosystème karaoké complet : API NestJS, dashboard admin React et player B2B offline-first.',
    },
    stack: ['NestJS', 'React', 'PostgreSQL', 'Redis'],
    demoUrl: null,
    repoUrl: null,
    imagePath: null,
  },
  {
    slug: 'imjustlucas-dev',
    name: 'imjustlucas.dev v1',
    emoji: '🌴',
    tagline: { en: 'My previous portfolio', fr: 'Mon ancien portfolio' },
    description: {
      en: 'The sober black & white portfolio this very site replaced.',
      fr: 'Le portfolio sobre en noir et blanc que ce site remplace.',
    },
    stack: ['Next.js', 'Tailwind'],
    demoUrl: null,
    repoUrl: 'https://github.com/ImJustLucas/imjustlucas.dev',
    imagePath: null,
  },
];
```

- [ ] **Step 4: Créer `src/content/experiences.ts`**

```ts
import type { Experience } from './content-types';

// TODO(lucas): remplacer par ton vrai parcours
export const EXPERIENCES: Experience[] = [
  {
    company: 'BAM Karaoke Box',
    role: { en: 'Software Developer', fr: 'Développeur logiciel' },
    period: { en: '2024 — today', fr: '2024 — aujourd’hui' },
    summary: {
      en: 'Building the karaoke platform: API, admin dashboard and B2B player.',
      fr: 'Construction de la plateforme karaoké : API, dashboard admin et player B2B.',
    },
  },
];
```

- [ ] **Step 5: Créer `src/content/about.ts`**

```ts
import type { LocalizedText } from './content-types';

// TODO(lucas): tes vrais textes de bio
export const ABOUT_INTRO: LocalizedText = {
  en: "Yoooo, I'm Lucas! French software developer based in Paris. I build web things and ride whatever rolls or floats 🏄🛹",
  fr: 'Yoooo, moi c’est Lucas ! Développeur parisien. Je construis des trucs pour le web et je ride tout ce qui roule ou flotte 🏄🛹',
};

export const ABOUT_PASSIONS: LocalizedText = {
  en: 'Outside of code: surf, skate, music, and making YouTube videos.',
  fr: 'En dehors du code : surf, skate, musique, et des vidéos YouTube.',
};
```

- [ ] **Step 6: Vérifier + commit**

Run: `pnpm typecheck`
Expected: vert.

```bash
git add -A && git commit -m "feat: contenu typé (site, projets, expériences, bio)"
```

---

### Task 2: Helper mailto (TDD)

**Files:**
- Create: `src/lib/mailto.ts`
- Test: `src/lib/mailto.test.ts`

- [ ] **Step 1: Écrire le test qui échoue**

```ts
import { describe, expect, it } from 'vitest';
import { buildMailtoHref } from './mailto';

describe('buildMailtoHref', () => {
  it('builds an encoded mailto with subject and body', () => {
    const href = buildMailtoHref({
      to: 'lucas@example.com',
      subject: 'Postcard from Beach OS',
      body: 'Hello Lucas!\nNice site & sea',
    });
    expect(href).toBe(
      'mailto:lucas@example.com?subject=Postcard%20from%20Beach%20OS&body=Hello%20Lucas%21%0ANice%20site%20%26%20sea',
    );
  });
});
```

- [ ] **Step 2: Vérifier l'échec** — Run: `pnpm test src/lib` — Expected: FAIL.

- [ ] **Step 3: Implémenter `src/lib/mailto.ts`**

```ts
interface MailtoOptions {
  to: string;
  subject: string;
  body: string;
}

export function buildMailtoHref({ to, subject, body }: MailtoOptions): string {
  const params = new URLSearchParams();
  params.set('subject', subject);
  params.set('body', body);
  return `mailto:${to}?${params.toString().replace(/\+/g, '%20')}`;
}
```

- [ ] **Step 4: Vérifier** — Run: `pnpm test src/lib` — Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: helper mailto encodé pour POSTCARD.EXE"
```

---

### Task 3: Clés i18n des apps de contenu

**Files:**
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: Ajouter ces clés à l'objet `en`** (et leurs équivalents dans `fr` — le typecheck casse sinon)

```ts
  // dans en :
  'projects.open': 'open',
  'projects.back': '< back to files',
  'projects.stack': 'Stack',
  'projects.demo': 'View demo',
  'projects.repo': 'View code',
  'career.download': 'Download CV (PDF)',
  'contact.title': 'Send me a postcard',
  'contact.name': 'Your name',
  'contact.message': 'Your message',
  'contact.send': 'SEND ▸',
  'contact.subject': 'Postcard from imjustlucas.dev',
  'contact.socials': 'Or find me here',

  // dans fr :
  'projects.open': 'ouvrir',
  'projects.back': '< retour aux fichiers',
  'projects.stack': 'Stack',
  'projects.demo': 'Voir la démo',
  'projects.repo': 'Voir le code',
  'career.download': 'Télécharger le CV (PDF)',
  'contact.title': 'Envoie-moi une carte postale',
  'contact.name': 'Ton nom',
  'contact.message': 'Ton message',
  'contact.send': 'ENVOYER ▸',
  'contact.subject': 'Carte postale depuis imjustlucas.dev',
  'contact.socials': 'Ou retrouve-moi ici',
```

- [ ] **Step 2: Vérifier + commit** — Run: `pnpm typecheck` — Expected: vert.

```bash
git add -A && git commit -m "feat: clés i18n des apps de contenu"
```

---

### Task 4: App ABOUT-ME.TXT

**Files:**
- Create: `src/components/apps/about/about-app.tsx`

- [ ] **Step 1: Implémenter**

```tsx
import { ABOUT_INTRO, ABOUT_PASSIONS } from '@/content/about';
import { useTranslation } from '@/i18n/use-translation';

export function AboutApp() {
  const { locale } = useTranslation();
  return (
    <div className="space-y-4 p-4 font-terminal text-sm leading-relaxed">
      <p>{ABOUT_INTRO[locale]}</p>
      <p>{ABOUT_PASSIONS[locale]}</p>
      <p aria-hidden="true" className="animate-pulse">
        _
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier + commit** — Run: `pnpm typecheck` — Expected: vert.

```bash
git add -A && git commit -m "feat: app ABOUT-ME.TXT"
```

---

### Task 5: App PROJECTS.SRF (liste + détail par slug)

**Files:**
- Create: `src/components/apps/projects/projects-app.tsx`
- Test: `src/components/apps/projects/projects-app.test.tsx`

L'app affiche la liste façon finder ; si l'URL est `/projects/<slug>`, elle affiche le détail. Elle lit le pathname via `useLocation` pour rester sans props (contrat du registre).

- [ ] **Step 1: Écrire le test qui échoue** (on mocke le router : le composant n'utilise que `useLocation`/`Link`)

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mockPathname = vi.hoisted(() => ({ current: '/projects' }));

vi.mock('@tanstack/react-router', () => ({
  useLocation: () => ({ pathname: mockPathname.current }),
  Link: ({ children, ...props }: React.ComponentProps<'a'> & { to?: string; params?: unknown }) => (
    <a {...props} href="#">{children}</a>
  ),
}));

import { ProjectsApp } from './projects-app';

describe('ProjectsApp', () => {
  it('lists all projects on /projects', () => {
    mockPathname.current = '/projects';
    render(<ProjectsApp />);
    expect(screen.getByText('Karaoke Platform')).toBeInTheDocument();
    expect(screen.getByText('imjustlucas.dev v1')).toBeInTheDocument();
  });

  it('shows the detail view on /projects/karaoke-platform', () => {
    mockPathname.current = '/projects/karaoke-platform';
    render(<ProjectsApp />);
    expect(screen.getByText(/NestJS API/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Vérifier l'échec** — Run: `pnpm test src/components/apps/projects` — Expected: FAIL.

- [ ] **Step 3: Implémenter `src/components/apps/projects/projects-app.tsx`**

```tsx
import { Link, useLocation } from '@tanstack/react-router';
import { PROJECTS } from '@/content/projects';
import type { Project } from '@/content/content-types';
import { useTranslation } from '@/i18n/use-translation';

function slugFromPathname(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  return segments[0] === 'projects' && segments[1] ? segments[1] : null;
}

export function ProjectsApp() {
  const { pathname } = useLocation();
  const slug = slugFromPathname(pathname);
  const selected = PROJECTS.find((project) => project.slug === slug);
  return selected ? <ProjectDetail project={selected} /> : <ProjectList />;
}

function ProjectList() {
  const { t } = useTranslation();
  return (
    <ul className="grid grid-cols-2 gap-3 p-4">
      {PROJECTS.map((project) => (
        <li key={project.slug}>
          <Link
            to="/projects/$slug"
            params={{ slug: project.slug }}
            className="block border-2 border-dashed border-ink p-3 text-center font-terminal text-xs hover:bg-sun-glow"
          >
            <span className="block text-2xl">{project.emoji}</span>
            <span className="block font-bold">{project.name}</span>
            <span className="block opacity-70">[{t('projects.open')}]</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ProjectDetail({ project }: { project: Project }) {
  const { t, locale } = useTranslation();
  return (
    <div className="space-y-3 p-4 font-terminal text-sm">
      <Link to="/projects" className="text-xs underline">
        {t('projects.back')}
      </Link>
      <h3 className="font-pixel text-sm">
        {project.emoji} {project.name}
      </h3>
      <p className="font-bold">{project.tagline[locale]}</p>
      <p>{project.description[locale]}</p>
      <p className="text-xs">
        <span className="font-bold">{t('projects.stack')}:</span> {project.stack.join(' · ')}
      </p>
      <p className="flex gap-4 text-xs">
        {project.demoUrl && (
          <a href={project.demoUrl} target="_blank" rel="noreferrer" className="underline">
            {t('projects.demo')}
          </a>
        )}
        {project.repoUrl && (
          <a href={project.repoUrl} target="_blank" rel="noreferrer" className="underline">
            {t('projects.repo')}
          </a>
        )}
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Vérifier** — Run: `pnpm test src/components/apps/projects` — Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: app PROJECTS.SRF (finder + détail)"
```

---

### Task 6: App CAREER.LOG

**Files:**
- Create: `src/components/apps/career/career-app.tsx`

- [ ] **Step 1: Implémenter**

```tsx
import { SITE } from '@/content/site';
import { EXPERIENCES } from '@/content/experiences';
import { useTranslation } from '@/i18n/use-translation';

export function CareerApp() {
  const { t, locale } = useTranslation();
  return (
    <div className="space-y-4 p-4 font-terminal text-sm">
      <ol className="space-y-3 border-l-2 border-ink pl-4">
        {EXPERIENCES.map((experience) => (
          <li key={`${experience.company}-${experience.period.en}`}>
            <p className="font-bold">
              {experience.role[locale]} — {experience.company}
            </p>
            <p className="text-xs opacity-70">{experience.period[locale]}</p>
            <p>{experience.summary[locale]}</p>
          </li>
        ))}
      </ol>
      <a
        href={SITE.cvPath}
        download
        className="inline-block border-2 border-ink bg-sun px-3 py-2 font-pixel text-[10px] shadow-hard-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
      >
        {t('career.download')}
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier + commit** — Run: `pnpm typecheck` — Expected: vert.

```bash
git add -A && git commit -m "feat: app CAREER.LOG (timeline + CV)"
```

---

### Task 7: App POSTCARD.EXE

**Files:**
- Create: `src/components/apps/contact/contact-app.tsx`

- [ ] **Step 1: Implémenter** (carte postale : message à gauche, « adresse » à droite, envoi = mailto pré-rempli)

```tsx
import * as React from 'react';
import { buildMailtoHref } from '@/lib/mailto';
import { SITE } from '@/content/site';
import { useTranslation } from '@/i18n/use-translation';

export function ContactApp() {
  const { t } = useTranslation();
  const [name, setName] = React.useState('');
  const [message, setMessage] = React.useState('');

  const href = buildMailtoHref({
    to: SITE.email,
    subject: t('contact.subject'),
    body: `${message}\n\n— ${name}`,
  });

  return (
    <div className="space-y-3 p-4 font-terminal text-sm">
      <h3 className="font-pixel text-xs">{t('contact.title')}</h3>
      <div className="grid grid-cols-[2fr_1fr] gap-3 border-2 border-ink bg-cream p-3 shadow-hard-sm">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t('contact.message')}
          rows={5}
          className="resize-none border-2 border-ink bg-white/60 p-2 text-xs"
        />
        <div className="flex flex-col justify-between gap-2 border-l-2 border-dashed border-ink pl-3">
          <div className="self-end border-2 border-ink bg-sun px-2 py-1 text-lg">🏄</div>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('contact.name')}
            className="border-2 border-ink bg-white/60 p-2 text-xs"
          />
          <a
            href={href}
            className="border-2 border-ink bg-coral-soft px-2 py-2 text-center font-pixel text-[10px] text-white shadow-hard-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
          >
            {t('contact.send')}
          </a>
        </div>
      </div>
      <p className="text-xs font-bold">{t('contact.socials')}</p>
      <ul className="flex flex-wrap gap-2 text-xs">
        {SITE.socials.map((social) => (
          <li key={social.label}>
            <a
              href={social.url}
              target="_blank"
              rel="noreferrer"
              className="inline-block -rotate-2 border-2 border-ink bg-lagoon px-2 py-1 text-white shadow-hard-sm hover:rotate-0"
            >
              {social.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier + commit** — Run: `pnpm typecheck && pnpm test` — Expected: verts.

```bash
git add -A && git commit -m "feat: app POSTCARD.EXE (carte postale mailto + stickers sociaux)"
```

---

## Vérification finale du plan 03

- [ ] `pnpm typecheck` ✅ — `pnpm test` ✅ — `pnpm build` ✅
- [ ] Les `TODO(lucas)` de `src/content/` sont les seuls TODO du code (données à saisir par Lucas, pas du code manquant).
