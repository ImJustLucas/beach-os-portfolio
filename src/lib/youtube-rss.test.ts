import { describe, expect, it } from "vitest";

import { parseYoutubeFeed } from "./youtube-rss";

const SAMPLE_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
  <title>ImJustLucas</title>
  <entry>
    <yt:videoId>abc123XYZ_-</yt:videoId>
    <title>Building a karaoke app in 24h</title>
    <published>2026-05-01T10:00:00+00:00</published>
    <media:group>
      <media:thumbnail url="https://i2.ytimg.com/vi/abc123XYZ_-/hqdefault.jpg" width="480" height="360"/>
    </media:group>
  </entry>
  <entry>
    <yt:videoId>def456</yt:videoId>
    <title>Surf &amp; code</title>
    <published>2026-04-01T10:00:00+00:00</published>
    <media:group>
      <media:thumbnail url="https://i2.ytimg.com/vi/def456/hqdefault.jpg" width="480" height="360"/>
    </media:group>
  </entry>
</feed>`;

describe("parseYoutubeFeed", () => {
  it("extracts id, title, thumbnail and date for each entry", () => {
    const videos = parseYoutubeFeed(SAMPLE_FEED);
    expect(videos).toHaveLength(2);
    expect(videos[0]).toEqual({
      id: "abc123XYZ_-",
      title: "Building a karaoke app in 24h",
      thumbnailUrl: "https://i2.ytimg.com/vi/abc123XYZ_-/hqdefault.jpg",
      publishedAt: "2026-05-01T10:00:00+00:00",
    });
  });

  it("decodes XML entities in titles", () => {
    const videos = parseYoutubeFeed(SAMPLE_FEED);
    expect(videos[1].title).toBe("Surf & code");
  });

  it("returns an empty array for garbage input", () => {
    expect(parseYoutubeFeed("not xml at all")).toEqual([]);
  });
});
