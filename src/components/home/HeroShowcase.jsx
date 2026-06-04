import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const SLIDES = [
  {
    id: 1,
    type: "video",
    src: "/videos/intro-1.mp4",
    thumb: "/thumbs/t1.jpg",
    badge: "Featured Reel",
    title: "Present Properties Like Premium Creative Drops",
    description:
      "Showcase high-end listings with cinematic motion, clean storytelling, and sharper first impressions.",
    primaryLabel: "Explore Listings",
    secondaryLabel: "Book A Tour",
  },
  {
    id: 2,
    type: "image",
    src: "/images/hero-2.jpg",
    thumb: "/thumbs/t2.jpg",
    badge: "Modern Search",
    title: "Turn Browsing Into Intent With Story-First Search",
    description:
      "Combine location, style, and price in a guided flow that keeps buyers focused and confident.",
    primaryLabel: "Start Search",
    secondaryLabel: "View Favorites",
  },
  {
    id: 3,
    type: "image",
    src: "/images/hero-3.jpg",
    thumb: "/thumbs/t3.jpg",
    badge: "Trusted Visits",
    title: "Move From Discovery To Confirmed Visits Faster",
    description:
      "Streamline booking with polished touchpoints that make every appointment feel reliable and simple.",
    primaryLabel: "Schedule Visit",
    secondaryLabel: "Check Calendar",
  },
  {
    id: 4,
    type: "image",
    src: "/images/hero-4.jpg",
    thumb: "/thumbs/t4.jpg",
    badge: "Conversion Ready",
    title: "Build A Home Experience That Converts At First Glance",
    description:
      "Blend visual impact with practical actions so users can explore, compare, and act without friction.",
    primaryLabel: "See Highlights",
    secondaryLabel: "Contact Team",
  },
];

