import React, { useEffect } from "react";
import Portal from "@/components/system/Portal";
import { useNovaChat } from "./NovaChatProvider";

function ChatLauncher() {
  const { open, setOpen, unread, seedWelcomeIfNeeded } = useNovaChat();

  useEffect(() => { seedWelcomeIfNeeded(); }, []);

  const containerStyle: React.CSSProperties = {
    position: "fixed",
    right: "24px",
    bottom: "calc(24px + env(safe-area-inset-bottom))",
    zIndex: 2147483647,
    isolation: "isolate"
  };

  const btn: React.CSSProperties = {
    width: 56, height: 56, borderRadius: 9999,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    background: "linear-gradient(180deg, var(--ff-color-primary,#2B6AF3), #244cc0)",
    boxShadow: "0 18px 36px rgba(0,0,0,.35), 0 0 0 0 rgba(43,106,243,.35)",
    color: "#fff", border: "0", cursor: "pointer", outline: "none",
    transition: "transform .12s ease, box-shadow .2s ease"
  };

  const ring: React.CSSProperties = {
    position: "absolute", inset: -4, borderRadius: 9999,
    boxShadow: "0 0 0 6px rgba(43,106,243,.18)"
  };

  return (
    <Portal id="fitfi-portal-launcher-normal" z={2147483647}>
      <div data-testid="nova-chat-launcher" style={containerStyle}>
        <button
          aria-label="Open Nova chat"
          title="Open Nova chat"
          style={btn}
          onClick={() => setOpen(true)}
          onMouseEnter={(e) => { (e.currentTarget.style.transform = "translateY(-2px)"); }}
          onMouseLeave={(e) => { (e.currentTarget.style.transform = "translateY(0)"); }}
        >
          <span aria-hidden style={{ position: "absolute", ...ring }} />
          {/* Chat bubble glyph (inline, geen lib) */}
          <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" width="22" height="22" aria-hidden>
            <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z"/>
          </svg>
        </button>
        {(!open && unread > 0) ? (
          <span aria-hidden
            style={{
              position: "absolute", top: -2, right: -2, width: 10, height: 10, borderRadius: 9999,
              background: "var(--ff-color-accent,#00D2B8)", boxShadow: "0 0 0 2px var(--ff-color-surface,#15192C)"
            }}
          />
        ) : null}
      </div>
    </Portal>
  );
}
export default ChatLauncher;