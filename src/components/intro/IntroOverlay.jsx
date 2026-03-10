import { useEffect, useState } from "react";
import Logo from "../brand/Logo.jsx";

export default function IntroOverlay({ open = false, onEnter, onClose }) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(id);
    }

    setVisible(false);
    const t = window.setTimeout(() => setMounted(false), 320);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mounted]);

  const enterIntro = () => onEnter?.();
  const skipIntro = () => onClose?.();

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden bg-black transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute inset-0">
        {!videoFailed ? (
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="/thumbs/t1.jpg"
            onError={() => setVideoFailed(true)}
          >
            <source src="/videos/intro-1.mp4" type="video/mp4" />
          </video>
        ) : (
          <img
            src="/images/hero-2.jpg"
            alt="CREOS intro background"
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="absolute inset-0 bg-black/65" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/60 to-black/85" />

      <div
        className={`relative z-10 mx-4 w-full max-w-2xl rounded-3xl border border-white/20 bg-black/35 p-8 text-center backdrop-blur-xl transition-all duration-300 sm:p-10 ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-white/15 bg-black/35 px-4 py-2">
          <Logo className="text-white/90" size={24} />
          <span className="text-sm font-semibold tracking-[0.2em] text-white">
            CREOS
          </span>
        </div>

        <h1 className="mt-6 text-3xl font-black text-white sm:text-4xl">
          Welcome To CREOS
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-200 sm:text-base">
          Centralized Real Estate Operations System
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={enterIntro}
            className="inline-flex min-w-40 items-center justify-center rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/10"
          >
            Enter CREOS
          </button>
          <button
            type="button"
            onClick={skipIntro}
            className="inline-flex min-w-32 items-center justify-center rounded-xl border border-white/35 bg-black/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
