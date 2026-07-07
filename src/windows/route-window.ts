import type { WindowId } from "./window-types";

const ROUTE_BY_WINDOW: Record<WindowId, string | null> = {
  projects: "/projects",
  career: "/career",
  tv: "/tv",
  about: "/about",
  radio: null,
  contact: "/contact",
};

export function windowIdToRoute(id: WindowId): string | null {
  return ROUTE_BY_WINDOW[id];
}

export function pathnameToWindowId(pathname: string): WindowId | null {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  if (!firstSegment) {
    return null;
  }
  const match = (
    Object.entries(ROUTE_BY_WINDOW) as [WindowId, string | null][]
  ).find(([, route]) => route === `/${firstSegment}`);
  return match ? match[0] : null;
}
