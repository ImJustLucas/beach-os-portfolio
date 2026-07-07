import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";

import { BootScreen } from "@/components/desktop/boot-screen";
import { CrtOverlay } from "@/components/desktop/crt-overlay";
import { Desktop } from "@/components/desktop/desktop";
import { Dock } from "@/components/desktop/dock";
import { MenuBar } from "@/components/desktop/menu-bar";
import { HandheldShell } from "@/components/handheld/handheld-shell";
import { detectLocale } from "@/i18n/detect-locale";
import { useIsMobile } from "@/lib/use-is-mobile";
import { usePreferences } from "@/stores/preferences-store";
import { WindowManagerProvider } from "@/windows/window-manager-provider";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lucas — Beach OS" },
      {
        name: "description",
        content:
          "Portfolio of Lucas, French software developer. Welcome to Beach OS 🌊",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isBooted, setIsBooted] = useState(false);
  const locale = usePreferences((state) => state.locale);
  const isMobile = useIsMobile();

  useEffect(() => {
    void usePreferences.persist.rehydrate();
    if (localStorage.getItem("beach-os-prefs") === null) {
      usePreferences.getState().setLocale(detectLocale(navigator.language));
    }
    setIsMounted(true);
  }, []);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="overflow-hidden">
        <div className={isBooted ? "animate-turn-on" : undefined}>
          {isMobile ? (
            <HandheldShell />
          ) : (
            <WindowManagerProvider>
              <MenuBar />
              <Desktop />
              <Dock />
              {children}
            </WindowManagerProvider>
          )}
        </div>
        {isMounted && !isBooted && (
          <BootScreen onDone={() => setIsBooted(true)} />
        )}
        <CrtOverlay />
        <Scripts />
      </body>
    </html>
  );
}
