import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionProps {
  id: string;
  /** Which side of the viewport the copy sits on; the 3D board takes the other. */
  side?: "left" | "right" | "wide";
  children: ReactNode;
  className?: string;
}

/**
 * One full screen of the page.
 *
 * `data-timeline-section` is what the scroll hook measures: the camera keyframes
 * are anchored to these elements, not to a fraction of the document height.
 */
export const Section = ({ id, side = "left", children, className }: SectionProps) => (
  <section
    id={id}
    data-timeline-section
    className={cn("relative z-10 flex min-h-svh items-center py-24 md:h-screen md:py-0", className)}
  >
    {/* Scrim: the board is a bright object and this is text on top of it. Scoped to
        the section so five of them never stack into a grey wash. */}
    {side !== "wide" && (
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 -z-10",
          side === "right"
            ? "bg-gradient-to-l from-bg via-bg/70 to-transparent"
            : "bg-gradient-to-r from-bg via-bg/70 to-transparent",
        )}
      />
    )}

    <div className="mx-auto w-full max-w-7xl px-6">
      <div
        className={cn(
          side === "wide" ? "max-w-none" : "max-w-xl",
          side === "right" && "md:ml-auto",
        )}
      >
        {children}
      </div>
    </div>
  </section>
);

export const Eyebrow = ({ children }: { children: ReactNode }) => (
  <p className="spec-label mb-4 flex items-center gap-3">
    <span className="h-px w-8 bg-lime/60" aria-hidden="true" />
    {children}
  </p>
);
