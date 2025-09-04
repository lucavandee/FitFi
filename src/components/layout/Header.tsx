import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, Settings, Crown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";
import Logo from "@/components/ui/Logo";

type NavItem = { label: string; to: string; match?: string };

const NAV_ITEMS: NavItem[] = [
  { label: "Home", to: "/", match: "/" },
  { label: "Stijltest", to: "/onboarding", match: "/onboarding" },
  { label: "Tribes", to: "/tribes", match: "/tribes" },
  { label: "Blog", to: "/blog", match: "/blog" },
  { label: "Pricing", to: "/pricing", match: "/pricing" },
  { label: "Hoe het werkt", to: "/how-it-works", match: "/how-it-works" },
];

export default function Header() {
  const location = useLocation();
  const { user, tier, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const isActive = (match?: string) =>
    match ? location.pathname === match || location.pathname.startsWith(match) : false;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/5 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" aria-label="FitFi home" className="flex items-center gap-2">
          <Logo className="h-7 w-auto" />
        </Link>

        <nav className="hidden gap-8 md:flex" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative font-medium text-slate-700 hover:text-slate-900 transition-colors",
                isActive(item.match) && "text-slate-900"
              )}
            >
              {item.label}
              {isActive(item.match) && (
                <span className="absolute left-0 -bottom-2 h-0.5 w-full bg-slate-900" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              <Link to="/account" className="text-slate-700 hover:text-slate-900" aria-label="Account">
                <User className="h-5 w-5" />
              </Link>
              <button onClick={logout} className="text-slate-700 hover:text-slate-900" aria-label="Uitloggen">
                <LogOut className="h-5 w-5" />
              </button>
              {tier !== "visitor" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
                  <Crown className="h-3.5 w-3.5" /> {tier}
                </span>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-700 hover:text-slate-900">
                Inloggen
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Registreren
              </Link>
            </>
          )}
        </div>

        <button
          className="inline-flex items-center justify-center rounded-md p-2 md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile */}
      {open && (
        <div className="border-t border-black/5 bg-white md:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2 px-4 py-3 sm:px-6" aria-label="Mobile">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn("rounded-md px-2 py-2 text-slate-700 hover:bg-slate-50", isActive(item.match) && "bg-slate-50 text-slate-900")}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-3">
              {user ? (
                <>
                  <Link to="/account" className="rounded-md px-2 py-2 hover:bg-slate-50">Account</Link>
                  <button onClick={logout} className="rounded-md px-2 py-2 hover:bg-slate-50">Uitloggen</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="rounded-md px-2 py-2 hover:bg-slate-50">Inloggen</Link>
                  <Link to="/register" className="rounded-md px-2 py-2 hover:bg-slate-50">Registreren</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}