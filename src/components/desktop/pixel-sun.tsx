export function PixelSun() {
  return (
    <div
      aria-hidden="true"
      className="absolute top-[8%] left-[62%] size-14 bg-sun-glow"
      style={{
        boxShadow: [
          "0 -10px 0 -4px var(--color-sun-glow)",
          "0 10px 0 -4px var(--color-sun-glow)",
          "-10px 0 0 -4px var(--color-sun-glow)",
          "10px 0 0 -4px var(--color-sun-glow)",
          "0 0 48px 18px rgb(255 243 196 / 0.55)",
        ].join(", "),
      }}
    />
  );
}
