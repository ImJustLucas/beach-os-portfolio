import type { WindowId, WindowManagerState } from "./window-types";

export type WindowAction =
  | { type: "OPEN"; id: WindowId }
  | { type: "CLOSE"; id: WindowId }
  | { type: "MINIMIZE"; id: WindowId }
  | { type: "RESTORE"; id: WindowId }
  | { type: "FOCUS"; id: WindowId }
  | { type: "MOVE"; id: WindowId; x: number; y: number };

function withWindow(
  state: WindowManagerState,
  id: WindowId,
  patch: Partial<WindowManagerState["windows"][WindowId]>,
): WindowManagerState {
  return {
    ...state,
    windows: { ...state.windows, [id]: { ...state.windows[id], ...patch } },
  };
}

export function windowReducer(
  state: WindowManagerState,
  action: WindowAction,
): WindowManagerState {
  switch (action.type) {
    case "OPEN": {
      const next = withWindow(state, action.id, {
        open: true,
        minimized: false,
        z: state.nextZ,
      });
      return { ...next, nextZ: state.nextZ + 1 };
    }
    case "CLOSE":
      return withWindow(state, action.id, { open: false, minimized: false });
    case "MINIMIZE":
      return withWindow(state, action.id, { minimized: true });
    case "RESTORE": {
      const next = withWindow(state, action.id, {
        minimized: false,
        z: state.nextZ,
      });
      return { ...next, nextZ: state.nextZ + 1 };
    }
    case "FOCUS": {
      if (state.windows[action.id].z === state.nextZ - 1) {
        return state;
      }
      const next = withWindow(state, action.id, { z: state.nextZ });
      return { ...next, nextZ: state.nextZ + 1 };
    }
    case "MOVE":
      return withWindow(state, action.id, { x: action.x, y: action.y });
  }
}
