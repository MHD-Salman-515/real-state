import { Children, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type HorizontalScrollGalleryProps = {
  children: ReactNode;
  className?: string;
  startTrigger?: string;
  endPadding?: number;
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export default function HorizontalScrollGallery({
  children,
  className,
  startTrigger = "top top",
  endPadding = 280,
}: HorizontalScrollGalleryProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  const items = useMemo(() => Children.toArray(children), [children]);
  const childrenCount = items.length;

  const [distance, setDistance] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();

    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!trackRef.current || typeof window === "undefined") return;

    const recalc = () => {
      const trackWidth = trackRef.current?.scrollWidth ?? 0;
      const viewportWidth = window.innerWidth;
      const next = Math.max(0, trackWidth - viewportWidth + endPadding);
      setDistance(next);
    };

    recalc();

    const ro = new ResizeObserver(recalc);
    ro.observe(trackRef.current);
    window.addEventListener("resize", recalc);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalc);
    };
  }, [childrenCount, endPadding]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => clearTimeout(t);
  }, [distance, childrenCount, reducedMotion]);

  useGSAP(
    () => {
      if (!pinRef.current || !trackRef.current) return;

      const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      gsap.set(trackRef.current, { x: 0 });

      const applyFocus = () => {
        if (cards.length === 0) return;

        const viewportCenter = window.innerWidth / 2;

        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          const d = Math.abs(cardCenter - viewportCenter);
          const t = clamp(1 - d / (window.innerWidth * 0.6), 0, 1);

          if (reducedMotion) {
            gsap.set(card, {
              opacity: 0.92,
              scale: 1,
              filter: "none",
            });
            return;
          }

          const blur = (1 - t) * 4;
          const opacity = 0.35 + t * 0.65;
          const scale = 0.96 + t * 0.1;

          gsap.set(card, {
            opacity,
            scale,
            filter: `blur(${blur}px)`,
          });
        });
      };

      applyFocus();

      if (reducedMotion || distance <= 0) {
        return () => {
          ScrollTrigger.getAll().forEach((st) => {
            if (st.trigger === pinRef.current) st.kill();
          });
        };
      }

      const tween = gsap.to(trackRef.current, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: pinRef.current,
          pin: true,
          pinSpacing: true,
          start: startTrigger,
          end: `+=${distance}`,
          scrub: 1.4,
          invalidateOnRefresh: true,
          onUpdate: () => {
            applyFocus();
          },
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: rootRef, dependencies: [distance, childrenCount, reducedMotion, startTrigger] }
  );

  if (reducedMotion) {
    return (
      <div ref={rootRef} className={cn("relative w-full", className)}>
        <div ref={pinRef} className="relative w-full">
          <div
            ref={trackRef}
            className="flex w-max gap-6 overflow-x-auto px-6 py-12"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {items.map((child, index) => (
              <div
                key={`horizontal-item-rm-${index}`}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className="shrink-0"
                style={{ willChange: "transform, opacity, filter" }}
              >
                {child}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={cn("relative w-full", className)}
      style={{ minHeight: `${Math.max(distance + 1200, 1800)}px` }}
    >
      <div ref={pinRef} className="relative min-h-screen overflow-hidden">
        <div
          ref={trackRef}
          className="flex w-max gap-6 px-10 py-16"
          style={{ willChange: "transform" }}
        >
          {items.map((child, index) => (
            <div
              key={`horizontal-item-${index}`}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className="shrink-0"
              style={{ willChange: "transform, opacity, filter" }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
