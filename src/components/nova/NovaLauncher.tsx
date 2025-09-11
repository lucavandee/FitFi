import React, { useState, useCallback } from "react";
import { Sparkles, X } from "lucide-react";
import { useNovaChat } from "./NovaChatProvider";
import ChatPanelPro from "./ChatPanelPro";
import { track } from "@/utils/telemetry";
import { cn } from "@/utils/cn";

export default function NovaLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const nova = useNovaChat();

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    track("nova:open", { source: "fab" });
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    track("nova:close", { source: "overlay" });
  }, []);

  return (
    <>
      {/* FAB - Fixed rechtsonder */}
      <button
        onClick={handleOpen}
        className={cn(
          "fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full",
          "bg-gradient-to-r from-[#2B6AF3] to-[#1E4FD9]",
          "text-white shadow-lg hover:shadow-xl",
          "transition-all duration-200 hover:scale-105",
          "flex items-center justify-center",
          "focus:outline-none focus:ring-2 focus:ring-[#2B6AF3]/30"
        )}
        aria-label="Open Nova AI stylist"
      >
        <Sparkles size={20} />
      </button>

      {/* Overlay Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-[#2B6AF3]" />
                <h2 className="font-heading font-semibold text-[#0D1B2A]">Nova AI Stylist</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Sluit Nova"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Chat Panel */}
            <div className="h-[calc(600px-73px)] p-4">
              <ChatPanelPro />
            </div>
          </div>
        </div>
      )}
    </>
  );
}