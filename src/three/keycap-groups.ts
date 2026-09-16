/**
 * Caps grouped by width.
 *
 * One `InstancedMesh` per distinct width rather than one for the whole board:
 * a single mesh would have to scale the spacebar 6.25x on X, which stretches its
 * corner radius into an ellipse. Seven meshes keep every corner identical and
 * still cost far less than 68 draw calls.
 */
import { keys } from "./keyboard-layout";

export interface CapGroup {
  /** Cap width in units. */
  width: number;
  /** Indices into `keys`, so press state stays addressable by a single board-wide array. */
  indices: number[];
}

export const groupKeysByWidth = (widths: readonly number[]): CapGroup[] => {
  const groups = new Map<number, number[]>();

  widths.forEach((width, index) => {
    const bucket = groups.get(width);
    if (bucket) bucket.push(index);
    else groups.set(width, [index]);
  });

  return [...groups.entries()]
    .map(([width, indices]) => ({ width, indices }))
    .sort((a, b) => a.width - b.width);
};

export const capGroups = groupKeysByWidth(keys.map((key) => key.width));
