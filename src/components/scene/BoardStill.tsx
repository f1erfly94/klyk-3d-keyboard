"use client";

import { useConfig } from "@/lib/store";
import { cn } from "@/lib/cn";
import { caseMaterialById, colorwayById } from "@/three/colorways";
import { CAP_GAP } from "@/three/dimensions";
import { BOARD_DEPTH_U, BOARD_WIDTH_U, keys } from "@/three/keyboard-layout";

const PAD = 0.55;
const VIEW_WIDTH = BOARD_WIDTH_U + PAD * 2;
const VIEW_HEIGHT = BOARD_DEPTH_U + PAD * 2;

/**
 * The board as flat SVG, drawn from the same layout table as the 3D scene.
 *
 * This is the fallback for phones and for anything without WebGL — and because it
 * reads the same colourway from the same store, the configurator keeps working
 * there instead of degrading to a static picture.
 */
export const BoardStill = ({ className }: { className?: string }) => {
  const colorway = colorwayById(useConfig((state) => state.colorwayId));
  const shell = caseMaterialById(useConfig((state) => state.caseId));

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label={`KLYK-65 у розкладці ${colorway.name}, корпус: ${shell.name}`}
    >
      <defs>
        <filter id="klyk-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
        <linearGradient id="klyk-case" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shell.color} stopOpacity="0.95" />
          <stop offset="1" stopColor={shell.color} stopOpacity="0.72" />
        </linearGradient>
      </defs>

      <rect
        x={PAD * 0.4}
        y={PAD * 0.6}
        width={VIEW_WIDTH - PAD * 0.8}
        height={VIEW_HEIGHT - PAD * 0.8}
        rx="0.8"
        fill={colorway.glow}
        opacity="0.28"
        filter="url(#klyk-glow)"
      />

      <rect
        x="0.1"
        y="0.1"
        width={VIEW_WIDTH - 0.2}
        height={VIEW_HEIGHT - 0.2}
        rx="0.55"
        fill="url(#klyk-case)"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="0.03"
      />

      {keys.map((key) => {
        const width = key.width - CAP_GAP;
        const height = 1 - CAP_GAP;
        const x = key.x + BOARD_WIDTH_U / 2 + PAD - width / 2;
        const y = key.z + BOARD_DEPTH_U / 2 + PAD - height / 2;

        return (
          <g key={key.code}>
            <rect
              data-key={key.code}
              x={x}
              y={y}
              width={width}
              height={height}
              rx="0.14"
              fill={colorway.cap[key.role]}
            />
            {key.label ? (
              <text
                x={x + width / 2}
                y={y + height / 2}
                fill={colorway.legend[key.role]}
                fontSize={key.label.length > 2 ? 0.26 : 0.36}
                fontFamily="var(--font-mono)"
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {key.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};
