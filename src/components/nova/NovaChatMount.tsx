// src/components/nova/NovaChatMount.tsx
import React, { Suspense, useEffect, useMemo, useState } from "react";
import NovaChatProvider, { useNovaChat } from "./NovaChatProvider";
import NovaLauncher from "./NovaLauncher";
import ChatPanelPro from "./ChatPanelPro";

const HIDE_ON: string[] = ["/login", "/register", "/reset-password", "/legal"];

// Huidige path zonder Router-context
function getPath(): string {
  if (typeof window === "undefined" || !window.location) return "/";
  return window.location.pathname || "/";
}

/** SPA-vriendelijke pathname zónder react-router hooks */
function usePathname(): string {
  const [path, setPath] = useState<string>(() => getPath());
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setPath(getPath());

    // Patch history zodat client-side navigatie events triggert
    const origPush = history.pushState;
    const origReplace = history.replaceState;
    try {
      history.pushState = function (...args: any[]) {
        origPush.apply(this, args as any);
        window.dispatchEvent(new Event("popstate"));
      } as typeof history.pushState;
      history.replaceState = function (...args: any[]) {
        origReplace.apply(this, args as any);
        window.dispatchEvent(new Event("popstate"));
      } as typeof history.replaceState;
    } catch { /* noop */ }

    window.addEventListener("popstate", update);
    update();

    return () => {
      window.removeEventListener("popstate", update);
      try {
        history.pushState = origPush;
        history.replaceState = origReplace;
      } catch { /* noop */ }
    };
  }, []);
  return path;
}

function NovaOverlay() {
  const nova = useNovaChat();

  if (!nova.isOpen) return null;

  return (
    <>
      {/* Dim background */}
      <div
        className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px]"
        onClick={nova.hide}
        aria-hidden
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-label="Nova chat"
        aria-modal="true"
        className="fixed z-[81] right-4 md:right-6 bottom-[max(1rem,env(safe-area-inset-bottom))]
                   w-[min(100vw-2rem,520px)] h-[72vh] max-h-[80vh]"
      >
        <div
          className="flex h-full flex-col rounded-2xl border border-black/10 bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-black/10">
            <div className="text-sm font-medium text-[#0D1B2A]">Nova</div>
            <button
              onClick={nova.hide}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/20"
              aria-label="Sluit chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {/* Body */}
          <div className="min-h-0 flex-1 p-3">
            <ChatPanelPro />
          </div>
        </div>
      </div>
    </>
  );
}

export default function NovaChatMount() {
  const pathname = usePathname();
  const hideFab = useMemo(() => HIDE_ON.some((p) => pathname.startsWith(p)), [pathname]);

  return (
    <NovaChatProvider>
      {/* Launcher (FAB) */}
      {!hideFab && <NovaLauncher />}

      {/* Mount target (optioneel voor portals) */}
      <div className="fixed inset-x-0 bottom-0 z-[60] hidden" aria-hidden />
      <Suspense fallback={null}>
        <div id="nova-chat-mount" className="hidden" />
      </Suspense>

      {/* Overlay met panel */}
      <NovaOverlay />
    </NovaChatProvider>
  );
}