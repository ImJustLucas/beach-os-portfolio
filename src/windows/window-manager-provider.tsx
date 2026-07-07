import { useLocation, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { pathnameToWindowId, windowIdToRoute } from "./route-window";
import { windowReducer } from "./window-reducer";
import { createInitialWindowState } from "./window-types";
import type { WindowId, WindowManagerState } from "./window-types";

interface WindowManagerApi {
  windows: WindowManagerState["windows"];
  openWindow: (id: WindowId) => void;
  closeWindow: (id: WindowId) => void;
  minimizeWindow: (id: WindowId) => void;
  restoreWindow: (id: WindowId) => void;
  focusWindow: (id: WindowId) => void;
  moveWindow: (id: WindowId, x: number, y: number) => void;
}

const WindowManagerContext = React.createContext<WindowManagerApi | null>(null);

export function WindowManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, dispatch] = React.useReducer(
    windowReducer,
    pathnameToWindowId(location.pathname),
    createInitialWindowState,
  );

  const routeWindowId = pathnameToWindowId(location.pathname);

  React.useEffect(() => {
    if (routeWindowId && !state.windows[routeWindowId].open) {
      dispatch({ type: "OPEN", id: routeWindowId });
    }
  }, [routeWindowId, state.windows]);

  const api = React.useMemo<WindowManagerApi>(() => {
    return {
      windows: state.windows,
      openWindow: (id) => {
        const route = windowIdToRoute(id);
        if (route) {
          navigate({ to: route });
        }
        dispatch({ type: "OPEN", id });
      },
      closeWindow: (id) => {
        dispatch({ type: "CLOSE", id });
        if (pathnameToWindowId(location.pathname) === id) {
          navigate({ to: "/" });
        }
      },
      minimizeWindow: (id) => dispatch({ type: "MINIMIZE", id }),
      restoreWindow: (id) => dispatch({ type: "RESTORE", id }),
      focusWindow: (id) => dispatch({ type: "FOCUS", id }),
      moveWindow: (id, x, y) => dispatch({ type: "MOVE", id, x, y }),
    };
  }, [state.windows, navigate, location.pathname]);

  return (
    <WindowManagerContext.Provider value={api}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager(): WindowManagerApi {
  const context = React.useContext(WindowManagerContext);
  if (!context) {
    throw new Error(
      "useWindowManager must be used inside WindowManagerProvider",
    );
  }
  return context;
}
