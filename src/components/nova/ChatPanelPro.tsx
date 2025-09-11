import React, { useCallback, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import Button from "@/components/ui/Button";
import { useNovaChat } from "@/components/nova/NovaChatProvider";
import { track } from "@/utils/telemetry";
import { cn } from "@/utils/cn";

type MsgRole = "user" | "assistant" | "system";
type Msg = { id: string; role: MsgRole; content: string; ts: string };

function nowISO() {
  return new Date().toISOString();
}

export default function ChatPanelPro() {
  // Provider is nu always-safe (fallback in Provider), maar we guarden tóch
  const nova = useNovaChat();
  const inputRef = useRef<HTMLInputElement>(null);

  // Lokale buffer zodat UI altijd werkt, ook als de provider in fallback staat
  const [messages, setMessages] = useState<Msg[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = nova?.status ?? "disabled";
  const isOpen = nova?.isOpen ?? true; // paneel mag renderen; je kunt hem visueel verbergen in de caller
  const prefill = nova?.prefill ?? "";

  // Veilig aantal berichten (nooit undefined)
  const count = (messages ?? []).length;

  const canType = useMemo(() => status !== "streaming" && status !== "opening", [status]);

  const send = useCallback(async (text: string) => {
    const trimmed = String(text || "").trim();
    if (!trimmed) return;

    setError(null);
    setPending(true);

    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: trimmed, ts: nowISO() };
    setMessages(prev => [...prev, userMsg]);

    try {
      // Probeer echte Nova-call; in fallback is dit een no-op
      await nova?.start(trimmed, { source: "ChatPanelPro" });

      // Simuleer minimaal assistent-antwoord als provider in fallback staat
      if (nova?.__fallback) {
        const assistant: Msg = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "We analyseren jouw stijl en bouwen een cleane, smart-casual outfit die past bij je voorkeuren.",
          ts: nowISO(),
        };
        setMessages(prev => [...prev, assistant]);
      }

      track("nova:prompt", { source: "ChatPanelPro", len: trimmed.length });
    } catch (e: any) {
      const msg = e?.message || "Kon je bericht niet verzenden.";
      setError(String(msg));
      track("nova:error", { where: "ChatPanelPro", message: String(msg) });
    } finally {
      setPending(false);
      inputRef.current && (inputRef.current.value = "");
    }
  }, [nova]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value ?? "";
    void send(value);
  }, [send]);

  return (
    <div className="flex h-full flex-col">
      {/* Status indicator */}
      <div className="flex items-center justify-center pb-2">
        <div className="text-xs text-gray-500">
          {status === "streaming" ? "Bezig met analyseren…" : status === "opening" ? "Opstarten…" : "Klaar"}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto py-2">
        {count === 0 ? (
          <div className="text-sm text-gray-500">
            Stel je stijlvraag of plak je outfit-briefing. Wij geven direct een heldere uitleg en shoppable look.
          </div>
        ) : (
          <ul className="space-y-3">
            {(messages ?? []).map(m => (
              <li key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                    m.role === "user" ? "bg-[#2B6AF3] text-white" : "bg-gray-100 text-[#0D1B2A]"
                  )}
                >
                  {m.content}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Error */}
      {error ? (
        <div className="pb-2 text-xs text-red-600">{error}</div>
      ) : null}

      {/* Composer */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-3 border-t border-black/5">
        <input
          ref={inputRef}
          defaultValue={prefill || ""}
          placeholder="Beschrijf je stijl of gelegenheid…"
          className="flex-1 h-10 rounded-xl border border-black/10 px-3 text-sm outline-none focus:ring-2 focus:ring-[#2B6AF3]/30"
          disabled={!canType || pending}
          aria-label="Nova chat invoer"
        />
        <Button
          type="submit"
          size="sm"
          variant="primary"
          icon={<Send size={16} />}
          iconPosition="right"
          loading={pending}
          disabled={!canType || pending}
        >
          Verstuur
        </Button>
      </form>
    </div>
  );
}