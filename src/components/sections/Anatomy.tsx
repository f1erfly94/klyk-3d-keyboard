import { layers } from "@/content/board";
import { Eyebrow, Section } from "@/components/ui/Section";

export const Anatomy = () => (
  <Section id="anatomy">
    <Eyebrow>03 / Анатомія</Eyebrow>

    <h2 className="font-display text-3xl leading-tight font-semibold sm:text-5xl">
      П&apos;ять шарів
    </h2>

    <p className="mt-6 text-muted">
      Прокрутіть — клавіатура розбереться на складові. Це та сама модель, просто її
      шари роз&apos;їжджаються за прогресом скролу.
    </p>

    <ol className="mt-10 space-y-5 border-l border-line/70 pl-6">
      {layers.map((layer) => (
        <li key={layer.index} className="relative">
          <span
            aria-hidden="true"
            className="absolute top-2 -left-[1.6rem] h-1.5 w-1.5 rounded-full bg-lime"
          />
          <p className="spec-label">{layer.index}</p>
          <p className="mt-1 font-display text-lg font-medium">{layer.name}</p>
          <p className="font-mono text-sm text-lime-dim">{layer.spec}</p>
          <p className="mt-1 text-sm text-muted">{layer.note}</p>
        </li>
      ))}
    </ol>
  </Section>
);
