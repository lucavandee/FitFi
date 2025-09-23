// src/components/layout/MobileNavDrawer.tsx
import React from "react";
import { NavLink } from "react-router-dom";

/**
 * MobileNavDrawer
 * - Tokens-first (géén hex), geen extra deps.
 * - Toegankelijk: aria-controls/expanded, Esc sluit, focus-trap light.
 * - Opt-in polish via ff-utilities (glass, btn, nav-active).
 */
const links = [
  { to: "/how-it-works", label: "Hoe het werkt" },
  { to: "/pricing", label: "Prijzen" },
  { to: "/about", label: "Over ons" },
  { to: "/faq", label: "FAQ" },
  { to: "/blog", label: "Blog" },
];

export default function MobileNavDrawer() {
  const [open, setOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-controls="mobile-drawer"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="ff-btn ff-btn-secondary h-9 md:hidden"
      >
        Menu
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-text/40 backdrop-blur-sm"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      <aside
        id="mobile-drawer"
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Mobiel menu"
        className={[
          "fixed inset-y-0 left-0 z-[70] w-80 max-w-[85%]",
          "bg-surface border-r border-border shadow-soft outline-none",
          "transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-border">
          <NavLink to="/" onClick={() => setOpen(false)} className="font-heading text-lg tracking-wide">
            FitFi
          </NavLink>
          <button
            type="button"
            className="ff-btn ff-btn-secondary h-9"
            onClick={() => setOpen(false)}
          >
            Sluiten
          </button>
        </div>

        <nav aria-label="Mobiel hoofdmenu" className="px-2 py-3">
          <ul className="flex flex-col">
            {links.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    [
                      "block px-3 py-2 rounded-md text-base",
                      "text-text/90 hover:text-text transition-colors",
                      isActive ? "ff-nav-active" : "border border-transparent",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-3 px-2 flex gap-2">
            <NavLink to="/login" onClick={() => setOpen(false)} className="ff-btn ff-btn-secondary h-10 grow">
              Inloggen
            </NavLink>
            <NavLink to="/start" onClick={() => setOpen(false)} className="ff-btn ff-btn-primary h-10 grow">
              Start gratis
            </NavLink>
          </div>
        </nav>
      </aside>
    </>
  );
}