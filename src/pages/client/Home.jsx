import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastProvider.jsx";
import HeroShowcase from "../../components/home/HeroShowcase.jsx";
import { notify } from "@/components/notifications/NotificationsProvider";

const DRAFT_KEY = "bookvisit_draft_v1";
const LAST_SEARCH_KEY = "last_search_v1";

export default function Home() {
  const nav = useNavigate();
  const toast = useToast();

  const [quick, setQuick] = useState({
    city: "",
    type: "",
    minPrice: "",
    maxPrice: "",
  });
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSearch, setLastSearch] = useState(null);
  const draftToastShownRef = useRef(false);

  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      const exists = !!draft;
      setHasDraft(exists);
      if (exists) {
        const shownInSession = sessionStorage.getItem("draft_toast_shown") === "true";
        if (!draftToastShownRef.current && !shownInSession) {
          toast.info("You have an unfinished booking draft.");
          draftToastShownRef.current = true;
          sessionStorage.setItem("draft_toast_shown", "true");
        }
      }
    } catch {
      // ignore storage read errors
    }

    try {
      const saved = localStorage.getItem(LAST_SEARCH_KEY);
      if (saved) setLastSearch(JSON.parse(saved));
    } catch {
      // ignore storage read errors
    }
  }, [toast]);

  const onlyNum = (v) => v.replace(/[^\d]/g, "");

  const onQuickSearch = (e) => {
    e.preventDefault();

    let min = quick.minPrice ? Number(quick.minPrice) : "";
    let max = quick.maxPrice ? Number(quick.maxPrice) : "";
    if (min !== "" && max !== "" && min > max) {
      const tmp = min;
      min = max;
      max = tmp;
      toast.info("Price range was adjusted (min/max).");
    }

    const query = {
      city: quick.city.trim(),
      type: quick.type,
      ...(min !== "" ? { minPrice: String(min) } : {}),
      ...(max !== "" ? { maxPrice: String(max) } : {}),
    };

    try {
      localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(query));
    } catch {
      // ignore storage write errors
    }

    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => v && params.set(k, v));
    toast.success("Quick search applied.");
    notify({
      type: "search",
      title: "Search applied",
      message: "Your filters were applied successfully.",
    });
    nav(`/search?${params.toString()}`);
  };

  const applyLastSearch = () => {
    if (!lastSearch) return;
    const q = new URLSearchParams();
    Object.entries(lastSearch).forEach(([k, v]) => v && q.set(k, v));
    toast.info("Last search filters restored.");
    nav(`/search?${q.toString()}`);
  };

  const clearLastSearch = () => {
    try {
      localStorage.removeItem(LAST_SEARCH_KEY);
    } catch {
      // ignore storage write errors
    }
    setLastSearch(null);
    toast.info("Last search cleared.");
  };

  const resetForm = () => {
    setQuick({ city: "", type: "", minPrice: "", maxPrice: "" });
    toast.info("Search form reset.");
  };

  return (
    <div className="creos-theme relative flex min-h-screen flex-col overflow-hidden bg-[var(--creos-bg)] text-[var(--creos-text)]">
      <main className="relative z-10 flex-1 space-y-10 pb-12">
        <HeroShowcase
          quick={quick}
          setQuick={setQuick}
          onQuickSearch={onQuickSearch}
          onlyNum={onlyNum}
          resetForm={resetForm}
          lastSearch={lastSearch}
          applyLastSearch={applyLastSearch}
          clearLastSearch={clearLastSearch}
          hasDraft={hasDraft}
          onPrimaryCta={() => {
            toast.info("Moving to properties.");
            nav("/properties");
          }}
          onSecondaryCta={() => {
            toast.info("Continue your booking flow.");
            nav("/client/book-visit");
          }}
          onContinueDraft={() => {
            toast.info("Opening your draft booking.");
            nav("/client/book-visit");
          }}
        />

        <section className="mx-auto w-full max-w-6xl px-4 lg:px-0">
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-white/15 bg-black/40 p-5 backdrop-blur-xl">
              <div className="text-[11px] uppercase tracking-wide text-white/90">Precision Search</div>
              <h3 className="mt-2 text-lg font-semibold">Discover Listings Faster</h3>
              <p className="mt-2 text-sm text-slate-300">Filter by city, type, and price range with instant query-driven navigation.</p>
            </article>
            <article className="rounded-2xl border border-white/15 bg-black/40 p-5 backdrop-blur-xl">
              <div className="text-[11px] uppercase tracking-wide text-white/90">Visit Workflow</div>
              <h3 className="mt-2 text-lg font-semibold">Book With Clear Steps</h3>
              <p className="mt-2 text-sm text-slate-300">Use structured booking and follow-up actions to confirm visits reliably.</p>
            </article>
            <article className="rounded-2xl border border-white/15 bg-black/40 p-5 backdrop-blur-xl">
              <div className="text-[11px] uppercase tracking-wide text-white/90">Operations Ready</div>
              <h3 className="mt-2 text-lg font-semibold">CREOS Central Control</h3>
              <p className="mt-2 text-sm text-slate-300">Manage property discovery, requests, and communication in one place.</p>
            </article>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 lg:px-0">
          <div className="rounded-3xl border border-white/15 bg-gradient-to-r from-black/70 via-white/10 to-black/70 p-6 shadow-xl shadow-white/10 backdrop-blur-xl md:p-8">
            <h2 className="text-2xl font-bold md:text-3xl">Explore the full CREOS experience</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
              Browse curated properties, review services, learn about our workflow, and contact the team from dedicated pages.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/properties" className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/10">
                View Properties
              </Link>
              <Link to="/services" className="rounded-xl border border-white/30 bg-black/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                See Services
              </Link>
              <Link to="/contact" className="rounded-xl border border-white/30 bg-black/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                Contact Team
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