export default function HeroShowcase({
  quick,
  setQuick,
  onQuickSearch,
  onlyNum,
  resetForm,
  lastSearch,
  applyLastSearch,
  clearLastSearch,
  hasDraft,
  onPrimaryCta,
  onSecondaryCta,
  onContinueDraft,
}) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const activeSlide = SLIDES[activeIndex];
  const videoKey = useMemo(
    () => `${activeSlide.id}-${activeSlide.type}-${activeSlide.src}`,
    [activeSlide.id, activeSlide.type, activeSlide.src],
  );

  const handleSlideChange = (index) => {
    if (index === activeIndex) return;
    setIsTransitioning(true);
    setVideoError(false);
    setActiveIndex(index);
    window.setTimeout(() => setIsTransitioning(false), 280);
  };

  const showPosterOnly = activeSlide.type === "video" && videoError;
  const inputMini = "input-creos h-11 rounded-2xl";
  const selectMini = "input-creos h-11 rounded-2xl";

  return (
    <section className="bg-luxury relative left-1/2 right-1/2 -mx-[50vw] min-h-screen w-screen overflow-hidden text-white">
      <div className="absolute inset-0">
        {activeSlide.type === "video" && !showPosterOnly ? (
          <video
            key={videoKey}
            className={`h-full w-full object-cover transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
            autoPlay
            muted
            loop
            playsInline
            poster={activeSlide.thumb}
            onError={() => setVideoError(true)}
          >
            <source src={activeSlide.src} type="video/mp4" />
          </video>
        ) : (
          <img
            src={activeSlide.type === "video" ? activeSlide.thumb : activeSlide.src}
            alt="Hero poster fallback"
            
            className={`h-full w-full object-cover transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
          />
        )}
      </div>

      <div className="absolute inset-0 bg-[rgb(var(--creos-bg-rgb)/0.42)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.16),_transparent_28%),linear-gradient(135deg,rgba(10,17,40,0.82),rgba(17,20,21,0.58),rgba(10,17,40,0.88))]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 pb-24 pt-20 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <p className="badge-creos mb-4 inline-flex border border-[rgb(var(--creos-accent-rgb)/0.24)] bg-[rgb(var(--creos-accent-rgb)/0.10)] px-3 py-1 text-xs tracking-[0.2em] text-[color:var(--creos-text)]">
            {t(activeSlide.badge)}
          </p>
          <h1
            className={`text-4xl font-black leading-tight text-[color:var(--creos-text)] sm:text-5xl lg:text-6xl transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
          >
            {t(activeSlide.title)}
          </h1>
          <p
            className={`mt-5 max-w-xl text-sm text-[color:rgb(var(--creos-text-rgb)/0.82)] sm:text-base transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
          >
            {t(activeSlide.description)}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onPrimaryCta}
              className="btn-gold px-6 py-3 text-sm"
            >
              {t(activeSlide.primaryLabel)}
            </button>
            <button
              type="button"
              onClick={onSecondaryCta}
              className="btn-glass px-6 py-3 text-sm"
            >
              {t(activeSlide.secondaryLabel)}
            </button>
          </div>
        </div>

        <div className="card-glass mt-8 max-w-3xl rounded-3xl p-4 sm:p-5">
          {lastSearch && (
            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[var(--creos-border-soft)] bg-[rgb(var(--creos-surface-rgb)/0.6)] p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-[color:var(--creos-text)]">
                {t("Last saved search:")}
                <span className="ms-2 font-mono text-[color:rgb(var(--creos-text-rgb)/0.86)]">
                  {Object.entries(lastSearch)
                    .map(([k, v]) => `${k}:${v}`)
                    .join(" • ")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn-glass px-3 py-1.5 text-xs"
                  onClick={applyLastSearch}
                >
                  {t("Apply")}
                </button>
                <button
                  type="button"
                  className="btn-glass px-3 py-1.5 text-xs"
                  onClick={clearLastSearch}
                >
                  {t("Clear")}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={onQuickSearch} className="grid gap-3 sm:grid-cols-2">
            <input
              className={inputMini}
              placeholder={t("City")}
              aria-label={t("City")}
              value={quick.city}
              onChange={(e) => setQuick({ ...quick, city: e.target.value })}
            />
            <select
              className={selectMini}
              value={quick.type}
              onChange={(e) => setQuick({ ...quick, type: e.target.value })}
            >
              <option value="">{t("Type")}</option>
              <option value="APARTMENT">{t("Apartment")}</option>
              <option value="VILLA">{t("Villa")}</option>
              <option value="HOUSE">{t("House")}</option>
              <option value="STUDIO">{t("Studio")}</option>
            </select>
            <input
              className={inputMini}
              inputMode="numeric"
              placeholder={t("Min price")}
              aria-label={t("Min price")}
              value={quick.minPrice}
              onChange={(e) =>
                setQuick({ ...quick, minPrice: onlyNum(e.target.value) })
              }
            />
            <input
              className={inputMini}
              inputMode="numeric"
              placeholder={t("Max price")}
              aria-label={t("Max price")}
              value={quick.maxPrice}
              onChange={(e) =>
                setQuick({ ...quick, maxPrice: onlyNum(e.target.value) })
              }
            />
            <div className="sm:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                className="btn-glass px-3 py-2 text-sm"
                onClick={resetForm}
              >
                {t("Reset")}
              </button>
              <button
                type="submit"
                className="btn-gold px-4 py-2 text-sm"
              >
                {t("Quick Search")}
              </button>
            </div>
          </form>

          {hasDraft && (
            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[var(--creos-border-soft)] bg-[rgb(var(--creos-surface-rgb)/0.6)] p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-[color:var(--creos-text)]">
                {t("You have an unfinished booking draft.")}
              </div>
              <button
                type="button"
                className="btn-glass px-3 py-2 text-sm"
                onClick={onContinueDraft}
              >
                {t("Continue Draft")}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 z-20 px-4 md:bottom-auto md:left-auto md:right-6 md:top-1/2 md:w-28 md:-translate-y-1/2 md:px-0">
        <div className="flex gap-3 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0">
          {SLIDES.map((slide, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={slide.id}
                type="button"
                aria-label={t("Show slide {{id}}", { id: slide.id })}
                onClick={() => handleSlideChange(index)}
                className={`group relative h-16 min-w-28 overflow-hidden rounded-lg border transition md:h-16 md:min-w-0 md:w-full ${
                  isActive
                    ? "scale-[1.02] border-white/15 shadow-lg shadow-white/10"
                    : "border-white/30 hover:border-white/70"
                }`}
              >
                <img
                  src={slide.thumb}
                  alt={t("Thumbnail {{id}}", { id: slide.id })}
                  className={`h-full w-full object-cover transition duration-300 ${isActive ? "brightness-100" : "brightness-75 group-hover:brightness-90"}`}
                />
                <span
                  className={`absolute inset-0 border ${isActive ? "border-white/15" : "border-transparent"} rounded-lg`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
