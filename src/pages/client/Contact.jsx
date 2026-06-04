import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Contact() {
  const { t } = useTranslation();

  return (
    <div className="creos-theme bg-luxury relative min-h-screen overflow-hidden bg-[var(--creos-bg)] text-[var(--creos-text)]">

      <main className="section-shell relative z-10 max-w-6xl space-y-6 pb-12 pt-10">
        <section className="card-glass rounded-3xl p-6 md:p-8">
          <h1 className="text-2xl font-bold md:text-3xl">{t("Contact")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-[color:rgb(var(--creos-text-rgb)/0.74)] md:text-base">
            {t("Reach our operations team for listing support, booking questions, and platform assistance.")}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="card-glass rounded-2xl p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--creos-muted)]">{t("Email")}</div>
              <div className="mt-2 text-sm text-[color:var(--creos-text)]">SalmanSystemAdmin@creos.example</div>
            </div>
            <div className="card-glass rounded-2xl p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--creos-muted)]">{t("Phone")}</div>
              <div className="mt-2 text-sm text-[color:var(--creos-text)]">+963 938 411 333</div>
            </div>
            <div className="card-glass rounded-2xl p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--creos-muted)]">{t("Hours")}</div>
              <div className="mt-2 text-sm text-[color:var(--creos-text)]">Mon - Fri, 9:00 - 18:00</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[color:rgb(var(--creos-text-rgb)/0.74)]">
            <span>{t("For complete policy details:")}</span>
            <Link
              to="/legal"
              className="text-[color:var(--creos-accent-bright)] underline underline-offset-2 transition hover:text-[color:var(--creos-accent)]"
            >
              {t("Terms And Privacy")}
            </Link>
          </div>
        </section>

        <footer className="card-glass rounded-3xl">
          <div className="flex flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-[color:rgb(var(--creos-text-rgb)/0.72)] md:flex-row">
            <span>{t("© 2025 CREOS. All rights reserved.")}</span>
            <span className="text-[color:var(--creos-muted)]">{t("Design and development: CREOS Team")}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
