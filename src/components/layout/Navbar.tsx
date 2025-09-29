import React from 'react';
import { NavLink } from 'react-router-dom';

const nav = [
  { to: '/', label: 'Home' },
  { to: '/hoe-het-werkt', label: 'Hoe het werkt' },
  { to: '/prijzen', label: 'Prijzen' },
  { to: '/over-ons', label: 'Over ons' },
  { to: '/veelgestelde-vragen', label: 'FAQ' },
];

export default function Navbar() {
  return (
    <header className="ff-nav-glass">
      <nav className="ff-container flex items-center justify-between py-3" aria-label="Hoofdnavigatie">
        <a href="/" className="inline-flex items-center gap-2 ff-logo">
          <span className="ff-logo-dot" aria-hidden />
          <span className="ff-logo-text">FitFi</span>
        </a>

        <ul className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                className={({ isActive }) => ['ff-navlink', isActive ? 'ff-nav-active' : ''].join(' ')}
              >
                {n.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a href="/onboarding" className="ff-btn ff-btn-primary ff-cta-raise" data-cta="primary">
            Start gratis
          </a>
        </div>
      </nav>
    </header>
  );
}