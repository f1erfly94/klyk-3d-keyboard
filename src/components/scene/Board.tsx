"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, Mesh } from "three";
import { useConfig } from "@/lib/store";
import { viewState } from "@/lib/view-state";
import { type CaseMaterial, caseMaterialById, colorwayById } from "@/three/colorways";
import {
  CASE_DEPTH,
  CASE_HEIGHT,
  CASE_WIDTH,
  EXPLODE_LIFT,
  PCB_THICKNESS,
  PCB_Y,
  PLATE_THICKNESS,
  PLATE_Y,
} from "@/three/dimensions";
import { BOARD_DEPTH_U, BOARD_WIDTH_U } from "@/three/keyboard-layout";
import { createRoundedBox, createRoundedFrame } from "@/three/keycap-geometry";
import { cameraAt } from "@/three/timeline";
import { KeyField } from "./KeyField";
import { SoftQuad } from "./SoftQuad";

const TRAY_HEIGHT = 0.18;
const WALL_THICKNESS = 0.25;

/**
 * Anodised aluminium needs no clearcoat, and the physical material compiles a
 * noticeably heavier shader than the standard one — so the default case does not
 * pay for a lacquer layer it never uses.
 */
const CaseMaterial = ({ shell }: { shell: CaseMaterial }) =>
  shell.clearcoat > 0 ? (
    <meshPhysicalMaterial
      color={shell.color}
      metalness={shell.metalness}
      roughness={shell.roughness}
      clearcoat={shell.clearcoat}
      transparent={shell.opacity < 1}
      opacity={shell.opacity}
    />
  ) : (
    <meshStandardMaterial
      color={shell.color}
      metalness={shell.metalness}
      roughness={shell.roughness}
      transparent={shell.opacity < 1}
      opacity={shell.opacity}
    />
  );

interface BoardProps {
  reducedMotion: boolean;
}

/**
 * The board: case, internals and key field.
 *
 * Layers are ordinary meshes whose Y comes from the scroll timeline, so the
 * exploded view in the Anatomy section is the same model, not a second scene.
 */
export const Board = ({ reducedMotion }: BoardProps) => {
  const swayRef = useRef<Group>(null);
  const plateRef = useRef<Mesh>(null);
  const pcbRef = useRef<Mesh>(null);

  const caseId = useConfig((state) => state.caseId);
  const colorwayId = useConfig((state) => state.colorwayId);
  const shell = caseMaterialById(caseId);
  const colorway = colorwayById(colorwayId);

  const trayGeometry = useMemo(
    () => createRoundedBox(CASE_WIDTH, TRAY_HEIGHT, CASE_DEPTH, { radius: 0.34, bevel: 0.05 }),
    [],
  );
  const wallGeometry = useMemo(
    () => createRoundedFrame(CASE_WIDTH, CASE_DEPTH, CASE_HEIGHT - TRAY_HEIGHT, WALL_THICKNESS, 0.34),
    [],
  );
  const plateGeometry = useMemo(
    () =>
      createRoundedBox(BOARD_WIDTH_U + 0.08, PLATE_THICKNESS, BOARD_DEPTH_U + 0.08, {
        radius: 0.12,
        bevel: 0.012,
      }),
    [],
  );
  const pcbGeometry = useMemo(
    () =>
      createRoundedBox(BOARD_WIDTH_U - 0.1, PCB_THICKNESS, BOARD_DEPTH_U - 0.1, {
        radius: 0.12,
        bevel: 0.012,
      }),
    [],
  );

  useFrame((state) => {
    const { explode } = cameraAt(viewState.progress);

    if (plateRef.current) plateRef.current.position.y = PLATE_Y + EXPLODE_LIFT.plate * explode;
    if (pcbRef.current) pcbRef.current.position.y = PCB_Y + EXPLODE_LIFT.pcb * explode;

    const sway = swayRef.current;
    if (sway && !reducedMotion) {
      const time = state.clock.elapsedTime;
      sway.rotation.y = Math.sin(time * 0.22) * 0.04 + viewState.pointerX * 0.1;
      sway.rotation.x = Math.sin(time * 0.31) * 0.012 + viewState.pointerY * 0.035;
    }
  });

  return (
    <group ref={swayRef}>
      <SoftQuad
        color="#04070a"
        opacity={0.62}
        falloff={1.9}
        position={[0, 0.004, 0.2]}
        scale={[CASE_WIDTH * 1.45, CASE_DEPTH * 2.4]}
      />
      <SoftQuad
        color={colorway.glow}
        opacity={0.3}
        additive
        position={[0, 0.012, 0.35]}
        scale={[CASE_WIDTH * 1.25, CASE_DEPTH * 1.7]}
      />

      <mesh geometry={trayGeometry} position={[0, TRAY_HEIGHT / 2, 0]} castShadow receiveShadow>
        <CaseMaterial shell={shell} />
      </mesh>

      <mesh
        geometry={wallGeometry}
        position={[0, TRAY_HEIGHT + (CASE_HEIGHT - TRAY_HEIGHT) / 2, 0]}
        castShadow
        receiveShadow
      >
        <CaseMaterial shell={shell} />
      </mesh>

      <mesh ref={plateRef} geometry={plateGeometry} position={[0, PLATE_Y, 0]} castShadow>
        <meshStandardMaterial color="#8d949b" metalness={0.92} roughness={0.38} />
      </mesh>

      <mesh ref={pcbRef} geometry={pcbGeometry} position={[0, PCB_Y, 0]}>
        <meshStandardMaterial color="#123524" metalness={0.15} roughness={0.72} />
      </mesh>

      <KeyField reducedMotion={reducedMotion} />
    </group>
  );
};
