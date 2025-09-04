/**
 * useNav – centrale navigatie + analytics wrapper.
 * 
 * Gebruik:
 * const nav = useNav();
 * nav.to("/", { source: "login" });
 */
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

type NavMeta = Record<string, unknown>;

export default function useNav() {
  const navigate = useNavigate();

  const to = useCallback(
    (path: string, meta?: NavMeta, replace = false) => {
      try {
        // @ts-ignore project-brede helper
        track?.("nav:to", { path, ...(meta || {}) });
      } catch {}
      replace ? navigate(path, { replace: true }) : navigate(path);
    },
    [navigate]
  );

  const back = useCallback(() => {
    try {
      // @ts-ignore
      track?.("nav:back");
    } catch {}
    navigate(-1);
  }, [navigate]);

  return { to, back };
}