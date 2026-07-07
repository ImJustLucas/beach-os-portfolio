import * as React from "react";

import { usePreferences } from "@/stores/preferences-store";
import { useTranslation } from "@/i18n/use-translation";

function useClock(): string | null {
  const [time, setTime] = React.useState<string | null>(null);
  React.useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, []);
  return time;
}

export function MenuBar() {
  const { t } = useTranslation();
  const crtEnabled = usePreferences((state) => state.crtEnabled);
  const toggleCrt = usePreferences((state) => state.toggleCrt);
  const soundEnabled = usePreferences((state) => state.soundEnabled);
  const toggleSound = usePreferences((state) => state.toggleSound);
  const time = useClock();

  return (
    <header className="relative z-50 flex h-8 items-center gap-4 border-b-2 border-ink bg-cream px-3 font-terminal text-xs font-bold text-ink">
      <span className="glitch-hover font-pixel text-[10px]">
        🌊 {t("menu.system")}
      </span>
      <span className="hidden sm:inline">{t("menu.files")}</span>
      <span className="hidden sm:inline">{t("menu.sessions")}</span>
      <span className="ml-auto flex items-center gap-3">
        <button
          type="button"
          aria-pressed={crtEnabled}
          onClick={toggleCrt}
          className="border-2 border-ink px-1 hover:bg-sun-glow"
        >
          [{t("menu.crt")}:{crtEnabled ? "ON" : "OFF"}]
        </button>
        <button
          type="button"
          aria-pressed={soundEnabled}
          onClick={toggleSound}
          className={`border-2 border-ink px-1 hover:bg-sun-glow ${soundEnabled ? "" : "animate-pulse"}`}
        >
          [{t("menu.sound")}:{soundEnabled ? "🔊" : "🔇"}]
        </button>
        <span aria-hidden="true">☀ 28°C{time ? ` — ${time}` : ""}</span>
      </span>
    </header>
  );
}
