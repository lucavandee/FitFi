import React from "react";

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id: string }
  | { type: "h3"; text: string; id: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "blockquote"; text: string };

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Converteer een platte blogtekst naar renderbare blokken (simpele markdown). */
export function toRichBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  function closeList() {
    if (list) {
      blocks.push({ type: list.type, items: list.items });
      list = null;
    }
  }

  for (const raw of lines) {
    const line = raw.trim();

    if (line === "") {
      closeList();
      continue;
    }

    if (line.startsWith("### ")) {
      closeList();
      const text = line.slice(4).trim();
      blocks.push({ type: "h3", text, id: slugify(text) });
      continue;
    }

    if (line.startsWith("## ")) {
      closeList();
      const text = line.slice(3).trim();
      blocks.push({ type: "h2", text, id: slugify(text) });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const item = line.replace(/^\d+\.\s+/, "").trim();
      if (!list || list.type !== "ol") list = { type: "ol", items: [] };
      list.items.push(item);
      continue;
    }

    if (line.startsWith("- ")) {
      const item = line.slice(2).trim();
      if (!list || list.type !== "ul") list = { type: "ul", items: [] };
      list.items.push(item);
      continue;
    }

    if (line.startsWith("> ")) {
      closeList();
      blocks.push({ type: "blockquote", text: line.slice(2).trim() });
      continue;
    }

    // default: paragraaf
    closeList();
    blocks.push({ type: "p", text: line });
  }
  closeList();

  return blocks;
}

type RichProseProps = {
  blocks: Block[];
};

/** Render blokken met tokens-first typografie */
const RichProse: React.FC<RichProseProps> = ({ blocks }) => {
  return (
    <div className="prose">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={b.id + i} id={b.id} className="prose-h2">
                <a className="heading-anchor" href={`#${b.id}`} aria-label="Koplink">¶</a>
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={b.id + i} id={b.id} className="prose-h3">
                <a className="heading-anchor" href={`#${b.id}`} aria-label="Koplink">¶</a>
                {b.text}
              </h3>
            );
          case "ul":
            return (
              <ul key={"ul-" + i} className="prose-ul">
                {b.items.map((it, idx) => <li key={idx}>{it}</li>)}
              </ul>
            );
          case "ol":
            return (
              <ol key={"ol-" + i} className="prose-ol">
                {b.items.map((it, idx) => <li key={idx}>{it}</li>)}
              </ol>
            );
          case "blockquote":
            return <blockquote key={"q-" + i} className="prose-quote">"{b.text}"</blockquote>;
          default:
            return <p key={"p-" + i} className="prose-p">{(b as any).text}</p>;
        }
      })}
    </div>
  );
};

export default RichProse;