import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "fr" | "en";

export interface PreferencesState {
  crtEnabled: boolean;
  soundEnabled: boolean;
  locale: Locale;
  toggleCrt: () => void;
  toggleSound: () => void;
  setLocale: (locale: Locale) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      crtEnabled: true,
      soundEnabled: false,
      locale: "en",
      toggleCrt: () => set((state) => ({ crtEnabled: !state.crtEnabled })),
      toggleSound: () =>
        set((state) => ({ soundEnabled: !state.soundEnabled })),
      setLocale: (locale) => set({ locale }),
    }),
    { name: "beach-os-prefs", skipHydration: true },
  ),
);
