import { ReactNode } from "react";

/**
 * CrashGate is een eenvoudige wrapper die kan worden uitgebreid
 * met runtime guards, logging of fallback UI.
 */
export default function CrashGate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}