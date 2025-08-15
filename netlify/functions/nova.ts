import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { mode, model, messages } = body;

    // TODO: als je echte streaming wil:
    // - zet fetch door naar OpenAI met stream:true
    // - response headers: 'Content-Type': 'text/event-stream'
    // - en write "data: <chunk>\\n\\n" telkens

    // Voor nu: synthese antw (server-assembled) om latency te beperken
    const content = synth(mode, messages);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ model, content }),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'nova function error' }) };
  }
};

function synth(mode: string, messages: any[]) {
  const last = [...(messages||[])].reverse().find((m:any)=>m.role==='user')?.content || '';
  if (mode === 'outfits') {
    return `Hier zijn 3 outfits op basis van je vraag: ${last}\n\n1) Smart casual — donkerblauwe jeans, wit oxford, suede loafer.\n2) Clean athleisure — tapered jogger, merino crew, retro runner.\n3) Minimal chic — wolblend pantalon, rib knit, chelsea boots.\n\nWaarom: silhouet in balans, kleuren in jouw palet.`;
  }
  if (mode === 'archetype') {
    return `Jouw stijl neigt naar "Modern Minimal". Signal: neutrale kleuren, strakke fits, weinig branding. Do: textuurmix. Don't: te veel contrast.`;
  }
  return `Shoprichtingen: 1) Merino knit crew, 2) Straight/dark denim, 3) Suede sneakers in taupe, 4) Overshirt in wolblend, 5) Minimal leather belt.`;
}