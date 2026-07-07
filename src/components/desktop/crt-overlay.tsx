import { usePreferences } from "@/stores/preferences-store";

export function CrtOverlay() {
  const crtEnabled = usePreferences((state) => state.crtEnabled);
  if (!crtEnabled) {
    return null;
  }
  return (
    <>
      <div aria-hidden="true" className="crt-scanlines" />
      <div aria-hidden="true" className="crt-vignette" />
    </>
  );
}
