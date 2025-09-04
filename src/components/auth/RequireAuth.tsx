import { ReactNode } from "react";
import { useAuth, requireTier } from "@/context/AuthContext";

export default function RequireAuth({
  children,
  minTier = "member"
}: {
  children: ReactNode;
  minTier?: "visitor" | "member" | "plus" | "founder";
}) {
  const { tier } = useAuth();
  if (!requireTier(tier, minTier)) return null;
  return <>{children}</>;
}