export type NovaMessage = { role: 'user'|'assistant'|'system', content: string }
export type NovaMode = 'outfits'|'archetype'|'shop'|'chat'

type StreamOpts = {
  mode: NovaMode
  messages: NovaMessage[]
  tier?: string
  uid?: string
  signal?: AbortSignal
  baseUrl?: string
}
export async function* streamNova(opts: StreamOpts) {
  const { mode, messages, tier='visitor', uid='anon', signal, baseUrl='' } = opts
  const res = await fetch(`${baseUrl}/.netlify/functions/nova`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'x-fitfi-tier': tier,
      'x-fitfi-uid': uid,
    },
    body: JSON.stringify({ mode, messages, stream: true }),
    signal,
  })
  if (!res.ok || !res.body) throw new Error(`Nova HTTP ${res.status}`)
  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffered = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffered += decoder.decode(value, { stream: true })
    const parts = buffered.split('\n\n'); buffered = parts.pop() ?? ''
    for (const p of parts) if (p.startsWith('data:')) yield p.replace(/^data:\s?/, '')
  }
}