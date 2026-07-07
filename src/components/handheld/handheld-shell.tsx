import { Link, useLocation } from "@tanstack/react-router";
import * as React from "react";
import { listApps } from "@/components/apps/registry";
import { PixelSun } from "@/components/desktop/pixel-sun";
import type { TranslationKey } from "@/i18n/translations";
import { useTranslation } from "@/i18n/use-translation";
import { pathnameToWindowId } from "@/windows/route-window";

export function HandheldShell() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [localAppId, setLocalAppId] = React.useState<"radio" | null>(null);
  const routeAppId = pathnameToWindowId(pathname);
  const activeApp =
    listApps().find((app) => app.id === (routeAppId ?? localAppId)) ?? null;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink/90 p-3">
      <div className="w-full max-w-md rounded-2xl border-[3px] border-ink bg-sun-glow p-3 pb-5 shadow-hard">
        <div className="relative overflow-hidden rounded-md border-[3px] border-ink bg-sunset">
          <header className="flex h-7 items-center border-b-2 border-ink bg-cream px-2 font-pixel text-[9px] text-ink">
            ▓ {t("handheld.title")}
          </header>
          <div className="relative min-h-[60dvh]">
            {activeApp ? (
              <div className="relative z-10 max-h-[60dvh] overflow-y-auto bg-cream">
                <activeApp.Component />
              </div>
            ) : (
              <>
                <PixelSun />
                <nav
                  aria-label="Applications"
                  className="relative z-10 space-y-2 p-4 pt-16"
                >
                  {listApps().map((app) =>
                    app.route ? (
                      <Link
                        key={app.id}
                        to={app.route}
                        onClick={() => setLocalAppId(null)}
                        className="block border-2 border-ink bg-cream px-3 py-2 font-terminal text-xs font-bold text-ink shadow-hard-sm"
                      >
                        {app.icon} <AppTitle titleKey={app.titleKey} />
                      </Link>
                    ) : (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setLocalAppId("radio")}
                        className="block w-full border-2 border-ink bg-cream px-3 py-2 text-left font-terminal text-xs font-bold text-ink shadow-hard-sm"
                      >
                        {app.icon} <AppTitle titleKey={app.titleKey} />
                      </button>
                    ),
                  )}
                </nav>
              </>
            )}
          </div>
          <nav
            aria-label="Dock"
            className="flex h-9 items-center justify-around border-t-2 border-ink bg-cream text-lg"
          >
            <Link
              to="/"
              onClick={() => setLocalAppId(null)}
              aria-label={t("handheld.home")}
            >
              🏠
            </Link>
            {listApps()
              .filter((app) => app.route)
              .map((app) => (
                <Link
                  key={app.id}
                  to={app.route ?? "/"}
                  onClick={() => setLocalAppId(null)}
                >
                  {app.icon}
                </Link>
              ))}
          </nav>
        </div>
        <div
          className="mt-3 flex items-center justify-between px-2"
          aria-hidden="true"
        >
          <div className="relative size-9">
            <div className="absolute top-3 left-0 h-3 w-9 rounded-sm bg-ink" />
            <div className="absolute top-0 left-3 h-9 w-3 rounded-sm bg-ink" />
          </div>
          <div className="flex gap-2">
            <div className="size-4 rounded-full border-2 border-ink bg-coral-soft" />
            <div className="size-4 rounded-full border-2 border-ink bg-lagoon" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AppTitle({ titleKey }: { titleKey: TranslationKey }) {
  const { t } = useTranslation();
  return <>{t(titleKey)}</>;
}
