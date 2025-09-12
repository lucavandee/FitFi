import React from "react";
import { MessageCircle } from "lucide-react";
import { useNovaChat } from "./NovaChatProvider";
import { track } from "@/utils/telemetry";

export default function ChatLauncher() {
  const nova = useNovaChat();
  
  const handleClick = () => {
    track("nova:launcher-click", { wasOpen: nova.isOpen });
    if (nova.isOpen) {
      className="fixed bottom-6 right-6 z-[9999] nova-launcher
                 h-14 w-14 rounded-full text-white
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                 inline-flex items-center justify-center"
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={nova.isOpen ? "Sluit Nova chat" : "Open Nova chat"}
      className="
        fixed z-[9999] right-4 md:right-6
        bottom-[max(1rem,env(safe-area-inset-bottom))]
        inline-flex items-center justify-center
        inline-flex items-center justify-center
        bg-[#2B6AF3] text-white
        shadow-lg shadow-black/20
        hover:bg-[#245de0] hover:scale-105
        hover:bg-[#245de0] hover:scale-105 active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-[#2B6AF3]/30
        transition-all duration-200
      "
    >
      <MessageCircle size={24} className="opacity-90" />
    </button>
  );
}