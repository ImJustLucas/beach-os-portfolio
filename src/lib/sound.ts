import { usePreferences } from "@/stores/preferences-store";

export type SoundName =
  "click" | "open" | "close" | "minimize" | "boot" | "error";

const SOUND_FILES: Record<SoundName, string> = {
  click: "/sounds/click.mp3",
  open: "/sounds/open.mp3",
  close: "/sounds/close.mp3",
  minimize: "/sounds/minimize.mp3",
  boot: "/sounds/boot.mp3",
  error: "/sounds/error.mp3",
};

const UI_VOLUME = 0.4;

export function playSound(name: SoundName): void {
  if (typeof window === "undefined") {
    return;
  }
  if (!usePreferences.getState().soundEnabled) {
    return;
  }
  const audio = new Audio(SOUND_FILES[name]);
  audio.volume = UI_VOLUME;
  void Promise.resolve(audio.play()).catch(() => {});
}
