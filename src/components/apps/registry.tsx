import type * as React from "react";

import type { TranslationKey } from "@/i18n/translations";
import type { WindowId } from "@/windows/window-types";

import { AboutApp } from "./about/about-app";
import { CareerApp } from "./career/career-app";
import { ContactApp } from "./contact/contact-app";
import { ProjectsApp } from "./projects/projects-app";
import { RadioApp } from "./radio/radio-app";
import { TvApp } from "./tv/tv-app";

export interface AppDefinition {
  id: WindowId;
  icon: string;
  titleKey: TranslationKey;
  route: string | null;
  Component: React.ComponentType;
  defaultSize: { width: number };
}

export const APP_REGISTRY: Partial<Record<WindowId, AppDefinition>> = {
  projects: {
    id: "projects",
    icon: "🏄",
    titleKey: "app.projects",
    route: "/projects",
    Component: ProjectsApp,
    defaultSize: { width: 460 },
  },
  career: {
    id: "career",
    icon: "🗺️",
    titleKey: "app.career",
    route: "/career",
    Component: CareerApp,
    defaultSize: { width: 420 },
  },
  about: {
    id: "about",
    icon: "📝",
    titleKey: "app.about",
    route: "/about",
    Component: AboutApp,
    defaultSize: { width: 380 },
  },
  contact: {
    id: "contact",
    icon: "✉️",
    titleKey: "app.contact",
    route: "/contact",
    Component: ContactApp,
    defaultSize: { width: 440 },
  },
  tv: {
    id: "tv",
    icon: "📺",
    titleKey: "app.tv",
    route: "/tv",
    Component: TvApp,
    defaultSize: { width: 520 },
  },
  radio: {
    id: "radio",
    icon: "📻",
    titleKey: "app.radio",
    route: null,
    Component: RadioApp,
    defaultSize: { width: 300 },
  },
};

export function listApps(): AppDefinition[] {
  return (
    Object.values(APP_REGISTRY) as Array<AppDefinition | undefined>
  ).filter((app): app is AppDefinition => app !== undefined);
}
