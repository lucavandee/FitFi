import React from 'react';
import type { FitfiTier } from '@/config/novaAccess';

export default function QuotaModal({
  tier, onClose,
}: { tier: FitfiTier; onClose: () => void }) {
  const isVisitor = tier === 'visitor';
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[92vw] max-w-md">
        <h3 className="text-xl font-semibold text-ink">Ontgrendel Nova</h3>
        <p className="text-gray-600 mt-2">
          {isVisitor
            ? 'Maak gratis een account aan om outfits te ontgrendelen.'
            : 'Je limiet is bereikt. Upgrade naar Plus voor onbeperkt stijladvies.'}
        </p>
        <div className="mt-5 flex gap-3">
          {isVisitor ? (
            <>
              <a href="/signup" className="rounded-xl px-4 py-2 bg-[#89CFF0] text-[#0D1B2A] hover:bg-[#89CFF0]/90">Gratis member worden</a>
              <a href="/pricing" className="rounded-xl px-4 py-2 border">Plus bekijken</a>
            </>
          ) : (
            <>
              <a href="/pricing" className="rounded-xl px-4 py-2 bg-[#89CFF0] text-[#0D1B2A] hover:bg-[#89CFF0]/90">Upgrade naar Plus</a>
              <button onClick={onClose} className="rounded-xl px-4 py-2 border">Sluiten</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}