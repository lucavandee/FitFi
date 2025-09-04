/**
 * useNav – centrale navigatie + analytics wrapper (uitgebreid).
 * 
 * Helpers:
 * 
 * to(path, meta?, replace?)
 * 
 * back()
 * 
 * toHome(meta?, replace?)
 * 
 * toDashboard(meta?, replace?)
 * 
 * toOnboarding(step?: string | number, meta?, replace?)
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

  const toHome = useCallback((meta?: NavMeta, replace = false) => {
    to("/", { source: "nav:home", ...(meta || {}) }, replace);
  }, [to]);

  const toDashboard = useCallback((meta?: NavMeta, replace = false) => {
    to("/dashboard", { source: "nav:dashboard", ...(meta || {}) }, replace);
  }, [to]);

  const toOnboarding = useCallback((step?: string | number, meta?: NavMeta, replace = false) => {
    const suffix = step !== undefined && step !== null ? `/${String(step)}` : "";
    to(`/onboarding${suffix}`, { source: "nav:onboarding", step, ...(meta || {}) }, replace);
  }, [to]);

  return { to, back, toHome, toDashboard, toOnboarding };
}