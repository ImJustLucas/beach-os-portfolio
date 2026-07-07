import * as React from "react";

import type { AppDefinition } from "@/components/apps/registry";
import { useTranslation } from "@/i18n/use-translation";
import { useWindowManager } from "@/windows/window-manager-provider";

const DRAG_THRESHOLD = 4;

export interface IconPosition {
  x: number;
  y: number;
}

export function DesktopIcon({
  app,
  index,
  position,
  onMove,
}: {
  app: AppDefinition;
  index: number;
  position: IconPosition | undefined;
  onMove: (x: number, y: number) => void;
}) {
  const { t } = useTranslation();
  const { openWindow } = useWindowManager();
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dragOrigin = React.useRef<{
    pointerX: number;
    pointerY: number;
    x: number;
    y: number;
  } | null>(null);
  const didDrag = React.useRef(false);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) {
      return;
    }
    const parent = button.offsetParent;
    const parentRect = parent?.getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    dragOrigin.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: rect.left - (parentRect?.left ?? 0),
      y: rect.top - (parentRect?.top ?? 0),
    };
    didDrag.current = false;
    button.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const origin = dragOrigin.current;
    if (!origin) {
      return;
    }
    const deltaX = event.clientX - origin.pointerX;
    const deltaY = event.clientY - origin.pointerY;
    if (
      Math.abs(deltaX) > DRAG_THRESHOLD ||
      Math.abs(deltaY) > DRAG_THRESHOLD
    ) {
      didDrag.current = true;
    }
    onMove(Math.max(0, origin.x + deltaX), Math.max(0, origin.y + deltaY));
  };

  const handlePointerUp = () => {
    dragOrigin.current = null;
  };

  const handleClick = () => {
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }
    openWindow(app.id);
  };

  const style: React.CSSProperties = position
    ? { position: "absolute", left: position.x, top: position.y }
    : { position: "absolute", right: 16, top: 16 + index * 92 };

  return (
    <button
      ref={buttonRef}
      type="button"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      style={style}
      className="flex w-24 touch-none flex-col items-center gap-1 border-2 border-ink bg-cream/80 px-2 py-2 font-terminal text-[10px] font-bold text-ink shadow-hard-sm hover:bg-sun-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink active:cursor-grabbing"
    >
      <span aria-hidden="true" className="text-3xl">
        {app.icon}
      </span>
      {t(app.titleKey)}
    </button>
  );
}
