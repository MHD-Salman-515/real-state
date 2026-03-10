import React, { Children, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type RadialScrollGalleryProps = {
  children: React.ReactNode;
  className?: string;
  baseRadius?: number;
  mobileRadius?: number;
  visiblePercentage?: number;
  scrollDuration?: number;
  startTrigger?: string;
};

export default function RadialScrollGallery({
  children,
  className,
  baseRadius = 400,
  mobileRadius = 250,
  visiblePercentage = 50,
  scrollDuration = 2000,
  startTrigger = "top top",
}: RadialScrollGalleryProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const items = useMemo(() => Children.toArray(children), [children]);
  const childrenCount = items.length;

  const [currentRadius, setCurrentRadius] = useState(baseRadius);
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
    const onResize = () => {
      setCurrentRadius(window.innerWidth < 768 ? mobileRadius : baseRadius);
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [baseRadius, mobileRadius]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = setTimeout(() => ScrollTrigger.refresh(), 250);
    return () => clearTimeout(t);
  }, [childrenCount, currentRadius]);

  useGSAP(
    () => {
      if (!ringRef.current || !pinRef.current) return;

      const validItems = itemRefs.current.filter(Boolean) as HTMLDivElement[];
      gsap.set(ringRef.current, { rotation: 0 });

      const applyDepthState = (rotationValue: number) => {
        if (reducedMotion || validItems.length === 0) return;

        const segment = 360 / Math.max(validItems.length, 1);
        const frontAngle = 0;

        validItems.forEach((el, index) => {
          const raw = (index * segment + rotationValue) % 360;
          const absolute = ((raw + 360) % 360);
          const delta = Math.abs(absolute - frontAngle);
          const angleDistance = Math.min(delta, 360 - delta);
          const t = Math.min(angleDistance / 180, 1);

          const opacity = gsap.utils.interpolate(1, 0.45, t);
          const scale = gsap.utils.interpolate(1.05, 0.97, t);
          const blur = gsap.utils.interpolate(0, 2, t);

          gsap.set(el, {
            opacity,
            scale,
            filter: `blur(${blur}px)`,
          });
        });
      };

      if (!reducedMotion && validItems.length > 0) {
        gsap.set(validItems, { autoAlpha: 0, scale: 0.92, filter: "blur(1px)" });
        gsap.to(validItems, {
          autoAlpha: 1,
          scale: 1,
          filter: "blur(0px)",
          stagger: 0.06,
          ease: "power2.out",
          scrollTrigger: {
            trigger: pinRef.current,
            start: "top 82%",
            end: "top 40%",
            scrub: 1,
          },
        });
      } else if (validItems.length > 0) {
        gsap.set(validItems, { autoAlpha: 1, scale: 1, filter: "blur(0px)" });
      }

      const rotateTo = gsap.quickTo(ringRef.current, "rotation", {
        duration: reducedMotion ? 0 : 0.6,
        ease: "power3.out",
      });

      const tween = gsap.to(ringRef.current, {
        rotation: 360,
        ease: "none",
        scrollTrigger: {
          trigger: pinRef.current,
          pin: true,
          pinSpacing: true,
          start: startTrigger,
          end: `+=${scrollDuration}`,
          scrub: reducedMotion ? 1 : 1.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const target = self.progress * 360;
            rotateTo(target);
            const current = Number(gsap.getProperty(ringRef.current!, "rotation"));
            applyDepthState(current);
          },
        },
      });

      applyDepthState(0);

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: rootRef, dependencies: [scrollDuration, startTrigger, childrenCount, currentRadius, reducedMotion] }
  );

  return (
    <div
      ref={rootRef}
      className={cn("relative w-full", className)}
      style={{ minHeight: `${Math.max(scrollDuration + 900, 1800)}px` }}
    >
      <div ref={pinRef} className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 grid place-items-center">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              maskImage: `radial-gradient(circle at center, black ${visiblePercentage}%, transparent 100%)`,
              WebkitMaskImage: `radial-gradient(circle at center, black ${visiblePercentage}%, transparent 100%)`,
            }}
          />

          <div
            ref={ringRef}
            className="relative h-[680px] w-[680px] md:h-[860px] md:w-[860px]"
            style={{ transformOrigin: "50% 50%" }}
          >
            {items.map((child, index) => {
              const angle = (360 / Math.max(items.length, 1)) * index;

              return (
                <div
                  key={`radial-item-${index}`}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `rotate(${angle}deg) translate(${currentRadius}px) rotate(${-angle}deg)`,
                    transformOrigin: "0 0",
                    willChange: "transform, opacity, filter",
                  }}
                >
                  {child}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
