/**
 * useIsAdmin – bepaalt of de huidige gebruiker admin is.
 * 
 * Strategie:
 * - Lees Supabase session (JWT claims).
 * - Controleer app_metadata.roles of user_metadata.role.
 * - Fallback: lokale cache in localStorage ("fitfi.role").
 */
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

type Role = "admin" | "user" | "recruiter" | "owner" | string;

function extractRole(): Role | null {
  const cached = (() => {
    try {
      return localStorage.getItem("fitfi.role");
    } catch {
      return null;
    }
  })();
  if (cached) return cached as Role;
  return null;
}

export default function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    let canceled = false;

    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        const roles: Role[] =
          (user?.app_metadata as any)?.roles ||
          ((user?.user_metadata as any)?.roles as Role[]) ||
          [];

        const roleStr: Role | null =
          ((user?.user_metadata as any)?.role as Role) ||
          (roles.length ? roles[0] : null) ||
          extractRole();

        const admin =
          roleStr === "admin" ||
          roles.includes("admin") ||
          (Array.isArray(roles) && roles.some((r) => String(r).toLowerCase() === "admin"));

        if (!canceled) setIsAdmin(Boolean(admin));
      } catch {
        if (!canceled) setIsAdmin(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, []);

  return isAdmin;
}