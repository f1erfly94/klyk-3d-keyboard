"use client";

import { cn } from "@/lib/cn";
import { useConfig } from "@/lib/store";
import { BoardStill } from "@/components/scene/BoardStill";
import { Eyebrow, Section } from "@/components/ui/Section";
import { caseMaterials, colorways } from "@/three/colorways";

export const Configurator = () => {
  const colorwayId = useConfig((state) => state.colorwayId);
  const caseId = useConfig((state) => state.caseId);
  const setColorway = useConfig((state) => state.setColorway);
  const setCase = useConfig((state) => state.setCase);

  return (
    <Section id="configurator" side="wide">
      <div className="max-w-xl">
        <Eyebrow>04 / Конфігуратор</Eyebrow>
        <h2 className="font-display text-3xl leading-tight font-semibold sm:text-5xl">
          Зберіть свою
        </h2>
      </div>

      <div className={"mt-10 max-w-2xl md:hidden"}>
        <BoardStill />
      </div>

      <div className="mt-10 grid gap-10 md:mt-16 md:grid-cols-2">
        <fieldset>
          <legend className="spec-label mb-4">Колорвей</legend>
          <div className="flex flex-wrap gap-3">
            {colorways.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setColorway(item.id)}
                aria-pressed={colorwayId === item.id}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                  colorwayId === item.id
                    ? "border-lime bg-surface"
                    : "border-line bg-surface/40 hover:border-muted",
                )}
              >
                <span aria-hidden="true" className="flex overflow-hidden rounded-md">
                  <span className="h-6 w-4" style={{ backgroundColor: item.cap.alpha }} />
                  <span className="h-6 w-4" style={{ backgroundColor: item.cap.modifier }} />
                  <span className="h-6 w-4" style={{ backgroundColor: item.cap.accent }} />
                </span>
                <span className="font-mono text-sm">{item.name}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="spec-label mb-4">Корпус</legend>
          <div className="flex flex-col gap-3">
            {caseMaterials.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCase(item.id)}
                aria-pressed={caseId === item.id}
                className={cn(
                  "flex items-center gap-4 rounded-xl border px-4 py-3 text-left transition-colors",
                  caseId === item.id
                    ? "border-lime bg-surface"
                    : "border-line bg-surface/40 hover:border-muted",
                )}
              >
                <span
                  aria-hidden="true"
                  className="h-8 w-8 shrink-0 rounded-md border border-white/10"
                  style={{ backgroundColor: item.color, opacity: item.opacity }}
                />
                <span>
                  <span className="block font-mono text-sm">{item.name}</span>
                  <span className="spec-label">{item.spec}</span>
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </Section>
  );
};
