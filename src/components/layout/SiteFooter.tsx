import { brand, disclaimer } from "@/content/board";
import { authorUrl, repoUrl } from "@/lib/site";

export const SiteFooter = () => (
  <footer className="relative z-10 border-t border-line/70 bg-bg/80 backdrop-blur-sm">
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-end md:justify-between">
      <div className="max-w-md">
        <p className="font-display text-lg font-semibold tracking-[0.2em]">{brand.name}</p>
        <p className="mt-3 text-sm text-muted">{disclaimer}</p>
      </div>

      <ul className="flex gap-6">
        <li>
          <a className="spec-label transition-colors hover:text-lime" href={repoUrl}>
            Код на GitHub
          </a>
        </li>
        <li>
          <a className="spec-label transition-colors hover:text-lime" href={authorUrl}>
            Автор
          </a>
        </li>
      </ul>
    </div>
  </footer>
);
