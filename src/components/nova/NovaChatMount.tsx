import React, { useEffect } from "react";
import NovaChatProvider from "@/components/nova/NovaChatProvider";
import ChatLauncherPro from "@/components/nova/ChatLauncherPro";
import ChatPanelPro from "@/components/nova/ChatPanelPro";
import ChatLauncher from "@/components/nova/ChatLauncher"; // fallback
import ChatPanel from "@/components/nova/ChatPanel";       // fallback

const STYLE = (import.meta.env.VITE_CHAT_STYLE ?? "pro") as "pro" | "normal";

/**
 * Kill-switch voor oude/dubbele chat docks die buiten React om geïnjecteerd worden.
 * Werkt op statische nodes + dynamisch via MutationObserver.
 */
function useKillLegacyDocks() {
  useEffect(() => {
    const SELECTORS = [
      "#nova-bottom-bar",
      ".nova-dock",
      ".nova-chatbar",
      "[data-nova-dock]",
      "[data-widget='nova-chatbar']",
      ".chatbar",
    ];
    const hideAll = () => {
      SELECTORS.forEach((sel) => {
        document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
          el.style.setProperty("display", "none", "important");
          el.style.setProperty("visibility", "hidden", "important");
          el.style.setProperty("pointer-events", "none", "important");
        });
      });
    };
    hideAll();
    const mo = new MutationObserver(() => hideAll());
    mo.observe(document.documentElement, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);
}

export default function NovaChatMount() {
  useKillLegacyDocks(); // <- verwijdert de horizontale balk onderaan

  if (STYLE === "pro") {
    return (
      <NovaChatProvider>
        <ChatLauncherPro />
        <ChatPanelPro />
      </NovaChatProvider>
    );
  }
  return (
    <NovaChatProvider>
      <ChatLauncher />
      <ChatPanel />
    </NovaChatProvider>
  );
}