import React from "react";
import { MessageCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { useNovaChat } from "./NovaChatProvider";
import { track } from "@/utils/telemetry";

function ChatLauncher() {
  const { open, setOpen, messages, busy } = useNovaChat();
  const unread = !open && messages.some((m) => m.role === "assistant");

  const handleOpen = () => {
    setOpen(true);
    track("cta:primary", { where: "chat-launcher" });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        aria-label="Open Nova chat"
        title="Open Nova chat"
        size="lg"
        variant="primary"
        className="rounded-full h-14 w-14 p-0 shadow-lg"
        onClick={handleOpen}
        loading={busy}
      >
        <MessageCircle aria-hidden size={22} />
      </Button>
      {unread ? <span aria-hidden className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent ring-2 ring-surface" /> : null}
    </div>
  );
}

export default ChatLauncher;