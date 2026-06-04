import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Services() {
  const { t } = useTranslation();

  return (
    <div className="creos-theme bg-luxury relative min-h-screen overflow-hidden bg-[var(--creos-bg)] text-[var(--creos-text)]">

      <main className="section-shell relative z-10 max-w-6xl space-y-6 pb-12 pt-10">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{t("Services")}</h1>
          <p className="mt-2 max-w-3xl text-sm text-[color:rgb(var(--creos-text-rgb)/0.74)] md:text-base">
            {t("CREOS helps users move from property discovery to booking and follow-up with clear, trackable workflows.")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="card-glass rounded-3xl p-5">
            <h3 className="mb-2 font-semibold text-[color:var(--creos-text)]">{t("Booking And Usage Guidance")}</h3>
            <ul className="list-inside list-disc space-y-1.5 text-sm text-[color:rgb(var(--creos-text-rgb)/0.82)]">
              <li>{t("Booking data should be accurate and kept up to date.")}</li>
              <li>{t("Fake or misleading requests may lead to account restrictions.")}</li>
              <li>{t("Visit confirmation depends on property availability and agent approval.")}</li>
              <li>{t("Some listings may require deposit verification steps.")}</li>
            </ul>
          </div>

          <div className="card-glass rounded-3xl p-5">
            <h3 className="mb-2 font-semibold text-[color:var(--creos-text)]">{t("Privacy And Support")}</h3>
            <ul className="list-inside list-disc space-y-1.5 text-sm text-[color:rgb(var(--creos-text-rgb)/0.82)]">
              <li>{t("Contact details are used only for booking and offer communication.")}</li>
              <li>{t("Your data is not shared with unauthorized third parties.")}</li>
              <li>{t("Support requests can be tracked through in-app channels.")}</li>
              <li>{t("Platform usage implies agreement with policy and terms.")}</li>
            </ul>
          </div>
        </div>

        <div className="card-glass rounded-3xl p-5">
          <p className="text-sm text-[color:rgb(var(--creos-text-rgb)/0.74)]">
            {t("Need a full legal breakdown? Review the complete policy documentation.")}
          </p>
          <Link
            to="/legal"
            className="btn-glass mt-3 inline-flex px-4 py-2 text-sm"
          >
            {t("Terms And Privacy")}
          </Link>
        </div>
      </main>
    </div>
  );
}

