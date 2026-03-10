import { Children, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import gsap from "gsap";

import { cn } from "@/lib/utils";

type HorizontalDragGalleryProps = {
  children: ReactNode;
  className?: string;
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export default function HorizontalDragGallery({ children, className }: HorizontalDragGalleryProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const draggingRef = useRef(false);

  const rafRef = useRef<number | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const items = useMemo(() => Children.toArray(children), [children]);
  const childrenCount = items.length;

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();

    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const applyVisibility = () => {
      const cRect = container.getBoundingClientRect();
      const viewportCenter = cRect.left + cRect.width / 2;

      cardRefs.current.forEach((card) => {
        if (!card) return;

        if (reducedMotion) {
          gsap.set(card, { opacity: 1, scale: 1, filter: "none" });
          return;
        }

        const r = card.getBoundingClientRect();
        const isVisible = r.right > cRect.left && r.left < cRect.right;

        if (!isVisible) {
          gsap.set(card, { opacity: 0.45, scale: 0.98, filter: "blur(3px)" });
          return;
        }

        const cardCenter = r.left + r.width / 2;
        const d = Math.abs(cardCenter - viewportCenter);
        const t = clamp(1 - d / (cRect.width * 0.6), 0, 1);

        gsap.set(card, {
          opacity: 1,
          filter: "blur(0px)",
          scale: 1 + t * 0.03,
        });
      });
    };

    const scheduleUpdate = () => {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        applyVisibility();
      });
    };

    container.scrollTo({ left: 0, behavior: "auto" });
    scheduleUpdate();

    container.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    container.addEventListener("load", scheduleUpdate, true);

    return () => {
      container.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      container.removeEventListener("load", scheduleUpdate, true);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [childrenCount, reducedMotion]);

  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    draggingRef.current = true;
    setIsDragging(true);
    dragStartXRef.current = e.pageX - container.offsetLeft;
    dragStartScrollRef.current = container.scrollLeft;
  };

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || !draggingRef.current) return;

    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = x - dragStartXRef.current;
    container.scrollLeft = dragStartScrollRef.current - walk;
  };

  const stopDragging = () => {
    draggingRef.current = false;
    setIsDragging(false);
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        className={cn(
          "w-full overflow-x-auto overflow-y-hidden",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="inline-flex min-w-max items-center gap-6 px-6 py-12 whitespace-nowrap select-none">
          {items.map((child, index) => (
            <div
              key={`drag-item-${index}`}
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
