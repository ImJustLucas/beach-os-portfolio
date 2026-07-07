import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePreferences } from "@/stores/preferences-store";
import { playSound } from "./sound";

const playMock = vi.fn().mockResolvedValue(undefined);

vi.stubGlobal(
  "Audio",
  class {
    src: string;
    volume = 1;
    constructor(src: string) {
      this.src = src;
    }
    play = playMock;
  },
);

describe("playSound", () => {
  beforeEach(() => {
    playMock.mockClear();
    usePreferences.setState({ soundEnabled: true });
  });

  it("plays the requested sound when sound is enabled", () => {
    playSound("click");
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it("stays silent when sound is disabled", () => {
    usePreferences.setState({ soundEnabled: false });
    playSound("click");
    expect(playMock).not.toHaveBeenCalled();
  });

  it("swallows playback errors (missing file)", () => {
    playMock.mockRejectedValueOnce(new Error("no source"));
    expect(() => playSound("open")).not.toThrow();
  });
});
