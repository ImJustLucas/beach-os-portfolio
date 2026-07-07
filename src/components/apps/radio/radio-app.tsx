import * as React from "react";

import { RADIO_TRACKS } from "@/content/radio";
import { useTranslation } from "@/i18n/use-translation";

export function RadioApp() {
  const { t } = useTranslation();
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [trackIndex, setTrackIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const track = RADIO_TRACKS[trackIndex];

  const play = async () => {
    try {
      await audioRef.current?.play();
      setIsPlaying(true);
      setHasError(false);
    } catch {
      setHasError(true);
      setIsPlaying(false);
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const next = () => {
    setTrackIndex((index) => (index + 1) % RADIO_TRACKS.length);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-3 p-4 font-terminal text-xs">
      <audio ref={audioRef} src={track.src} onEnded={next} />
      <p className="border-2 border-ink bg-ink px-2 py-1 font-bold text-sun">
        ♪ {track.title} {isPlaying && <span aria-hidden="true">▂▃▅▃▂</span>}
      </p>
      {hasError && <p role="alert">📻 … no signal (fichier audio manquant)</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={isPlaying ? pause : play}
          className="border-2 border-ink bg-sun px-2 py-1 font-bold shadow-hard-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
        >
          {isPlaying ? t("radio.pause") : t("radio.play")}
        </button>
        <button
          type="button"
          onClick={next}
          className="border-2 border-ink bg-lagoon px-2 py-1 font-bold text-white shadow-hard-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
        >
          {t("radio.next")}
        </button>
      </div>
    </div>
  );
}
