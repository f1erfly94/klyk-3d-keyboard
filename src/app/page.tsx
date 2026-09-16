import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SceneProvider } from "@/components/scene/SceneProvider";
import { Anatomy } from "@/components/sections/Anatomy";
import { Configurator } from "@/components/sections/Configurator";
import { Feel } from "@/components/sections/Feel";
import { Hero } from "@/components/sections/Hero";
import { Order } from "@/components/sections/Order";

export default function Page() {
  return (
    <SceneProvider>
      <SiteHeader />
      <main className="blueprint-grid">
        <Hero />
        <Feel />
        <Anatomy />
        <Configurator />
        <Order />
      </main>
      <SiteFooter />
    </SceneProvider>
  );
}
