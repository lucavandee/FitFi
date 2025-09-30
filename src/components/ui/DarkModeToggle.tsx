import React from "react";
import { Sun, Moon } from "lucide-react";

const LS_KEY = "fitfi.theme";

export default function DarkModeToggle() {
  const [dark, setDark] = React.useState(false);

  // Init vanuit localStorage of systeemvoorkeur
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const val = saved === "dark";
        setDark(val);
        document.documentElement.setAttribute("data-theme", val ? "dark" : "light");
        return;
      }
    } catch {}
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    setDark(!!prefersDark);
    document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    try { localStorage.setItem(LS_KEY, next ? "dark" : "light"); } catch {}
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={dark}
      aria-label="Wissel kleurmodus"
      className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
      style={{ boxShadow: "var(--shadow-ring)" }}
    >
      {dark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}