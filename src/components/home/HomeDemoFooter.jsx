import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const FOOTER_LINKS = [
  { label: "Quick Search", href: "#quick-search", isAnchor: true },
  { label: "Properties", href: "/properties" },
  { label: "Search", href: "/search" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

export default function HomeDemoFooter() {
  const { t } = useTranslation();

  return (
    <footer className="section-shell relative z-10 mt-6 pb-8">
      <div className="card-glass flex w-full flex-col items-center justify-between gap-4 rounded-[1.75rem] px-5 py-6 text-sm text-[color:rgb(var(--creos-text-rgb)/0.72)] md:flex-row">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {FOOTER_LINKS.map((link) =>
            link.isAnchor ? (
              <a key={link.label} href={link.href} className="transition hover:text-[color:var(--creos-accent-bright)]">
                {t(link.label)}
              </a>
            ) : (
              <Link key={link.label} to={link.href} className="transition hover:text-[color:var(--creos-accent-bright)]">
                {t(link.label)}
              </Link>
            )
          )}
        </div>
        <p className="text-xs uppercase tracking-[0.22em] text-[color:rgb(var(--creos-text-rgb)/0.56)]">CREOS / UrbanX</p>
      </div>
    </footer>
  );
}
