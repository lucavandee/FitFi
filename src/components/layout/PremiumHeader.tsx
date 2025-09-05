import { Link, NavLink } from "react-router-dom";
import cn from "@/utils/cn";
import track from "@/services/analytics";

const nav = [
  { to: "/onboarding", label: "Onboarding" },
  { to: "/results", label: "Resultaten" },
  { to: "/nova", label: "Nova" },
  { to: "/tribes", label: "Tribes" },
  { to: "/pricing", label: "Pricing" },
];

export default function PremiumHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <nav className="ff-container h-14 flex items-center justify-between">
        <Link to="/" className="font-heading text-[color:var(--ff-midnight)] font-extrabold text-lg tracking-tight">
          FitFi
        </Link>
        <div className="hidden sm:flex items-center gap-5 text-sm">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "text-gray-600 hover:text-gray-900 transition",
                  isActive && "text-gray-900 font-semibold"
                )
              }
              onClick={() => track("nav:click", { to: n.to })}
            >
              {n.label}
            </NavLink>
          ))}
        </div>
        <Link
          to="/onboarding"
          className="hidden sm:inline-flex btn btn-primary"
          onClick={() => track("nova:cta", { where: "nav", action: "onboarding" })}
        >
          Doe de stijlscan
        </Link>
      </nav>
    </header>
  );
}