import React, { useEffect } from "react";
import NovaChatProvider from "./NovaChatProvider";
import ChatLauncherPro from "./ChatLauncherPro";
import ChatPanelPro from "./ChatPanelPro";

/**
 * Nova Chat mount component
 * Zorgt voor clean mounting en unmounting van Nova chat systeem
 */
export default function NovaChatMount() {
  useEffect(() => {
    // Mount flag voor health checks
    document.body.setAttribute("data-nova-mount", "true");
    
    // Console log voor deployment verificatie
    const buildTag = import.meta.env.VITE_BUILD_TAG ?? "dev";
    console.log(`✅ FitFi build=${buildTag} | NovaChat root mounted (${import.meta.env.MODE})`);
    
    return () => {
      document.body.removeAttribute("data-nova-mount");
    };
  }, []);

  return (
    <NovaChatProvider>
      <ChatLauncherPro />
      <ChatPanelPro />
    </NovaChatProvider>
  );
}