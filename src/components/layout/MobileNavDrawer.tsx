import React from "react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { NAV_ITEMS } from "../../constants/nav";

type Props = {
  open: boolean;
  onClose: () => void;
};

const MobileNavDrawer: React.FC<Props> = ({ open, onClose }) => {
  const { user, logout } = useUser();
  const location = useLocation();

  React.useEffect(() => {
    onClose(); // sluit bij route-change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div
      id="mobile-menu"
      aria-hidden={!open}
      className={`md:hidden fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-app border-l border-ui shadow-soft transition-transform
        ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobiele navigatie"
      >
        <div className="flex items-center justify-between p-4">
          <span className="text-ink font-semibold">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Sluit menu"
            className="btn btn-ghost btn-sm"
            data-variant="ghost"
          >
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)]" onClick={onClose} aria-label="Sluit menu">
            <X className="h-4 w-4" />
          </button>
          </button>
        </div>

        <nav className="px-4 pb-4">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className="nav-link block w-full px-3 py-2"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-[color:var(--color-border)]" style={{ padding: 'var(--space-3)' }}>
          {!user ? (
            <Link to="/login" className="btn btn-primary btn-lg w-full" data-variant="primary" aria-label="Inloggen">
              <div style={{ height: 'var(--space-2)' }} />
              Inloggen
            </Link>
          ) : (
            <div className="flex gap-2">
              <Link to="/dashboard" className="btn btn-ghost btn-lg flex-1" data-variant="ghost" aria-label="Dashboard">
                Dashboard
              </Link>
              <button
                type="button"
                onClick={logout}
                className="btn btn-ghost btn-lg flex-1"
                data-variant="ghost"
                aria-label="Uitloggen"
              >
                Uitloggen
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default MobileNavDrawer;