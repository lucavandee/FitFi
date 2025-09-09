import React, { useEffect, useRef, useState } from "react";
import Seo from "@/components/Seo";
import ResultSkeleton from "@/components/system/ResultSkeleton";
import ErrorFallback from "@/components/system/ErrorFallback";
import { openNovaStream, NovaEvent } from "@/services/nova/novaClient";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import Button from "@/components/ui/Button";
import { track } from "@/utils/telemetry";

type PatchState = {
  explanation?: string;
};

function EnhancedResultsPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [patch, setPatch] = useState<PatchState>({});
  const abortRef = useRef<AbortController | null>(null);

  const start = () => {
    setLoading(true);
    setErr(null);
    setPatch({});
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    track("nova:open");

    openNovaStream("/.netlify/functions/nova", { prompt: "leg outfit uit", context: { gender: "female" } }, {
      onStart: () => {},
      onPatch: (e: NovaEvent) => {
        if (e.type === "FITFI_JSON" && e.data?.stage === "explainability") {
          setPatch((s) => ({ ...s, explanation: e.data.explanation }));
          track("nova:patch");
        }
      },
      onDone: () => {
        setLoading(false);
        track("nova:done");
      },
      onError: (e) => {
        setLoading(false);
        setErr(e?.error?.message || "Onbekende fout");
        track("nova:error", { message: e?.error?.message });
      },
      onHeartbeat: () => {}
    }, { signal: abortRef.current.signal });
  };

  useEffect(() => {
    start();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <ResultSkeleton />;
  if (err) return <ErrorFallback onRetry={start} />;

  return (
    <div className="space-y-4">
      <Seo 
        title="Jouw Stijlanalyse - FitFi"
        description="Ontdek je perfecte outfit met AI-gestuurde stijladvies. Persoonlijke aanbevelingen op basis van jouw unieke profiel."
      />
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