export type NovaMessage = { role: 'user'|'assistant'|'system', content: string };
export type NovaMode = 'outfits'|'archetype'|'shop'|'chat';

type StreamOpts = {
  mode: NovaMode;
  messages: NovaMessage[];
  tier?: string;
  uid?: string;
  signal?: AbortSignal;
  baseUrl?: string;
};

export async function* streamNova(opts: StreamOpts) {
  const { mode, messages, tier='visitor', uid='anon', signal, baseUrl='' } = opts;
  const url = `${baseUrl}/.netlify/functions/nova`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'x-fitfi-tier': tier,
        'x-fitfi-uid': uid,
      },
      body: JSON.stringify({ mode, messages, stream: true }),
      signal,
    });
  } catch (e:any) {
    console.error('Nova fetch failed', { url, error: e?.message });
    throw new Error('Nova endpoint unreachable (network/CORS)');
  }
  if (!res.ok || !res.body) {
    const text = await res.text().catch(()=> '');
    console.error('Nova HTTP error', { status: res.status, body: text.slice(0,500) });
    throw new Error(`Nova HTTP ${res.status}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffered = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffered += decoder.decode(value, { stream: true });
    const parts = buffered.split('\n\n'); buffered = parts.pop() ?? '';
    for (const p of parts) if (p.startsWith('data:')) yield p.replace(/^data:\s?/, '');
  }
}