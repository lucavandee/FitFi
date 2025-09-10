import React from "react";
import Portal from "@/components/system/Portal";
import { useNovaChat } from "./NovaChatProvider";

const btnBase: React.CSSProperties = {
  position: "fixed",
  right: "24px",
  bottom: "calc(24px + env(safe-area-inset-bottom))",
  width: "56px",
  height: "56px",
  borderRadius: "9999px",
  background: "var(--ff-color-primary, #2B6AF3)",
  color: "#fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
  cursor: "pointer",
  border: "none",
  outline: "none",
  zIndex: 2147483647,
};

const icon: React.CSSProperties = { width: 24, height: 24, display: "block" };

function ChatLauncherHard() {
  const { setOpen } = useNovaChat();

  return (
    <Portal id="fitfi-portal-launcher" z={2147483647}>
      <button
        data-testid="nova-chat-launcher"
        aria-label="Open Nova chat"
        title="Open Nova chat"
        style={btnBase}
        onClick={() => setOpen(true)}
      >
        {/* inline SVG (message circle) */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={icon} aria-hidden>
          <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z"/>
        </svg>
      </button>
    </Portal>
  );
}

export default ChatLauncherHard;