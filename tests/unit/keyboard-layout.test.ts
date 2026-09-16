import { describe, expect, it } from "vitest";
import {
  BOARD_DEPTH_U,
  BOARD_WIDTH_U,
  keyIndexByCode,
  keys,
  rowCount,
  rowWidth,
} from "@/three/keyboard-layout";

describe("keyboard layout", () => {
  it("is a 65% board: every row adds up to the same width", () => {
    for (let row = 0; row < rowCount; row += 1) {
      expect(rowWidth(row)).toBeCloseTo(BOARD_WIDTH_U, 6);
    }
  });

  it("has 68 keys", () => {
    expect(keys).toHaveLength(68);
  });

  it("gives every key a unique code", () => {
    expect(new Set(keys.map((key) => key.code)).size).toBe(keys.length);
  });

  it("maps a code back to its own entry", () => {
    const index = keyIndexByCode.get("KeyF");
    expect(index).toBeDefined();
    expect(keys[index as number].label).toBe("F");
  });

  it("keeps every cap inside the board footprint", () => {
    for (const key of keys) {
      expect(Math.abs(key.x) + key.width / 2).toBeLessThanOrEqual(BOARD_WIDTH_U / 2 + 1e-9);
      expect(Math.abs(key.z) + 0.5).toBeLessThanOrEqual(BOARD_DEPTH_U / 2 + 1e-9);
    }
  });

  it("places the spacebar on the bottom row, centred under the alphas", () => {
    const space = keys.find((key) => key.code === "Space");
    expect(space?.row).toBe(rowCount - 1);
    expect(space?.width).toBe(6.25);
  });
});
