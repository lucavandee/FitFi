// Nova router – placeholder die compileert; echte SSE later terugplaatsen.
export interface NovaMessage { role: "system" | "user" | "assistant"; content: string; }
export async function askNova(messages: NovaMessage[]): Promise<string> {
  const last = messages[messages.length - 1]?.content || "";
  return `Nova stub response: ${last.slice(0, 140)}…`;
}
export default { askNova };