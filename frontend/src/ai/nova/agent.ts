export default {
  async sendMessage(input: string) {
    return { role: "assistant", content: `Nova (stub): ${input}` };
  },
};