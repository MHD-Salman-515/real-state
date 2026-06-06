import { useTranslation } from "react-i18next";

import ContainerScroll from "../../components/home/ContainerScroll.jsx";
import HomeDemoFooter from "../../components/home/HomeDemoFooter.jsx";
import HomeRadialProperties from "../../components/home/HomeRadialProperties";

export default function HomeDemoWrapper() {
  const { t } = useTranslation();

  return (
    <div className="creos-theme min-h-screen overflow-x-hidden bg-[var(--creos-bg)] text-[var(--creos-text)]">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_24%),radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.08),transparent_18%),linear-gradient(180deg,#06080d_0%,#0a1128_45%,#111415_100%)]" />
        <main className="relative z-10 w-full">
          <section className="flex min-h-screen items-center justify-center px-6">
            <div className="text-center">
              <h1 className="text-5xl font-semibold tracking-[0.45em] text-[color:var(--creos-text)] sm:text-7xl lg:text-[7rem]">
                CREOS
              </h1>
            </div>
          </section>

          <ContainerScroll
            eyebrow={t("Scroll to Reveal")}
            title={t("A cinematic property showcase that unfolds as you move.")}
            description={t("Browse curated properties inside a premium motion-driven frame designed for luxury-first discovery.")}
          >
            <HomeRadialProperties />
          </ContainerScroll>
        </main>

        <HomeDemoFooter />
      </div>
    </div>
  );
}
