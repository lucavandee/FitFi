// src/components/nova/NovaChatMount.tsx
import React, { Suspense, useEffect, useMemo, useState } from "react";
import NovaLauncher from "./NovaLauncher";
import NovaChatProvider from "./NovaChatProvider";
// Als je zonder portal rendert kun je ChatPanelPro hier importeren.
// import ChatPanelPro from "./ChatPanelPro";

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

export default function NovaChatMount() {
  const pathname = usePathname();
  const hideFab = useMemo(() => HIDE_ON.some((p) => pathname.startsWith(p)), [pathname]);

  return (
    <NovaChatProvider>
      {!hideFab && <NovaLauncher />}

      {/* Mount doel (portal kan hierop targeten) */}
      <div className="fixed inset-x-0 bottom-0 z-[60] hidden" aria-hidden />
      <Suspense fallback={null}>
        <div id="nova-chat-mount" className="hidden" />
      </Suspense>

      {/* Zonder portal? Mount hier direct: */}
      {/* <ChatPanelPro /> */}
    </NovaChatProvider>
  );
}