// src/components/nova/ChatPanelPro.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles, Wand2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useNovaChat } from "@/components/nova/NovaChatProvider";
import { track } from "@/utils/telemetry";
import { cn } from "@/utils/cn";
import type { Product } from "@/types/product";
import ProductRail from "./ProductRail";

type MsgRole = "user" | "assistant";
type Msg = { id: string; role: MsgRole; content: string; ts: string };

const SUGGESTIONS: string[] = [
  "Maak een smart-casual outfit onder €200",
  "Capsule wardrobe voor 10 dagen citytrip",
  "Minimalistische date-night look (vrouw)",
  "Street luxe fit met witte sneakers",
];

function nowISO() { return new Date().toISOString(); }

export default function ChatPanelPro() {
  const nova = useNovaChat();
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);

  const canType = useMemo(() => nova.status !== "streaming", [nova.status]);
  const count = (messages ?? []).length;

  // Tekst patches
  useEffect(() => {
    return nova.events.subscribe((m) => {
      if (!m?.content) return;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant") {
          const next = [...prev];
          next[next.length - 1] = { ...last, content: m.content, ts: nowISO() };
          return next;
        }
        return [...prev, { id: crypto.randomUUID(), role: "assistant", content: m.content, ts: nowISO() }];
      });
    });
  }, [nova.events]);

  // Product patches
  useEffect(() => {
    return nova.products.subscribe((items) => {
      if (!Array.isArray(items)) return;
      setProducts(items);
    });
  }, [nova.products]);

  const addAssistant = useCallback((content: string) => {
    setMessages((p) => [...p, { id: crypto.randomUUID(), role: "assistant", content, ts: nowISO() }]);
  }, []);

  const send = useCallback(async (text: string) => {
    const trimmed = (text || "").trim();
    if (!trimmed) return;
    setError(null);
    setPending(true);
    setProducts(null);

    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: trimmed, ts: nowISO() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      track("nova:prompt", { len: trimmed.length, source: "ChatPanelPro" });
      await nova.start(trimmed, { ui: "pro-panel" });
      if (nova.__fallback) {
        addAssistant(
          "We kozen voor een cleane, smart-casual look: nette jeans, frisse witte sneaker en een licht overshirt. Minimalistisch, comfortabel en direct shoppable."
        );
      }
    } catch (e: any) {
      const msg = e?.message || "Verzenden mislukt.";
      setError(String(msg));
      track("nova:error", { where: "ChatPanelPro", message: String(msg) });
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [nova, addAssistant]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value ?? "";
    void send(value);
  }, [send]);

  const onSuggestion = useCallback((s: string) => {
    if (!inputRef.current) return;
    inputRef.current.value = s;
    void send(s);
  }, [send]);

  return (
    <div className="flex h-full flex-col">
      {/* Intro */}
      {count === 0 ? (
        <div className="mb-3 rounded-2xl border border-black/5 bg-gradient-to-b from-[#F7FAFF] to-white p-4">
          <div className="flex items-center gap-2 text-[#0D1B2A]">
            <Sparkles size={16} />
            <span className="text-sm font-medium">Jouw stijl, helder uitgelegd</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Stel je stijlvraag of plak je outfit-briefing. Wij geven direct een heldere uitleg en shoppable look.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className={cn("group rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs","text-[#0D1B2A] hover:bg-black/5 transition")}
                onClick={() => onSuggestion(s)}
              >
                <span className="inline-flex items-center gap-1"><Wand2 size={14} className="opacity-70" />{s}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Messages */}
      <div className="flex-1 overflow-auto space-y-3 pr-1">
        {count === 0 ? (
          <div className="text-xs text-gray-500">
            Voorbeelden: "Maak een capsule wardrobe voor 7 dagen kantoor", "Heldere uitleg van mijn outfit met tips".
          </div>
        ) : (
          <ul className="space-y-3">
            {(messages ?? []).map((m) => (
              <li key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
                  m.role === "user" ? "bg-[#2B6AF3] text-white" : "bg-white text-[#0D1B2A] border border-black/10"
                )}>
                  {m.content}
                </div>
              </li>
            ))}
            {pending ? (
              <li className="flex justify-start">
                <div className="max-w-[82%] rounded-2xl px-3 py-2 text-sm bg-white border border-black/10 text-[#0D1B2A] shadow-sm">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#2B6AF3] animate-pulse" aria-hidden />
                    Nova typt…
                  </span>
                </div>
              </li>
            ) : null}
          </ul>
        )}

        {/* Product rail */}
        <ProductRail items={products || []} loading={pending && !products} />
      </div>

      {/* Error */}
      {error ? <div className="px-1 pb-2 text-xs text-red-600">{error}</div> : null}

      {/* Composer */}
      <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2">
        <input
          ref={inputRef}
          defaultValue={nova.prefill || ""}
          placeholder="Beschrijf je stijl of gelegenheid…"
          className={cn("flex-1 h-12 rounded-full border border-black/10 bg-white px-4 text-sm outline-none","focus:ring-2 focus:ring-[#2B6AF3]/30")}
          disabled={!canType || pending}
          aria-label="Nova chat invoer"
        />
        <Button type="submit" size="lg" variant="primary" icon={<Send size={16} />} iconPosition="right" loading={pending} disabled={!canType || pending} className="rounded-full px-5">
          Verstuur
        </Button>
      </form>
      <div className="mt-2 text-[11px] text-gray-500">Tip: druk op <span className="font-medium">Enter</span> om te verzenden.</div>
    </div>
  );
}