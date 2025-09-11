// src/components/nova/NovaChatMount.tsx
import React, { useLayoutEffect, useRef } from "react";
import { X, MessageCircle } from "lucide-react";
import { createPortal } from "react-dom";
import { useNovaChat } from "@/components/nova/NovaChatProvider";
import ChatPanelPro from "@/components/nova/ChatPanelPro";

function useSingleton(key = "__fitfiNovaMounted"): boolean {
  const ref = useRef(false);
  useLayoutEffect(() => {
    const w = window as any;
    if (w[key]) {
      ref.current = true;
      return;
    }
    w[key] = true;
    return () => {
      w[key] = false;
    };
  }, [key]);
  return ref.current; // true => bestond al, render niets
}

function ensurePortal(id = "fitfi-nova-root") {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    document.body.appendChild(el);
  }
  return el;
}

export default function NovaChatMount() {
  const alreadyMounted = typeof window !== "undefined" ? useSingleton() : false;
  if (alreadyMounted) return null;

  const nova = useNovaChat();
  const root = typeof document !== "undefined" ? ensurePortal() : null;
  if (!root) return null;

  // Inline styles met super z-index + safe-area zodat niets het kan verstoppen.
  const z = 2147483000;
  const fabStyle: React.CSSProperties = {
    position: "fixed",
    right: "calc(env(safe-area-inset-right) + 24px)",
    bottom: "calc(env(safe-area-inset-bottom) + 24px)",
    height: "56px",
    width: "56px",
    borderRadius: "9999px",
    background: "#2B6AF3",
    color: "#fff",
    boxShadow: "0 14px 28px rgba(0,0,0,.20)",
    zIndex: z,
    display: nova.isOpen ? "none" : "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "transform .15s ease, background .2s ease",
  };

  const sheetWrap: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: z,
    display: nova.isOpen ? "block" : "none",
  };

  const backdrop: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,.12)", // subtieler dan eerder
    pointerEvents: "auto",
  };

  const panelOuter: React.CSSProperties = {
    position: "absolute",
    right: "calc(env(safe-area-inset-right) + 24px)",
    bottom: "calc(env(safe-area-inset-bottom) + 24px)",
    width: "min(92vw, 480px)",
    height: "min(80vh, 720px)",
    pointerEvents: "auto",
  };

  const panel: React.CSSProperties = {
    height: "100%",
    width: "100%",
    borderRadius: 20,
    background: "#fff",
    boxShadow: "0 24px 64px rgba(0,0,0,.24)",
    border: "1px solid rgba(13,27,42,.06)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    transform: "translateY(8px)",
    opacity: 0,
    animation: "fitfi-nova-enter .18s ease-out forwards",
  };

  // Injecteer mini keyframes 1x (idempotent genoeg)
  if (typeof document !== "undefined" && !document.getElementById("fitfi-nova-anim")) {
    const style = document.createElement("style");
    style.id = "fitfi-nova-anim";
    style.innerHTML = `
      @keyframes fitfi-nova-enter {
        from { transform: translateY(8px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @media (prefers-reduced-motion: reduce) {
        @keyframes fitfi-nova-enter { from { opacity: 0; } to { opacity: 1; } }
      }
    `;
    document.head.appendChild(style);
  }

  return createPortal(
    <>
      {/* FAB */}
      <button
        aria-label="Open Nova chat"
        style={fabStyle}
        onClick={nova.open}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
      >
        <MessageCircle size={22} />
      </button>

      {/* SHEET */}
      <div style={sheetWrap} aria-hidden={!nova.isOpen}>
        <div style={backdrop} onClick={nova.close} />
        <div style={panelOuter}>
          <div style={panel}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: "1px solid rgba(13,27,42,.06)",
                background:
                  "linear-gradient(180deg, rgba(246,248,255,1) 0%, rgba(255,255,255,1) 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    height: 10,
                    width: 10,
                    borderRadius: 9999,
                    background: nova.__fallback ? "#A1A1AA" : "#22C55E",
                    boxShadow: "0 0 0 3px rgba(34,197,94,.12)",
                  }}
                  aria-hidden
                />
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0D1B2A" }}>
                  FitFi Nova
                </div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>
                  {nova.__fallback ? "Demo modus" : "Live"}
                </div>
              </div>
              <button
                aria-label="Sluit chat"
                onClick={nova.close}
                style={{
                  height: 32,
                  width: 32,
                  borderRadius: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(13,27,42,.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ flex: 1, padding: 12 }}>
              <ChatPanelPro />
            </div>
          </div>
        </div>
      </div>
    </>,
    root
  );
}