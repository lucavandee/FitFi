import React from "react";
import { useNovaChat } from "./NovaChatProvider";

export default function ChatPanelPro() {
  const { sending, error, messages, send } = useNovaChat();

  return (
    <div className="p-4">
      <div className="space-y-3 text-[14px] leading-5">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "assistant" ? "text-gray-200" : "text-white"}>
            {m.content}
          </div>
        ))}
      </div>

      {error && <div className="mt-3 text-red-400">{error}</div>}

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const text = String(fd.get("q") || "");
          if (text.trim().length === 0) return;
          void send(text);
          e.currentTarget.reset();
        }}
      >
        <input
          name="q"
          className="flex-1 rounded-md bg-white/5 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-white/20"
          placeholder="Voorbeeld: Smart casual, onder €200, witte sneakers"
          disabled={sending}
        />
        <button
          type="submit"
          className="rounded-md bg-[#2B6AF3] px-4 py-2 text-white transition-transform hover:scale-105 disabled:opacity-50"
          disabled={sending}
        >
          {sending ? "Bezig…" : "Verstuur"}
        </button>
      </form>
    </div>
  );
}

// (Optioneel) micro-voorbeeld dat eerder kapot was:
export function randomSeed() {
  return Math.random().toString(36).slice(2, 8);
}