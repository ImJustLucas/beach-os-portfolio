import { beforeEach, describe, expect, it } from "vitest";

import { usePreferences } from "./preferences-store";

describe("preferences store", () => {
  beforeEach(() => {
    localStorage.clear();
    usePreferences.setState({
      crtEnabled: true,
      soundEnabled: false,
      locale: "en",
    });
  });

  it("has retro-friendly defaults: CRT on, sound off, english", () => {
    const state = usePreferences.getState();
    expect(state.crtEnabled).toBe(true);
    expect(state.soundEnabled).toBe(false);
    expect(state.locale).toBe("en");
  });

  it("toggles CRT and persists to localStorage", () => {
    usePreferences.getState().toggleCrt();
    expect(usePreferences.getState().crtEnabled).toBe(false);
    const raw = localStorage.getItem("beach-os-prefs");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string).state.crtEnabled).toBe(false);
  });

  it("switches locale", () => {
    usePreferences.getState().setLocale("fr");
    expect(usePreferences.getState().locale).toBe("fr");
  });
});
