// src/components/nova/NovaChatMount.tsx
import React, { useEffect, useLayoutEffect, useRef } from "react";
import { X, MessageCircle } from "lucide-react";
import { createPortal } from "react-dom";
import { useNovaChat } from "@/components/nova/NovaChatProvider";
import ChatPanelPro from "@/components/nova/ChatPanelPro";

// Zorgt dat we nooit dubbel mounten (bijv. App + Layout)
function useSingleton(key = "__fitfiNovaMounted"): boolean {
  const ref = useRef(false);
  useLayoutEffect(() => {
    const w = window as any;
    if (w[key]) { ref.current = true; return; }
    w[key] = true;
    return () => { w[key] = false; };
  }, [key]);
  return ref.current; // true betekent: er bestond al een mount → render niets
}

function usePortalRoot(id = "fitfi-nova-root") {
  useLayoutEffect(() => {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      document.body.appendChild(el);
    }
  }, [id]);
  return document.getElementById(id) || document.body;
}

export default function NovaChatMount() {
  const alreadyMounted = typeof window !== "undefined" ? useSingleton() : false;
  if (alreadyMounted) return null;

  const nova = useNovaChat();
  const root = usePortalRoot();

  // Fail-safe style: maximale zichtbaarheid
  const fabStyle: React.CSSProperties = {
    position: "fixed",
    right: "calc(env(safe-area-inset-right) + 24px)",
    bottom: "calc(env(safe-area-inset-bottom) + 24px)",
    height: "48px",
    width: "48px",
    borderRadius: "9999px",
    background: "#2B6AF3",
    color: "#fff",
    boxShadow: "0 10px 24px rgba(0,0,0,.18)",
    zIndex: 2147483000, // super hoog
    display: nova.isOpen ? "none" : "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };

  const sheetWrapStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 2147483000,
    display: nova.isOpen ? "block" : "none",
  };
  const backdropStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,.30)",
    backdropFilter: "blur(2px)",
    pointerEvents: "auto",
  };
  const panelOuterStyle: React.CSSProperties = {
    position: "absolute",
    right: "calc(env(safe-area-inset-right) + 24px)",
    bottom: "calc(env(safe-area-inset-bottom) + 24px)",
    width: "min(92vw,420px)",
    height: "min(80vh,640px)",
    pointerEvents: "auto",
  };
  const panelStyle: React.CSSProperties = {
    height: "100%",
    width: "100%",
    borderRadius: "16px",
    background: "#fff",
    boxShadow: "0 22px 48px rgba(0,0,0,.20)",
    border: "1px solid rgba(0,0,0,.08)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };
  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    borderBottom: "1px solid rgba(0,0,0,.06)",
  };
  const closeBtnStyle: React.CSSProperties = {
    height: "32px",
    width: "32px",
    borderRadius: "12px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };
  const bodyStyle: React.CSSProperties = { flex: 1, padding: 12 };

  // In uiterste gevallen kan een CSS reset fixed elementen "verstoppen" via transforms.
  // Door direct in <body> te portalen + super z-index en inline styles is dit vrijwel uitgesloten.
  useEffect(() => {
    // Kleine hint in dev voor debugging
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info("[Nova] FAB ready — open:", nova.isOpen);
    }
  }, [nova.isOpen]);

  return createPortal(
    <>
      {/* FAB */}
      <button
        aria-label="Open Nova chat"
        style={fabStyle}
        onClick={nova.open}
      >
        <MessageCircle size={20} />
      </button>

      {/* Sheet */}
      <div style={sheetWrapStyle} aria-hidden={!nova.isOpen}>
        <div style={backdropStyle} onClick={nova.close} />
        <div style={panelOuterStyle}>
          <div style={panelStyle}>
            <div style={headerStyle}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0D1B2A" }}>FitFi Nova</div>
              <button
                aria-label="Sluit chat"
                onClick={nova.close}
                style={closeBtnStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <X size={18} />
              </button>
            </div>
            <div style={bodyStyle}>
              <ChatPanelPro />
            </div>
          </div>
        </div>
      </div>
    </>,
    root
  );
}