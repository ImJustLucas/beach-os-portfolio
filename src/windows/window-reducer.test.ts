import { describe, expect, it } from "vitest";
import { windowReducer } from "./window-reducer";
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

describe("windowReducer OPEN/CLOSE/FOCUS", () => {
  it("OPEN opens the window on top", () => {
    let state = createInitialWindowState(null);
    state = windowReducer(state, { type: "OPEN", id: "about" });
    expect(state.windows.about.open).toBe(true);
    expect(state.windows.about.z).toBe(1);
    expect(state.nextZ).toBe(2);
  });

  it("OPEN on an already open window re-focuses it and un-minimizes it", () => {
    let state = createInitialWindowState("about");
    state = windowReducer(state, { type: "OPEN", id: "projects" });
    state = windowReducer(state, { type: "MINIMIZE", id: "about" });
    state = windowReducer(state, { type: "OPEN", id: "about" });
    expect(state.windows.about.minimized).toBe(false);
    expect(state.windows.about.z).toBeGreaterThan(state.windows.projects.z);
  });

  it("CLOSE closes and resets minimized", () => {
    let state = createInitialWindowState("about");
    state = windowReducer(state, { type: "CLOSE", id: "about" });
    expect(state.windows.about.open).toBe(false);
    expect(state.windows.about.minimized).toBe(false);
  });

  it("FOCUS raises the window above the others", () => {
    let state = createInitialWindowState("about");
    state = windowReducer(state, { type: "OPEN", id: "projects" });
    state = windowReducer(state, { type: "FOCUS", id: "about" });
    expect(state.windows.about.z).toBeGreaterThan(state.windows.projects.z);
  });
});

describe("windowReducer MINIMIZE/RESTORE/MOVE", () => {
  it("MINIMIZE keeps the window open but minimized", () => {
    let state = createInitialWindowState("about");
    state = windowReducer(state, { type: "MINIMIZE", id: "about" });
    expect(state.windows.about.open).toBe(true);
    expect(state.windows.about.minimized).toBe(true);
  });

  it("RESTORE un-minimizes and re-focuses", () => {
    let state = createInitialWindowState("about");
    state = windowReducer(state, { type: "OPEN", id: "projects" });
    state = windowReducer(state, { type: "MINIMIZE", id: "about" });
    state = windowReducer(state, { type: "RESTORE", id: "about" });
    expect(state.windows.about.minimized).toBe(false);
    expect(state.windows.about.z).toBeGreaterThan(state.windows.projects.z);
  });

  it("MOVE updates coordinates", () => {
    let state = createInitialWindowState("about");
    state = windowReducer(state, { type: "MOVE", id: "about", x: 300, y: 200 });
    expect(state.windows.about.x).toBe(300);
    expect(state.windows.about.y).toBe(200);
  });
});
