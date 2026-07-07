import * as React from "react";

import { listApps } from "@/components/apps/registry";
import { Window } from "@/components/windows/window";
import type { WindowId } from "@/windows/window-types";

import { DesktopIcon } from "./desktop-icon";
import type { IconPosition } from "./desktop-icon";
import { Wallpaper } from "./wallpaper";

export function Desktop() {
  const apps = listApps();
  const [positions, setPositions] = React.useState<
    Partial<Record<WindowId, IconPosition>>
  >({});

  const moveIcon = (id: WindowId, x: number, y: number) => {
    setPositions((current) => ({ ...current, [id]: { x, y } }));
  };

  return (
    <main className="relative min-h-[calc(100dvh-2rem)] overflow-hidden">
      <Wallpaper />
      <nav aria-label="Applications">
        {apps.map((app, index) => (
          <DesktopIcon
            key={app.id}
            app={app}
            index={index}
            position={positions[app.id]}
            onMove={(x, y) => moveIcon(app.id, x, y)}
          />
        ))}
      </nav>
      {apps.map((app) => (
        <Window key={app.id} app={app} />
      ))}
    </main>
  );
}
