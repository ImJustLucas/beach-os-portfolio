import * as React from "react";

const MOBILE_QUERY = "(max-width: 767px)";

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    setIsMobile(mediaQuery.matches);
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}
