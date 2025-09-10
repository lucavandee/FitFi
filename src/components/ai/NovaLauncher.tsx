import React from "react";
import { useNovaChat } from "@/components/nova/NovaChatProvider";

export default function NovaLauncher() {
  const { setOpen } = useNovaChat();

  return (
    <button
      aria-label="Open Nova chat"
      onClick={() => setOpen(true)}
      className="fixed bottom-6 right-6 z-[2147483647] rounded-full shadow-lg"
      style={{
        width: 56,
        height: 56,
        background:
          "linear-gradient(180deg, var(--nv-primary,#2B6AF3), var(--nv-primary-2,#244cc0))",
        color: "#fff",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
        width="22"
        height="22"
        aria-hidden
      >
        <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z" />
      </svg>
    </button>
  );
}