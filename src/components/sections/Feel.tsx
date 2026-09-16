"use client";

import { useConfig } from "@/lib/store";
import { Eyebrow, Section } from "@/components/ui/Section";

export const Feel = () => {
  const lastLabel = useConfig((state) => state.lastLabel);
  const soundEnabled = useConfig((state) => state.soundEnabled);
  const toggleSound = useConfig((state) => state.toggleSound);

  return (
    <Section id="feel" side="right">
      <Eyebrow>02 / Відчуття</Eyebrow>

      <h2 className="font-display text-3xl leading-tight font-semibold sm:text-5xl">
        Натисніть будь-яку клавішу
      </h2>

      <p className="mt-6 text-lg text-muted">
        Сторінка слухає вашу справжню клавіатуру. Ковпачок на екрані проходить той самий
        хід, з тією ж затримкою, з якою ваш палець доходить до дна.
      </p>

      <div className="mt-8 hidden flex-wrap items-center gap-4 md:flex">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-xl border border-line bg-surface font-mono text-xl"
          aria-live="polite"
        >
          {lastLabel ?? <span className="text-muted">—</span>}
        </div>

        <div className="text-sm text-muted">
          <p className="font-mono text-fg">{lastLabel ? "Остання клавіша" : "Очікую натискання"}</p>
          <p className="mt-1 max-w-xs">
            Fn намальована, але браузер її не бачить — єдина клавіша на платі, яку не
            можна натиснути.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={soundEnabled}
        className="mt-8 hidden items-center gap-3 rounded-full border border-line px-5 py-2.5 font-mono text-sm transition-colors hover:border-lime hover:text-lime md:inline-flex"
      >
        <span
          aria-hidden="true"
          className={`h-2 w-2 rounded-full ${soundEnabled ? "bg-lime" : "bg-muted"}`}
        />
        Звук світчів: {soundEnabled ? "увімкнено" : "вимкнено"}
      </button>

      <p className="mt-4 hidden max-w-sm text-xs text-muted md:block">
        Звук синтезується в браузері — жодного аудіофайлу в проєкті немає.
      </p>

      {/* There is no physical keyboard to listen to on a phone, so say so rather
          than leave a dead control sitting there. */}
      <p className="mt-8 rounded-xl border border-dashed border-line px-4 py-3 text-sm text-muted md:hidden">
        Цей розділ оживає на комп&apos;ютері: там сторінка слухає вашу фізичну клавіатуру,
        а ковпачок на екрані проходить той самий хід.
      </p>
    </Section>
  );
};
