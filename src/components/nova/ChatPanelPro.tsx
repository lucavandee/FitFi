import React, { useEffect, useRef, useState } from "react";
import Portal from "@/components/system/Portal";
import { useNovaChat } from "./NovaChatProvider";
import Button from "@/components/ui/Button";
import { track } from "@/utils/analytics";

const SUGGESTIONS = [
  "Tip een outfit voor vrijdagavond",
  "Welke kleuren flatteren mij?",
  "Maak deze look compleet",
  "Casual maar netjes voor werk"
];

function TypingDots() {
  return (
    <span aria-label="Nova typt…" role="status" style={{ display:"inline-flex", gap:6 }}>
      <span style={{ width:6, height:6, borderRadius:6, background:"var(--nv-muted)", animation:"nvTyping 1.1s infinite" }} />
      <span style={{ width:6, height:6, borderRadius:6, background:"var(--nv-muted)", animation:"nvTyping 1.1s infinite .12s" }} />
      <span style={{ width:6, height:6, borderRadius:6, background:"var(--nv-muted)", animation:"nvTyping 1.1s infinite .24s" }} />
    </span>
  );
}

export default function ChatPanelPro() {
  const { open, minimized, toggleMinimize, setOpen, messages, send, busy } = useNovaChat();
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) track("nova:panel-open", { style: "pro", messageCount: messages.length });
    if (!open && minimized) track("nova:panel-minimize", { style: "pro" });
  }, [open, minimized, messages.length]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [open, messages.length, busy]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    track("nova:message-send", { style: "pro", messageLength: text.length });
    send(text);
  };

  const handleSuggestionClick = (suggestion: string) => {
    track("nova:suggestion-click", { style: "pro", suggestion });
    send(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  if (!open) return null;

  // Minimized tray
  if (minimized) {
    return (
      <Portal id="fitfi-portal-chat">
        <div className="z-[2147483647]" style={{ position:"fixed", right:24, bottom:"calc(24px + env(safe-area-inset-bottom))" }}>
          <div style={{
            background:"var(--nv-bg)", backdropFilter:`blur(var(--nv-blur))`,
            border:`1px solid var(--nv-border)`, boxShadow:"var(--nv-shadow)",
            borderRadius:14, padding:12, animation:"nvFadeIn .18s ease"
          }}>
            <div style={{ color:"var(--nv-text)", fontSize:14, marginBottom:8 }}>Praat met Nova</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {SUGGESTIONS.slice(0,2).map((s) => (
                <Button key={s} variant="outline" size="sm" onClick={() => handleSuggestionClick(s)}>{s}</Button>
              ))}
              <Button size="sm" onClick={toggleMinimize}>Open</Button>
            </div>
          </div>
        </div>
      </Portal>
    );
  }

  return (
    <Portal id="fitfi-portal-chat">
      <div role="dialog" aria-modal="true" aria-label="Nova chat" 
           onKeyDown={handleKeyDown}
           className="z-[2147483647]" style={{ position:"fixed", inset:0, display:"flex", alignItems:"flex-end", justifyContent:"flex-end", padding:24 }}>
        <div aria-hidden onClick={() => setOpen(false)} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.4)" }} />
        <div style={{
          position:"relative",
          width:"100%", maxWidth:420,
          background:"var(--nv-bg)", color:"var(--nv-text)",
          backdropFilter:`blur(var(--nv-blur))`,
          border:`1px solid var(--nv-border-strong)`,
          borderRadius:18, boxShadow:"var(--nv-shadow)", overflow:"hidden",
          animation:"nvFadeIn .18s ease"
        }}>
          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                        padding:"14px 16px", borderBottom:`1px solid var(--nv-border)` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{
                width:28, height:28, borderRadius:9999,
                background:"linear-gradient(135deg, var(--nv-primary), var(--nv-accent))",
                boxShadow:"var(--nv-ring)"
              }} />
              <div>
                <div style={{ fontWeight:600, lineHeight:1 }}>Nova</div>
                <div style={{ fontSize:12, color:"var(--nv-muted)", lineHeight:1 }}>Jouw stylist</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <Button variant="secondary" size="sm" onClick={toggleMinimize} aria-label="Minimaliseer chat">Minimaliseer</Button>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} aria-label="Sluit chat">Sluiten</Button>
            </div>
          </div>

          {/* Thread */}
          <div ref={listRef} style={{ padding:"14px 16px", maxHeight:"60vh", overflowY:"auto" }}>
            {messages.length === 0 ? (
              <div style={{ 
                fontSize:14, color:"var(--nv-muted)", textAlign:"center", 
                padding:"20px 0", lineHeight:1.5 
              }}>
                Stel je vraag of kies een optie hieronder — wij geven direct advies met een korte uitleg waarom het past.
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} style={{ display:"flex", justifyContent: m.role==="user" ? "flex-end" : "flex-start", marginBottom:10 }}>
                  <div style={{
                    position:"relative",
                    maxWidth:"85%",
                    borderRadius:16,
                    padding:"8px 12px",
                    fontSize:14,
                    background: m.role==="user" ? "var(--nv-primary)" : "#1b2138",
                    color: m.role==="user" ? "#fff" : "var(--nv-text)"
                  }}>
                    {m.role === "assistant" && (
                      <div style={{ fontSize:10, color:"var(--nv-muted)", marginBottom:4 }}>Nova</div>
                    )}
                    {m.text}
                  </div>
                </div>
              ))
            )}
            {busy ? <div style={{ color:"var(--nv-muted)", fontSize:14 }}><TypingDots /></div> : null}
          </div>

          {/* Composer */}
          <div style={{ padding:"10px 16px 14px", borderTop:`1px solid var(--nv-border)` }}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:10 }}>
              {SUGGESTIONS.map((s) => (
                <Button key={s} variant="outline" size="sm" onClick={() => handleSuggestionClick(s)} disabled={busy}>{s}</Button>
              ))}
            </div>
            <form onSubmit={onSubmit} style={{ display:"flex", gap:8 }}>
              <div style={{
                position:"relative", flex:1, display:"flex", alignItems:"center",
                background:"#101525", border:`1px solid var(--nv-border)`,
                borderRadius:10, height:44, padding:"0 12px"
              }}>
                {/* prefix icon */}
                <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" width="18" height="18" aria-hidden
                     style={{ opacity:.7, marginRight:8 }}>
                  <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z"/>
                </svg>
                <input
                  aria-label="Typ je bericht aan Nova"
                  placeholder="Stel je vraag, wij helpen je met stijl"
                  value={input}
                  disabled={busy}
                  onChange={(e)=>setInput(e.target.value)}
                  style={{
                    flex:1, height:"100%", background:"transparent", border:"0", outline:"none",
                    color:"var(--nv-text)", fontSize:14
                  }}
                />
              </div>
              <Button type="submit" disabled={!input.trim() || busy}>{busy ? "Bezig..." : "Verstuur"}</Button>
            </form>
          </div>
        </div>
      </div>
    </Portal>
  );
}