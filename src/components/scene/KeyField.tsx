"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  CanvasTexture,
  Color,
  InstancedBufferAttribute,
  InstancedMesh,
  Object3D,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
} from "three";
import { playClick } from "@/lib/click-sound";
import { useConfig } from "@/lib/store";
import { viewState } from "@/lib/view-state";
import { colorwayById } from "@/three/colorways";
import {
  CAP_HEIGHT,
  CAP_TRAVEL,
  CAP_Y,
  EXPLODE_LIFT,
  SWITCH_HEIGHT,
  SWITCH_SIZE,
  SWITCH_Y,
} from "@/three/dimensions";
import { createKeycapGeometry, createRoundedBox } from "@/three/keycap-geometry";
import { capGroups } from "@/three/keycap-groups";
import { keyIndexByCode, keys, ROW_LIFT, ROW_TILT } from "@/three/keyboard-layout";
import { atlasGrid, atlasOffset, createLegendCanvas } from "@/three/legend-atlas";
import { cameraAt } from "@/three/timeline";

/** Spring stiffness of a cap returning to rest. */
const PRESS_SPEED = 26;
/** The idle hint types the brand name so nobody has to guess the board is live. */
const DEMO_WORD = ["KeyK", "KeyL", "KeyY", "KeyK"];
const DEMO_IDLE_MS = 2600;
const DEMO_STEP_MS = 260;

/**
 * Press state for the whole board, and one scratch object used to compose instance
 * matrices. Module scope on purpose: the scene mounts once per page, these are
 * written sixty times a second, and React has no business re-rendering for them.
 */
const press = new Float32Array(keys.length);
const pressTarget = new Float32Array(keys.length);
const dummy = new Object3D();

interface KeyFieldProps {
  reducedMotion: boolean;
}

/**
 * Every cap, legend and switch on the board.
 *
 * Caps are grouped into one `InstancedMesh` per width and legends into a single
 * instanced quad sampling a runtime-generated atlas, so the whole key field is
 * about a dozen draw calls. Press state lives in a plain `Float32Array` indexed
 * exactly like the layout table — a keypress is an array write, never a re-render.
 */
