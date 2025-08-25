/**
 * Minimal Nova agent stub voor development.
 * Exporteert zowel default als named `agent` zodat verschillende loaders werken.
 */

export type ChatInput =
  | string
  | {
      input?: string;
      messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
    };

function lastUserMessage(input: ChatInput): string {
  if (typeof input === "string") return input;
  if (input?.input) return input.input;
  const arr = input?.messages ?? [];
  const last = arr[arr.length - 1];
  return last?.content ?? "";
}

const agent = {
  id: "nova-stub",
  name: "Nova (stub)",
  /**
   * Eenvoudig antwoord; genoeg om UI te ontkoppelen van backend.
   */
  async respond(input: ChatInput) {
    const text = lastUserMessage(input);
    const reply = `Nova (stub) — backend niet verbonden. Ontvangen: ${text.slice(0, 140)}`;
    return { text: reply };
  },
};

export default agent;
export { agent };