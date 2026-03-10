import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import HorizontalDragGallery from "@/components/ui/horizontal-drag-gallery";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/components/notifications/useNotifications";

const PROPERTIES = [
  { id: 1, title: "Emerald Heights", cat: "Apartment", location: "Damascus • Mazzeh", price: "1.5B SYP", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80" },
  { id: 2, title: "Safe Harbor Villa", cat: "Villa", location: "Damascus • Malki", price: "4.2B SYP", img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80" },
  { id: 3, title: "Skyline Studio", cat: "Studio", location: "Damascus • Kafar Souseh", price: "780M SYP", img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80" },
  { id: 4, title: "Business Suite", cat: "Office", location: "Damascus • Baramkeh", price: "2.1B SYP", img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80" },
  { id: 5, title: "Calm Courtyard", cat: "Apartment", location: "Damascus • Abu Rummaneh", price: "1.9B SYP", img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80" },
  { id: 6, title: "Luxe Lobby View", cat: "Apartment", location: "Damascus • Shaalan", price: "2.7B SYP", img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80" },
  { id: 7, title: "Modern Comfort", cat: "Apartment", location: "Damascus • Dummar", price: "1.2B SYP", img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80" },
  { id: 8, title: "Quiet Corner", cat: "Studio", location: "Damascus • Mezzeh West", price: "650M SYP", img: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80" },
];

export default function HomeRadialProperties() {
  const navigate = useNavigate();
  const { notify } = useNotifications();

  return (
    <div id="quick-search" className="min-h-screen w-full bg-transparent overflow-x-hidden text-white">
      <div className="h-[300px] flex flex-col items-center justify-center px-4 text-center">
        <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">CREOS</p>
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">Featured Properties</h2>
        <p className="mt-4 animate-bounce text-xs uppercase tracking-[0.25em] text-muted-foreground">↓ Scroll</p>
      </div>

      <HorizontalDragGallery className="!min-h-screen">
        {PROPERTIES.map((property) => (
          <button
            key={property.id}
            type="button"
            onClick={() => {
              notify({
                type: "properties",
                title: "Property opened",
                message: `You viewed ${property.title} • ${property.location}`,
              });
              navigate("/properties");
            }}
            className="group relative w-[200px] h-[280px] sm:w-[240px] sm:h-[320px] overflow-hidden rounded-xl bg-black/35 border border-white/10 shadow-lg text-left"
          >
            <img
              src={property.img}
              alt={property.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute left-3 top-3">
              <Badge variant="secondary" className="border-white/10 bg-white/15 text-[10px] uppercase tracking-wide text-white">
                {property.cat}
              </Badge>
            </div>

            <div className="absolute right-3 top-3 rounded-full bg-background/90 p-1.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              <ArrowUpRight className="h-4 w-4" />
            </div>

            <div className="absolute inset-x-0 bottom-0 p-3">
              <h3 className="line-clamp-1 text-base font-semibold text-white">{property.title}</h3>
              <p className="mt-1 line-clamp-1 text-xs text-white/60">{property.location}</p>
              <p className="mt-1 text-sm font-semibold text-white/90">{property.price}</p>
            </div>
          </button>
        ))}
      </HorizontalDragGallery>

      <div className="h-[300px]" />
    </div>
  );
}
