import type { AppDefinition } from "@/components/apps/registry";
import { useTranslation } from "@/i18n/use-translation";
import { useWindowManager } from "@/windows/window-manager-provider";

export function DesktopIcon({ app }: { app: AppDefinition }) {
  const { t } = useTranslation();
  const { openWindow } = useWindowManager();
  return (
    <button
      type="button"
      onDoubleClick={() => openWindow(app.id)}
      onClick={() => openWindow(app.id)}
      className="flex w-24 flex-col items-center gap-1 border-2 border-ink bg-cream/80 px-2 py-2 font-terminal text-[10px] font-bold text-ink shadow-hard-sm hover:bg-sun-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
    >
      <span aria-hidden="true" className="text-2xl">
        {app.icon}
      </span>
      {t(app.titleKey)}
    </button>
  );
}
