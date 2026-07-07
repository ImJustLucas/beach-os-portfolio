import { createServerFn } from "@tanstack/react-start";

import { SITE } from "@/content/site";
import { parseYoutubeFeed } from "@/lib/youtube-rss";
import type { YoutubeVideo } from "@/lib/youtube-rss";

const MAX_VIDEOS = 12;

export const getLatestVideos = createServerFn({ method: "GET" }).handler(
  async (): Promise<YoutubeVideo[]> => {
    if (!SITE.youtubeChannelId) {
      return [];
    }
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${SITE.youtubeChannelId}`;
    const response = await fetch(feedUrl);
    if (!response.ok) {
      throw new Error(`YouTube RSS responded ${response.status}`);
    }
    return parseYoutubeFeed(await response.text()).slice(0, MAX_VIDEOS);
  },
);
