import type { ReactNode } from "react";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";

import { CrtOverlay } from "@/components/desktop/crt-overlay";
import { Desktop } from "@/components/desktop/desktop";
import { Dock } from "@/components/desktop/dock";
import { MenuBar } from "@/components/desktop/menu-bar";
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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="overflow-hidden">
        <WindowManagerProvider>
          <MenuBar />
          <Desktop />
          <Dock />
          {children}
        </WindowManagerProvider>
        <CrtOverlay />
        <Scripts />
      </body>
    </html>
  );
}
