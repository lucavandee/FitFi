import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import { useUser } from "@/context/UserContext";

interface InlineAuthGateProps {
  /** Tekst op de knop die getoond wordt aan niet-ingelogde bezoekers */
  cta: string;
  children: React.ReactElement;
}

/**
 * Inline auth-gate voor kleine acties binnen een card (bewaren, feedback, uitleg, ...).
 * In tegenstelling tot @/components/auth/RequireAuth (route guard die de hele pagina
 * redirect) toont dit component gewoon een kleine login-CTA op de plek van de actie,
 * zonder de pagina te verlaten.
 */
export default function InlineAuthGate({ cta, children }: InlineAuthGateProps) {
  const { user, status } = useUser();
  const navigate = useNavigate();
  const loc = useLocation();

  if (status === "unauthenticated" || !user) {
    return (
      <button
        type="button"
        onClick={() => {
          const returnPath = loc.pathname + loc.search;
          navigate("/inloggen", { state: { from: returnPath } });
        }}
        className="px-4 py-2.5 border-2 border-[#E5E5E5] text-[#6E6E6E] hover:border-[#A85740] hover:text-[#9A503B] rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        <span className="flex items-center justify-center gap-1.5">
          <Lock className="w-4 h-4" />
          <span>{cta}</span>
        </span>
      </button>
    );
  }

  return children;
}
