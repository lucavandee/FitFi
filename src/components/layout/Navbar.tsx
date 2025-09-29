import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/hoe-het-werkt', label: 'Hoe het werkt' },
  { to: '/prijzen', label: 'Prijzen' },
  { to: '/over-ons', label: 'Over ons' },
  { to: '/veelgestelde-vragen', label: 'FAQ' },
];

export default function Navbar() {
  return (
    <header className="ff-nav-glass sticky top-0 z-50 backdrop-blur supports-backdrop-blur">
      <nav
        className="ff-container flex items-center justify-between py-3"
        aria-label="Hoofdnavigatie"
      >
        <div className="flex items-center gap-3">
          <a href="/" className="inline-flex items-center gap-2 ff-logo">
            <span className="ff-logo-dot" aria-hidden="true" />
            <span className="ff-logo-text">FitFi</span>
          </a>
        </div>

        <ul className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  [
                    'ff-navlink',
                    isActive ? 'ff-nav-active' : 'hover:text-[var(--ff-color-primary-600)]',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href="/onboarding"
            className="ff-btn ff-btn-primary ff-cta-raise"
            data-cta="primary"
          >
            Start gratis
          </a>
        </div>
      </nav>
    </header>
  );
}