import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNovaChat } from "./NovaChatProvider";
import Portal from "./Portal";
import "./ChatTheme.css";

const SCROLL_THRESHOLD = 300;

function useHideOnPaths() {
  const HIDE_ON = useMemo(() => ["/privacy", "/terms"], []);
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  return HIDE_ON.some((p) => pathname.startsWith(p));
}

export default function NovaChatMount() {
  const { isOpen, setOpen, sending, error, messages, send, reset } = useNovaChat();
  const hidden = useHideOnPaths();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (hidden) return null;

  return (
    <>
      {/* Floating FAB — verschijnt na scroll */}
      <button
        aria-label="Open chat"
        className={`nv-fab${scrolled || isOpen ? " nv-fab--visible" : ""}`}
        onClick={() => setOpen(true)}
      >
        <span className="nv-fab-dot" />
      </button>

      {/* Overlay Panel */}
      {isOpen && (
        <Portal>
          <div className="nv-overlay" role="dialog" aria-modal="true" aria-label="FitFi Chat">
            <div className="nv-panel">
              <div className="nv-panel-header">
                <div className="nv-title">FitFi · Nova</div>
                <div className="nv-actions">
                  <button className="nv-btn-ghost" onClick={reset} disabled={sending} aria-label="Reset gesprek">
                    Reset
                  </button>
                  <button className="nv-btn-ghost" onClick={() => setOpen(false)} aria-label="Sluit chat">
                    Sluit
                  </button>
                </div>
              </div>

              <div className="nv-panel-body" aria-live="polite">
                {messages.map((m) => (
                  <div key={m.id} className={m.role === "assistant" ? "nv-bubble-assistant" : "nv-bubble-user"}>
                    {m.content}
                  </div>
                ))}
                {sending && (
                  <div className="nv-bubble-assistant">
                    <span className="nv-typing">
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>
                )}
                {error && <div className="nv-error">{error}</div>}
              </div>

              <form
                className="nv-inputbar"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const fd = new FormData(form);
                  const text = String(fd.get("q") || "");
                  if (text.trim().length === 0) return;
                  void send(text);
                  form.reset();
                }}
              >
                <input
                  ref={inputRef as any}
                  name="q"
                  className="nv-input"
                  placeholder="Beschrijf je gelegenheid en budget…"
                  autoComplete="off"
                  disabled={sending}
                />
                <button className="nv-send" disabled={sending}>
                  Verstuur
                </button>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}