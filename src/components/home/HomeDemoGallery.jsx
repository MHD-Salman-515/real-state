import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import RadialScrollGallery from "@/components/ui/portfolio-and-image-gallery";
import { Badge } from "@/components/ui/badge";

const FEATURED_PROPERTIES = [
  {
    id: 1,
    title: "Emerald Heights",
    cat: "Apartment",
    location: "Damascus • Mazzeh",
    price: "1.5B SYP",
    img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "Safe Harbor Villa",
    cat: "Villa",
    location: "Damascus • Malki",
    price: "4.2B SYP",
    img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "Skyline Studio",
    cat: "Studio",
    location: "Damascus • Kafar Souseh",
    price: "780M SYP",
    img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "Business Suite",
    cat: "Office",
    location: "Damascus • Baramkeh",
    price: "2.1B SYP",
    img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 5,
    title: "Calm Courtyard",
    cat: "Apartment",
    location: "Damascus • Abu Rummaneh",
    price: "1.9B SYP",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 6,
    title: "Luxe Lobby View",
    cat: "Apartment",
    location: "Damascus • Shaalan",
    price: "2.7B SYP",
    img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 7,
    title: "Modern Comfort",
    cat: "Apartment",
    location: "Damascus • Dummar",
    price: "1.2B SYP",
    img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 8,
    title: "Quiet Corner",
    cat: "Studio",
    location: "Damascus • Mezzeh West",
    price: "650M SYP",
    img: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80",
  },
];

export default function HomeDemoGallery() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  return (
    <div className="card-glass min-h-[600px] w-full overflow-hidden rounded-[1.75rem] text-[color:var(--creos-text)]">
      <div className="h-[300px] flex flex-col items-center justify-center px-4 text-center">
        <Badge variant="outline" className="mb-4 border-[rgb(var(--creos-accent-rgb)/0.2)] bg-[rgb(var(--creos-accent-rgb)/0.12)] text-[10px] tracking-[0.22em] uppercase text-[color:var(--creos-text)]">
          CREOS
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{t("Featured Properties")}</h2>
        <p className="mt-4 animate-bounce text-xs uppercase tracking-[0.25em] text-muted-foreground">{t("↓ Scroll")}</p>
      </div>

      <RadialScrollGallery
        className="!min-h-[600px]"
        baseRadius={400}
        mobileRadius={250}
        visiblePercentage={50}
        scrollDuration={2000}
      >
        {FEATURED_PROPERTIES.map((property) => (
          <button
            key={property.id}
            type="button"
            onClick={() => navigate("/properties")}
            className="group w-[260px] overflow-hidden rounded-[1.5rem] border border-[var(--creos-border-soft)] bg-[rgb(var(--creos-surface-rgb)/0.42)] shadow-glass backdrop-blur-glass transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-[rgb(var(--creos-accent-rgb)/0.22)]"
            style={{ textAlign: i18n.dir() === "rtl" ? "right" : "left" }}
          >
            <div className="relative h-40 w-full overflow-hidden">
              <img
                src={property.img}
                alt={property.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute right-3 top-3">
                <Badge className="bg-black/65 text-white">{t(property.cat)}</Badge>
              </div>
            </div>
            <div className="space-y-1.5 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-1 text-base font-semibold text-white">{property.title}</h3>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-white/90 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <p className="text-xs text-slate-300">{property.location}</p>
              <p className="text-sm font-semibold text-white/90">{property.price}</p>
            </div>
          </button>
        ))}
      </RadialScrollGallery>

      <div className="h-[300px] flex items-center justify-center px-4 text-center">
        <p className="text-sm text-muted-foreground">{t("Discover more listings on the properties page.")}</p>
      </div>
    </div>
  );
}
