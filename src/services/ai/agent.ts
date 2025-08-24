// frontend/src/services/ai/agent.ts
// Eenvoudige dev-mock voor Nova. Werkt standalone in Vite/Codespaces.
export default async function* agent(messages: Array<{ role: string; content: string }>) {
  const intro = [
    "Hey! 👋 Ik ben Nova.",
    "Ik zie je stijlprofiel en voorkeuren.",
    "Zal ik 3 outfits voor je samenstellen?"
  ];
  for (const part of intro) {
    yield { type: "text", content: part };
    await new Promise(r => setTimeout(r, 350));
  }

  // Kleine echo op basis van laatste user-bericht (als aanwezig)
  const last = [...(messages || [])].reverse().find(m => m.role === "user");
  if (last?.content) {
    yield { type: "text", content: `Top! Ik neem "${last.content}" mee in m'n selectie.` };
  }

  yield { type: "text", content: "Klaar om te starten? ✨" };
}