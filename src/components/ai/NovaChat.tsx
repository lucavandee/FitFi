import React from "react";
import Button from "@/components/ui/Button";
import { askNova } from "@/ai/nova/router";

export default function NovaChat() {
  const [input, setInput] = React.useState("");
  const [msgs, setMsgs] = React.useState<string[]>([]);

  async function onSend() {
    const reply = await askNova([{ role: "user", content: input } as any]);
    setMsgs(m => [...m, `Jij: ${input}`, `Nova: ${reply}`]);
    setInput("");
  }

  return (
    <div className="ff-card">
      <h2 className="text-lg font-semibold mb-3">Nova Chat (stub)</h2>
      <div className="space-y-2 max-h-64 overflow-auto border rounded-xl p-3 bg-white">
        {msgs.map((m, i) => <div key={i} className="text-sm">{m}</div>)}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 border rounded-xl px-3 py-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Typ je vraag…"
        />
        <Button onClick={onSend}>Stuur</Button>
      </div>
    </div>
  );
}