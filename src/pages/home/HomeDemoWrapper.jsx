import HomeDemoFooter from "../../components/home/HomeDemoFooter.jsx";
import HomeRadialProperties from "../../components/home/HomeRadialProperties";

export default function HomeDemoWrapper() {
  return (
    <div className="chat-shell overflow-x-hidden text-white">
      <div className="creos-theme bg-luxury relative min-h-screen w-full">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--creos-accent-rgb)/0.14),_transparent_28%),linear-gradient(180deg,transparent,rgba(10,17,40,0.28)_70%,rgba(17,20,21,0.5))]" />
        <main className="relative z-10 w-full">
          <section className="w-full">
            <HomeRadialProperties />
          </section>
        </main>

        <HomeDemoFooter />
      </div>
    </div>
  );
}
