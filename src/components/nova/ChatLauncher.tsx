import React from "react";
import { MessageCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { useNovaChat } from "./NovaChatProvider";
import Portal from "@/components/system/Portal";

const DEBUG = (import.meta.env.VITE_DEBUG_CHAT ?? "0") === "1";

function ChatLauncher() {
  const { open, setOpen, messages, busy } = useNovaChat();
  const unread = !open && messages.some((m) => m.role === "assistant");

  const launcher = (
    <div
      data-testid="nova-chat-launcher"
      className="fixed right-6 pointer-events-none"
      style={{
        bottom: "calc(1.5rem + env(safe-area-inset-bottom))",
        zIndex: 2147483647,
        isolation: "isolate",
        outline: DEBUG ? "1px dashed rgba(0,255,200,.4)" : "none"
      }}
    >
      <Button
        aria-label="Open Nova chat"
        title="Open Nova chat"
        size="lg"
        variant="primary"
        className="rounded-full h-14 w-14 p-0 shadow-lg pointer-events-auto"
        onClick={() => setOpen(true)}
        loading={busy}
      >
        <MessageCircle aria-hidden size={22} />
      </Button>
      {unread ? (
        <span aria-hidden className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent ring-2 ring-surface pointer-events-none" />
      ) : null}
    </div>
  );

  return <Portal id="fitfi-portal-launcher">{launcher}</Portal>;
}

export default ChatLauncher;