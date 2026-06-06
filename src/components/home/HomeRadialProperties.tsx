import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PROPERTIES = [
  { id: 1, title: "Emerald Heights", cat: "Apartment", location: "Damascus • Mazzeh", price: "1.5B SYP", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80" },
  { id: 2, title: "Safe Harbor Villa", cat: "Villa", location: "Damascus • Malki", price: "4.2B SYP", img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80" },
  { id: 3, title: "Skyline Studio", cat: "Studio", location: "Damascus • Kafar Souseh", price: "780M SYP", img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80" },
  { id: 4, title: "Business Suite", cat: "Office", location: "Damascus • Baramkeh", price: "2.1B SYP", img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80" },
  { id: 5, title: "Calm Courtyard", cat: "Apartment", location: "Damascus • Abu Rummaneh", price: "1.9B SYP", img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80" },
  { id: 6, title: "Modern Comfort", cat: "Apartment", location: "Damascus • Dummar", price: "1.2B SYP", img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80" },
];

export default function HomeRadialProperties() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  return (
    <div className="relative min-h-[70vh] bg-[linear-gradient(180deg,rgba(10,17,40,0.92),rgba(17,20,21,0.96))] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-[var(--creos-border-soft)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-[color:var(--creos-muted)]">{t("Property Intelligence Layer")}</p>
          <h3 className="mt-2 text-2xl font-semibold text-[color:var(--creos-text)] sm:text-3xl">
            {t("Featured Properties")}
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:rgb(var(--creos-text-rgb)/0.7)]">
            {t("Discover more listings on the properties page.")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/properties")}
          className="btn-gold px-5 py-2.5 text-sm"
        >
          {t("View Properties")}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PROPERTIES.map((property) => (
          <button
            key={property.id}
            type="button"
            onClick={() => navigate("/properties")}
            className="group relative overflow-hidden rounded-[1.6rem] border border-[var(--creos-border-soft)] bg-[rgb(var(--creos-surface-rgb)/0.42)] text-start shadow-glass backdrop-blur-glass"
            style={{ textAlign: i18n.dir() === "rtl" ? "right" : "left" }}
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src={property.img}
                alt={property.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--creos-bg-rgb)/0.94)] via-[rgb(var(--creos-bg-rgb)/0.18)] to-transparent" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-4">
                <span className="badge-creos px-3 py-1 text-[10px] uppercase tracking-[0.18em]">
                  {t(property.cat)}
                </span>
                <span className="rounded-full border border-[var(--creos-border-soft)] bg-[rgb(var(--creos-surface-rgb)/0.74)] p-2 text-[color:var(--creos-accent-bright)]">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </div>

            <div className="space-y-2 p-5">
              <h4 className="text-lg font-semibold text-[color:var(--creos-text)]">{property.title}</h4>
              <p className="text-sm text-[color:rgb(var(--creos-text-rgb)/0.68)]">{property.location}</p>
              <p className="pt-2 text-base font-semibold text-[color:var(--creos-accent-bright)]">{property.price}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
