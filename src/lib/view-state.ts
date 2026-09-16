"use client";

import { useEffect, useState } from "react";
import { progressFromAnchors, sectionIndexAt } from "@/three/timeline";

/**
 * Scroll and pointer position, kept outside React on purpose.
 *
 * The 3D scene reads these every frame from `useFrame`; routing them through
 * state would re-render the tree sixty times a second for values no component
 * actually renders. The section index *is* state, because the DOM does render it —
 * it just changes a handful of times per page.
 */
export const viewState = {
  progress: 0,
  /** Pointer position as -1..1 across the viewport, for the parallax sway. */
  pointerX: 0,
  pointerY: 0,
};

/** Tracks scroll position and returns the section currently filling the viewport. */
export const usePageProgress = () => {
  const [section, setSection] = useState(0);

  useEffect(() => {
    let frame = 0;
    let anchors: number[] = [];

    // Where each section starts, measured once per layout change rather than per frame.
    const measure = () => {
      anchors = [...document.querySelectorAll<HTMLElement>('[data-timeline-section]')].map(
        (element) => element.offsetTop,
      );
    };

    const read = () => {
      frame = 0;
      viewState.progress = progressFromAnchors(window.scrollY, anchors);
      setSection(sectionIndexAt(viewState.progress));
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(read);
    };

    const remeasure = () => {
      measure();
      schedule();
    };

    const trackPointer = (event: PointerEvent) => {
      viewState.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      viewState.pointerY = (event.clientY / window.innerHeight) * 2 - 1;
    };

    measure();
    read();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    window.addEventListener("pointermove", trackPointer, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("pointermove", trackPointer);
    };
  }, []);

  return section;
};
