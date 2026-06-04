import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircleUserRound, MapPin, BedDouble, Building2, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext.jsx";
import { getRoleLandingPath } from "@/utils/roleLanding.js";

const CURATED_PROPERTIES = [
  {
    key: "skyloft",
    badge: "Penthouse",
    title: "Sky Loft Dubai",
    price: "$4.2M",
    meta: "Downtown Dubai • 4 Bedrooms • 5,200 sq ft",
    tags: ["Smart System", "Waterfront View"],
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    key: "riyadh",
    badge: "Private Estate",
    title: "Riyadh Courtyard",
    price: "$8.7M",
    meta: "North Riyadh • 6 Bedrooms • 9,400 sq ft",
    tags: ["Quiet Gate", "Private Garden"],
    image:
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    key: "athens",
    badge: "Smart Tower",
    title: "Athens Skyline",
    price: "$4.2M",
    meta: "Athens Center • 3 Bedrooms • 3,300 sq ft",
    tags: ["City View", "Private Gym"],
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  },
];

const STORY_TILES = [
  {
    key: "boardroom",
    title: "Luxury Workplace",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
  },
  {
    key: "kitchen",
    title: "Premium Smart Kitchens",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80",
  },
];

export default function HomeDemoWrapper() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const isRtl = i18n.dir() === "rtl";

  const navItems = useMemo(
    () => [
      { label: t("Properties"), to: "/properties" },
      { label: t("Services"), to: "/services" },
      { label: t("About"), to: "/about" },
      { label: t("Profile"), to: user ? getRoleLandingPath(user) : "/auth/login" },
    ],
    [t, user],
  );

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const value = String(searchText || "").trim();
    navigate(value ? `/search?query=${encodeURIComponent(value)}` : "/search");
  };

  return (
    <div dir={i18n.dir()} className="stitch-ref-home-shell min-h-screen overflow-x-hidden">
      <header className="stitch-ref-home-nav fixed inset-x-0 top-0 z-40">
        <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-5 lg:px-16">
          <div className={`flex items-center gap-6 ${isRtl ? "lg:flex-row-reverse" : ""}`}>
            <Link to="/" className="stitch-ref-brand text-[2rem]">
              Creos
            </Link>
            <nav className="hidden items-center gap-8 lg:flex">
              {navItems.map((item, index) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-base transition ${index === 0 ? "border-b-2 border-[var(--stitch-ref-gold)] pb-1 text-[var(--stitch-ref-gold)]" : "text-[rgba(226,226,231,0.82)] hover:text-[var(--stitch-ref-gold)]"}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className={`flex items-center gap-4 ${isRtl ? "lg:flex-row-reverse" : ""}`}>
            <form
              onSubmit={handleSearchSubmit}
              className="hidden items-center border border-[rgba(154,143,128,0.12)] bg-[rgba(30,32,35,0.58)] px-4 py-2 lg:flex"
            >
              <Search className="h-4 w-4 text-[rgba(154,143,128,0.82)]" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={t("Search your sanctuary...")}
                className="min-w-[220px] bg-transparent px-3 text-sm text-[var(--stitch-ref-text)] outline-none placeholder:text-[rgba(154,143,128,0.56)]"
              />
            </form>

            <Link
              to={user ? getRoleLandingPath(user) : "/auth/register"}
              className="stitch-ref-button-primary !min-h-0 !px-6 !py-3 !text-sm"
            >
              {t("Connect Wallet")}
            </Link>

            <Link to={user ? getRoleLandingPath(user) : "/auth/login"} className="text-[var(--stitch-ref-gold)]">
              <CircleUserRound className="h-7 w-7" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
          <img
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1800&q=80"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,20,37,0.18),rgba(8,20,37,0.9))]" />

          <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-5 text-center lg:px-16">
            <span className="stitch-ref-mono text-[0.7rem] uppercase tracking-[0.32em] text-[rgba(226,226,231,0.8)]">
              {t("Quiet luxury intelligence")}
            </span>
            <h1 className="stitch-ref-title mt-5 text-4xl leading-tight text-white sm:text-5xl lg:text-[4.5rem] lg:leading-[1.1]">
              {t("Discover your sanctuary with quiet intelligence")}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[rgba(226,226,231,0.78)] sm:text-lg">
              {t("We redefine luxury through advanced architecture and calm intelligence so every space becomes part of your identity.")}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link to="/properties" className="stitch-ref-button-primary !min-h-0 !px-10 !py-4 !text-lg">
                {t("Browse Curated Collection")}
              </Link>
              <Link to="/search" className="stitch-ref-button-secondary !min-h-0 !px-10 !py-4 !text-lg">
                {t("View Smart Properties")}
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-24 lg:px-16">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <span className="stitch-ref-mono text-xs uppercase tracking-[0.28em] text-[var(--stitch-ref-gold)]">
                {t("Curated For You")}
              </span>
              <h2 className="stitch-ref-title mt-3 text-3xl lg:text-5xl">{t("Curated Property Collection")}</h2>
            </div>
            <Link to="/properties" className="text-sm text-[var(--stitch-ref-gold)] hover:underline">
              {t("View All")}
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {CURATED_PROPERTIES.map((property) => (
              <article key={property.key} className="stitch-ref-home-card overflow-hidden rounded-xl">
                <div className="relative h-80 overflow-hidden">
                  <img src={property.image} alt={t(property.title)} className="h-full w-full object-cover transition duration-700 hover:scale-105" />
                  <span className="absolute right-4 top-4 bg-[var(--stitch-ref-gold)] px-3 py-1 text-xs text-[#261900]">
                    {t(property.badge)}
                  </span>
                </div>

                <div className="p-6">
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <h3 className="stitch-ref-title text-2xl text-white">{t(property.title)}</h3>
                    <span className="stitch-ref-mono text-sm text-[var(--stitch-ref-gold)]">{property.price}</span>
                  </div>
                  <p className="text-sm text-[rgba(226,226,231,0.68)]">{t(property.meta)}</p>
                  <div className="mt-5 flex flex-wrap gap-4 border-t border-[rgba(154,143,128,0.12)] pt-4 text-xs text-[rgba(226,226,231,0.62)]">
                    {property.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {t(tag)}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-[1440px] gap-8 px-5 pb-24 lg:grid-cols-[0.75fr_1.35fr] lg:px-16">
          <div className="space-y-4">
            <div>
              <span className="stitch-ref-mono text-xs uppercase tracking-[0.28em] text-[var(--stitch-ref-gold)]">
                {t("Story Layer")}
              </span>
              <h2 className="stitch-ref-title mt-3 text-3xl lg:text-4xl">{t("Choose atmospheres that fit your taste")}</h2>
            </div>

            {STORY_TILES.map((tile) => (
              <div key={tile.key} className="overflow-hidden rounded-md">
                <div className="relative h-[220px]">
                  <img src={tile.image} alt={t(tile.title)} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.6))]" />
                  <div className="absolute bottom-6 right-6 text-lg text-white">{t(tile.title)}</div>
                </div>
              </div>
            ))}
          </div>

          <article className="stitch-ref-home-card relative overflow-hidden rounded-xl">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.58))]" />
            <div className="relative z-10 flex min-h-[560px] items-end p-8 lg:p-12">
              <div className="max-w-2xl">
                <span className="mb-4 inline-flex bg-[var(--stitch-ref-gold)] px-3 py-1 text-xs text-[#261900]">
                  {t("Featured Home")}
                </span>
                <h3 className="stitch-ref-title text-3xl text-white lg:text-5xl">{t("Luminous Mansion - Waterfront")}</h3>
                <p className="mt-3 text-base text-[rgba(255,255,255,0.82)]">
                  {t("A rare architectural icon that combines private atmosphere with contemporary luxury and calm intelligence.")}
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/properties")}
                  className="mt-8 bg-white px-8 py-4 text-base font-semibold text-[#111317] transition hover:bg-[rgba(255,255,255,0.92)]"
                >
                  {t("Explore Home")}
                </button>
              </div>
            </div>
          </article>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 pb-20 lg:px-16">
          <div className="stitch-ref-home-card rounded-xl px-6 py-10 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <span className="stitch-ref-mono text-xs uppercase tracking-[0.28em] text-[var(--stitch-ref-gold)]">
                  {t("Private updates")}
                </span>
                <h2 className="stitch-ref-title mt-3 text-3xl lg:text-4xl">{t("Receive exclusive opportunities")}</h2>
                <p className="mt-3 text-base leading-8 text-[rgba(226,226,231,0.72)]">
                  {t("Register to receive curated opportunities and high-value property alerts before the wider market.")}
                </p>
              </div>

              <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 sm:flex-row">
                <input
                  type="email"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder={t("Enter your email")}
                  className="flex-1 border border-[rgba(154,143,128,0.18)] bg-[rgba(255,255,255,0.04)] px-5 py-4 text-base text-[var(--stitch-ref-text)] outline-none placeholder:text-[rgba(154,143,128,0.56)]"
                />
                <button type="submit" className="stitch-ref-button-primary !min-h-0 !px-8 !py-4 !text-base">
                  {t("Request Now")}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[rgba(154,143,128,0.08)] bg-[#070d18]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-8 text-sm text-[rgba(226,226,231,0.66)] lg:flex-row lg:items-center lg:justify-between lg:px-16">
          <div className={`flex flex-wrap gap-5 ${isRtl ? "lg:flex-row-reverse" : ""}`}>
            <Link to="/services">{t("Terms of Service")}</Link>
            <Link to="/legal">{t("Privacy Policy")}</Link>
            <Link to="/contact">{t("Customer Support")}</Link>
            <Link to="/about">{t("Global Offices")}</Link>
          </div>
          <div className={`flex items-center gap-4 ${isRtl ? "lg:flex-row-reverse" : ""}`}>
            <span className="stitch-ref-brand text-2xl">Creos</span>
            <span>{t("2024 CREOS. All rights reserved.")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
