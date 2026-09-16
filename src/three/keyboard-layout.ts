/**
 * The KLYK-65 board described as data.
 *
 * This module is the single source of truth for the 3D scene *and* for the
 * "press a real key" interaction: every cap is placed from this table, so the
 * index of a `KeyboardEvent.code` here is also its instance index in the
 * `InstancedMesh` that renders the caps.
 *
 * Units are keyboard units ("u"): 1u is one alpha key, the classic 19.05 mm pitch.
 */

/** Cap roles drive the colorway — alphas, modifiers, and the single accent cap. */
export type KeyRole = "alpha" | "modifier" | "accent";

export interface KeyDefinition {
  /** `KeyboardEvent.code`, or a synthetic id for caps the browser never reports (`Fn`). */
  code: string;
  /** Legend printed on the cap. */
  label: string;
  /** Width in keyboard units. */
  width: number;
  role: KeyRole;
}

export interface PlacedKey extends KeyDefinition {
  /** Row index, 0 = number row. */
  row: number;
  /** Centre of the cap on the X axis, in units, relative to the middle of the board. */
  x: number;
  /** Centre of the cap on the Z axis, in units, relative to the middle of the board. */
  z: number;
}

const alpha = (code: string, label: string, width = 1): KeyDefinition => ({
  code,
  label,
  width,
  role: "alpha",
});

const mod = (code: string, label: string, width = 1): KeyDefinition => ({
  code,
  label,
  width,
  role: "modifier",
});

/** Rows top to bottom. Every row adds up to `BOARD_WIDTH_U`. */
const rows: KeyDefinition[][] = [
  [
    { code: "Escape", label: "Esc", width: 1, role: "accent" },
    alpha("Digit1", "1"),
    alpha("Digit2", "2"),
    alpha("Digit3", "3"),
    alpha("Digit4", "4"),
    alpha("Digit5", "5"),
    alpha("Digit6", "6"),
    alpha("Digit7", "7"),
    alpha("Digit8", "8"),
    alpha("Digit9", "9"),
    alpha("Digit0", "0"),
    alpha("Minus", "-"),
    alpha("Equal", "="),
    mod("Backspace", "Bksp", 2),
    mod("Delete", "Del"),
  ],
  [
    mod("Tab", "Tab", 1.5),
    alpha("KeyQ", "Q"),
    alpha("KeyW", "W"),
    alpha("KeyE", "E"),
    alpha("KeyR", "R"),
    alpha("KeyT", "T"),
    alpha("KeyY", "Y"),
    alpha("KeyU", "U"),
    alpha("KeyI", "I"),
    alpha("KeyO", "O"),
    alpha("KeyP", "P"),
    alpha("BracketLeft", "["),
    alpha("BracketRight", "]"),
    alpha("Backslash", "\\", 1.5),
    mod("Home", "Home"),
  ],
  [
    mod("CapsLock", "Caps", 1.75),
    alpha("KeyA", "A"),
    alpha("KeyS", "S"),
    alpha("KeyD", "D"),
    alpha("KeyF", "F"),
    alpha("KeyG", "G"),
    alpha("KeyH", "H"),
    alpha("KeyJ", "J"),
    alpha("KeyK", "K"),
    alpha("KeyL", "L"),
    alpha("Semicolon", ";"),
    alpha("Quote", "'"),
    mod("Enter", "Enter", 2.25),
    mod("PageUp", "PgUp"),
  ],
  [
    mod("ShiftLeft", "Shift", 2.25),
    alpha("KeyZ", "Z"),
    alpha("KeyX", "X"),
    alpha("KeyC", "C"),
    alpha("KeyV", "V"),
    alpha("KeyB", "B"),
    alpha("KeyN", "N"),
    alpha("KeyM", "M"),
    alpha("Comma", ","),
    alpha("Period", "."),
    alpha("Slash", "/"),
    mod("ShiftRight", "Shift", 1.75),
    mod("ArrowUp", "↑"),
    mod("PageDown", "PgDn"),
  ],
  [
    mod("ControlLeft", "Ctrl", 1.25),
    mod("MetaLeft", "Cmd", 1.25),
    mod("AltLeft", "Alt", 1.25),
    alpha("Space", "", 6.25),
    mod("AltRight", "Alt"),
    // The browser never reports a Fn key, so this cap is decorative by design.
    mod("Fn", "Fn"),
    mod("ControlRight", "Ctrl"),
    mod("ArrowLeft", "←"),
    mod("ArrowDown", "↓"),
    mod("ArrowRight", "→"),
  ],
];

/** Width of the board in units — a 65% board is 16u wide. */
export const BOARD_WIDTH_U = 16;
/** Depth of the board in units, one unit per row. */
export const BOARD_DEPTH_U = rows.length;

/**
 * Sculpted-profile row heights: the home row sits lowest and the rows step up
 * towards the user, the way OEM/Cherry caps do. Purely cosmetic, but it is what
 * stops the board reading as a flat grid of boxes.
 */
export const ROW_LIFT = [0.1, 0.035, 0, 0.035, 0.075];
/** Row tilt in radians, same idea as `ROW_LIFT`. */
export const ROW_TILT = [-0.06, -0.025, 0, 0.03, 0.06];

const placeRow = (row: KeyDefinition[], rowIndex: number): PlacedKey[] => {
  let cursor = 0;
  return row.map((key) => {
    const x = cursor + key.width / 2 - BOARD_WIDTH_U / 2;
    cursor += key.width;
    return {
      ...key,
      row: rowIndex,
      x,
      z: rowIndex + 0.5 - BOARD_DEPTH_U / 2,
    };
  });
};

/** Every cap of the board, in a stable order, flattened row by row. */
export const keys: PlacedKey[] = rows.flatMap(placeRow);

/** `KeyboardEvent.code` → index into {@link keys}. */
export const keyIndexByCode: ReadonlyMap<string, number> = new Map(
  keys.map((key, index) => [key.code, index]),
);

/** Total width of a row, used by the tests to keep the table honest. */
export const rowWidth = (rowIndex: number) =>
  rows[rowIndex].reduce((total, key) => total + key.width, 0);

export const rowCount = rows.length;
