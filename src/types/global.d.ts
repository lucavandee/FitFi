// Extra losse types die in de app opduiken.
type Tier = "visitor" | "member" | "plus" | "founder";

interface NovaEvent {
  type: string;
  payload?: unknown;
}