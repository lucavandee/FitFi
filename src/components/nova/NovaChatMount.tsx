import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useNovaChat } from "./NovaChatProvider";
import NovaLauncher from "./NovaLauncher";
import ChatPanelPro from "./ChatPanelPro";

const HIDE_ON_PATHS: string[] = []; // Tijdens QA nergens verbergen

function getCurrentPath(): string {
  if (typeof window === "undefined" || !window.location) return "/";
  return window.location.pathname || "/";
}

function useCurrentPathname(): string {
  const [pathname, setPathname] = useState<string>(() => getCurrentPath());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updatePathname = () => {
      const newPath = getCurrentPath();
      setPathname(newPath);
    };

    // Patch history methods to trigger updates
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    try {
      history.pushState = function(...args: any[]) {
        originalPushState.apply(this, args as [any, string, string?]);
        setTimeout(updatePathname, 0);
      };

      history.replaceState = function(...args: any[]) {
        originalReplaceState.apply(this, args as [any, string, string?]);
        setTimeout(updatePathname, 0);
      };
    } catch (error) {
      console.warn("[NovaChatMount] Could not patch history methods:", error);
    }

    // Listen for popstate events
    window.addEventListener("popstate", updatePathname);
    
    // Initial update
    updatePathname();

    return () => {
      window.removeEventListener("popstate", updatePathname);
      try {
        history.pushState = originalPushState;
        history.replaceState = originalReplaceState;
      } catch (error) {
        console.warn("[NovaChatMount] Could not restore history methods:", error);
      }
    };
  }, []);

  return pathname;
}

function NovaOverlay() {
  const nova = useNovaChat();

  if (!nova.isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9997] bg-black/40 backdrop-blur-[2px]"
        onClick={nova.hide}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        role="dialog"
        aria-label="Nova chat"
        aria-modal="true"
        className="fixed right-4 md:right-6 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[9998]
                   w-[min(100vw-2rem,480px)] h-[72vh] max-h-[80vh]"
      >
        <div
          className="flex h-full flex-col rounded-2xl nova-panel"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#00D2B8] rounded-full animate-pulse" />
              <span className="text-sm font-medium text-[#0D1B2A]">Nova</span>
            </div>
            <button
              onClick={nova.hide}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2B6AF3]/30 transition-colors"
              aria-label="Sluit chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path 
                  d="M18 6L6 18M6 6l12 12" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                />
              </svg>
            </button>
          </div>
          
          {/* Chat Content */}
          <div className="min-h-0 flex-1">
            <ChatPanelPro />
          </div>
        </div>
      </div>
    </>
  );
}

export default function NovaChatMount() {
  const pathname = useCurrentPathname();
  const shouldHideFab = useMemo(() => {
    return HIDE_ON_PATHS.some(path => pathname.startsWith(path));
  }, [pathname]);

  return (
    <>
      {/* FAB Launcher */}
      {!shouldHideFab && <NovaLauncher />}
      
      {/* Portal Mount Point */}
      <Suspense fallback={null}>
        <div id="nova-chat-mount" className="hidden" aria-hidden="true" />
      </Suspense>
      
      {/* Chat Overlay */}
      <NovaOverlay />
    </>
  );
}