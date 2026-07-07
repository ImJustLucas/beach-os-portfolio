import type { Locale } from "@/stores/preferences-store";

export function detectLocale(browserLanguage: string | undefined): Locale {
  return browserLanguage?.toLowerCase().startsWith("fr") ? "fr" : "en";
}
