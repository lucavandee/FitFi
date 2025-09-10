import React from "react";
import Button from "@/components/ui/Button";
import { useNovaChat } from "./NovaChatProvider";
import Portal from "@/components/system/Portal";

function ChatLauncher() {
  const { open, setOpen, messages, busy } = useNovaChat();
  const unread = !open && messages.some((m) => m.role === "assistant");

  // Fallback inline styles (werken zonder Tailwind)
  const containerStyle: React.CSSProperties = {
    position: "fixed",
    right: "24px",
    bottom: "calc(24px + env(safe-area-inset-bottom))",
    zIndex: 2147483647,
    isolation: "isolate",
    pointerEvents: "none"
  };

  return (
    <Portal id="fitfi-portal-launcher-normal" z={2147483647}>
      <div
        data-testid="nova-chat-launcher"
        className="fixed right-6 pointer-events-none z-[2147483647]"
        style={containerStyle}
      >
        <Button
          aria-label="Open Nova chat"
          title="Open Nova chat"
          size="lg"
          variant="primary"
          className="rounded-full h-14 w-14 p-0 shadow-lg pointer-events-auto"
          style={{
            // extra fallbacks als tokens/utility ontbreken
            width: "56px",
            height: "56px",
            borderRadius: "9999px",
            background: "var(--ff-color-primary, #2B6AF3)"
          }}
          onClick={() => setOpen(true)}
          loading={busy}
        >
          {/* simpele bubble (geen icon-lib afhankelijkheid) */}
          <span aria-hidden style={{ display: "block", width: 22, height: 22, borderRadius: 9999, background: "rgba(255,255,255,.9)" }} />
        </Button>

        {unread ? (
          <span
            aria-hidden
            className="absolute -top-1 -right-1 h-3 w-3 rounded-full ring-2 pointer-events-none"
            style={{ background: "var(--ff-color-accent, #00D2B8)", boxSizing: "content-box", borderColor: "var(--ff-color-surface, #15192C)" }}
          />
        ) : null}
      </div>
    </Portal>
  );
}

export default ChatLauncher;