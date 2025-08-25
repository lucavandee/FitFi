// frontend/src/services/ai/agent.ts
export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };
export type ChatInput = { messages?: ChatMessage[] };

type ChatResult = { messages: ChatMessage[] };

export const agent = {
  id: "nova-stub",
  name: "Nova",
  async send(input: ChatInput = {}): Promise<ChatResult> {
    const last = (input.messages ?? []).slice(-1)[0];
    const echo = last?.content?.trim();
    const reply =
      echo && echo.length > 0
        ? `Nova (stub): ik ontving — "${echo}"`
        : "Nova (stub): hallo! Stel me een vraag over stijl of outfits.";
    return { messages: [{ role: "assistant", content: reply }] };
  },
};

export default agent;