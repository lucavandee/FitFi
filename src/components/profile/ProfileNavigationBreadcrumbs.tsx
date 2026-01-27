/**
 * ProfileNavigationBreadcrumbs Component
 *
 * Clear navigation hierarchy for profile section
 *
 * Key Principles:
 * - Always know where you are ("Profiel > Instellingen")
 * - Easy to go back (clickable breadcrumbs)
 * - Mobile-friendly (shortened labels)
 * - Semantic HTML (nav + aria)
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface Breadcrumb {
  label: string;
  shortLabel?: string;
  path: string;
  current?: boolean;
}

export function ProfileNavigationBreadcrumbs() {
  const location = useLocation();

  const getBreadcrumbs = (): Breadcrumb[] => {
    const path = location.pathname;
    const hash = location.hash;

    // Base breadcrumb
    const crumbs: Breadcrumb[] = [
      { label: 'Home', shortLabel: 'Home', path: '/' }
    ];

    // Profile section
    if (path.includes('/profile')) {
      crumbs.push({
        label: 'Mijn Stijlprofiel',
        shortLabel: 'Profiel',
        path: '/profile',
        current: !hash
      });

      // Sub-sections based on hash
      if (hash === '#email-preferences') {
        crumbs.push({
          label: 'Email Voorkeuren',
          shortLabel: 'Email',
          path: '/profile#email-preferences',
          current: true
        });
      } else if (hash === '#privacy') {
        crumbs.push({
          label: 'Privacy & Cookies',
          shortLabel: 'Privacy',
          path: '/profile#privacy',
          current: true
        });
      }
    }

    // Dashboard
    if (path.includes('/dashboard')) {
      crumbs.push({
        label: 'Dashboard',
        shortLabel: 'Dashboard',
        path: '/dashboard',
        current: true
      });
    }

    // Results
    if (path.includes('/results')) {
      crumbs.push({
        label: 'Mijn Outfits',
        shortLabel: 'Outfits',
        path: '/results',
        current: true
      });
    }

    // Shop
    if (path.includes('/shop')) {
      crumbs.push({
        label: 'Shop',
        shortLabel: 'Shop',
        path: '/shop',
        current: true
      });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Don't show if only home
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Navigatie pad" className="mb-6">
      <ol className="flex items-center flex-wrap gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isHome = index === 0;

          return (
            <li key={crumb.path} className="flex items-center gap-2">
              {/* Separator */}
              {index > 0 && (
                <ChevronRight
                  className="w-4 h-4 text-[var(--color-muted)]"
                  aria-hidden="true"
                />
              )}

              {/* Breadcrumb Link or Current */}
              {isLast || crumb.current ? (
                <span
                  className="font-medium text-[var(--color-text)]"
                  aria-current="page"
                >
                  {/* Show shortLabel on mobile, full label on desktop */}
                  <span className="hidden sm:inline">{crumb.label}</span>
                  <span className="sm:hidden">{crumb.shortLabel || crumb.label}</span>
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="flex items-center gap-1 text-[var(--color-muted)] hover:text-[var(--ff-color-primary-600)] transition-colors"
                >
                  {isHome && (
                    <Home className="w-4 h-4" aria-hidden="true" />
                  )}
                  {/* Show shortLabel on mobile, full label on desktop */}
                  <span className="hidden sm:inline">{crumb.label}</span>
                  <span className="sm:hidden">{crumb.shortLabel || crumb.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default ProfileNavigationBreadcrumbs;
