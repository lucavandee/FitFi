// src/components/nova/ChatPanelPro.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles, Wand2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useNovaChat } from "@/components/nova/NovaChatProvider";
import { track } from "@/utils/telemetry";
import type { Product } from "@/types/product";
import ProductRail from "./ProductRail";

type MsgRole = "user" | "assistant";
type Msg = { id: string; role: MsgRole; content: string; ts: string };

const SUGGESTIONS: string[] = [
  "Maak een smart-casual outfit onder €200",
  "Capsule wardrobe voor 10 dagen citytrip",
  "Business casual, geen blazer",
  "Street luxe fit met witte sneakers",
];

function uuid() {
  try {
    return crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  } catch {
    return Math.random().toString(36).slice(2);
  }
}
function nowISO() { return new Date().toISOString(); }

export default function ChatPanelPro() {
  const nova = useNovaChat();
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Msg[]>([
    { id: uuid(), role: "assistant", content: "Hi! Waarmee zal ik je stylen? 👋", ts: nowISO() }
  ]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);

  const canType = useMemo(
    () => nova.status !== "opening" && nova.status !== "streaming",
    [nova.status]
  );

  useEffect(() => {
    const unsub = nova.events.subscribe((m) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant") {
          const merged = prev.slice(0, -1).concat([{ ...last, content: m.content, ts: nowISO() }]);
          return merged;
        }
        return prev.concat({ id: uuid(), role: "assistant", content: m.content, ts: nowISO() });
      });
    });
    return () => unsub();
  }, [nova.events]);

  useEffect(() => {
    const unsub = nova.products.subscribe((items) => setProducts(items ?? null));
    return () => unsub();
  }, [nova.products]);

  useEffect(() => {
    setPending(nova.status === "opening" || nova.status === "streaming");
  }, [nova.status]);

  const submit = useCallback(async (raw?: string) => {
    const value = (raw ?? inputRef.current?.value ?? "").trim();
    
    // Prevent empty submissions
    if (!value && !raw) {
      return;
    }
    
    const prompt = value || "Maak een smart-casual outfit onder €200";
    setError(null);

    setMessages((prev) => prev.concat({ id: uuid(), role: "user", content: prompt, ts: nowISO() }));
    setMessages((prev) => prev.concat({ id: uuid(), role: "assistant", content: "…", ts: nowISO() }));
    setPending(true);
    setProducts(null);

    try {
      track("nova:send", { len: prompt.length });
      await nova.send(prompt, { mode: "outfits" });
    } catch (e: any) {
      setError("Er ging iets mis bij het stylen. Probeer het opnieuw.");
      track("nova:submit_error", { hasMessage: !!e?.message });
      setPending(false);
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [nova]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 p-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] rounded-xl px-3 py-2 text-[14px] leading-5 bg-[#F2F5FF] text-[#0D1B2A]"
                : "max-w-[85%] rounded-xl px-3 py-2 text-[14px] leading-5 bg-white border border-gray-100 text-[#0D1B2A] shadow-sm"
            }
          >
            {m.content}
          </div>
        ))}
        {products && <ProductRail items={products} />}
      </div>

      <div className="border-t border-gray-200 p-2">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Beschrijf je style of gelegenheid…"
            className="flex-1 h-11 rounded-xl border border-gray-300 bg-white px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2B6AF3]/30"
            onKeyDown={(e) => { if (e.key === "Enter" && canType) submit(); }}
            disabled={!canType}
          />
          <Button onClick={() => submit()} disabled={!canType} className="h-11 px-4">
            {pending ? (
              <span className="inline-flex items-center gap-2"><Sparkles size={16}/>Stylen…</span>
            ) : (
              <span className="inline-flex items-center gap-2"><Send size={16}/>Verstuur</span>
            )}
          </Button>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              className="rounded-full border border-gray-300 bg-white px-3 py-1 text-[12px] hover:border-gray-400"
              disabled={!canType}
              type="button"
            >
              <Wand2 size={14} className="inline-block mr-1" />
              {s}
            </button>
          ))}
        </div>

        {error && <div className="mt-2 text-[13px] text-red-600">{error}</div>}
      </div>
    </div>
  );
}