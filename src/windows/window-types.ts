export const WINDOW_IDS = [
  "projects",
  "career",
  "tv",
  "about",
  "radio",
  "contact",
] as const;
export type WindowId = (typeof WINDOW_IDS)[number];

export interface WindowState {
  open: boolean;
  minimized: boolean;
  x: number;
  y: number;
  z: number;
}

export interface WindowManagerState {
  windows: Record<WindowId, WindowState>;
  nextZ: number;
}

export const DEFAULT_POSITIONS: Record<WindowId, { x: number; y: number }> = {
  projects: { x: 60, y: 70 },
  career: { x: 120, y: 110 },
  tv: { x: 180, y: 90 },
  about: { x: 260, y: 140 },
  radio: { x: 40, y: 300 },
  contact: { x: 220, y: 180 },
};

function closedWindow(id: WindowId): WindowState {
  return { open: false, minimized: false, ...DEFAULT_POSITIONS[id], z: 0 };
}

export function createInitialWindowState(
  initialOpen: WindowId | null,
): WindowManagerState {
  const windows = Object.fromEntries(
    WINDOW_IDS.map((id) => [id, closedWindow(id)]),
  ) as Record<WindowId, WindowState>;
  if (!initialOpen) {
    return { windows, nextZ: 1 };
  }
  windows[initialOpen] = { ...windows[initialOpen], open: true, z: 1 };
  return { windows, nextZ: 2 };
}
