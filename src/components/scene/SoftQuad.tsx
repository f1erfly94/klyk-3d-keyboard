"use client";

import { useEffect, useMemo } from "react";
import { AdditiveBlending, Color, NormalBlending, ShaderMaterial } from "three";

interface SoftQuadProps {
  color: string;
  /** Peak opacity at the centre of the quad. */
  opacity: number;
  /** Higher values pull the falloff tighter to the middle. */
  falloff?: number;
  additive?: boolean;
  position: [number, number, number];
  scale: [number, number];
}

/**
 * A quad that fades out radially — the underglow and the contact shadow.
 *
 * Both effects are one gradient on one polygon. Real contact shadows would mean
 * re-rendering the scene from below on every frame, which is a lot of GPU for a
 * blurred smudge under an object that barely moves.
 */
export const SoftQuad = ({
  color,
  opacity,
  falloff = 2.6,
  additive = false,
  position,
  scale,
}: SoftQuadProps) => {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: additive ? AdditiveBlending : NormalBlending,
        uniforms: {
          uColor: { value: new Color() },
          uOpacity: { value: opacity },
          uFalloff: { value: falloff },
        },
        vertexShader: /* glsl */ `
          varying vec2 vLocal;
          void main() {
            vLocal = position.xy;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          #include <common>

          uniform vec3 uColor;
          uniform float uOpacity;
          uniform float uFalloff;
          varying vec2 vLocal;

          void main() {
            float d = clamp(length(vLocal * 2.0), 0.0, 1.0);
            gl_FragColor = vec4(uColor, pow(1.0 - d, uFalloff) * uOpacity);
            #include <colorspace_fragment>
          }
        `,
      }),
    [additive, falloff, opacity],
  );

  useEffect(() => {
    material.uniforms.uColor.value.set(color);
  }, [color, material]);

  return (
    <mesh material={material} position={position} rotation={[-Math.PI / 2, 0, 0]} scale={[scale[0], scale[1], 1]}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
};
