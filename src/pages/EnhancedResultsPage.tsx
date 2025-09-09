import React, { useEffect, useRef, useState } from "react";
import ResultSkeleton from "@/components/system/ResultSkeleton";
import ErrorFallback from "@/components/system/ErrorFallback";
import { openNovaStream, NovaEvent } from "@/services/nova/novaClient";
import { mockNovaStream } from "@/services/nova/novaMock";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import Button from "@/components/ui/Button";
import { track } from "@/utils/telemetry";

const USE_DEV_MOCK = import.meta.env.DEV && (import.meta.env.VITE_DEV_MOCK_NOVA ?? "1") === "1";

type PatchState = { explanation?: string };

function EnhancedResultsPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [patch, setPatch] = useState<PatchState>({});
  const abortRef = useRef<AbortController | null>(null);

  const start = async () => {
    setLoading(true); setErr(null); setPatch({});
    abortRef.current?.abort(); abortRef.current = new AbortController();
    track("nova:open");

    if (USE_DEV_MOCK) {
      try {
        for await (const e of mockNovaStream()) {
          if (e.type === "FITFI_JSON" && e.phase === "patch" && e.data?.explanation) {
            setPatch(s => ({ ...s, explanation: e.data.explanation })); track("nova:patch");
          }
        }
        setLoading(false); track("nova:done");
      } catch (e: any) {
        setLoading(false); setErr(String(e?.message || e)); track("nova:error", { message: String(e?.message || e) });
      }
      return;
    }

    openNovaStream("/.netlify/functions/nova", { prompt: "leg outfit uit", context: { gender: "female" } }, {
      onStart: () => {},
      onPatch: (e: NovaEvent) => {
        if (e.type === "FITFI_JSON" && e.data?.stage === "explainability") {
          setPatch(s => ({ ...s, explanation: e.data.explanation })); track("nova:patch");
        }
      },
      onDone: () => { setLoading(false); track("nova:done"); },
      onError: (e) => { setLoading(false); setErr(e?.error?.message || "Stream-fout"); track("nova:error", { message: e?.error?.message }); },
      onHeartbeat: () => {}
    }, { signal: abortRef.current.signal });
  };

  useEffect(() => { start(); return () => abortRef.current?.abort(); }, []);

  if (loading) return <ResultSkeleton />;
  if (err) return <ErrorFallback onRetry={start} />;

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl text-text">Onze aanbeveling</h2>
          <Chip tone="accent">Explainability</Chip>
        </div>
        <p className="text-muted mt-2">{patch.explanation}</p>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => track("cta:primary", { where: "results" })}>Shop deze look</Button>
          <Button variant="secondary" onClick={() => track("cta:secondary", { where: "results" })}>Nieuwe analyse</Button>
        </div>
      </Card>
    </div>
  );
}

export default EnhancedResultsPage;