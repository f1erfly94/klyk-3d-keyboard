/**
 * Vertical stack of the board, in keyboard units, with the desk at y = 0.
 *
 * The exploded view in the "Anatomy" section lifts each layer by
 * `EXPLODE_LIFT[layer] * amount`, so these two tables together define both the
 * assembled board and every frame of it coming apart.
 */
import { BOARD_DEPTH_U, BOARD_WIDTH_U } from "./keyboard-layout";

/** Outer shell, a little larger than the key field on every side. */
export const CASE_WIDTH = BOARD_WIDTH_U + 0.6;
export const CASE_DEPTH = BOARD_DEPTH_U + 0.6;
export const CASE_HEIGHT = 0.7;

export const PCB_Y = 0.3;
export const PCB_THICKNESS = 0.06;

export const PLATE_Y = 0.45;
export const PLATE_THICKNESS = 0.05;

/** Switch housing: the little box a cap sits on. */
export const SWITCH_Y = 0.58;
export const SWITCH_SIZE = 0.56;
export const SWITCH_HEIGHT = 0.26;

/** Resting height of a cap's centre, before the per-row sculpt is added. */
export const CAP_Y = 0.85;
export const CAP_HEIGHT = 0.4;
/** Gap between neighbouring caps, in units. */
export const CAP_GAP = 0.08;

/** How far a cap travels when it bottoms out. */
export const CAP_TRAVEL = 0.16;

export type BoardLayer = "caps" | "switches" | "plate" | "pcb" | "case";

/** How far each layer floats up at full explode. */
export const EXPLODE_LIFT: Record<BoardLayer, number> = {
  caps: 2.6,
  switches: 1.7,
  plate: 1.0,
  pcb: 0.45,
  case: 0,
};
