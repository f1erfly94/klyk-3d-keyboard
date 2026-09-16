/**
 * Configurator presets.
 *
 * Colours live here as plain hex strings so both the 3D materials and the HTML
 * swatches read from one table — a swatch can never drift from the cap it claims
 * to show.
 */
import type { KeyRole } from "./keyboard-layout";

export interface Colorway {
  id: string;
  name: string;
  /** Cap colour per role. */
  cap: Record<KeyRole, string>;
  /** Legend colour per role, picked for contrast against the cap. */
  legend: Record<KeyRole, string>;
  /** Underglow spilling out from under the case. */
  glow: string;
}

export const colorways: readonly Colorway[] = [
  {
    id: "graphite",
    name: "Graphite",
    cap: { alpha: "#3d444a", modifier: "#262b30", accent: "#c8f542" },
    legend: { alpha: "#dfe4e8", modifier: "#9aa3aa", accent: "#14180f" },
    glow: "#c8f542",
  },
  {
    id: "bone",
    name: "Bone",
    cap: { alpha: "#e7e2d6", modifier: "#9aa0a3", accent: "#1b1e21" },
    legend: { alpha: "#3a3f43", modifier: "#20242a", accent: "#c8f542" },
    glow: "#8fb0ff",
  },
  {
    id: "signal",
    name: "Signal",
    cap: { alpha: "#16191c", modifier: "#c8f542", accent: "#f24b3a" },
    legend: { alpha: "#c8f542", modifier: "#16191c", accent: "#16191c" },
    glow: "#f24b3a",
  },
  {
    id: "abyss",
    name: "Abyss",
    cap: { alpha: "#1d2b45", modifier: "#131c2c", accent: "#4fd4c4" },
    legend: { alpha: "#7fa3d8", modifier: "#5d7799", accent: "#0b1220" },
    glow: "#4fd4c4",
  },
];

export interface CaseMaterial {
  id: string;
  name: string;
  /** Short spec-sheet line shown under the swatch. */
  spec: string;
  color: string;
  metalness: number;
  roughness: number;
  clearcoat: number;
  /** Below 1 the shell reads as translucent polycarbonate. */
  opacity: number;
}

export const caseMaterials: readonly CaseMaterial[] = [
  {
    id: "aluminium",
    name: "Анодований алюміній",
    spec: "CNC 6063 · 1,4 кг",
    color: "#42484e",
    metalness: 1,
    roughness: 0.34,
    clearcoat: 0,
    opacity: 1,
  },
  {
    id: "polycarbonate",
    name: "Матовий полікарбонат",
    spec: "Литий PC · 0,9 кг",
    color: "#aab4bd",
    metalness: 0,
    roughness: 0.55,
    clearcoat: 1,
    opacity: 0.82,
  },
  {
    id: "walnut",
    name: "Промаслений горіх",
    spec: "Масив дерева · 1,2 кг",
    color: "#6b4630",
    metalness: 0,
    roughness: 0.62,
    clearcoat: 0.25,
    opacity: 1,
  },
];

export const defaultColorway = colorways[0];
export const defaultCaseMaterial = caseMaterials[0];

export const colorwayById = (id: string) => colorways.find((item) => item.id === id) ?? defaultColorway;

export const caseMaterialById = (id: string) =>
  caseMaterials.find((item) => item.id === id) ?? defaultCaseMaterial;
