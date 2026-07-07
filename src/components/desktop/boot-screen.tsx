import * as React from "react";
import { playSound } from "@/lib/sound";
import { useTranslation } from "@/i18n/use-translation";

const BOOT_LINES = [
  "BEACH-OS v1.0 — BIOS 1986-2026",
  "checking sun ............ OK",
  "checking waves .......... OK",
  "waxing surfboard ........ OK",
  "mounting /dev/beach ..... OK",
  "starting session for: visitor",
];

const LINE_INTERVAL_MS = 350;
const SESSION_KEY = "beach-os-booted";

function shouldSkipBoot(): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  return reducedMotion || sessionStorage.getItem(SESSION_KEY) === "1";
}

export function BootScreen({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const [visibleLines, setVisibleLines] = React.useState(0);
  const [isFinished, setIsFinished] = React.useState(() => shouldSkipBoot());

  const finish = React.useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setIsFinished(true);
    onDone();
  }, [onDone]);

  React.useEffect(() => {
    if (isFinished) {
      onDone();
      return;
    }
    playSound("boot");
    const interval = setInterval(() => {
      setVisibleLines((count) => {
        if (count >= BOOT_LINES.length) {
          clearInterval(interval);
          setTimeout(finish, 500);
          return count;
        }
        return count + 1;
      });
    }, LINE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isFinished, finish, onDone]);

  React.useEffect(() => {
    if (isFinished) {
      return;
    }
    window.addEventListener("pointerdown", finish);
    window.addEventListener("keydown", finish);
    return () => {
      window.removeEventListener("pointerdown", finish);
      window.removeEventListener("keydown", finish);
    };
  }, [isFinished, finish]);

  if (isFinished) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black p-8 font-terminal text-sm text-lagoon">
      {BOOT_LINES.slice(0, visibleLines).map((line) => (
        <p key={line}>{line}</p>
      ))}
      <p className="absolute right-4 bottom-4 text-xs opacity-60">
        {t("boot.skip")}
      </p>
    </div>
  );
}
