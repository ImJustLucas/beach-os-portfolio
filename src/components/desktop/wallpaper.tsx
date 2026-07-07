import { PixelSun } from "./pixel-sun";

export function Wallpaper() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden bg-sunset"
    >
      <PixelSun />
      <div className="absolute top-[53%] right-0 left-0 h-2 rounded-[50%] bg-white/40" />
      <span className="absolute bottom-[18%] left-[6%] text-4xl">🌴</span>
      <span className="absolute right-[10%] bottom-[14%] text-3xl">🛹</span>
    </div>
  );
}
