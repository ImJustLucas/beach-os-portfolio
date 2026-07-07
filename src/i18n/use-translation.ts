import { useCallback } from "react";

import { usePreferences } from "@/stores/preferences-store";

import { translations } from "./translations";
import type { TranslationKey } from "./translations";

export function useTranslation() {
  const locale = usePreferences((state) => state.locale);
  const t = useCallback(
    (key: TranslationKey): string => translations[locale][key],
    [locale],
  );
  return { t, locale };
}
