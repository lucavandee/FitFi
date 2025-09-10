import React, { useEffect, useRef, useState } from "react";
import Portal from "@/components/system/Portal";
import { useNovaChat } from "./NovaChatProvider";
import Button from "@/components/ui/Button";

const SUGGESTIONS = [
  "Tip een outfit voor vrijdagavond",
  "Welke kleuren flatteren mij?",
  "Maak deze look compleet",
  "Casual maar netjes voor werk"
];

function TypingDots() {
  return (
    <span className="inline-flex gap-1 align-middle">
      <span className="animate-pulse">•</span>
      <span className="animate-pulse" style={{ animationDelay: ".12s" }}>•</span>
      <span className="animate-pulse" style={{ animationDelay: ".24s" }}>•</span>
    </span>
  );
}

export default function ChatPanel() {
  const { open, minimized, toggleMinimize, setOpen, messages, send, busy } = useNovaChat();
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  // Hooks staan ALTIJD bovenaan en worden nooit conditioneel overgeslagen:
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
    if (!text) return;
    setInput("");
    send(text);
  };

  // Vanaf hier mag je conditioneel renderen (geen hooks meer hieronder):
  if (!open) return null;

  const Bubble = ({ text, role }: { text: string; role: "user" | "assistant" }) => {
    const base = "inline-block rounded-2xl px-3 py-2 max-w-[85%] text-sm";
    if (role === "user") {
      return (
        <div className="text-right">
          <div className={base} style={{ background: "var(--ff-color-primary,#2B6AF3)", color: "#fff" }}>
            {text}
          </div>
        </div>
      );
    }
    return (
      <div className="text-left">
        <div className={base} style={{ background: "#1b2138", color: "var(--ff-color-text,#E6E7EA)" }}>
          {text}
        </div>
      </div>
    );
  };

  const Header = () => (
    <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--ff-color-border,#242A40)" }}>
      <div>
        <h3 className="text-text text-lg">Praat met Nova</h3>
        <p className="text-muted text-sm">Snelle stijltips, precies voor jou.</p>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={toggleMinimize} aria-label={minimized ? "Maximaliseer chat" : "Minimaliseer chat"}>
          {minimized ? "Open" : "Minimaliseer"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)} aria-label="Sluit chat">Sluiten</Button>
      </div>
    </div>
  );

  // Minimized tray
  if (minimized) {
    return (
      <Portal id="fitfi-portal-chat">
        <div className="fixed right-6 bottom-[calc(24px+env(safe-area-inset-bottom))] z-[2147483647]">
          <div className="rounded-xl bg-surface border shadow-lg p-3" style={{ borderColor: "var(--ff-color-border,#242A40)" }}>
            <div className="text-sm mb-2 text-text">Praat met Nova</div>
            <div className="flex gap-2 flex-wrap">
              {SUGGESTIONS.slice(0, 2).map((s) => (
                <Button key={s} variant="outline" size="sm" onClick={() => send(s)}>{s}</Button>
              ))}
              <Button onClick={toggleMinimize}>Open</Button>
            </div>
          </div>
        </div>
      </Portal>
    );
  }

  // Volledig paneel
  return (
    <Portal id="fitfi-portal-chat">
      <div role="dialog" aria-modal="true" aria-label="Nova chat" className="fixed inset-0 z-[2147483647] flex items-end justify-end p-6">
        <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
        <div className="relative w-full max-w-md bg-surface border rounded-xl shadow-lg overflow-hidden"
             style={{ borderColor: "var(--ff-color-border,#242A40)" }}>
          <Header />
          <div ref={listRef} className="px-5 py-4 max-h-[55vh] overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="text-sm text-muted">
                Stel je vraag of kies een optie hieronder — wij geven direct advies met een korte uitleg waarom het past.
              </div>
            ) : (
              messages.map((m) => <Bubble key={m.id} text={m.text} role={m.role} />)
            )}
            {busy ? <div className="text-left text-muted text-sm"><TypingDots /></div> : null}
          </div>
          <div className="px-5 pb-3 pt-1">
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTIONS.map((s) => (
                <Button key={s} variant="outline" size="sm" onClick={() => send(s)}>{s}</Button>
              ))}
            </div>
            <form onSubmit={onSubmit} className="flex gap-2">
              <input
                aria-label="Typ je bericht aan Nova"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Stel je vraag, wij helpen je met stijl"
                className="flex-1 h-11 rounded-md bg-[#101525] border px-3 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ borderColor: "var(--ff-color-border,#242A40)" }}
              />
              <Button type="submit" disabled={busy || !input.trim()}>{busy ? "Bezig" : "Verstuur"}</Button>
            </form>
          </div>
        </div>
      </div>
    </Portal>
  );
}