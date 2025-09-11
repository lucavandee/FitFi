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
  // Deze component is vervangen door NovaChatMount
  // Render niets om layout-shift te voorkomen
  return null;
}