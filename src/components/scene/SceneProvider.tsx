"use client";

import dynamic from "next/dynamic";
import { createContext, type ReactNode, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { useMediaQuery } from "@/lib/media";
import { usePageProgress } from "@/lib/view-state";
import { BoardStill } from "./BoardStill";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

/** Which board the visitor is actually looking at. */
export type SceneMode = "still" | "webgl";

interface SceneContextValue {
  mode: SceneMode;
  /** Index of the section filling the viewport, for the header's active link. */
  section: number;
}

const SceneContext = createContext<SceneContextValue>({ mode: "still", section: 0 });

export const useScene = () => useContext(SceneContext);
export const useSceneMode = () => useContext(SceneContext).mode;

let webglSupport: boolean | null = null;

const supportsWebGL = () => {
  if (webglSupport === null) {
    try {
      webglSupport = Boolean(document.createElement("canvas").getContext("webgl2"));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
};

const noopSubscribe = () => () => {};

/**
 * Decides between the WebGL layer and the flat SVG board, and owns the single
 * scroll subscription the page needs.
 *
 * The server always renders the flat board, so the markup a crawler or a
 * no-JavaScript visitor gets still contains the whole keyboard.
 */
export const SceneProvider = ({ children }: { children: ReactNode }) => {
  // Phones get the flat board: a fixed WebGL layer behind five screens of text is
  // the fastest way to turn a landing page into a space heater.
  const compact = useMediaQuery("(max-width: 767px)");
  const hasWebGL = useSyncExternalStore(noopSubscribe, supportsWebGL, () => false);
  const section = usePageProgress();

  // three.js is ~600 KB to parse and its first frame compiles every shader, so the
  // canvas waits for an idle main thread instead of competing with hydration.
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    const start = () => setIdle(true);
    if (typeof window.requestIdleCallback !== "function") {
      const timer = window.setTimeout(start, 300);
      return () => window.clearTimeout(timer);
    }
    const handle = window.requestIdleCallback(start, { timeout: 1600 });
    return () => window.cancelIdleCallback(handle);
  }, []);

  const mode: SceneMode = !compact && hasWebGL ? "webgl" : "still";

  return (
    <SceneContext.Provider value={{ mode, section }}>
      {mode === "webgl" && idle && <SceneCanvas />}

      {/* Wide screen without WebGL: the flat board takes the canvas's place rather
          than appearing inline and pushing the copy around. */}
      {mode === "still" && !compact && (
        <div
          className="pointer-events-none fixed inset-0 z-0 hidden items-center justify-center px-24 md:flex"
          aria-hidden="true"
        >
          <BoardStill className="max-w-4xl opacity-70" />
        </div>
      )}

      {children}
    </SceneContext.Provider>
  );
};
