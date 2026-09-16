"use client";

import { useFrame } from "@react-three/fiber";
import type { RefObject } from "react";
import { Vector3 } from "three";
import { viewState } from "@/lib/view-state";
import { cameraAt, keyframes, sectionIndexAt } from "@/three/timeline";

/** Scratch vectors, reused every frame so the rig allocates nothing. */
const desired = new Vector3();
const lookTarget = new Vector3(...keyframes[0].target);

interface CameraRigProps {
  reducedMotion: boolean;
  /** Wrapper whose opacity is driven by the timeline, so text can take the last section. */
  wrapperRef: RefObject<HTMLDivElement | null>;
}

/**
 * Drives the camera from the scroll position.
 *
 * The pose itself comes from the pure timeline; this only damps towards it, so
 * the choreography stays testable and this file stays about three.js.
 */
export const CameraRig = ({ reducedMotion, wrapperRef }: CameraRigProps) => {
  useFrame((state, delta) => {
    // Reduced motion gets the section's own keyframe with no interpolation:
    // the camera changes when the section does, and never drifts under the reader.
    const pose = reducedMotion ? keyframes[sectionIndexAt(viewState.progress)] : cameraAt(viewState.progress);

    // Exponential damping, so the feel does not change with frame rate.
    const damp = reducedMotion ? 1 : 1 - Math.exp(-5.5 * Math.min(delta, 0.05));

    desired.set(
      pose.position[0] + viewState.pointerX * 0.55,
      pose.position[1] - viewState.pointerY * 0.35,
      pose.position[2],
    );

    state.camera.position.lerp(desired, damp);
    lookTarget.lerp(desired.set(...pose.target), damp);
    state.camera.lookAt(lookTarget);

    const wrapper = wrapperRef.current;
    if (wrapper) wrapper.style.opacity = pose.opacity.toFixed(3);
  });

  return null;
};
