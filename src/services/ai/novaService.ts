import type { NovaOutfitsPayload } from '@/lib/outfitSchema';
import { getUserTier, getUID } from '@/utils/session';

export type NovaMode = 'outfits' | 'archetype' | 'shop';
export type Role = 'system' | 'user' | 'assistant';
export interface ChatMessage { role: Role; content: string; }

export interface NovaStreamEvent {
  type: 'meta' | 'chunk' | 'done' | 'error' | 'json';
  model?: string;
  traceId?: string;
  delta?: string;
  data?: NovaOutfitsPayload;
}

const START = '<<<FITFI_JSON>>>';
const END   = '<<<END_FITFI_JSON>>>';

export async function* streamChat({
  mode,
  messages,
  signal,
  onEvent,
}: {
  mode: NovaMode;
  messages: ChatMessage[];
  signal?: AbortSignal;
  onEvent?: (evt: NovaStreamEvent) => void;
}): AsyncGenerator<string, void, unknown> {
  const dbg = import.meta.env.VITE_NOVA_DEBUG === 'true';

  const res = await fetch('/.netlify/functions/nova', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'x-fitfi-tier': getUserTier(),
      'x-fitfi-uid': getUID(),
    },
    body: JSON.stringify({ mode, messages, stream: true }),
    signal,
  });

  const ctype = (res.headers.get('content-type') || '').toLowerCase();
  if (!(res.ok && res.body && ctype.includes('text/event-stream'))) {
    if (dbg) {
      const txt = await res.text().catch(()=> '');
      console.debug('[NOVA] non-SSE', res.status, ctype, txt.slice(0,200));
    }
    onEvent?.({ type:'error' });
    throw new Error('NOVA_SSE_INACTIVE');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let jsonMode = false;
  let jsonBuf = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n'); buffer = lines.pop() || '';

    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith(':') || !line.startsWith('data:')) continue;

      const payload = line.slice(5).trim();
      let evt: any;
      try { evt = JSON.parse(payload); } catch { evt = null; }

      const delta = evt?.type === 'chunk' ? (evt.delta ?? '') : '';

      // --- JSON marker capture (werkt ook tijdens streaming) ---
      if (delta) {
        if (!jsonMode) {
          const i = delta.indexOf(START);
          if (i >= 0) {
            jsonMode = true;
            jsonBuf = '';
            // alles na START reserveren
            jsonBuf += delta.slice(i + START.length);
            // toon human tekst t/m START
            const human = delta.slice(0, i);
            if (human) { onEvent?.({ type:'chunk', delta: human }); yield human; }
            continue;
          }
        } else {
          const j = delta.indexOf(END);
          if (j >= 0) {
            jsonBuf += delta.slice(0, j);
            try {
              const parsed = JSON.parse(jsonBuf) as NovaOutfitsPayload;
              onEvent?.({ type:'json', data: parsed });
            } catch (e) {
              if (dbg) console.warn('[NOVA] JSON parse failed', e);
            }
            jsonMode = false;
            const rest = delta.slice(j + END.length);
            if (rest) { onEvent?.({ type:'chunk', delta: rest }); yield rest; }
            continue;
          } else {
            jsonBuf += delta;
            // verberg JSON voor de gebruiker
            continue;
          }
        }
      }

      if (evt?.type === 'meta') {
        onEvent?.({ type:'meta', model: evt.model, traceId: evt.traceId });
      } else if (delta) {
        onEvent?.({ type:'chunk', delta }); yield delta;
      } else if (evt?.type === 'done') {
        onEvent?.({ type:'done' });
      } else if (evt?.type === 'error') {
        onEvent?.({ type:'error' });
      }
    }
  }
}