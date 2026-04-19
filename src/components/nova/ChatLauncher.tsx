import React from "react";
import { MessageCircle } from "lucide-react";
import { useNovaChat } from "@/components/nova/NovaChatProvider";
import { track } from "@/utils/analytics";

export default function ChatLauncher() {
  const { setOpen } = useNovaChat();

  const handleClick = () => {
    track("nova:open", { source: "launcher" });
    setOpen(true);
  };

  return (
    <button
      onClick={handleClick}
      className="nova-launcher fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#C2654A] to-[#A8513A] text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#D4856E] focus:ring-offset-2"
      aria-label="Open Nova Chat"
    >
      <MessageCircle className="h-6 w-6" />
      <div className="nova-glow absolute inset-0 rounded-full bg-gradient-to-br from-[#D4856E] to-[#C2654A] opacity-20 blur-md" />
    </button>
  );
}