import { ABOUT_INTRO, ABOUT_PASSIONS } from "@/content/about";
import { useTranslation } from "@/i18n/use-translation";

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
