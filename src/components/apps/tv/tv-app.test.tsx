import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TvApp } from "./tv-app";

vi.mock("@/server/get-latest-videos", () => ({
  getLatestVideos: vi.fn().mockResolvedValue([
    {
      id: "live001",
      title: "Fresh from the feed",
      thumbnailUrl: "https://i.ytimg.com/vi/live001/hqdefault.jpg",
      publishedAt: "2026-06-01T00:00:00+00:00",
    },
  ]),
}));

describe("TvApp", () => {
  it("renders snapshot immediately then live videos, and lazy-loads the iframe", async () => {
    render(<TvApp />);
    await waitFor(() =>
      expect(screen.getByText("Fresh from the feed")).toBeInTheDocument(),
    );
    expect(document.querySelector("iframe")).toBeNull();
    await userEvent.click(
      screen.getByRole("button", { name: /Fresh from the feed/ }),
    );
    expect(document.querySelector("iframe")).not.toBeNull();
  });
});
