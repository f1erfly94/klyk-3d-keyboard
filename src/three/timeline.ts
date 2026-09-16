/**
 * Scroll-driven camera timeline.
 *
 * Everything here is pure: the page turns `scrollY` into a 0..1 progress and
 * this module turns that into a camera pose, an explode amount and a canvas
 * opacity. Keeping it free of three.js means the whole choreography is unit
 * testable — the scene only lerps towards whatever these functions return.
 */

export type Vec3 = readonly [number, number, number];

export interface CameraKeyframe {
  position: Vec3;
  target: Vec3;
  /** 0 = assembled board, 1 = fully exploded. */
  explode: number;
  /** Opacity of the canvas layer; the last section hands the page back to text. */
  opacity: number;
}

/** One keyframe per page section, in page order. */
export const keyframes: readonly CameraKeyframe[] = [
  // Hero — the whole board, held right of the text column.
  { position: [-13, 12, 26], target: [-5.5, 2.4, 0], explode: 0, opacity: 1 },
  // Feel — down at cap level, close enough to read the travel of a keypress.
  { position: [-1.5, 3.0, 7.6], target: [1.0, 1.1, -0.5], explode: 0, opacity: 1 },
  // Anatomy — from the side, far enough out that five layers stay readable.
  { position: [11, 9.5, 26], target: [-5.5, 2.6, 0], explode: 1, opacity: 1 },
  // Configurator — high three-quarter, board lifted above the controls.
  { position: [1, 15.5, 22], target: [-3.5, -6.0, 0], explode: 0, opacity: 1 },
  // Order — the board backs off and fades so the pricing text owns the screen.
  { position: [0, 10, 38], target: [0, 0, 0], explode: 0, opacity: 0.1 },
];

export const sectionCount = keyframes.length;

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Classic smoothstep, used so sections ease in and out instead of sliding linearly. */
export const smoothstep = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const lerpVec3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

/**
 * Position in keyframe space: 0 at the top of the page, `sectionCount - 1` at
 * the bottom. With one viewport-tall section per keyframe, whole numbers line
 * up exactly with a section filling the screen.
 */
export const keyframePosition = (progress: number) => clamp01(progress) * (sectionCount - 1);

/** The section currently filling the viewport. */
export const sectionIndexAt = (progress: number) =>
  Math.min(sectionCount - 1, Math.max(0, Math.round(keyframePosition(progress))));

/** Camera pose for a whole-page scroll progress of 0..1. */
export const cameraAt = (progress: number): CameraKeyframe => {
  const t = keyframePosition(progress);
  const index = Math.min(sectionCount - 2, Math.floor(t));
  const eased = smoothstep(t - index);
  const from = keyframes[index];
  const to = keyframes[index + 1];

  return {
    position: lerpVec3(from.position, to.position, eased),
    target: lerpVec3(from.target, to.target, eased),
    explode: lerp(from.explode, to.explode, eased),
    opacity: lerp(from.opacity, to.opacity, eased),
  };
};

/**
 * How strongly a section's own overlay text is showing, 0..1, peaking when the
 * section fills the viewport. Used to fade annotations in and out.
 */
export const sectionWeight = (progress: number, index: number) =>
  clamp01(1 - Math.abs(keyframePosition(progress) - index));

/**
 * Timeline position (0..sectionCount-1) for a scroll offset, given the document
 * offset of each section's top edge.
 *
 * Anchored to the sections themselves rather than to a fraction of the document,
 * so a section that is taller than the viewport — the pricing block, say — does
 * not drag every earlier keyframe out of step with its text.
 */
export const timelinePosition = (scrollY: number, anchors: readonly number[]): number => {
  const last = anchors.length - 1;
  if (last < 1) return 0;
  if (scrollY <= anchors[0]) return 0;
  if (scrollY >= anchors[last]) return last;

  for (let index = 0; index < last; index += 1) {
    if (scrollY < anchors[index + 1]) {
      const span = anchors[index + 1] - anchors[index];
      return span > 0 ? index + (scrollY - anchors[index]) / span : index;
    }
  }

  return last;
};

/** Same thing as the 0..1 progress the scene consumes. */
export const progressFromAnchors = (scrollY: number, anchors: readonly number[]) =>
  anchors.length > 1 ? timelinePosition(scrollY, anchors) / (anchors.length - 1) : 0;
