export async function loadNovaAgent() {
  try {
    const mod = await import("../ai/nova/agent");
    return (mod as any).default ?? (mod as any).agent ?? mod;
  } catch {
    // final stub
    return {
      async sendMessage(input: string) {
        return { role: "assistant", content: `Nova (stub): ${input}` };
      },
    };
  }
}