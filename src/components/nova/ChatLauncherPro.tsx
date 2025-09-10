import React from "react";
import Portal from "@/components/system/Portal";
import { useNovaChat } from "./NovaChatProvider";

export default function ChatLauncherPro() {
  const { open, setOpen, unread } = useNovaChat();

  // Launcher niet tonen wanneer het panel open is (voorkomt overlap)
  if (open) return null;

  return (
    <Portal id="fitfi-portal-launcher-pro" z={2147483647}>
      <div
        data-testid="nova-chat-launcher"
        style={{
          position: "fixed",
          right: "24px",
          bottom: "calc(24px + env(safe-area-inset-bottom))",
          zIndex: 2147483647,
          isolation: "isolate",
        }}
      >
        <button
          aria-label="Open Nova chat"
          title="Open Nova chat"
          onClick={() => setOpen(true)}
          style={{
            position: "relative",
            width: 60,
            height: 60,
            borderRadius: 9999,
            border: 0,
            cursor: "pointer",
            background:
              "linear-gradient(180deg, var(--nv-primary, #2B6AF3), var(--nv-primary-2, #244cc0))",
            color: "#fff",
            boxShadow: "0 18px 36px rgba(0,0,0,.35)",
            outline: "none",
            transition: "transform .12s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          {/* Glow ring */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: 9999,
              background:
                "radial-gradient(60% 60% at 50% 50%, rgba(43,106,243,.35), transparent)",
              filter: "blur(10px)",
            }}
          />
          {/* Chat glyph (inline SVG, geen extra deps) */}
          <svg
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            width="22"
            height="22"
            aria-hidden
            style={{ position: "relative" }}
          >
            <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z" />
          </svg>
        </button>

        {/* Unread badge */}
        {unread > 0 ? (
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 12,
              height: 12,
              borderRadius: 9999,
              background: "var(--nv-accent, #00D2B8)",
              boxShadow: "0 0 0 2px var(--nv-surface, #15192C)",
            }}
          />
        ) : null}
      </div>
    </Portal>
  );
}