        try { const evt = JSON.parse(payload); if (evt.type==='chunk' && evt.delta) yield evt.delta; } catch { /* ignore */ }
      }
        const payload = line.slice(5).trim();
    }
        const line = raw.trim(); if (!line || line.startsWith(':') || !line.startsWith('data:')) continue;
    return;
      for (const raw of lines) {
  }
      const lines = buf.split('\n'); buf = lines.pop() || '';

      buf += td.decode(value, { stream:true });
  // --- Geen SSE -> duidelijk signaal voor UI ---
      const { value, done } = await r.read(); if (done) break;
  const msg = await res.text().catch(()=> '');
    for (;;) {
  throw new Error('NOVA_SSE_INACTIVE:' + msg.slice(0,200));
    const r = res.body.getReader(); const td = new TextDecoder(); let buf = '';
}
  if (res.ok && res.body && ctype.includes('text/event-stream')) {
  // --- SSE pad ---

  const ctype = (res.headers.get('content-type')||'').toLowerCase();

  });
    signal
    body: JSON.stringify({ mode, messages, stream:true }),
    headers: { 'Content-Type':'application/json', 'Accept':'text/event-stream' },
    method: 'POST',
  const res = await fetch('/.netlify/functions/nova', {
}): AsyncGenerator<string, void, unknown> {
  signal?: AbortSignal;
  messages: { role:'system'|'user'|'assistant'; content:string }[];
  mode: 'outfits'|'archetype'|'shop';
export async function* streamChat({ mode, messages, signal }: {
              yield evt.delta;
            }
            // meta / done / error can be handled by caller if needed
          } catch {
            // lenient: some providers send plain text
            yield payload;
          }
        }
      }
      return;
    }

    // --- JSON FALLBACK ---
    const json = await res.json().catch(() => ({}));
    const text = json?.content || 'Er ging iets mis.';
    for (const chunk of chunkify(text)) {
      yield chunk;
      await sleep(20);
    }
  } catch (e) {
    const text = 'Netwerkprobleem — offline mode.';
    for (const chunk of chunkify(text)) {
      yield chunk;
      await sleep(25);
    }
  }
}

function mockAnswer(mode: NovaMode, messages: Msg[]): string {
  const last = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  if (mode === 'outfits') {
    return `Hier zijn 3 outfits op basis van je vraag: ${last}\n\n1) Smart casual — donkerblauwe jeans, wit oxford, suede loafer.\n2) Clean athleisure — tapered jogger, merino crew, retro runner.\n3) Minimal chic — wolblend pantalon, rib knit, chelsea boots.\n\nWaarom: silhouet in balans, kleuren in jouw palet.`;
  }
  if (mode === 'archetype') {
    return `Jouw stijl neigt naar "Modern Minimal". Signal: neutrale kleuren, strakke fits, weinig branding. Do: textuurmix. Don't: te veel contrast.`;
  }
  return `Shoprichtingen: 1) Merino knit crew, 2) Straight/dark denim, 3) Suede sneakers in taupe, 4) Overshirt in wolblend, 5) Minimal leather belt.`;
}

function* chunkify(s: string) {
  const step = 14;
  for (let i = 0; i < s.length; i += step) yield s.slice(i, i + step);
}
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));