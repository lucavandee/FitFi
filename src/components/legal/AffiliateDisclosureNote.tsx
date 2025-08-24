import React from "react";
import { Info } from "lucide-react";

export default function AffiliateDisclosureNote({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#ECF7FF] text-[#0D1B2A]">
          <Info size={14} />
        </span>
        <p>
          Transparantie: sommige links op deze pagina zijn{" "}
          <strong>affiliate links</strong>. Als je via deze links shopt, kan
          FitFi een commissie ontvangen — zonder extra kosten voor jou. Meer
          info in onze{" "}
          <a href="/disclosure" className="underline">
            Affiliate Disclosure
          </a>
          .
        </p>
      </div>
    </div>
  );
}
