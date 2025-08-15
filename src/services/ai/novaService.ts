export type NovaMode = 'outfits' | 'archetype' | 'shop';
export type Role = 'system' | 'user' | 'assistant';
export interface ChatMessage { role: Role; content: string; }

/** Streaming client → Netlify function.
 *  Leest SSE (voorkeur) en valt terug op JSON-respons. */
export async function* streamChat({
  mode,
  messages,
  signal,
}: {
  mode: NovaMode;
  messages: ChatMessage[];
  signal?: AbortSignal;
}): AsyncGenerator<string, void, unknown> {
  const res = await fetch('/.netlify/functions/nova', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream', // prefer SSE
    },
    body: JSON.stringify({ mode, messages, stream: true }),
    signal,
  });

  const ctype = (res.headers.get('content-type') || '').toLowerCase();

  // --- SSE pad ---
  if (res.ok && res.body && ctype.includes('text/event-stream')) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const raw of lines) {
        const line = raw.trim();
        if (!line || line.startsWith(':') || !line.startsWith('data:')) continue;

        const payload = line.slice(5).trim();
        try {
          const evt = JSON.parse(payload);
          if (evt.type === 'chunk' && typeof evt.delta === 'string') {
            yield evt.delta;
          }
        } catch {
          // Lenient: als server plain text pusht, toch doorgeven
          yield payload;
        }
      }
    }
    return;
  }

  // --- JSON fallback ---
  let text = '';
  try {
    const json = await res.json();
    text = json?.content || '';
  } catch {
    text = await res.text().catch(() => '');
  }

  if (!text) throw new Error('NOVA_SSE_INACTIVE');

  for (const part of chunkify(text)) {
    yield part;
    await sleep(20);
  }
}

function* chunkify(s: string) {
  const step = 14;
  for (let i = 0; i < s.length; i += step) yield s.slice(i, i + step);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));