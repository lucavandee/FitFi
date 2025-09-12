// src/components/nova/boot.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import NovaChatMount from "./NovaChatMount";

const MOUNT_ID = "fitfi-nova-root";

function mountNova() {
  try {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    if (document.getElementById(MOUNT_ID)) return;

    const host = document.createElement("div");
    host.id = MOUNT_ID;
    host.style.position = "relative";
    document.body.appendChild(host);

    const root = ReactDOM.createRoot(host);
    root.render(
      <React.StrictMode>
        <NovaChatMount />
      </React.StrictMode>
    );

    // Klein debug-handvat voor support
    // @ts-ignore
    window.__fitfi_nova_ready__ = true;
  } catch (e) {
    console.error("[Nova boot] mount error", e);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountNova, { once: true });
} else {
  mountNova();
}