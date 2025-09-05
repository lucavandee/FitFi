import React from "react";
import novaStream, { NovaMessage } from "@/ai/nova/sse";
import Button from "@/components/ui/Button";
import { readUsage, getLimitForTier } from "@/utils/usage";
import { track } from "@/utils/analytics";

function uidFromStorage(): string {
  try {
    const existing = localStorage.getItem("fitfi.uid");
    if (existing) return existing;
    const u = crypto.randomUUID();
    localStorage.setItem("fitfi.uid", u);
    return u;
  } catch {
    return "anon";
  }
}

export default function NovaChat() {
  const tier: Tier = "visitor"; // kan dynamisch uit context komen; default = visitor
  const uid = React.useMemo(() => uidFromStorage(), []);
  const [input, setInput] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<NovaMessage[]>([
    { role: "system", content: "Je bent Nova, de FitFi stylist. Geef korte heldere antwoorden in het Nederlands." }
  ]);
  const [output, setOutput] = React.useState<string>("");

  React.useEffect(() => { track("nova:open", { uid, tier }); }, [uid, tier]);

  const usage = readUsage(uid);
  const limit = getLimitForTier(tier);
  const remaining = Math.max(0, limit - usage.tokens);

  async function onSend() {
    setError(null);
    if (!input.trim()) return;
    if (remaining <= 0) {
      setError("Daglimiet bereikt voor jouw tier. Upgrade in Pricing om meer te chatten.");
      track("nova:prompt-login", { reason: "quota_exceeded", tier, uid });
      return;
    }

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setOutput("");
    setStreaming(true);

    track("nova:set-context", { messages: newMessages.length, uid, tier });

    await novaStream({
      uid,
      tier,
      messages: newMessages,
      onToken: (t) => setOutput(prev => prev + t),
      onJson: (obj) => {
        // JSON tool-calls/metadata – je kunt hier UI-state updaten
        // eslint-disable-next-line no-console
        console.info("Nova JSON:", obj);
      },
      onDone: () => {
        setStreaming(false);
        setMessages(m => [...m, { role: "assistant", content: output }]);
      },
      onError: (e) => {
        setStreaming(false);
        setError(typeof e === "string" ? e : "Er ging iets mis met Nova.");
      }
    });
  }

  return (
    <div className="ff-card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-heading text-[color:var(--ff-midnight)]">Nova</h2>
        <div className="text-xs text-gray-600">
          Tokens: {usage.tokens} / {limit}
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-auto border rounded-xl p-3 bg-white text-sm">
        {messages.filter(m => m.role !== "system").map((m, i) => (
          <div key={i} className={m.role === "user" ? "font-medium" : ""}>
            <span className="text-gray-500">{m.role === "user" ? "Jij" : "Nova"}:</span> {m.content}
          </div>
        ))}
        {streaming && <div><span className="text-gray-500">Nova:</span> {output}<span className="animate-pulse">▍</span></div>}
        {!streaming && output && <div><span className="text-gray-500">Nova:</span> {output}</div>}
      </div>

      {error && <div className="mt-3 text-sm text-red-600" role="alert">{error}</div>}

      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 border rounded-xl px-3 py-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSend(); }}
          placeholder="Stel je vraag aan Nova… (Enter ⏎ of Cmd/Ctrl+Enter)"
          aria-label="Bericht aan Nova"
        />
        <Button onClick={onSend} disabled={streaming}>Stuur</Button>
      </div>
      <p className="ff-subtle mt-2">Gebruik met beleid; quota per tier. Voor meer capaciteit: bekijk <a className="underline" href="/pricing">Pricing</a>.</p>
    </div>
  );
}