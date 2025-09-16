import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useUser } from "@/context/UserContext";
import Logo from "@/components/ui/Logo";
import { NAV_ITEMS } from "@/constants/nav";
import MobileNavDrawer from "./MobileNavDrawer";

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="navbar" aria-label="Hoofdnavigatie">
      <div className="container nav-inner">
        {/* Left: brand */}
        <div className="flex items-center gap-3">
          <Link to="/" aria-label="Home" className="inline-flex items-center">
            <Logo className="h-6 w-auto" />
          </Link>
        </div>

        {/* Center: Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
              <a key={n.href} href={n.href} className={`nav-link ${isActive(n.href) ? "is-active" : ""}`}>{n.label}</a>
              <a key={item.href} href={item.href}
                 className={`nav-link ${isActive(item.href) ? "is-active" : ""}`}>
                {item.label}
              </a>
            ) : (
              <Link key={n.href} to={n.href} className={`nav-link ${isActive(n.href) ? "is-active" : ""}`}>{n.label}</Link>
                    className={`nav-link ${isActive(item.href) ? "is-active" : ""}`}>
                {item.label}
              </Link>
            )
          ))}
        </div>

        {/* Right: exact één CTA */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <Link to="/registreren" className="btn btn-primary" aria-label="Start gratis">Start gratis</Link>
          ) : (
            <Link to="/dashboard" className="btn btn-primary" aria-label="Ga naar je dashboard">Dashboard</Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)]"
          aria-label="Open navigatie"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((s) => !s)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Drawer */}
      <MobileNavDrawer open={open} onClose={() => setOpen(false)} />
    </nav>
  );
};

export default Navbar;