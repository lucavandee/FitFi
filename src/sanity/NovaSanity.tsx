import { useEffect, useState } from "react";
import { novaStream, type NovaEvent } from "@/ai/nova/router";

type Line = string;

function NovaSanity() {
  const [lines, setLines] = useState<Line[]>([]);
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      const gen = novaStream({ prompt: "ping", context: {}, signal: ctrl.signal });
      for await (const ev of gen) {
        if (ev.type === "text") setLines((ls) => [...ls, ev.data]);
        if (ev.type === "json") setLines((ls) => [...ls, JSON.stringify(ev.data)]);
        if (ev.type === "error") setLines((ls) => [...ls, `ERR: ${ev.error}`]);
      }
    })();
    return () => ctrl.abort();
  }, []);
  return (
    <pre className="p-4 text-xs bg-surface rounded-xl overflow-auto">
      {lines.map((l, i) => (<div key={i}>{l}</div>))}
    </pre>
  );
}

export default NovaSanity;