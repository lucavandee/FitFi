import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/ui/Logo";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="flex items-center space-x-2 group"
          aria-label="FitFi homepage"
        >
          <Logo className="h-8 w-auto" textColor="text-[#0D1B2A]" />
        </Link>

        {/* rechts: (houd je bestaande links/knoppen hier) */}
        <div className="flex items-center gap-6">
          {/* ... jouw links ... */}
        </div>
      </nav>
    </header>
  );
}