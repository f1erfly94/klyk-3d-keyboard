"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import {
  DoubleSide,
  Color,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  type WebGLRenderer,
} from "three";

/** One emissive panel of the studio: colour, brightness, size and where it hangs. */
interface Panel {
  color: string;
  intensity: number;
  position: [number, number, number];
  scale: [number, number];
}

const panels: readonly Panel[] = [
  // Key panel, long and low: the highlight that runs across the whole case.
  { color: "#ffffff", intensity: 4, position: [0, 9, 7], scale: [18, 7] },
  // Cold fill from the right.
  { color: "#93b4e6", intensity: 2, position: [11, 5, 3], scale: [9, 7] },
  // Brand-coloured rim from behind left — the lime edge along the case.
  { color: "#b7e653", intensity: 3.4, position: [-11, 6, -7], scale: [8, 9] },
  // Soft bounce from below, so the underside is not a black void.
  { color: "#ffffff", intensity: 0.9, position: [0, -5, 4], scale: [15, 5] },
];

/**
 * Builds the environment map in the browser from four emissive panels.
 *
 * This is what a light-panel helper does under the hood. Doing it here keeps the
 * HDRI loaders (`RGBELoader`, `EXRLoader`, gain-map decoding) out of the bundle
 * entirely: the page never loads an HDRI, so it should never ship the code that
 * could — that import chain alone was a third of the 3D payload.
 */
const buildStudioEnvironment = (gl: WebGLRenderer) => {
  const generator = new PMREMGenerator(gl);
  const studio = new Scene();
  // A dark room, so reflections have somewhere to fall off to.
  studio.background = new Color(0.015, 0.018, 0.022);

  const geometry = new PlaneGeometry(1, 1);
  const materials = panels.map((panel) => {
    // Values above 1 survive: the map is prefiltered into a half-float target.
    const color = new Color(panel.color).multiplyScalar(panel.intensity);
    // Double-sided: lookAt aims the panel's front at the origin, and the prefilter
    // camera sits at the origin — a back-faced panel would be culled into darkness.
    const material = new MeshBasicMaterial({ color, side: DoubleSide, toneMapped: false });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(...panel.position);
    mesh.scale.set(panel.scale[0], panel.scale[1], 1);
    mesh.lookAt(0, 0, 0);
    studio.add(mesh);
    return material;
  });

  const target = generator.fromScene(studio, 0.05);
  generator.dispose();

  return {
    texture: target.texture,
    dispose: () => {
      target.dispose();
      geometry.dispose();
      materials.forEach((material) => material.dispose());
    },
  };
};

/** Studio lighting: the generated environment plus one shadow-casting key light. */
export const Studio = () => {
  const gl = useThree((state) => state.gl);
  const environment = useMemo(() => buildStudioEnvironment(gl), [gl]);

  useEffect(() => environment.dispose, [environment]);

  return (
    <>
      <primitive object={environment.texture} attach="environment" />

      <ambientLight intensity={0.5} />

      <directionalLight
        position={[7, 12, 6]}
        intensity={2.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0012}
        shadow-normalBias={0.02}
      >
        <orthographicCamera attach="shadow-camera" args={[-14, 14, 8, -8, 1, 40]} />
      </directionalLight>
    </>
  );
};
