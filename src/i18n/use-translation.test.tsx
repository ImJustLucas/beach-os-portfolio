import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { usePreferences } from "@/stores/preferences-store";
import { useTranslation } from "./use-translation";

describe("useTranslation", () => {
  beforeEach(() => {
    usePreferences.setState({ locale: "en" });
  });

  it("returns the english value by default", () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t("menu.system")).toBe("BEACH-OS");
  });

  it("returns the french value when locale is fr", () => {
    usePreferences.setState({ locale: "fr" });
    const { result } = renderHook(() => useTranslation());
    expect(result.current.t("hero.tagline")).toBe(
      "développeur logiciel — Paris",
    );
  });
});
