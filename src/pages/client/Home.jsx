import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "../../components/ToastProvider.jsx";
import HeroShowcase from "../../components/home/HeroShowcase.jsx";
import { notify } from "@/components/notifications/NotificationsProvider";

const DRAFT_KEY = "bookvisit_draft_v1";
const LAST_SEARCH_KEY = "last_search_v1";

export default function Home() {
  const nav = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

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
          toast.info(t("You have an unfinished booking draft."));
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
      toast.info(t("Price range was adjusted (min/max)."));
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
    toast.success(t("Quick search applied."));
    notify({
      type: "search",
      title: t("Search applied"),
      message: t("Your filters were applied successfully."),
    });
    nav(`/search?${params.toString()}`);
  };

  const applyLastSearch = () => {
    if (!lastSearch) return;
    const q = new URLSearchParams();
    Object.entries(lastSearch).forEach(([k, v]) => v && q.set(k, v));
    toast.info(t("Last search filters restored."));
    nav(`/search?${q.toString()}`);
  };

  const clearLastSearch = () => {
    try {
      localStorage.removeItem(LAST_SEARCH_KEY);
    } catch {
      // ignore storage write errors
    }
    setLastSearch(null);
    toast.info(t("Last search cleared."));
  };

  const resetForm = () => {
    setQuick({ city: "", type: "", minPrice: "", maxPrice: "" });
    toast.info(t("Search form reset."));
  };

  return (
    <div className="creos-theme bg-luxury relative flex min-h-screen flex-col overflow-hidden bg-[var(--creos-bg)] text-[var(--creos-text)]">
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
            toast.info(t("Moving to properties."));
            nav("/properties");
          }}
          onSecondaryCta={() => {
            toast.info(t("Continue your booking flow."));
            nav("/client/book-visit");
          }}
          onContinueDraft={() => {
            toast.info(t("Opening your draft booking."));
            nav("/client/book-visit");
          }}
        />

        <section className="section-shell max-w-6xl">
          <div className="grid gap-4 md:grid-cols-3">
            <article className="card-glass hover-card-pop p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--creos-muted)]">{t("Precision Search")}</div>
              <h3 className="mt-2 text-lg font-semibold">{t("Discover Listings Faster")}</h3>
              <p className="mt-2 text-sm text-[color:rgb(var(--creos-text-rgb)/0.72)]">{t("Filter by city, type, and price range with instant query-driven navigation.")}</p>
            </article>
            <article className="card-glass hover-card-pop p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--creos-muted)]">{t("Visit Workflow")}</div>
              <h3 className="mt-2 text-lg font-semibold">{t("Book With Clear Steps")}</h3>
              <p className="mt-2 text-sm text-[color:rgb(var(--creos-text-rgb)/0.72)]">{t("Use structured booking and follow-up actions to confirm visits reliably.")}</p>
            </article>
            <article className="card-glass hover-card-pop p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--creos-muted)]">{t("Operations Ready")}</div>
              <h3 className="mt-2 text-lg font-semibold">{t("CREOS Central Control")}</h3>
              <p className="mt-2 text-sm text-[color:rgb(var(--creos-text-rgb)/0.72)]">{t("Manage property discovery, requests, and communication in one place.")}</p>
            </article>
          </div>
        </section>

        <section className="section-shell max-w-6xl">
          <div className="card-glass p-6 md:p-8">
            <h2 className="text-2xl font-bold md:text-3xl">{t("Explore the full CREOS experience")}</h2>
            <p className="mt-3 max-w-2xl text-sm text-[color:rgb(var(--creos-text-rgb)/0.74)] md:text-base">
              {t("Browse curated properties, review services, learn about our workflow, and contact the team from dedicated pages.")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/properties" className="btn-gold px-5 py-2.5 text-sm">
                {t("View Properties")}
              </Link>
              <Link to="/services" className="btn-glass px-5 py-2.5 text-sm">
                {t("See Services")}
              </Link>
              <Link to="/contact" className="btn-glass px-5 py-2.5 text-sm">
                {t("Contact Team")}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
