import React from "react";
import { Sun, Moon } from "lucide-react";

/**
 * DarkModeToggle
 *
 * A small button that toggles the data-theme attribute on the
 * <html> element between light and dark. It stores the preference
 * in localStorage so that the choice persists across sessions. The
 * component uses inline styles to avoid reliance on external CSS
 * definitions and keeps icons sized consistently.
 */
const DarkModeToggle: React.FC = () => {
  const [dark, setDark] = React.useState(false);

  // On mount, sync with stored preference
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const stored = localStorage.getItem("theme");
    const isDark = stored ? stored === "dark" : root.dataset.theme === "dark";
    setDark(isDark);
    if (stored) {
      root.dataset.theme = stored;
    }
  }, []);

  const toggleTheme = () => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const newTheme = dark ? "light" : "dark";
    root.dataset.theme = newTheme;
    localStorage.setItem("theme", newTheme);
    setDark(!dark);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Wissel kleurmodus"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.375rem",
        borderRadius: "0.5rem",
        border: "1px solid var(--ff-color-border)",
        background: "var(--ff-color-surface)",
        cursor: "pointer",
      }}
    >
      {dark ? (
        <Sun size={18} strokeWidth={1.8} style={{ color: "var(--ff-color-primary)" }} />
      ) : (
        <Moon size={18} strokeWidth={1.8} style={{ color: "var(--ff-color-primary)" }} />
      )}
    </button>
  );
};

export default DarkModeToggle;