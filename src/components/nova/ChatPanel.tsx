import React, { useEffect, useRef } from "react";
import { X, Send, RotateCcw } from "lucide-react";
import { useNovaChat } from "./NovaChatProvider";
import Button from "@/components/ui/Button";

export default function ChatPanel() {
  const { isOpen, setOpen, sending, error, messages, send, reset } = useNovaChat();
  const [input, setInput] = React.useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    await send(text);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-end justify-end p-4 md:p-6 pointer-events-none"
      role="dialog"
      aria-label="Nova Chat"
    >
      <div
        className="
          pointer-events-auto
          w-full max-w-md
          h-[600px] max-h-[80vh]
          bg-[var(--color-surface)]
          border border-[var(--color-border)]
          rounded-[var(--radius-2xl)]
          shadow-[var(--shadow-soft)]
          flex flex-col
          overflow-hidden
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2B6AF3] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" className="text-white">
                <path
                  d="M12 3a9 9 0 00-9 9c0 1.98.64 3.8 1.73 5.27L3 21l3.86-1.67A8.96 8.96 0 0012 21a9 9 0 100-18z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-[var(--color-text)]">Nova</h2>
              <p className="text-xs text-[var(--color-muted)]">
                {sending ? "Aan het typen..." : "Je persoonlijke style assistent"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={reset}
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              title="Reset chat"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setOpen(false)}
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              title="Sluit chat"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`
                  max-w-[85%] rounded-2xl px-4 py-3
                  ${
                    msg.role === "user"
                      ? "bg-[#2B6AF3] text-white"
                      : "bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)]"
                  }
                `}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--color-border)]">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Stel je vraag aan Nova..."
                disabled={sending}
                rows={1}
                className="
                  w-full resize-none
                  bg-[var(--color-bg)]
                  border border-[var(--color-border)]
                  rounded-xl
                  px-4 py-3
                  text-sm
                  text-[var(--color-text)]
                  placeholder:text-[var(--color-muted)]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#2B6AF3]/30
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
                style={{ maxHeight: "120px" }}
              />
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || sending}
              variant="primary"
              size="sm"
              className="h-11 px-4"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-[var(--color-muted)] mt-2">
            Tip: Gebruik Enter om te versturen, Shift+Enter voor een nieuwe regel
          </p>
        </form>
      </div>
    </div>
  );
}
