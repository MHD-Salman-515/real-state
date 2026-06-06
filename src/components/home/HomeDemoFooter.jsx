import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function HomeDemoFooter() {
  const { t } = useTranslation();

  return (
    <footer className="section-shell relative z-10 border-t border-[var(--creos-border-soft)] py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-lg font-semibold tracking-[0.26em] text-[color:var(--creos-text)]">CREOS</p>
            <p className="mt-2 text-sm text-[color:rgb(var(--creos-text-rgb)/0.64)]">
              {t("Premium real estate intelligence designed for confident property decisions.")}
            </p>
          </div>

          <nav className="flex flex-wrap gap-4 text-sm text-[color:rgb(var(--creos-text-rgb)/0.74)]">
            <Link to="/legal" className="transition hover:text-[color:var(--creos-accent-bright)]">
              {t("Rights")}
            </Link>
            <Link to="/services" className="transition hover:text-[color:var(--creos-accent-bright)]">
              {t("Guidelines")}
            </Link>
            <Link to="/legal" className="transition hover:text-[color:var(--creos-accent-bright)]">
              {t("Privacy")}
            </Link>
            <Link to="/contact" className="transition hover:text-[color:var(--creos-accent-bright)]">
              {t("Contact")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
