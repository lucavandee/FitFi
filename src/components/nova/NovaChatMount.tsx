import React from "react";
import { useNovaChat } from "@/components/nova/NovaChatProvider";
import ChatLauncher from "@/components/nova/ChatLauncher";
import ChatPanelPro from "@/components/nova/ChatPanelPro";

export default function NovaChatMount() {
  const { isOpen } = useNovaChat();

  return (
    <>
      {/* Floating launcher (rechtsonder) */}
      <ChatLauncher />
      
      {/* Overlay panel (conditionally rendered) */}
      {isOpen && <ChatPanelPro />}
    </>
  );
}