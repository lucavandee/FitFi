import React from "react";
import ChatPanelPro from "@/components/nova/ChatPanelPro";

/**
 * Legacy entrypoint dat soms in pages/layouts wordt geïmporteerd.
 * We presenteren gewoon de Pro-variant zonder horizontale layout.
 */
export default function ChatPanel() {
  return <ChatPanelPro />;
}