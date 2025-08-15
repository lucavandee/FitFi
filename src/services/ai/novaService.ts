export type NovaMode = 'outfits' | 'archetype' | 'shop';
export type Role = 'system' | 'user' | 'assistant';
export interface ChatMessage { role: Role; content: string; }

export interface NovaStreamEvent {
  type: 'meta' | 'chunk' | 'done' | 'error';
  model?: string;
  traceId?: string;
  delta?: string;
}

/** Streaming client → Netlify function.
 *  Leest SSE (voorkeur) en valt terug op JSON-respons. */
export async function* streamChat({
  mode,
  messages,
  signal,
  onEvent,            // <-- nieuw
}: {
  mode: NovaMode;
  messages: ChatMessage[];
  signal?: AbortSignal;
  onEvent?: (evt: NovaStreamEvent) => void;
}): AsyncGenerator<string, void, unknown> {
  const t0 = performance.now();
  const dbg = import.meta.env.VITE_NOVA_DEBUG === 'true';
  const dbg = import.meta.env.VITE_NOVA_DEBUG === 'true';

  const res = await fetch('/.netlify/functions/nova', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
    body: JSON.stringify({ mode, messages, stream: true }),
    signal,
  });

  const ctype = (res.headers.get('content-type') || '').toLowerCase();
  
  if (dbg) console.debug('[NOVA] status', res.status, 'ctype', res.headers.get('content-type'));
  
  if (dbg) console.debug('[NOVA] status', res.status, 'ctype', res.headers.get('content-type'));

  // --- SSE pad ---
  if (res.ok && res.body && ctype.includes('text/event-stream')) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let sentFirstChunk = false;

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
          const evt = JSON.parse(payload) as NovaStreamEvent;

          if (evt.type === 'meta') {
            onEvent?.({ type: 'meta', model: evt.model, traceId: evt.traceId });
          } else if (evt.type === 'chunk' && typeof evt.delta === 'string') {
            if (!sentFirstChunk) {
              sentFirstChunk = true;
              const ttfb = Math.max(0, Math.round(performance.now() - t0));
              onEvent?.({ type: 'meta', model: evt.model, traceId: evt.traceId });
              // We laten TTFB tonen via context (NovaChat berekent op meta→first chunk).
            }
            onEvent?.({ type: 'chunk', delta: evt.delta });
            yield evt.delta;
          } else if (evt.type === 'done') {
            onEvent?.({ type: 'done' });
          } else if (evt.type === 'error') {
            onEvent?.({ type: 'error' });
          }
        } catch {
          // Plain text fallback
          onEvent?.({ type: 'chunk', delta: payload });
          yield payload;
        }
      }
    }
    return;
  }

  // geen SSE → harde fout (UI toont duidelijke melding)
  if (!res.ok || !res.body || !ctype.includes('text/event-stream')) {
    if (dbg) {
      const txt = await res.text().catch(() => '');
      console.debug('[NOVA] non-SSE response', { status: res.status, ctype, bodySnippet: txt.slice(0, 200) });
    }
    if (dbg) {
      const txt = await res.text().catch(() => '');
      console.debug('[NOVA] non-SSE response', { status: res.status, ctype, bodySnippet: txt.slice(0, 200) });
    }
    onEvent?.({ type: 'error' });
    throw new Error('NOVA_SSE_INACTIVE');
  }

}

const chunkify = function* (s: string) {
  const step = 14;
  for (let i = 0; i < s.length; i += step) yield s.slice(i, i + step);
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));