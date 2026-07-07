import { EXPERIENCES } from "@/content/experiences";
import { SITE } from "@/content/site";
import { useTranslation } from "@/i18n/use-translation";

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
        {t("career.download")}
      </a>
    </div>
  );
}
