import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ContainerScroll({ eyebrow, title, description, children }) {
  const sectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const syncViewport = () => setIsMobile(window.innerWidth < 768);
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const headerY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.15, 0.8, 1], [1, 1, 0.4, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], isMobile ? [0.7, 0.9] : [1.05, 1]);
  const shadow = useTransform(
    scrollYProgress,
    [0, 1],
    [
      "0 50px 120px rgba(0,0,0,0.58), 0 0 0 1px rgba(255,255,255,0.04)",
      "0 28px 70px rgba(0,0,0,0.36), 0 0 0 1px rgba(255,255,255,0.08)",
    ],
  );

  return (
    <section ref={sectionRef} className="relative min-h-[220vh]">
      <div className="sticky top-0 flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center">
          <motion.div
            style={{ y: headerY, opacity: headerOpacity }}
            className="mb-8 flex max-w-3xl flex-col items-center text-center"
          >
            {eyebrow ? (
              <span className="badge-creos mb-4 px-4 py-1.5 text-[11px] uppercase tracking-[0.28em]">
                {eyebrow}
              </span>
            ) : null}
            <h2 className="max-w-4xl text-3xl font-semibold tracking-[0.08em] text-[color:var(--creos-text)] sm:text-4xl lg:text-6xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:rgb(var(--creos-text-rgb)/0.72)] sm:text-base">
                {description}
              </p>
            ) : null}
          </motion.div>

          <div
            className="w-full max-w-6xl [perspective:1400px]"
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.div
              style={{ rotateX, scale, boxShadow: shadow, transformStyle: "preserve-3d" }}
              className="overflow-hidden rounded-[2rem] border border-[rgb(var(--creos-accent-rgb)/0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] backdrop-blur-xl"
            >
              {children}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
