import React from 'react';

export default function EmptyNova() {
  return (
    <div className="p-6 text-center text-gray-600">
      <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-[#ECF7FF]" />
      <h3 className="text-ink font-semibold">Praat met Nova</h3>
      <p className="text-sm mt-1">Kies een context of tik op een suggestie hieronder om te starten.</p>
    </div>
  );
}