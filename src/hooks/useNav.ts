/**
 * useNav – centrale navigatie + analytics wrapper (uitgebreid met Nova/Results/Tribe).
 */
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

type NavMeta = Record<string, unknown>;

export default function useNav() {
  const navigate = useNavigate();

  const to = useCallback((path: string, meta?: NavMeta, replace?: boolean) => {
    try {
      // @ts-ignore project-brede helper
      track?.("nav:to", { path, /* placeholder removed */(meta || {}) });
    } catch {}
    if (replace) navigate(path, { replace: true });
    else navigate(path);
  }, [navigate]);

  const back = useCallback(() => {
    try {
      // @ts-ignore
      track?.("nav:back");
    } catch {}
    navigate(-1);
  }, [navigate]);

  const toHome = useCallback((meta?: NavMeta, replace?: boolean) => {
    to("/", { route: "home", /* placeholder removed */(meta || {}) }, replace);
  }, [to]);

  const toDashboard = useCallback((meta?: NavMeta, replace?: boolean) => {
    to("/dashboard", { route: "dashboard", /* placeholder removed */(meta || {}) }, replace);
  }, [to]);

  const toOnboarding = useCallback((step?: string | number, meta?: NavMeta, replace?: boolean) => {
    const suffix = step === undefined || step === null ? "" : `/${String(step)}`;
    to(`/onboarding${suffix}`, { route: "onboarding", step, /* placeholder removed */(meta || {}) }, replace);
  }, [to]);

  const toNova = useCallback((meta?: NavMeta, replace?: boolean) => {
    to("/nova", { route: "nova", /* placeholder removed */(meta || {}) }, replace);
  }, [to]);

  const toResults = useCallback((id?: string | number, meta?: NavMeta, replace?: boolean) => {
    const path = id === undefined || id === null ? "/results" : `/results/${String(id)}`;
    to(path, { route: "results", id, /* placeholder removed */(meta || {}) }, replace);
  }, [to]);

  const toTribe = useCallback((id: string | number, meta?: NavMeta, replace?: boolean) => {
    to(`/tribes/${String(id)}`, { route: "tribe", id, /* placeholder removed */(meta || {}) }, replace);
  }, [to]);

  return { to, back, toHome, toDashboard, toOnboarding, toNova, toResults, toTribe };
}