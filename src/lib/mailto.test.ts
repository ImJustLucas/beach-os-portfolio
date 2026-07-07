import { describe, expect, it } from "vitest";
import { buildMailtoHref } from "./mailto";

describe("buildMailtoHref", () => {
  it("builds an encoded mailto with subject and body", () => {
    const href = buildMailtoHref({
      to: "lucas@example.com",
      subject: "Postcard from Beach OS",
      body: "Hello Lucas!\nNice site & sea",
    });
    expect(href).toBe(
      "mailto:lucas@example.com?subject=Postcard%20from%20Beach%20OS&body=Hello%20Lucas%21%0ANice%20site%20%26%20sea",
    );
  });
});
