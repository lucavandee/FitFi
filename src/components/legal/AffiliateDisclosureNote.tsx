import React from 'react';
import { Info } from 'lucide-react';

export default function AffiliateDisclosureNote({ className = '' }: { className?: string }) {
  return (
    <div className={`mt-4 rounded-xl border border-[#E5E5E5] bg-white px-4 py-3 text-sm text-[#4A4A4A] ${className}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#F5F0EB] text-[#1A1A1A]">
          <Info size={14} />
        </span>
        <p>
          Transparantie: sommige links op deze pagina zijn <strong>affiliate links</strong>.
          Als je via deze links shopt, kan FitFi een commissie ontvangen — zonder extra kosten voor jou.
          Meer info in onze <a href="/affiliate-disclosure" className="underline text-[#4A7EC2]">Affiliate Disclosure</a>.
        </p>
      </div>
    </div>
  );
}