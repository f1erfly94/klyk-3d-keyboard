import { describe, expect, it } from "vitest";
import {
  cameraAt,
  keyframes,
  progressFromAnchors,
  sectionCount,
  sectionIndexAt,
  sectionWeight,
  smoothstep,
  timelinePosition,
} from "@/three/timeline";

describe("camera timeline", () => {
  it("sits exactly on the first and last keyframe at the ends of the page", () => {
    expect(cameraAt(0).position).toEqual(keyframes[0].position);
    expect(cameraAt(1).position).toEqual(keyframes[sectionCount - 1].position);
  });

  it("lands on each section's own keyframe at its scroll position", () => {
    for (let index = 0; index < sectionCount; index += 1) {
      const pose = cameraAt(index / (sectionCount - 1));
      expect(pose.position[0]).toBeCloseTo(keyframes[index].position[0], 6);
      expect(pose.explode).toBeCloseTo(keyframes[index].explode, 6);
    }
  });

  it("opens the board up only around the anatomy section", () => {
    const anatomy = 2 / (sectionCount - 1);
    expect(cameraAt(0).explode).toBe(0);
    expect(cameraAt(anatomy).explode).toBeCloseTo(1, 6);
    expect(cameraAt(1).explode).toBe(0);
  });

  it("clamps out-of-range progress instead of extrapolating", () => {
    expect(cameraAt(-2).position).toEqual(keyframes[0].position);
    expect(cameraAt(9).position).toEqual(keyframes[sectionCount - 1].position);
  });

  it("eases between keyframes rather than sliding linearly", () => {
    // A quarter of the way into the first section, smoothstep is behind linear.
    const quarter = 0.25 / (sectionCount - 1);
    const linear = keyframes[0].position[2] + (keyframes[1].position[2] - keyframes[0].position[2]) * 0.25;
    expect(cameraAt(quarter).position[2]).toBeGreaterThan(linear);
    expect(smoothstep(0.5)).toBeCloseTo(0.5, 6);
    expect(smoothstep(-1)).toBe(0);
    expect(smoothstep(4)).toBe(1);
  });

  it("reports the section filling the viewport", () => {
    expect(sectionIndexAt(0)).toBe(0);
    expect(sectionIndexAt(1)).toBe(sectionCount - 1);
    expect(sectionIndexAt(2 / (sectionCount - 1))).toBe(2);
  });

  it("weights a section's overlay highest when it is on screen", () => {
    expect(sectionWeight(1 / (sectionCount - 1), 1)).toBeCloseTo(1, 6);
    expect(sectionWeight(0, 1)).toBeCloseTo(0, 6);
    expect(sectionWeight(1, 1)).toBe(0);
  });
});

describe("scroll anchors", () => {
  // Sections of unequal height: the last one is twice as tall as the rest.
  const anchors = [0, 800, 1600, 2400, 3200];

  it("is 0 above the first anchor and maxed out past the last", () => {
    expect(timelinePosition(-50, anchors)).toBe(0);
    expect(timelinePosition(99999, anchors)).toBe(anchors.length - 1);
  });

  it("returns whole numbers exactly on an anchor", () => {
    anchors.forEach((offset, index) => {
      expect(timelinePosition(offset, anchors)).toBeCloseTo(index, 6);
    });
  });

  it("interpolates inside a section", () => {
    expect(timelinePosition(1200, anchors)).toBeCloseTo(1.5, 6);
  });

  it("survives anchors that have not been measured yet", () => {
    expect(progressFromAnchors(500, [])).toBe(0);
    expect(progressFromAnchors(500, [0])).toBe(0);
  });

  it("normalises to the 0..1 progress the scene consumes", () => {
    expect(progressFromAnchors(1600, anchors)).toBeCloseTo(0.5, 6);
  });
});
