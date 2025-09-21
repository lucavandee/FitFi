import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";

export type ThemeState = {
  /** Gekozen modus (light/dark/system) */
  theme: Theme;
  /** Feitelijke modus na resolven (light/dark) */
  resolvedTheme: "light" | "dark";
  /** Zet expliciet een thema */
  setTheme: (t: Theme) => void;
  /** Toggle tussen light/dark (negeert 'system') */
  toggleTheme: () => void;
};

const ThemeCtx = createContext<ThemeState | null>(null);
const STORAGE_KEY = "ff_theme_v1";

/** Lees startwaarde uit storage; fallback op 'light' */
function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {/* ignore */}
  return "light";
}

/** Bepaal effectieve modus (light/dark) o.b.v. gekozen thema + system preference */
function resolveTheme(theme: Theme): "light" | "dark" {
  if (typeof window === "undefined") return theme === "dark" ? "dark" : "light";
  if (theme === "system") {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
    resolveTheme(getInitialTheme())
  );

  // Pas thema toe op <html>: toggle .dark en zet data-theme voor tokens
  useEffect(() => {
    const html = document.documentElement;
    const nextResolved = resolveTheme(theme);
    setResolvedTheme(nextResolved);

    if (nextResolved === "dark") html.classList.add("dark");
    else html.classList.remove("dark");

    html.setAttribute("data-theme", nextResolved);

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {/* ignore */}
  }, [theme]);

  // Reageer op systeemwijziging wanneer theme === 'system'
  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mql) return;

    const onChange = () => setResolvedTheme(mql.matches ? "dark" : "light");
    // brede compat
    // @ts-expect-error older Safari
    (mql.addEventListener ? mql.addEventListener("change", onChange) : mql.addListener(onChange));
    return () => {
      // @ts-expect-error older Safari
      (mql.removeEventListener ? mql.removeEventListener("change", onChange) : mql.removeListener(onChange));
    };
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () =>
    setThemeState((prev) => (resolveTheme(prev) === "dark" ? "light" : "dark"));

  const value = useMemo<ThemeState>(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
};

/** Fail-safe hook: crasht niet als de Provider (tijdelijk) ontbreekt. */
export function useTheme(): ThemeState {
  const ctx = useContext(ThemeCtx);
  if (ctx) return ctx;
  return {
    theme: "light",
    resolvedTheme: "light",
    setTheme: () => {},
    toggleTheme: () => {},
  };
}

export default ThemeProvider;