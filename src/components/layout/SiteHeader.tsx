"use client";

import { brand } from "@/content/board";
import { cn } from "@/lib/cn";
import { sections } from "@/lib/sections";
import { useScene } from "@/components/scene/SceneProvider";

export const SiteHeader = () => {
  const { section } = useScene();

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line/70 bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-6">
        <a href="#hero" className="font-display text-lg font-semibold tracking-[0.2em]">
          {brand.name}
        </a>

        <nav aria-label="Розділи сторінки" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {sections.map((item, index) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={section === index ? "true" : undefined}
                  className={cn(
                    "spec-label transition-colors hover:text-fg",
                    section === index && "text-lime",
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href="#order"
          className="rounded-full border border-lime/40 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.16em] text-lime transition-colors hover:bg-lime hover:text-bg"
        >
          Замовити
        </a>
      </div>
    </header>
  );
};
