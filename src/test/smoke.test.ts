import { describe, expect, it } from "vitest";

describe("vitest setup", () => {
  it("runs with jsdom", () => {
    expect(typeof document).toBe("object");
  });
});
