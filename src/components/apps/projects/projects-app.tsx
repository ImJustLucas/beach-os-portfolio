import { Link, useLocation } from "@tanstack/react-router";

import type { Project } from "@/content/content-types";
import { PROJECTS } from "@/content/projects";
import { useTranslation } from "@/i18n/use-translation";

function slugFromPathname(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  return segments[0] === "projects" && segments[1] ? segments[1] : null;
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
            <span className="block opacity-70">[{t("projects.open")}]</span>
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
        {t("projects.back")}
      </Link>
      <h3 className="font-pixel text-sm">
        {project.emoji} {project.name}
      </h3>
      <p className="font-bold">{project.tagline[locale]}</p>
      <p>{project.description[locale]}</p>
      <p className="text-xs">
        <span className="font-bold">{t("projects.stack")}:</span>{" "}
        {project.stack.join(" · ")}
      </p>
      <p className="flex gap-4 text-xs">
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            {t("projects.demo")}
          </a>
        )}
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            {t("projects.repo")}
          </a>
        )}
      </p>
    </div>
  );
}
