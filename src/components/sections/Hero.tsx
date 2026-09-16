"use client";

import { brand, heroSpecs } from "@/content/board";
import { BoardStill } from "@/components/scene/BoardStill";
import { Eyebrow, Section } from "@/components/ui/Section";

export const Hero = () => {
  return (
    <Section id="hero">
      <Eyebrow>{brand.model} · механічна клавіатура</Eyebrow>

      <h1 className="font-display text-4xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
        {brand.tagline}
      </h1>

      <p className="mt-6 max-w-lg text-lg text-muted">
        Фрезерований алюміній, gasket-кріплення й хід, який чути пальцями.{" "}
        <span className="hidden md:inline">
          Натисніть будь-яку клавішу на своїй клавіатурі — вона відгукнеться тут, на екрані.
        </span>
        <span className="md:hidden">
          На телефоні вона показана плоскою схемою — конфігуратор нижче все одно працює.
        </span>
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="#configurator"
          className="rounded-full bg-lime px-6 py-3 font-mono text-sm font-medium tracking-wide text-bg transition-transform hover:-translate-y-0.5"
        >
          Зібрати свою
        </a>
        <a
          href="#anatomy"
          className="rounded-full border border-line px-6 py-3 font-mono text-sm tracking-wide text-fg transition-colors hover:border-lime hover:text-lime"
        >
          Як вона влаштована
        </a>
      </div>

      <dl className="mt-12 grid max-w-md grid-cols-2 gap-x-8 gap-y-4 border-t border-line/70 pt-6 sm:grid-cols-3">
        {heroSpecs.map((spec) => (
          <div key={spec.label}>
            <dt className="spec-label">{spec.label}</dt>
            <dd className="mt-1 font-mono text-sm text-fg">{spec.value}</dd>
          </div>
        ))}
      </dl>

      {/* On phones and without WebGL this is the board; on a capable desktop the
          canvas behind the page is already showing it, so the flat copy stays out. */}
      <div className={"mt-12 md:hidden"}>
        <BoardStill />
      </div>
    </Section>
  );
};
