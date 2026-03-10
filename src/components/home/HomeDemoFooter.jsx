import { Link } from "react-router-dom";

const FOOTER_LINKS = [
  { label: "Quick Search", href: "#quick-search", isAnchor: true },
  { label: "Properties", href: "/properties" },
  { label: "Search", href: "/search" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

export default function HomeDemoFooter() {
  return (
    <footer className="mt-10 border-t bg-muted/30 px-4 py-8 text-muted-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 text-sm md:flex-row">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {FOOTER_LINKS.map((link) =>
            link.isAnchor ? (
              <a key={link.label} href={link.href} className="transition hover:text-foreground">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} to={link.href} className="transition hover:text-foreground">
                {link.label}
              </Link>
            )
          )}
        </div>
        <p className="text-xs">CREOS / UrbanX</p>
      </div>
    </footer>
  );
}
