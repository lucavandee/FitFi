import React, { useCallback, useMemo, useRef, useState } from "react";
import NovaMessageList from "./NovaMessageList";
import { useNovaSSE } from "./useNovaSSE";
import type { ChatMessage, NovaEvent } from "./types";
import { track } from "./types";

type Props = {
  uid?: string;            // optioneel: doorgeven van (pseudo) user-id
  tier?: string;           // optioneel: "free" | "plus" | ...
  initialContext?: Record<string, unknown>;
  className?: string;
};

const makeId = () => Math.random().toString(36).slice(2);

const NovaChat: React.FC<Props> = ({ uid, tier, initialContext, className }) => {
  const { start, stop, isLoading, lastError } = useNovaSSE("/.netlify/functions/nova");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState<string>("");
  const [input, setInput] = useState<string>("");

  const listRef = useRef<HTMLDivElement>(null);

  const headers = useMemo(
    () => ({
      "x-fitfi-uid": uid || (typeof localStorage !== "undefined" ? localStorage.getItem("fitfi_uid") || undefined : undefined),
      "x-fitfi-tier": tier || (typeof localStorage !== "undefined" ? localStorage.getItem("fitfi_tier") || undefined : undefined),
    }),
    [uid, tier]
  );

  const append = useCallback((role: "user" | "assistant", content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: makeId(),
        role,
        content,
        ts: Date.now(),
      },
    ]);
    // auto-scroll
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  const onEvent = useCallback(
    (e: NovaEvent) => {
      if (e.type === "delta") {
        setStreaming((s) => (s ? s + e.delta : e.delta));
      } else if (e.type === "complete") {
        // finalize current assistant message
        const finalText = e.message || streaming;
        if (finalText && finalText.trim().length > 0) {
          append("assistant", finalText);
        }
        setStreaming("");
        track("nova:complete", { len: finalText?.length || 0, usage: (e as any).usage });
      } else if (e.type === "error") {
        track("nova:error", { message: e.message, code: e.code });
      } else if (e.type === "nova:prompt-login") {
        track("nova:prompt-login");
      }
    },
    [append, streaming]
  );

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    append("user", trimmed);
    setInput("");
    setStreaming("");

    const ctx: Record<string, unknown> = { ...(initialContext || {}) };
    const history = messages
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    await start(
      {
        prompt: trimmed,
        context: ctx,
        messages: history,
      },
      headers,
      onEvent
    );
  }, [append, headers, initialContext, input, isLoading, messages, onEvent, start]);

  const handleStop = useCallback(() => {
    stop();
    setStreaming("");
  }, [stop]);

  return (
    <section className={`ff-card card p-4 md:p-5 ${className || ""}`} aria-label="Nova chat">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-ui pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full skeleton" aria-hidden="true" />
          <div>
            <h2 className="text-ink font-semibold leading-none">Nova</h2>
            <p className="text-muted text-sm">Jouw AI-stylist — premium & to the point</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isLoading ? (
            <span className="badge badge-accent text-xs">Klaar</span>
          ) : (
            <span className="badge badge-accent text-xs">Bezig…</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        className="mt-4 max-h-[52vh] overflow-auto pr-1"
        aria-live="polite"
        aria-busy={isLoading}
      >
        <NovaMessageList messages={messages} streamingText={streaming} />
      </div>

      {/* Error */}
      {lastError && (
        <div className="mt-3">
          <div className="badge badge-danger text-sm">
            Fout: <span className="ml-1">{lastError}</span>
          </div>
        </div>
      )}

      {/* Composer */}
      <form
        className="mt-4 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSend();
        }}
      >
        <label className="w-full">
          <span className="sr-only">Bericht aan Nova</span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Stel je stijlvraag of laat Nova een outfit uitleggen…"
            rows={2}
            className="w-full resize-none rounded-xl border border-ui bg-surface p-3 text-ink focus:outline-none focus:ring-2 ring-brand ring-offset-2 ring-offset-surface"
          />
        </label>

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            className="btn btn-solid btn-md ff-focus"
            disabled={isLoading || input.trim().length === 0}
            aria-disabled={isLoading || input.trim().length === 0}
            aria-label="Verstuur naar Nova"
          >
            Verstuur
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleStop}
            disabled={!isLoading && !streaming}
            aria-disabled={!isLoading && !streaming}
            aria-label="Stop streaming"
          >
            Stop
          </button>
        </div>
      </form>
    </section>
  );
};

export default NovaChat;