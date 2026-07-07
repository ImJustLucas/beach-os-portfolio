import * as React from "react";

import snapshot from "@/content/videos-snapshot.json";
import { useTranslation } from "@/i18n/use-translation";
import type { YoutubeVideo } from "@/lib/youtube-rss";
import { getLatestVideos } from "@/server/get-latest-videos";

export function TvApp() {
  const { t } = useTranslation();
  const [videos, setVideos] = React.useState<YoutubeVideo[]>(
    snapshot as YoutubeVideo[],
  );
  const [playingId, setPlayingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    getLatestVideos()
      .then((liveVideos) => {
        if (liveVideos.length > 0) {
          setVideos(liveVideos);
        }
      })
      .catch((error: unknown) => {
        console.warn("BEACH-TV: falling back to snapshot", error);
      });
  }, []);

  return (
    <div className="space-y-3 p-4">
      <p className="font-terminal text-xs">{t("tv.watch")}</p>
      <ul className="grid grid-cols-2 gap-3">
        {videos.map((video) => (
          <li
            key={video.id}
            className="border-2 border-ink bg-black shadow-hard-sm"
          >
            {playingId === video.id ? (
              <iframe
                title={video.title}
                src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full"
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlayingId(video.id)}
                className="group relative block w-full"
                aria-label={video.title}
              >
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  loading="lazy"
                  className="aspect-video w-full object-cover opacity-90 group-hover:opacity-100"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 grid place-items-center font-pixel text-2xl text-cream drop-shadow"
                >
                  ▸
                </span>
                <span className="block truncate bg-cream p-1 font-terminal text-[10px] font-bold text-ink">
                  {video.title}
                </span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
