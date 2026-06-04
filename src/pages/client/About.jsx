import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="creos-theme bg-luxury relative min-h-screen overflow-hidden bg-[var(--creos-bg)] text-[var(--creos-text)]">

      <main className="section-shell relative z-10 max-w-6xl space-y-6 pb-12 pt-10">
        <section className="pt-2">
          <div className="card-glass relative space-y-5 rounded-3xl p-5 md:p-7">
              <div className="space-y-1">
                <div className="badge-creos inline-flex items-center gap-2 px-3 py-1 text-[11px]">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-[rgb(var(--creos-accent-rgb)/0.82)]" />
                  <span>{t("Platform Rights And Operating Standards")}</span>
                </div>
                <h1 className="text-2xl font-bold md:text-3xl">
                  {t("Safe And Transparent Usage For")} <span className="text-[color:var(--creos-accent-bright)]">CREOS</span>
                </h1>
                <p className="max-w-3xl text-sm text-[color:rgb(var(--creos-text-rgb)/0.74)] md:text-base">
                  {t("Before browsing, booking, or submitting requests, users should understand the core principles that keep the platform fair and reliable for clients, agents, and property owners.")}
                </p>
              </div>

              <div className="grid gap-4 text-sm md:grid-cols-2">
                <div className="card-glass space-y-2 rounded-2xl p-4">
                  <h3 className="font-semibold text-[color:var(--creos-text)]">{t("User Rights")}</h3>
                  <ul className="list-inside list-disc space-y-1.5 text-[color:rgb(var(--creos-text-rgb)/0.82)]">
                    <li>{t("Review listing details before requesting a visit.")}</li>
                    <li>{t("Cancel or update a request within allowed windows.")}</li>
                    <li>{t("Protect personal contact data and communication privacy.")}</li>
                    <li>{t("Receive clear updates on booking and request status.")}</li>
                  </ul>
                </div>

                <div className="card-glass space-y-2 rounded-2xl p-4">
                  <h3 className="font-semibold text-[color:var(--creos-text)]">{t("About The System")}</h3>
                  <p className="text-[color:rgb(var(--creos-text-rgb)/0.74)]">
                    {t("CREOS is designed as a centralized real estate operations system to align discovery, visits, support, and operational communication in one experience.")}
                  </p>
                </div>
              </div>
          </div>
        </section>
      </main>
    </div>
  );
}

