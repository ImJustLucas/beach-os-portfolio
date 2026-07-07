import { usePreferences } from "@/stores/preferences-store";

import {  translations } from "./translations";
import type {TranslationKey} from "./translations";

export function useTranslation() {
  const locale = usePreferences((state) => state.locale);
  const t = (key: TranslationKey): string => translations[locale][key];
  return { t, locale };
}
