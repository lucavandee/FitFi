/**
 * DevOnly – rendert children alleen in development, anders null.
 * 
 * Gebruik: <DevOnly><DebugPanel/></DevOnly>
 */
import { ReactNode } from "react";

type Props = { children: ReactNode };

export default function DevOnly({ children }: Props) {
  if (!import.meta.env.DEV) return null;
  return <>{children}</>;
}