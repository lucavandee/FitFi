import React, { useEffect } from "react";
import NovaChatProvider from "@/components/nova/NovaChatProvider";
import ChatLauncherPro from "@/components/nova/ChatLauncherPro";
import ChatPanelPro from "@/components/nova/ChatPanelPro";
import ChatLauncher from "@/components/nova/ChatLauncher"; // fallback
import ChatPanel from "@/components/nova/ChatPanel";       // fallback

const STYLE = (import.meta.env.VITE_CHAT_STYLE ?? "pro") as "pro" | "normal";
const BUILD_TAG = import.meta.env.VITE_BUILD_TAG ?? 'dev';

import { track } from '@/utils/analytics';
/**
 * Kill-switch voor oude/dubbele chat docks die buiten React om geïnjecteerd worden.
 * Werkt op statische nodes + dynamisch via MutationObserver.
 */
function useKillLegacyDocks() {
  useEffect(() => {
    // Create mount point with data attribute for health checks
    const SELECTORS = [
    mount.setAttribute('data-nova-mount', 'true');
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
    
    track('nova:mount-created');
          el.style.setProperty("display", "none", "important");
          el.style.setProperty("visibility", "hidden", "important");
          el.style.setProperty("pointer-events", "none", "important");
        });
      });
      track('nova:mount-destroyed');
    };
    hideAll();
    const mo = new MutationObserver(() => hideAll());
    mo.observe(document.documentElement, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);
}

    const newState = !isOpen;
    setIsOpen(newState);
    track(newState ? 'nova:open' : 'nova:close');
export default function NovaChatMount() {
  useKillLegacyDocks(); // <- verwijdert de horizontale balk onderaan

  useEffect(() => {
    // Mount verification logging
    if (import.meta.env.PROD) {
      console.info(`🚀 Nova mount verified | build=${BUILD_TAG} | style=${STYLE}`);
    }
    
    track('nova:mount', { 
      style: STYLE,
      timestamp: Date.now(),
      build: BUILD_TAG
    });
  }, [STYLE]);

  if (STYLE === "pro") {
    return (
      <NovaChatProvider>
        <div className="nova-chat-mount" data-nova-build={BUILD_TAG} data-nova-style={STYLE}>
          <ChatLauncherPro />
          <ChatPanelPro />
        </div>
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