import { describe, expect, it } from "vitest";
import { createInitialWindowState } from "./window-types";

describe("createInitialWindowState", () => {
  it("starts with every window closed when no initial window", () => {
    const state = createInitialWindowState(null);
    expect(Object.values(state.windows).every((w) => !w.open)).toBe(true);
    expect(state.nextZ).toBe(1);
  });

  it("opens and focuses the initial window (deep-link SSR)", () => {
    const state = createInitialWindowState("projects");
    expect(state.windows.projects.open).toBe(true);
    expect(state.windows.projects.z).toBe(1);
    expect(state.nextZ).toBe(2);
  });
});
