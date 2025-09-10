import React, { useEffect, useRef, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { X } from "lucide-react";
import { useNovaChat } from "./NovaChatProvider";
import Portal from "@/components/system/Portal";

function ChatPanel() {
  const { open, setOpen, messages, send, busy } = useNovaChat();
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages.length]);

  if (!open) return null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    send(text);
  };

  return (
    <Portal id="fitfi-portal-chat">
      <div role="dialog" aria-modal="true" aria-label="Nova chat" className="fixed inset-0 z-[2147483647] flex items-end justify-end p-6">
        <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
        <Card className="relative w-full max-w-md bg-surface border border-border rounded-xl shadow-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h3 className="text-text text-lg">Praat met Nova</h3>
              <p className="text-muted text-sm">Snelle stijltips, precies voor jou.</p>
            </div>
            <button
              aria-label="Sluit Nova chat"
              onClick={() => setOpen(false)}
              className="rounded-md p-2 hover:bg-[#1b1f35] focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={listRef} className="px-5 py-4 max-h-[55vh] overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="text-sm text-muted">Stel je vraag, wij helpen je met stijl.</div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
                  <div className={m.role === "user" ? "inline-block rounded-lg bg-primary text-white px-3 py-2" : "inline-block rounded-lg bg-[#1b2138] text-text px-3 py-2"}>
                    {m.text}
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={onSubmit} className="px-5 pb-5 pt-2">
            <div className="flex gap-2">
              <input
                aria-label="Typ je bericht aan Nova"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Vraag Nova om stijladvies"
                className="flex-1 h-11 rounded-md bg-[#101525] border border-border px-3 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Button type="submit" disabled={busy || !input.trim()}>{busy ? "Bezig" : "Versturen"}</Button>
            </div>
          </form>
        </Card>
      </div>
    </Portal>
  );
}

export default ChatPanel;