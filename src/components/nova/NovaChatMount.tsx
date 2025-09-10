import React from "react";
import ChatLauncher from "@/components/nova/ChatLauncher";          // jouw normale (Tailwind) variant
import ChatLauncherHard from "@/components/nova/ChatLauncherHard"; // pure inline variant
import ChatPanel from "@/components/nova/ChatPanel";
import NovaChatProvider from "@/components/nova/NovaChatProvider";

const HARD = (import.meta.env.VITE_CHAT_LAUNCHER_MODE ?? "normal") === "hard";

export default function NovaChatMount() {
  return (
    <NovaChatProvider>
      {HARD ? <ChatLauncherHard /> : <ChatLauncher />}
      <ChatPanel />
    </NovaChatProvider>
  );
}