export const KeyField = ({ reducedMotion }: KeyFieldProps) => {
  const capRefs = useRef<(InstancedMesh | null)[]>([]);
  const legendRef = useRef<InstancedMesh>(null);
  const housingRef = useRef<InstancedMesh>(null);
  const stemRef = useRef<InstancedMesh>(null);
  const lastInteraction = useRef(0);
  const demoStep = useRef(0);
  const demoAt = useRef(0);

  const colorwayId = useConfig((state) => state.colorwayId);
  const colorway = colorwayById(colorwayId);

  const capGeometries = useMemo(() => capGroups.map((group) => createKeycapGeometry(group.width)), []);
  const housingGeometry = useMemo(
    () => createRoundedBox(SWITCH_SIZE, SWITCH_HEIGHT, SWITCH_SIZE, { radius: 0.06, bevel: 0.015 }),
    [],
  );
  const stemGeometry = useMemo(() => createRoundedBox(0.22, 0.2, 0.22, { radius: 0.04, bevel: 0.01 }), []);

  const grid = useMemo(() => atlasGrid(keys.length), []);
  const legendGeometry = useMemo(() => new PlaneGeometry(1, 1), []);
  const legendTexture = useMemo(() => {
    const texture = new CanvasTexture(createLegendCanvas(keys.map((key) => key.label)));
    texture.anisotropy = 4;
    return texture;
  }, []);

  const legendMaterial = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uMap: { value: legendTexture },
          uCell: { value: new Vector2(1 / grid.cols, 1 / grid.rows) },
        },
        vertexShader: /* glsl */ `
          attribute vec2 aAtlasOffset;
          attribute vec3 aLegendColor;
          uniform vec2 uCell;
          varying vec2 vAtlasUv;
          varying vec3 vLegendColor;

          void main() {
            // The quad is a unit plane, so its local XY doubles as a UV.
            vAtlasUv = (position.xy + 0.5) * uCell + aAtlasOffset;
            vLegendColor = aLegendColor;
            gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          #include <common>

          uniform sampler2D uMap;
          varying vec2 vAtlasUv;
          varying vec3 vLegendColor;

          void main() {
            float mask = texture2D(uMap, vAtlasUv).a;
            if (mask < 0.02) discard;
            gl_FragColor = vec4(vLegendColor, mask);
            #include <colorspace_fragment>
          }
        `,
      }),
    [grid.cols, grid.rows, legendTexture],
  );

  // Atlas cell per legend instance: fixed for the life of the board.
  useEffect(() => {
    const mesh = legendRef.current;
    if (!mesh) return;
    const offsets = new Float32Array(keys.length * 2);
    keys.forEach((_, index) => {
      const [u, v] = atlasOffset(index, grid);
      offsets[index * 2] = u;
      offsets[index * 2 + 1] = v;
    });
    mesh.geometry.setAttribute("aAtlasOffset", new InstancedBufferAttribute(offsets, 2));
  }, [grid]);

  // Colourway: cap colours, legend tints, switch stems.
  useEffect(() => {
    const color = new Color();

    capGroups.forEach((group, groupIndex) => {
      const mesh = capRefs.current[groupIndex];
      if (!mesh) return;
      group.indices.forEach((keyIndex, instance) => {
        color.set(colorway.cap[keys[keyIndex].role]);
        mesh.setColorAt(instance, color);
      });
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });

    const legend = legendRef.current;
    if (legend) {
      const tints = new Float32Array(keys.length * 3);
      keys.forEach((key, index) => {
        color.set(colorway.legend[key.role]);
        tints[index * 3] = color.r;
        tints[index * 3 + 1] = color.g;
        tints[index * 3 + 2] = color.b;
      });
      legend.geometry.setAttribute("aLegendColor", new InstancedBufferAttribute(tints, 3));
    }

    const stems = stemRef.current;
    if (stems) {
      color.set(colorway.glow);
      for (let index = 0; index < keys.length; index += 1) stems.setColorAt(index, color);
      if (stems.instanceColor) stems.instanceColor.needsUpdate = true;
    }
  }, [colorway]);

  // Switch housings never move relative to the plate, so write their matrices once.
  useEffect(() => {
    const mesh = housingRef.current;
    if (!mesh) return;
    keys.forEach((key, index) => {
      dummy.position.set(key.x, SWITCH_Y, key.z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  // A real keypress drives the matching cap.
  useEffect(() => {
    const isTypingTarget = (node: EventTarget | null) => {
      if (!(node instanceof HTMLElement)) return false;
      return (
        node.isContentEditable ||
        node.tagName === "INPUT" ||
        node.tagName === "TEXTAREA" ||
        node.tagName === "SELECT"
      );
    };

    // Deliberately no preventDefault: Space and the arrows scroll the page, and
    // taking that away to keep the demo tidy would break the page for anyone
    // navigating by keyboard.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || isTypingTarget(event.target)) return;
      const index = keyIndexByCode.get(event.code);
      if (index === undefined) return;
      pressTarget[index] = 1;
      lastInteraction.current = performance.now();
      const { soundEnabled, setLastLabel } = useConfig.getState();
      setLastLabel(keys[index].label || "Space");
      if (soundEnabled) playClick(false);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const index = keyIndexByCode.get(event.code);
      if (index === undefined) return;
      pressTarget[index] = 0;
      if (useConfig.getState().soundEnabled) playClick(true);
    };

    // A key held while the page loses focus never sends keyup, so release everything.
    const releaseAll = () => pressTarget.fill(0);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", releaseAll);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", releaseAll);
    };
  }, []);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const now = performance.now();
    const { explode } = cameraAt(viewState.progress);

    if (!reducedMotion && now - lastInteraction.current > DEMO_IDLE_MS && explode < 0.02) {
      if (now - demoAt.current > DEMO_STEP_MS) {
        demoAt.current = now;
        const index = keyIndexByCode.get(DEMO_WORD[demoStep.current % DEMO_WORD.length]);
        demoStep.current += 1;
        if (index !== undefined) {
          pressTarget[index] = 1;
          window.setTimeout(() => {
            pressTarget[index] = 0;
          }, 130);
        }
      }
    }

    const capLift = EXPLODE_LIFT.caps * explode;
    const switchLift = EXPLODE_LIFT.switches * explode;
    const step = Math.min(1, delta * PRESS_SPEED);

    for (let index = 0; index < press.length; index += 1) {
      press[index] += (pressTarget[index] - press[index]) * step;
    }

    capGroups.forEach((group, groupIndex) => {
      const mesh = capRefs.current[groupIndex];
      if (!mesh) return;
      group.indices.forEach((keyIndex, instance) => {
        const key = keys[keyIndex];
        dummy.position.set(
          key.x,
          CAP_Y + ROW_LIFT[key.row] + capLift - press[keyIndex] * CAP_TRAVEL,
          key.z,
        );
        dummy.rotation.set(ROW_TILT[key.row], 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(instance, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    });

    const legend = legendRef.current;
    if (legend) {
      dummy.scale.setScalar(0.62);
      keys.forEach((key, index) => {
        dummy.position.set(
          key.x,
          CAP_Y + ROW_LIFT[key.row] + CAP_HEIGHT / 2 + 0.02 + capLift - press[index] * CAP_TRAVEL,
          key.z,
        );
        dummy.rotation.set(-Math.PI / 2 + ROW_TILT[key.row], 0, 0);
        dummy.updateMatrix();
        legend.setMatrixAt(index, dummy.matrix);
      });
      dummy.scale.setScalar(1);
      legend.instanceMatrix.needsUpdate = true;
    }

    const housings = housingRef.current;
    if (housings) housings.position.y = switchLift;

    const stems = stemRef.current;
    if (stems) {
      keys.forEach((key, index) => {
        dummy.position.set(
          key.x,
          SWITCH_Y + SWITCH_HEIGHT / 2 + switchLift - press[index] * CAP_TRAVEL,
          key.z,
        );
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        stems.setMatrixAt(index, dummy.matrix);
      });
      stems.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {capGroups.map((group, groupIndex) => (
        <instancedMesh
          key={group.width}
          ref={(mesh) => {
            capRefs.current[groupIndex] = mesh;
          }}
          args={[capGeometries[groupIndex], undefined, group.indices.length]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial roughness={0.58} metalness={0.02} />
        </instancedMesh>
      ))}

      <instancedMesh ref={legendRef} args={[legendGeometry, legendMaterial, keys.length]} />

      <instancedMesh ref={housingRef} args={[housingGeometry, undefined, keys.length]}>
        <meshStandardMaterial color="#24282d" roughness={0.75} metalness={0.05} />
      </instancedMesh>

      <instancedMesh ref={stemRef} args={[stemGeometry, undefined, keys.length]}>
        <meshStandardMaterial roughness={0.42} metalness={0.1} />
      </instancedMesh>
    </group>
  );
};
