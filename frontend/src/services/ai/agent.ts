const agent = {
  id: "nova-stub",
  async respond(_input?: any) {
    return { type: "message", role: "assistant", content: "Nova stub active." };
  }
};

export default agent;
export { agent };