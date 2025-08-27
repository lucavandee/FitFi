import { useEffect, useRef, useState } from 'react'
import { streamNova, type NovaMessage, type NovaMode } from '@/lib/nova'

export default function NovaSanity(){
  const [mode,setMode]=useState<NovaMode>('chat')
  const [input,setInput]=useState('')
  const [lines,setLines]=useState<string[]>([])
  const [busy,setBusy]=useState(false)
  const abortRef = useRef<AbortController|null>(null)
  useEffect(()=>()=>{ abortRef.current?.abort() },[])

  async function send(){
    if (!input.trim() || busy) return
    setBusy(true); setLines(ls=>[...ls, `> ${input}`])
    abortRef.current?.abort(); abortRef.current = new AbortController()
    const tier = localStorage.getItem('fitfi_tier') || 'visitor'
    const uid  = localStorage.getItem('fitfi_uid')  || 'dev'
    try{
      const gen = streamNova({
        mode,
        messages: [{role:'user', content: input}],
        tier, uid,
        signal: abortRef.current.signal,
        baseUrl: '', // netlify dev/prod: zelfde origin
      })
      for await (const d of gen) setLines(ls=>[...ls, d])
    }catch(e:any){ setLines(ls=>[...ls, `! ${e?.message||e}`]) }
    finally{ setBusy(false); setInput('') }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold">Nova Sanity</h1>
      <div className="flex gap-2 items-center">
        <select className="border rounded p-2" value={mode} onChange={e=>setMode(e.target.value as NovaMode)}>
          <option value="chat">chat</option>
          <option value="outfits">outfits</option>
          <option value="archetype">archetype</option>
          <option value="shop">shop</option>
        </select>
        <input className="flex-1 border rounded p-2" placeholder="Typ je vraag…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} />
        <button className="cta-btn" onClick={send} disabled={busy}>Send</button>
        <button className="border rounded p-2" onClick={()=>{ abortRef.current?.abort(); setBusy(false) }}>Stop</button>
      </div>
      <pre className="bg-gray-50 p-3 rounded min-h-[200px] whitespace-pre-wrap">{lines.join('\n')}</pre>
    </div>
  )
}