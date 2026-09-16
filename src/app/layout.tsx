import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import { brand } from "@/content/board";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter", display: "swap" });

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

const description =
  "KLYK-65 — концепт механічної клавіатури: 3D-сцена, згенерована кодом, реагує на вашу справжню клавіатуру.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.model} — ${brand.tagline}`,
    template: `%s — ${brand.name}`,
  },
  description,
  openGraph: {
    type: "website",
    locale: "uk_UA",
    url: siteUrl,
    siteName: brand.name,
    title: `${brand.model} — ${brand.tagline}`,
    description,
  },
  twitter: { card: "summary_large_image", title: brand.model, description },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#0b0d0e",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${plexMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
