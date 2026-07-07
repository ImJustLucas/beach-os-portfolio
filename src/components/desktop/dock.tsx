import { listApps } from "@/components/apps/registry";
import { useTranslation } from "@/i18n/use-translation";
import { useWindowManager } from "@/windows/window-manager-provider";

export function Dock() {
  const { t } = useTranslation();
  const { windows, openWindow, restoreWindow } = useWindowManager();
  return (
    <nav
      aria-label="Dock"
      className="absolute bottom-3 left-1/2 z-50 flex -translate-x-1/2 gap-4 rounded border-2 border-ink bg-cream/90 px-5 py-3 shadow-hard-sm"
    >
      {listApps().map((app) => {
        const state = windows[app.id];
        const handleClick = () => {
          if (state.open && state.minimized) {
            restoreWindow(app.id);
            return;
          }
          openWindow(app.id);
        };
        return (
          <button
            key={app.id}
            type="button"
            aria-label={t(app.titleKey)}
            onClick={handleClick}
            className="relative text-4xl transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
          >
            {app.icon}
            {state.open && (
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-ink"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
