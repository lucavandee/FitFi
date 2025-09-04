/**
 * DevConsoleMount – veilige DEV-only mount van ConsoleInspector zónder React.lazy.
 * 
 * In productie rendert dit component null en doet niets.
 */
import { useEffect, useState } from "react";

let Loaded: React.ComponentType | null = null;

function DevConsoleMount() {
  const [ready, setReady] = useState(false);

  // In productie: render niets
  if (!import.meta.env.DEV) return null;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (!Loaded) {
          const mod = await import("@/components/dev/ConsoleInspector");
          Loaded = (mod as any).default ?? null;
        }
        if (!cancelled) setReady(true);
      } catch (e) {
        // Laat ErrorBoundary niet trippen: log alleen in DEV
        console.error("[DevConsoleMount] kon ConsoleInspector niet laden:", e);
        if (!cancelled) setReady(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready || !Loaded) return null;
  const Comp = Loaded;
  return <Comp />;
}

export default DevConsoleMount;