import { useMemo, useState } from "react";

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
  const inputMini =
    "h-11 w-full rounded-xl bg-black/30 backdrop-blur-xl border border-white/20 text-white placeholder-slate-300/70 shadow-inner shadow-black/40 focus:outline-none focus:border-white/15 focus:ring-2 focus:ring-white/30 transition duration-300";
  const selectMini =
    "h-11 w-full rounded-xl bg-black/30 backdrop-blur-xl border border-white/20 text-white shadow-lg shadow-black/25 hover:border-white/15 focus:outline-none focus:border-white/15 focus:ring-2 focus:ring-white/30 transition duration-300";

  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] min-h-screen w-screen overflow-hidden bg-[#070b11] text-white">
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

      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/35 to-[#0a2233]/65" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 pb-24 pt-20 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs tracking-[0.2em] text-slate-100">
            {activeSlide.badge}
          </p>
          <h1
            className={`text-4xl font-black leading-tight sm:text-5xl lg:text-6xl transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
          >
            {activeSlide.title}
          </h1>
          <p
            className={`mt-5 max-w-xl text-sm text-slate-200 sm:text-base transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
          >
            {activeSlide.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onPrimaryCta}
              className="rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/10"
            >
              {activeSlide.primaryLabel}
            </button>
            <button
              type="button"
              onClick={onSecondaryCta}
              className="rounded-xl border border-white/40 bg-black/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {activeSlide.secondaryLabel}
            </button>
          </div>
        </div>

        <div className="mt-8 max-w-3xl rounded-2xl border border-white/20 bg-black/40 p-4 backdrop-blur-xl sm:p-5">
          {lastSearch && (
            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-white/15 bg-black/35 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-100">
                Last saved search:
                <span className="ms-2 font-mono text-white/90">
                  {Object.entries(lastSearch)
                    .map(([k, v]) => `${k}:${v}`)
                    .join(" • ")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/90 transition hover:bg-white/10"
                  onClick={applyLastSearch}
                >
                  Apply
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-white/30 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
                  onClick={clearLastSearch}
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          <form onSubmit={onQuickSearch} className="grid gap-3 sm:grid-cols-2">
            <input
              className={inputMini}
              placeholder="City"
              aria-label="City"
              value={quick.city}
              onChange={(e) => setQuick({ ...quick, city: e.target.value })}
            />
            <select
              className={selectMini}
              value={quick.type}
              onChange={(e) => setQuick({ ...quick, type: e.target.value })}
            >
              <option value="">Type</option>
              <option value="APARTMENT">Apartment</option>
              <option value="VILLA">Villa</option>
              <option value="HOUSE">House</option>
              <option value="STUDIO">Studio</option>
            </select>
            <input
              className={inputMini}
              inputMode="numeric"
              placeholder="Min price"
              aria-label="Min price"
              value={quick.minPrice}
              onChange={(e) =>
                setQuick({ ...quick, minPrice: onlyNum(e.target.value) })
              }
            />
            <input
              className={inputMini}
              inputMode="numeric"
              placeholder="Max price"
              aria-label="Max price"
              value={quick.maxPrice}
              onChange={(e) =>
                setQuick({ ...quick, maxPrice: onlyNum(e.target.value) })
              }
            />
            <div className="sm:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-white/30 px-3 py-2 text-sm transition hover:bg-white/10"
                onClick={resetForm}
              >
                Reset
              </button>
              <button
                type="submit"
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/10"
              >
                Quick Search
              </button>
            </div>
          </form>

          {hasDraft && (
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-white/15 bg-black/35 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-100">
                You have an unfinished booking draft.
              </div>
              <button
                type="button"
                className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10"
                onClick={onContinueDraft}
              >
                Continue Draft
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
                aria-label={`Show slide ${slide.id}`}
                onClick={() => handleSlideChange(index)}
                className={`group relative h-16 min-w-28 overflow-hidden rounded-lg border transition md:h-16 md:min-w-0 md:w-full ${
                  isActive
                    ? "scale-[1.02] border-white/15 shadow-lg shadow-white/10"
                    : "border-white/30 hover:border-white/70"
                }`}
              >
                <img
                  src={slide.thumb}
                  alt={`Thumbnail ${slide.id}`}
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
