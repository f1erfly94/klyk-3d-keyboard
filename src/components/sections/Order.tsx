import { brand, faq, pricing } from "@/content/board";
import { Eyebrow, Section } from "@/components/ui/Section";

export const Order = () => (
  <Section id="order" side="wide">
    <div className="max-w-xl">
      <Eyebrow>05 / Замовлення</Eyebrow>
      <h2 className="font-display text-3xl leading-tight font-semibold sm:text-5xl">
        {brand.model}
      </h2>
    </div>

    <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <div className="rounded-2xl border border-line bg-surface/60 p-8 backdrop-blur-sm">
        <p className="font-display text-4xl font-semibold">{pricing.price}</p>
        <p className="mt-2 text-sm text-muted">{pricing.note}</p>

        <ul className="mt-6 space-y-2 border-t border-line/70 pt-6">
          {pricing.includes.map((item) => (
            <li key={item} className="flex gap-3 text-sm">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lime" />
              {item}
            </li>
          ))}
        </ul>

        {/* Deliberately inert: the brand does not exist, so a working checkout would
            be a lie dressed up as a portfolio flourish. */}
        <p className="mt-8 rounded-xl border border-dashed border-line px-4 py-3 font-mono text-xs text-muted">
          Концепт — оформити замовлення неможливо.
        </p>
      </div>

      <dl className="space-y-6">
        {faq.map((item) => (
          <div key={item.question} className="border-b border-line/70 pb-6">
            <dt className="font-display text-lg font-medium">{item.question}</dt>
            <dd className="mt-2 text-sm text-muted">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </div>
  </Section>
);
