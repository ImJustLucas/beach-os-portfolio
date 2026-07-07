export interface YoutubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
}

function decodeXmlEntities(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

export function parseYoutubeFeed(xml: string): YoutubeVideo[] {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  const videos: YoutubeVideo[] = [];
  for (const entry of entries) {
    const id = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
    const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const thumbnailUrl = entry.match(/<media:thumbnail url="(.*?)"/)?.[1];
    const publishedAt = entry.match(/<published>(.*?)<\/published>/)?.[1];
    if (!id || !title || !thumbnailUrl || !publishedAt) {
      continue;
    }
    videos.push({
      id,
      title: decodeXmlEntities(title),
      thumbnailUrl,
      publishedAt,
    });
  }
  return videos;
}
