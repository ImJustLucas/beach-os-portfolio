import type { Locale } from "@/stores/preferences-store";

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
