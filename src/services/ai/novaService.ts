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
  const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const dbg = import.meta.env.VITE_NOVA_DEBUG === 'true';

  const res = await fetch('/.netlify/functions/nova', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
    body: JSON.stringify({ mode, messages, stream: true }),
    signal,
  });

  const ctype = (res.headers.get('content-type') || '').toLowerCase();
  
  if (dbg) console.debug('[NOVA] status', res.status, 'ctype', ctype);

  // --- SSE pad ---
  if (res.ok && res.body && ctype.includes('text/event-stream')) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let firstChunkAt: number | null = null;

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
            if (!firstChunkAt) {
              firstChunkAt = (typeof performance !== 'undefined' ? performance.now() : Date.now());
              // TTFB wordt in NovaChat berekend uit t0 en firstChunkAt; hier geen state nodig
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

  // --- geen SSE -> log snippet en faal hard zodat UI een duidelijke melding toont
  if (dbg) {
    let snippet = '';
    try { snippet = (await res.text()).slice(0, 200); } catch {}
    console.debug('[NOVA] non-SSE response', { status: res.status, ctype, bodySnippet: snippet });
  }
  onEvent?.({ type: 'error' });
  throw new Error('NOVA_SSE_INACTIVE');
}

const chunkify = function* (s: string) {
  const step = 14;
  for (let i = 0; i < s.length; i += step) yield s.slice(i, i + step);
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));