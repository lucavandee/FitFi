// src/components/nova/NovaLauncher.tsx
import React from "react";
import { useNovaChat } from "./NovaChatProvider";

export default function NovaLauncher() {
  const nova = useNovaChat();
  const onClick = () => (nova.isOpen ? nova.hide() : nova.open());

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={nova.isOpen ? "Sluit Nova" : "Open Nova"}
      className="
        fixed z-[9999]
        right-4 md:right-6
        bottom-[max(1rem,env(safe-area-inset-bottom))]
        inline-flex items-center gap-2
        rounded-full px-4 h-12
        bg-[#2B6AF3] text-white
        shadow-lg shadow-black/10
        hover:bg-[#245de0] active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-[#2B6AF3]/30
        transition-all duration-200
      "
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="opacity-90">
        <path
          d="M12 3a9 9 0 00-9 9c0 1.98.64 3.8 1.73 5.27L3 21l3.86-1.67A8.96 8.96 0 0012 21a9 9 0 100-18z"
          fill="currentColor"
        />
      </svg>
      <span className="text-sm font-medium">{nova.isOpen ? "Sluiten" : "Chatten"}</span>
    </button>
  );
}