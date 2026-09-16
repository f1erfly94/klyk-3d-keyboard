"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Media query as state.
 *
 * `useSyncExternalStore` rather than an effect: it gives React a server snapshot
 * to hydrate against and subscribes afterwards, so there is no first-render
 * setState and no flash of the wrong branch.
 */
export const useMediaQuery = (query: string) => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
};

export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
