import { listApps } from "@/components/apps/registry";
import { Window } from "@/components/windows/window";

import { DesktopIcon } from "./desktop-icon";
import { Wallpaper } from "./wallpaper";

export function Desktop() {
  const apps = listApps();
  return (
    <main className="relative min-h-[calc(100dvh-2rem)] overflow-hidden">
      <Wallpaper />
      <nav
        aria-label="Applications"
        className="absolute top-4 right-4 flex flex-col gap-3"
      >
        {apps.map((app) => (
          <DesktopIcon key={app.id} app={app} />
        ))}
      </nav>
      {apps.map((app) => (
        <Window key={app.id} app={app} />
      ))}
    </main>
  );
}
