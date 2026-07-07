import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  WindowManagerProvider,
  useWindowManager,
} from "./window-manager-provider";

const mockLocation = vi.hoisted(() => ({ pathname: "/projects" }));
const navigate = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-router", () => ({
  useLocation: () => mockLocation,
  useNavigate: () => navigate,
}));

describe("WindowManagerProvider", () => {
  it("closes a routed window and does not reopen it while navigation is pending", () => {
    mockLocation.pathname = "/projects";
    const { result } = renderHook(() => useWindowManager(), {
      wrapper: WindowManagerProvider,
    });

    expect(result.current.windows.projects.open).toBe(true);

    act(() => {
      result.current.closeWindow("projects");
    });

    expect(result.current.windows.projects.open).toBe(false);
  });

  it("opens a window whose route becomes active", () => {
    mockLocation.pathname = "/";
    const { result } = renderHook(() => useWindowManager(), {
      wrapper: WindowManagerProvider,
    });

    expect(result.current.windows.about.open).toBe(false);

    act(() => {
      result.current.openWindow("about");
    });

    expect(result.current.windows.about.open).toBe(true);
  });
});
