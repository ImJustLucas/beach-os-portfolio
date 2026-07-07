import { describe, expect, it } from "vitest";
import { pathnameToWindowId, windowIdToRoute } from "./route-window";

describe("pathnameToWindowId", () => {
  it.each([
    ["/", null],
    ["/projects", "projects"],
    ["/projects/karaoke-platform", "projects"],
    ["/career", "career"],
    ["/tv", "tv"],
    ["/about", "about"],
    ["/contact", "contact"],
    ["/unknown", null],
  ] as const)("%s -> %s", (pathname, expected) => {
    expect(pathnameToWindowId(pathname)).toBe(expected);
  });
});

describe("windowIdToRoute", () => {
  it("maps every routed app and returns null for radio", () => {
    expect(windowIdToRoute("projects")).toBe("/projects");
    expect(windowIdToRoute("radio")).toBeNull();
  });
});
