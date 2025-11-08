import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const routeLabels: Record<string, string> = {
  "": "Home",
  "hoe-het-werkt": "Hoe het werkt",
  "prijzen": "Prijzen",
  "results": "Voorbeeld resultaten",
  "blog": "Blog",
  "veelgestelde-vragen": "FAQ",
  "contact": "Contact",
  "over-ons": "Over ons",
  "dashboard": "Dashboard",
  "profile": "Profiel",
  "onboarding": "Stijlquiz",
  "inloggen": "Inloggen",
  "registreren": "Registreren",
  "privacy": "Privacy",
  "algemene-voorwaarden": "Voorwaarden",
  "cookies": "Cookies",
  "disclosure": "Disclosure",
  "admin": "Admin"
};

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const location = useLocation();

  const breadcrumbs = React.useMemo(() => {
    if (items) return items;

    const pathSegments = location.pathname.split("/").filter(Boolean);

    if (pathSegments.length === 0) {
      return [];
    }

    const crumbs: BreadcrumbItem[] = [];
    let currentPath = "";

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = routeLabels[segment] || segment
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      crumbs.push({
        label,
        path: currentPath
      });
    });

    return crumbs;
  }, [location.pathname, items]);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`ff-container py-4 ${className}`}
    >
      <ol className="flex items-center flex-wrap gap-2 text-sm">
        <li>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[var(--color-text)]/70 hover:text-[var(--color-text)] transition-colors rounded-lg px-2 py-1 hover:bg-[var(--color-surface)]"
            aria-label="Home"
          >
            <Home className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </li>

        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <React.Fragment key={crumb.path}>
              <li aria-hidden="true">
                <ChevronRight className="h-4 w-4 text-[var(--color-text)]/40" />
              </li>
              <li>
                {isLast ? (
                  <span
                    className="text-[var(--color-text)] font-medium px-2 py-1"
                    aria-current="page"
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-[var(--color-text)]/70 hover:text-[var(--color-text)] transition-colors rounded-lg px-2 py-1 hover:bg-[var(--color-surface)]"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
