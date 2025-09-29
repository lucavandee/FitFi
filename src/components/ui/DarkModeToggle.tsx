import React from "react";
import { Sun, Moon } from "lucide-react";

/**
 * Donker/licht-schakelaar. Zet `data-theme="dark"| "light"` op <html>
 * en bewaart de voorkeur in localStorage ("theme").
 * Geen externe CSS vereist; kleuren komen uit tokens.
 */
export default function DarkModeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("theme")) as
      | "light"
      | "dark"
      | null;
    if (saved) return saved;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const isDark = theme === "dark";
  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      type="button"
      aria-label={isDark ? "Schakel naar licht modus" : "Schakel naar donker modus"}
      aria-pressed={isDark}
      onClick={toggle}
      className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] focus:outline-none ff-focus-ring"
      title={isDark ? "Licht modus" : "Donker modus"}
    >
      {isDark ? (
        <Sun size={16} strokeWidth={1.8} className="text-[var(--color-text)]" />
      ) : (
        <Moon size={16} strokeWidth={1.8} className="text-[var(--color-text)]" />
      )}
    </button>
  );
}