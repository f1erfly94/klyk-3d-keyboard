import { describe, expect, it } from "vitest";
import { CAP_GAP, CAP_HEIGHT } from "@/three/dimensions";
import { createKeycapGeometry, createRoundedBox, createRoundedFrame } from "@/three/keycap-geometry";
import { capGroups, groupKeysByWidth } from "@/three/keycap-groups";
import { keys } from "@/three/keyboard-layout";

const size = (geometry: ReturnType<typeof createRoundedBox>) => {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  return {
    width: box.max.x - box.min.x,
    height: box.max.y - box.min.y,
    depth: box.max.z - box.min.z,
  };
};

describe("procedural geometry", () => {
  it("never lets a cap grow past its own unit, so neighbours cannot touch", () => {
    // The chamfer and the taper both pull the widest point in slightly, so the
    // nominal footprint is a ceiling rather than an exact figure.
    const spacebar = size(createKeycapGeometry(6.25));
    expect(spacebar.width).toBeLessThanOrEqual(6.25 - CAP_GAP);
    expect(spacebar.width).toBeGreaterThan(6.25 - CAP_GAP - 0.06);
    expect(spacebar.depth).toBeLessThanOrEqual(1 - CAP_GAP);
    expect(spacebar.depth).toBeGreaterThan(1 - CAP_GAP - 0.06);
    expect(spacebar.height).toBeCloseTo(CAP_HEIGHT, 2);
  });

  it("stands centred on the origin, so a cap's Y is its own centre", () => {
    const geometry = createKeycapGeometry(1);
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    expect(box.min.y).toBeCloseTo(-CAP_HEIGHT / 2, 2);
    expect(box.max.y).toBeCloseTo(CAP_HEIGHT / 2, 2);
  });

  it("tapers a cap: the top face is narrower than the base", () => {
    const geometry = createKeycapGeometry(1);
    const position = geometry.attributes.position;
    let topSpan = 0;
    let baseSpan = 0;

    for (let i = 0; i < position.count; i += 1) {
      const span = Math.abs(position.getX(i));
      if (position.getY(i) > CAP_HEIGHT / 2 - 0.01) topSpan = Math.max(topSpan, span);
      if (position.getY(i) < -CAP_HEIGHT / 2 + 0.01) baseSpan = Math.max(baseSpan, span);
    }

    expect(topSpan).toBeGreaterThan(0);
    expect(topSpan).toBeLessThan(baseSpan);
  });

  it("makes the case walls hollow", () => {
    const frame = createRoundedFrame(10, 6, 0.5, 0.25);
    const outer = size(frame);
    expect(outer.width).toBeCloseTo(10, 2);
    expect(outer.depth).toBeCloseTo(6, 2);
    expect(outer.height).toBeCloseTo(0.5, 2);
    // A solid slab of this footprint would need far fewer vertices than a ring.
    expect(frame.attributes.position.count).toBeGreaterThan(64);
  });
});

describe("cap groups", () => {
  it("covers every key exactly once", () => {
    const covered = capGroups.flatMap((group) => group.indices).sort((a, b) => a - b);
    expect(covered).toEqual(keys.map((_, index) => index));
  });

  it("puts each key in the group matching its own width", () => {
    for (const group of capGroups) {
      for (const index of group.indices) {
        expect(keys[index].width).toBe(group.width);
      }
    }
  });

  it("orders groups by width", () => {
    const widths = capGroups.map((group) => group.width);
    expect([...widths].sort((a, b) => a - b)).toEqual(widths);
  });

  it("collapses repeated widths into one group", () => {
    expect(groupKeysByWidth([1, 2, 1, 1])).toEqual([
      { width: 1, indices: [0, 2, 3] },
      { width: 2, indices: [1] },
    ]);
  });
});
