import React from 'react';

export default function ToastXp({ amount }: { amount: number }) {
  return (
    <div className="inline-flex items-center gap-2 text-ink">
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#ECF7FF]">✦</span>
      <span className="font-medium">+{amount} XP</span>
    </div>
  );
}