// src/components/nova/NovaChatMount.tsx
import React, { useEffect } from "react";
import { X, MessageCircle } from "lucide-react";
import { createPortal } from "react-dom";
import { useNovaChat } from "@/components/nova/NovaChatProvider";
import ChatPanelPro from "@/components/nova/ChatPanelPro";
import { cn } from "@/utils/cn";

function usePortalRoot(id = "fitfi-nova-root") {
  useEffect(() => {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      document.body.appendChild(el);
    }
  }, [id]);
  return document.getElementById(id) || document.body;
}

export default function NovaChatMount() {
  const nova = useNovaChat();
  const root = usePortalRoot();

  const launcher = !nova.isOpen ? (
    <button
      aria-label="Open Nova chat"
      onClick={nova.open}
      className={cn(
        "fixed z-40 bottom-6 right-6 h-12 w-12 rounded-full shadow-lg",
        "bg-[#2B6AF3] text-white hover:bg-[#1f56d6] transition-colors",
        "flex items-center justify-center"
      )}
    >
      <MessageCircle size={20} />
    </button>
  ) : null;

  const panel = nova.isOpen ? (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Subtle backdrop zonder scroll-lock */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] pointer-events-auto" onClick={nova.close} />
      <div className="absolute bottom-6 right-6 w-[min(92vw,420px)] h-[min(80vh,640px)] pointer-events-auto">
        <div className="h-full w-full rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-black/5">
            <div className="text-sm font-medium text-[#0D1B2A]">FitFi Nova</div>
            <button
              aria-label="Sluit chat"
              onClick={nova.close}
              className="h-8 w-8 inline-flex items-center justify-center rounded-xl hover:bg-black/5"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 p-3">
            <ChatPanelPro />
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return createPortal(
    <>
      {launcher}
      {panel}
    </>,
    root
  );
}