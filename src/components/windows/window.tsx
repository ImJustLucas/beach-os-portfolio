import * as React from "react";

import type { AppDefinition } from "@/components/apps/registry";
import { useTranslation } from "@/i18n/use-translation";
import { useWindowManager } from "@/windows/window-manager-provider";

export function Window({ app }: { app: AppDefinition }) {
  const { t } = useTranslation();
  const { windows, closeWindow, minimizeWindow, focusWindow, moveWindow } =
    useWindowManager();
  const windowState = windows[app.id];
  const dragOrigin = React.useRef<{
    pointerX: number;
    pointerY: number;
    x: number;
    y: number;
  } | null>(null);

  if (!windowState.open) {
    return null;
  }

  const handleTitlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (event.target instanceof HTMLElement && event.target.closest("button")) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOrigin.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: windowState.x,
      y: windowState.y,
    };
  };

  const handleTitlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (!dragOrigin.current) {
      return;
    }
    const deltaX = event.clientX - dragOrigin.current.pointerX;
    const deltaY = event.clientY - dragOrigin.current.pointerY;
    moveWindow(
      app.id,
      Math.max(0, dragOrigin.current.x + deltaX),
      Math.max(0, dragOrigin.current.y + deltaY),
    );
  };

  const handleTitlePointerUp = () => {
    dragOrigin.current = null;
  };

  return (
    <section
      role="dialog"
      aria-label={t(app.titleKey)}
      hidden={windowState.minimized}
      onPointerDown={() => focusWindow(app.id)}
      className="absolute border-[3px] border-ink bg-cream shadow-hard"
      style={{
        left: windowState.x,
        top: windowState.y,
        width: app.defaultSize.width,
        zIndex: windowState.z,
      }}
    >
      <div
        onPointerDown={handleTitlePointerDown}
        onPointerMove={handleTitlePointerMove}
        onPointerUp={handleTitlePointerUp}
        onPointerCancel={handleTitlePointerUp}
        className="flex cursor-grab touch-none items-center gap-2 bg-ink px-2 py-1 font-terminal text-xs font-bold text-cream select-none active:cursor-grabbing"
      >
        <span aria-hidden="true" className="text-coral-soft">
          ■
        </span>
        <span aria-hidden="true" className="text-sun">
          ■
        </span>
        <span aria-hidden="true" className="text-lagoon">
          ■
        </span>
        <span className="ml-1">
          {app.icon} {t(app.titleKey)}
        </span>
        <span className="ml-auto flex gap-1">
          <button
            type="button"
            aria-label={t("window.minimize")}
            onClick={() => minimizeWindow(app.id)}
            className="border border-cream px-1 leading-none hover:bg-cream hover:text-ink"
          >
            _
          </button>
          <button
            type="button"
            aria-label={t("window.close")}
            onClick={() => closeWindow(app.id)}
            className="border border-cream px-1 leading-none hover:bg-coral hover:text-cream"
          >
            ×
          </button>
        </span>
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        <app.Component />
      </div>
    </section>
  );
}
