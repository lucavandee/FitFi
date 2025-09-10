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
    <span className="inline-flex gap-1 align-middle" aria-label="Nova is aan het typen">
      <span 
        className="w-1 h-1 rounded-full bg-current opacity-20"
        style={{ animation: "nvTyping 1.4s infinite" }}
      />
      <span 
        className="w-1 h-1 rounded-full bg-current opacity-20"
        style={{ animation: "nvTyping 1.4s infinite 0.2s" }}
      />
      <span 
        className="w-1 h-1 rounded-full bg-current opacity-20"
        style={{ animation: "nvTyping 1.4s infinite 0.4s" }}
      />
    </span>
  );
}

export default function ChatPanel() {
  const { open, minimized, toggleMinimize, setOpen, messages, send, busy } = useNovaChat();
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  // Hooks altijd onvoorwaardelijk
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    track("nova:panel-open", { minimized });
    return () => { 
      document.body.style.overflow = ""; 
    };
  }, [open, minimized]);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages.length, busy]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        track("nova:panel-close-escape");
        setOpen(false);
      }
      if (e.key === "m" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        track("nova:panel-minimize-shortcut");
        toggleMinimize();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen, toggleMinimize]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    track("nova:message-send", { length: text.length });
    setInput("");
    send(text);
  };

  const handleSuggestionClick = (suggestion: string) => {
    track("nova:suggestion-click", { suggestion });
    send(suggestion);
  };

  // Conditionele rendering na alle hooks
  if (!open) return null;

  const Bubble = ({ text, role }: { text: string; role: "user" | "assistant" }) => {
    const base = "inline-block rounded-2xl px-4 py-2 max-w-[85%] text-sm leading-relaxed";
    const style = { animation: "nvFadeIn 0.3s ease-out" };
    
    if (role === "user") {
      return (
        <div className="text-right mb-3">
          <div 
            className={base} 
            style={{
              ...style,
              background: "linear-gradient(135deg, var(--nv-primary), var(--nv-primary-2))",
              color: "#fff",
              boxShadow: "0 2px 8px rgba(43,106,243,.25)"
            }}
          >
            {text}
          </div>
        </div>
      );
    }
    
    return (
      <div className="text-left mb-3">
        <div 
          className={base} 
          style={{
            ...style,
            background: "var(--nv-bg)",
            backdropFilter: `blur(var(--nv-blur))`,
            border: "1px solid var(--nv-border)",
            color: "var(--nv-text)"
          }}
        >
          {text}
        </div>
      </div>
    );
  };

  const Header = () => (
    <div 
      className="flex items-center justify-between px-6 py-4 border-b backdrop-blur-sm"
      style={{ 
        borderColor: "var(--nv-border-strong)",
        background: "var(--nv-bg)"
      }}
    >
      <div>
        <h3 className="text-lg font-medium" style={{ color: "var(--nv-text)" }}>
          Praat met Nova
        </h3>
        <p className="text-sm" style={{ color: "var(--nv-muted)" }}>
          Snelle stijltips, precies voor jou
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => {
            track("nova:panel-minimize-click");
            toggleMinimize();
          }}
          aria-label={minimized ? "Maximaliseer chat" : "Minimaliseer chat"}
        >
          {minimized ? "Open" : "Minimaliseer"}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            track("nova:panel-close-click");
            setOpen(false);
          }}
          aria-label="Sluit chat"
        >
          Sluiten
        </Button>
      </div>
    </div>
  );

  // Minimized tray
  if (minimized) {
    return (
      <Portal id="fitfi-portal-chat-minimized">
        <div 
          className="fixed right-6 bottom-[calc(24px+env(safe-area-inset-bottom))] z-[2147483647]"
          style={{ animation: "nvFadeIn 0.3s ease-out" }}
        >
          <div 
            className="rounded-xl border shadow-lg p-4 backdrop-blur-sm"
            style={{
              background: "var(--nv-bg)",
              borderColor: "var(--nv-border)",
              boxShadow: "var(--nv-shadow)"
            }}
          >
            <div className="text-sm mb-3 font-medium" style={{ color: "var(--nv-text)" }}>
              Praat met Nova
            </div>
            <div className="flex gap-2 flex-wrap">
              {SUGGESTIONS.slice(0, 2).map((s) => (
                <Button 
                  key={s} 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSuggestionClick(s)}
                  className="text-xs"
                >
                  {s}
                </Button>
              ))}
              <Button 
                onClick={() => {
                  track("nova:panel-maximize-click");
                  toggleMinimize();
                }}
                size="sm"
              >
                Open
              </Button>
            </div>
          </div>
        </div>
      </Portal>
    );
  }

  // Volledig paneel
  return (
    <Portal id="fitfi-portal-chat-full">
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-label="Nova chat" 
        className="fixed inset-0 z-[2147483647] flex items-end justify-end p-6"
        style={{ animation: "nvFadeIn 0.3s ease-out" }}
      >
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
          onClick={() => {
            track("nova:panel-close-backdrop");
            setOpen(false);
          }} 
        />
        <div 
          className="relative w-full max-w-md border rounded-xl shadow-lg overflow-hidden backdrop-blur-sm"
          style={{
            background: "var(--nv-bg)",
            borderColor: "var(--nv-border)",
            boxShadow: "var(--nv-shadow)"
          }}
        >
          <Header />
          
          <div 
            ref={listRef} 
            className="px-6 py-4 max-h-[55vh] overflow-y-auto"
            style={{ scrollbarWidth: "thin" }}
          >
            {messages.length === 0 ? (
              <div 
                className="text-sm leading-relaxed"
                style={{ 
                  color: "var(--nv-muted)",
                  animation: "nvFadeIn 0.5s ease-out"
                }}
              >
                Stel je vraag of kies een optie hieronder — wij geven direct advies met een korte uitleg waarom het past.
              </div>
            ) : (
              messages.map((m) => <Bubble key={m.id} text={m.text} role={m.role} />)
            )}
            
            {busy && (
              <div 
                className="text-left text-sm mb-3"
                style={{ 
                  color: "var(--nv-muted)",
                  animation: "nvFadeIn 0.3s ease-out"
                }}
              >
                <TypingDots />
              </div>
            )}
          </div>
          
          <div 
            className="px-6 pb-4 pt-2 border-t backdrop-blur-sm"
            style={{ 
              borderColor: "var(--nv-border-strong)",
              background: "var(--nv-bg)"
            }}
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {SUGGESTIONS.map((s) => (
                <Button 
                  key={s} 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSuggestionClick(s)}
                  className="text-xs hover:scale-105 transition-transform duration-150"
                  disabled={busy}
                >
                  {s}
                </Button>
              ))}
            </div>
            
            <form onSubmit={onSubmit} className="flex gap-3">
              <input
                aria-label="Typ je bericht aan Nova"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Stel je vraag, wij helpen je met stijl"
                disabled={busy}
                className="flex-1 h-11 rounded-lg border px-4 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 disabled:opacity-50"
                style={{
                  background: "var(--nv-bg)",
                  borderColor: "var(--nv-border)",
                  color: "var(--nv-text)",
                  backdropFilter: `blur(var(--nv-blur))`
                }}
              />
              <Button 
                type="submit" 
                disabled={busy || !input.trim()}
                className="hover:scale-105 transition-transform duration-150"
              >
                {busy ? "Bezig" : "Verstuur"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Portal>
  );
}