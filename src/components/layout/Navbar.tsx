import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";

function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

const links = [
  { to: "/hoe-het-werkt", label: "Hoe het werkt" },
  { to: "/over-ons", label: "Over ons" },
  { to: "/veelgestelde-vragen", label: "FAQ" },
  { to: "/blog", label: "Blog" },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const onStart = () => navigate("/onboarding");

  return (
    <header className="sticky top-0 z-50 nav-glass">
      <nav
        aria-label="Hoofdnavigatie"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--shadow-ring)]"
            aria-label="Ga naar home"
          >
            {/* Simpele tekstlogo; vervang door SmartImage als je een beeldmerk hebt */}
            <span className="text-lg font-semibold text-[color:var(--color-text)]">FitFi</span>
          </button>
        </div>

        {/* Links */}
        <ul className="hidden md:flex items-center gap-2">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  cx(
                    "px-3 py-2 text-sm",
                    isActive
                      ? "accent-chip" // chip-stijl volgens polish.css
                      : "text-[color:var(--color-text)] hover:underline underline-offset-4"
                  )
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:inline-flex"
            onClick={() => navigate("/inloggen")}
            aria-label="Inloggen"
          >
            Inloggen
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="cta-raise"
            onClick={onStart}
            aria-label="Start je gratis AI Style Report"
          >
            Start gratis
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;