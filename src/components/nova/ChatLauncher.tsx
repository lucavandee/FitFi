import React, { useEffect } from "react";
import Portal from "@/components/system/Portal";
import { useNovaChat } from "./NovaChatProvider";
import { track } from "@/utils/analytics";

export default function ChatLauncher() {
  const { open, setOpen, unread, seedWelcomeIfNeeded } = useNovaChat();

  useEffect(() => { 
    seedWelcomeIfNeeded(); 
  }, [seedWelcomeIfNeeded]);

  const handleOpen = () => {
    track("nova:launcher-click", { unread });
    setOpen(true);
  };

  if (open) return null;

  return (
    <Portal id="fitfi-portal-launcher-premium" z={2147483647}>
      <div 
        data-testid="nova-chat-launcher" 
        className="fixed right-6 bottom-[calc(24px+env(safe-area-inset-bottom))] z-[2147483647] isolate"
      >
        <button
          aria-label="Open Nova chat"
          title="Open Nova chat"
          onClick={handleOpen}
          className="group relative w-14 h-14 rounded-full inline-flex items-center justify-center text-white border-0 cursor-pointer outline-none transition-all duration-200 ease-out hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30"
          style={{
            background: `linear-gradient(135deg, var(--nv-primary), var(--nv-primary-2))`,
            boxShadow: `var(--nv-shadow), var(--nv-ring)`,
            animation: unread > 0 ? "nvPulse 2s infinite" : "none"
          }}
        >
          {/* Glow ring */}
          <span 
            aria-hidden="true"
            className="absolute inset-[-4px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ boxShadow: "0 0 0 6px rgba(43,106,243,.12)" }}
          />
          
          {/* Chat bubble icon */}
          <svg 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            fill="none" 
            strokeWidth="2" 
            width="22" 
            height="22" 
            aria-hidden="true"
            className="relative z-10"
          >
            <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z"/>
          </svg>
          
          {/* Unread badge */}
          {unread > 0 && (
            <span 
              aria-hidden="true"
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
              style={{
                background: "var(--nv-accent)",
                boxShadow: "0 0 0 2px var(--nv-surface)"
              }}
            />
          )}
        </button>
      </div>
    </Portal>
  );
}