import { useMemo } from "react";
import { useSearch } from "wouter";
import { parseLocalDateTime, resolveDemoNow } from "@/lib/demo-clock";

const SESSION_KEY = "tripcanvas:demo-now";

function rememberedOverride(fromUrl: string | null): string | null {
  try {
    if (fromUrl && parseLocalDateTime(fromUrl)) {
      window.sessionStorage.setItem(SESSION_KEY, fromUrl);
      return fromUrl;
    }
    return window.sessionStorage.getItem(SESSION_KEY);
  } catch {
    return fromUrl;
  }
}

/** The demo's "now". A `?now=` override is remembered for the tab so in-app links keep it. */
export function useDemoNow(): Date {
  const search = useSearch();
  return useMemo(() => {
    const fromUrl = new URLSearchParams(search).get("now");
    return resolveDemoNow(rememberedOverride(fromUrl));
  }, [search]);
}
