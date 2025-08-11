export type NovaGate = { type: 'gate'; text: string; };
export type NovaText = { type: 'text'; text: string; };
export type NovaReply = NovaGate | NovaText;

export type NovaContext = {
  userId?: string;
};

export function routeMessage(text: string, ctx: NovaContext): NovaReply {
  const q = text?.trim();
  if (!q) return { type: 'text', text: 'Vertel me kort wat je zoekt 😉' };

  if (!ctx.userId) {
    try { localStorage.setItem('nova_pending_query', q); } catch {}
    return {
      type: 'gate',
      text:
        'Log in of maak gratis een account. Dan stel ik direct 3 looks voor je samen op basis van je stijl en seizoen.'
    };
  }

  // TODO: echte intent → engine/endpoint
  return { type: 'text', text: `Top! Ik ga looks zoeken voor: "${q}".` };
}