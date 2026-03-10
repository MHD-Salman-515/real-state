import HomeDemoFooter from "../../components/home/HomeDemoFooter.jsx";
import HomeRadialProperties from "../../components/home/HomeRadialProperties";

export default function HomeDemoWrapper() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="creos-theme relative min-h-screen bg-black w-full">
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
