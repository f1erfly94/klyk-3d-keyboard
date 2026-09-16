/**
 * Keycap legends, drawn at runtime into a single canvas atlas.
 *
 * Every legend is one cell of one texture, so all 68 of them render as a single
 * instanced draw call — and the project still ships without a font file, an
 * image or a 3D model in `public/`. Glyphs are drawn white on transparent and
 * tinted per instance, which is why switching colourway costs an attribute
 * update instead of a texture rebuild.
 */

export interface AtlasGrid {
  cols: number;
  rows: number;
}

/** Smallest square-ish grid that fits `count` cells. */
export const atlasGrid = (count: number): AtlasGrid => {
  const cols = Math.ceil(Math.sqrt(Math.max(1, count)));
  const rows = Math.ceil(Math.max(1, count) / cols);
  return { cols, rows };
};

/**
 * UV offset of a cell.
 *
 * Cells are drawn top-to-bottom on the canvas while UV space runs bottom-to-top
 * (three flips canvas textures on upload), so the row is mirrored here.
 */
export const atlasOffset = (index: number, grid: AtlasGrid): [number, number] => {
  const col = index % grid.cols;
  const row = Math.floor(index / grid.cols);
  return [col / grid.cols, 1 - (row + 1) / grid.rows];
};

const CELL_PX = 128;
const FONT_STACK = 'ui-monospace, "Cascadia Mono", "SF Mono", Consolas, "Liberation Mono", monospace';

/** Draws one legend centred in its cell, shrinking the type until it fits. */
const drawLegend = (
  context: CanvasRenderingContext2D,
  label: string,
  x: number,
  y: number,
) => {
  if (!label) return;

  const padding = CELL_PX * 0.18;
  let size = CELL_PX * 0.52;
  context.textAlign = "center";
  context.textBaseline = "middle";

  do {
    context.font = `600 ${size}px ${FONT_STACK}`;
    if (context.measureText(label).width <= CELL_PX - padding * 2) break;
    size -= 4;
  } while (size > 12);

  context.fillStyle = "#ffffff";
  context.fillText(label, x + CELL_PX / 2, y + CELL_PX / 2 + size * 0.04);
};

/**
 * Builds the atlas canvas. Browser only — the scene that uses it never renders
 * on the server.
 */
export const createLegendCanvas = (labels: readonly string[]): HTMLCanvasElement => {
  const grid = atlasGrid(labels.length);
  const canvas = document.createElement("canvas");
  canvas.width = grid.cols * CELL_PX;
  canvas.height = grid.rows * CELL_PX;

  const context = canvas.getContext("2d");
  if (!context) return canvas;

  labels.forEach((label, index) => {
    const col = index % grid.cols;
    const row = Math.floor(index / grid.cols);
    drawLegend(context, label, col * CELL_PX, row * CELL_PX);
  });

  return canvas;
};
