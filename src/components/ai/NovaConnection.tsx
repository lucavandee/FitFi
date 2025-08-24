import React, { createContext, useContext, useState } from "react";

type Status = "idle" | "connecting" | "streaming" | "done" | "error";

type Conn = {
  status: Status;
  model?: string;
  traceId?: string;
  ttfbMs?: number;
  setStatus: (s: Status) => void;
  setMeta: (m: Partial<Omit<Conn, "setStatus" | "setMeta">>) => void;
};

const Ctx = createContext<Conn | null>(null);

export function NovaConnectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<Conn>({
    status: "idle",
    setStatus: (s) => setState((prev) => ({ ...prev, status: s })),
    setMeta: (m) => setState((prev) => ({ ...prev, ...m })),
  });
  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export function useNovaConn() {
  const v = useContext(Ctx);
  if (!v)
    throw new Error("useNovaConn must be used within NovaConnectionProvider");
  return v;
}
