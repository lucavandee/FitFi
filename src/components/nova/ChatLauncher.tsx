import React from "react";
import { MessageCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { useNovaChat } from "./NovaChatProvider";

function ChatLauncher() {
  const { open, setOpen, messages, busy } = useNovaChat();
  const unread = !open && messages.some((m) => m.role === "assistant");

  return (
    <div
      data-testid="nova-chat-launcher"
      className="fixed right-6 z-[10000] pointer-events-none"
      style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
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
        <span
          aria-hidden
          className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent ring-2 ring-surface pointer-events-none"
        />
      ) : null}
    </div>
  );
}

export default ChatLauncher;