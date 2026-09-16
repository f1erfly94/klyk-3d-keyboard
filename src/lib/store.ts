"use client";

import { create } from "zustand";
import { defaultCaseMaterial, defaultColorway } from "@/three/colorways";

interface ConfigState {
  colorwayId: string;
  caseId: string;
  soundEnabled: boolean;
  /** Label of the last cap the visitor pressed, shown in the "Feel" readout. */
  lastLabel: string | null;
  setColorway: (id: string) => void;
  setCase: (id: string) => void;
  toggleSound: () => void;
  setLastLabel: (label: string | null) => void;
}

export const useConfig = create<ConfigState>((set) => ({
  colorwayId: defaultColorway.id,
  caseId: defaultCaseMaterial.id,
  // Off until the visitor asks for it: browsers block unprompted audio, and
  // a landing page that clicks at you unannounced is a landing page people close.
  soundEnabled: false,
  lastLabel: null,
  setColorway: (colorwayId) => set({ colorwayId }),
  setCase: (caseId) => set({ caseId }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setLastLabel: (lastLabel) => set({ lastLabel }),
}));
