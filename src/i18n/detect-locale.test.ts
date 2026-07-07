import { describe, expect, it } from "vitest";
import { detectLocale } from "./detect-locale";

describe("detectLocale", () => {
  it("returns fr for french browser languages", () => {
    expect(detectLocale("fr")).toBe("fr");
    expect(detectLocale("fr-FR")).toBe("fr");
  });

  it("falls back to en for anything else", () => {
    expect(detectLocale("en-US")).toBe("en");
    expect(detectLocale("de-DE")).toBe("en");
    expect(detectLocale(undefined)).toBe("en");
  });
});
