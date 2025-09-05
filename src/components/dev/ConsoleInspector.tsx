/**
 * Safe DEV-only ConsoleInspector.
 * 
 * In productie: render niets (null).
 * In DEV: laat een kleine toggle zien met recente console.logs (non-invasive).
 */
import { useEffect, useRef, useState } from "react";

function ConsoleInspector() {
  if (!import.meta.env.DEV) return null;

  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const originalLog = useRef<(...args: any[]) => void>();

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    originalLog.current = console.log;
    console.log = (...args: any[]) => {
      try {
        setLines((prev) => [...prev.slice(-49), args.map(String).join(" ")]);
      } catch {
        // ignore
      }
      // forward to original
      originalLog.current?.(...args);
    };
    return () => {
      if (originalLog.current) console.log = originalLog.current;
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        type="button"
        aria-label={open ? "Sluit console-inspector" : "Open console-inspector"}
        onClick={() => setOpen((v) => !v)}
        className="rounded-2xl border border-surface bg-white px-3 py-1 text-sm shadow"
      >
        {open ? "Console — sluiten" : "Console — openen"}
      </button>
      {open && (
        <div className="mt-2 h-56 w-[28rem] overflow-auto rounded-2xl border border-surface bg-white p-3 text-xs shadow">
          {lines.length === 0 ? (
            <p className="text-midnight/60">Nog geen console output…</p>
          ) : (
            <ul className="space-y-1">
              {lines.map((l, i) => (
                <li key={i} className="font-mono text-[11px] leading-snug text-midnight/90">
                  {l}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default ConsoleInspector;