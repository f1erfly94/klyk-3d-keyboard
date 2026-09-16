import { describe, expect, it } from "vitest";
import { atlasGrid, atlasOffset } from "@/three/legend-atlas";
import { keys } from "@/three/keyboard-layout";

describe("legend atlas", () => {
  it("picks a grid big enough for every legend", () => {
    const grid = atlasGrid(keys.length);
    expect(grid.cols * grid.rows).toBeGreaterThanOrEqual(keys.length);
    expect((grid.cols - 1) * grid.rows).toBeLessThan(keys.length);
  });

  it("puts the first cell at the top-left of the canvas", () => {
    const grid = { cols: 4, rows: 4 };
    // Top-left on the canvas is the top of UV space, which runs bottom-up.
    expect(atlasOffset(0, grid)).toEqual([0, 0.75]);
  });

  it("wraps to the next row after the last column", () => {
    const grid = { cols: 4, rows: 4 };
    expect(atlasOffset(3, grid)).toEqual([0.75, 0.75]);
    expect(atlasOffset(4, grid)).toEqual([0, 0.5]);
  });

  it("keeps every cell inside the texture", () => {
    const grid = atlasGrid(keys.length);
    keys.forEach((_, index) => {
      const [u, v] = atlasOffset(index, grid);
      expect(u).toBeGreaterThanOrEqual(0);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(u + 1 / grid.cols).toBeLessThanOrEqual(1 + 1e-9);
      expect(v + 1 / grid.rows).toBeLessThanOrEqual(1 + 1e-9);
    });
  });
});
