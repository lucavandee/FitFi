import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* BRAND: tekst-only, geen avatar, geen achtergrond */}
        <Link to="/" className="ff-brand" aria-label="FitFi Home">
          <span className="ff-brand-text">FitFi</span>
        </Link>

        {/* rechts: (houd je bestaande links/knoppen hier) */}
        <div className="flex items-center gap-6">
          {/* ... jouw links ... */}
        </div>
      </nav>
    </header>
  );
}