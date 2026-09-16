"use client";

import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/media";
import { keyframes } from "@/three/timeline";
import { Board } from "./Board";
import { CameraRig } from "./CameraRig";
import { Studio } from "./Studio";

/**
 * The fixed WebGL layer the whole page scrolls over.
 *
 * Loaded through `next/dynamic` from the provider, so three.js never lands in the
 * first JS chunk — a phone or a crawler downloads none of it.
 */
export const SceneCanvas = () => {
  const reducedMotion = usePrefersReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={wrapperRef}
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
      aria-hidden="true"
    >
      <Canvas
        shadows="percentage"
        // Capped at 1.5x: a retina panel at full DPR triples the fragment cost for
        // a difference nobody sees on a scene made of flat-shaded boxes.
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance", toneMappingExposure: 1.35 }}
        camera={{
          fov: 38,
          near: 0.5,
          far: 90,
          position: [...keyframes[0].position] as [number, number, number],
        }}
      >
        <Studio />
        <Board reducedMotion={reducedMotion} />
        <CameraRig reducedMotion={reducedMotion} wrapperRef={wrapperRef} />
      </Canvas>
    </div>
  );
};

export default SceneCanvas;
