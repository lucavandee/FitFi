// frontend/src/services/ai/agent.ts
export type NovaAgent = {
  send: (input: string, opts?: Record<string, any>) => AsyncGenerator<string, void, unknown>;
};

const agent: NovaAgent = {
  async *send(input: string) {
    yield `Nova stub actief — echo: ${input}`;
  },
};

export default agent;
export const agentExport = agent; // eventueel named variant