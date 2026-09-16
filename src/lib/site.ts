// Vercel sets env vars that are declared but left blank to "" rather than leaving them
// unset, so `??` alone won't fall through — an empty string must be treated as unset too.
const envUrl = (value: string | undefined) => (value ? value : undefined);

const vercelUrl = envUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL);

export const siteUrl =
  envUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000");

export const repoUrl = "https://github.com/f1erfly94/klyk";
export const authorUrl = "https://github.com/f1erfly94";

/** Placeholder contact: KLYK is a fictional brand built as a portfolio piece (see the footer). */
export const contact = {
  email: "hello@klyk.example",
};
