/**
 * Procedural geometry for the board.
 *
 * There is no GLTF in this project: every part is generated from an extruded
 * rounded rectangle. That keeps the download tiny, makes each part a function of
 * the layout table, and means a change to the spec sheet reshapes the model.
 */
import { BufferGeometry, ExtrudeGeometry, Shape } from "three";
import { CAP_GAP, CAP_HEIGHT } from "./dimensions";

/** Rounded rectangle centred on the origin, in the XY plane. */
export const roundedRectShape = (width: number, depth: number, radius: number) => {
  const limit = Math.min(width, depth) / 2;
  const r = Math.min(radius, limit);
  const x = width / 2;
  const y = depth / 2;

  const shape = new Shape();
  shape.moveTo(-x + r, -y);
  shape.lineTo(x - r, -y);
  shape.quadraticCurveTo(x, -y, x, -y + r);
  shape.lineTo(x, y - r);
  shape.quadraticCurveTo(x, y, x - r, y);
  shape.lineTo(-x + r, y);
  shape.quadraticCurveTo(-x, y, -x, y - r);
  shape.lineTo(-x, -y + r);
  shape.quadraticCurveTo(-x, -y, -x + r, -y);
  return shape;
};

export interface RoundedBoxOptions {
  /** Corner radius on the top-down outline. */
  radius?: number;
  /** Chamfer on the top and bottom edges. */
  bevel?: number;
  /** How much narrower the top is than the bottom, 0..1 — what makes a cap a cap. */
  taper?: number;
  curveSegments?: number;
}

/**
 * Box with rounded corners and chamfered top/bottom edges, standing on the Y axis
 * and centred on the origin.
 */
export const createRoundedBox = (
  width: number,
  height: number,
  depth: number,
  { radius = 0.08, bevel = 0.02, taper = 0, curveSegments = 3 }: RoundedBoxOptions = {},
): BufferGeometry => {
  // The bevel grows the profile back out by `bevel` on every side, so the shape
  // is drawn that much smaller to land on the requested outer dimensions.
  const chamfer = Math.min(bevel, height / 2 - 0.001);
  const shape = roundedRectShape(
    Math.max(width - chamfer * 2, 0.01),
    Math.max(depth - chamfer * 2, 0.01),
    Math.max(radius - chamfer, 0.005),
  );

  const geometry = new ExtrudeGeometry(shape, {
    depth: Math.max(height - chamfer * 2, 0.001),
    bevelEnabled: true,
    bevelThickness: chamfer,
    bevelSize: chamfer,
    bevelSegments: 2,
    curveSegments,
    steps: 1,
  });

  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, -(height / 2 - chamfer), 0);

  if (taper > 0) {
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i += 1) {
      const y = position.getY(i);
      // 0 at the base, 1 at the top.
      const t = Math.min(1, Math.max(0, y / height + 0.5));
      const scale = 1 - taper * t;
      position.setX(i, position.getX(i) * scale);
      position.setZ(i, position.getZ(i) * scale);
    }
    position.needsUpdate = true;
  }

  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  return geometry;
};

/** A keycap of the given width in units. */
export const createKeycapGeometry = (widthU: number) =>
  createRoundedBox(widthU - CAP_GAP, CAP_HEIGHT, 1 - CAP_GAP, {
    radius: 0.1,
    bevel: 0.035,
    taper: 0.12,
  });

/**
 * Hollow frame — the walls of the case, as one extruded shape with a hole in it.
 *
 * A tray case really is hollow, and the exploded view would give away four boxes
 * pretending to be one.
 */
export const createRoundedFrame = (
  outerWidth: number,
  outerDepth: number,
  height: number,
  thickness: number,
  radius = 0.3,
): BufferGeometry => {
  const shape = roundedRectShape(outerWidth, outerDepth, radius);
  shape.holes.push(
    roundedRectShape(
      outerWidth - thickness * 2,
      outerDepth - thickness * 2,
      Math.max(radius - thickness, 0.02),
    ),
  );

  const geometry = new ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
    curveSegments: 4,
    steps: 1,
  });

  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, -height / 2, 0);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  return geometry;
};
