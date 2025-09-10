import React, { useEffect, useRef, useState } from "react";
import ResultSkeleton from "@/components/system/ResultSkeleton";
import ErrorFallback from "@/components/system/ErrorFallback";
import { openNovaStream, NovaEvent } from "@/services/nova/novaClient";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import Button from "@/components/ui/Button";
import { track } from "@/utils/telemetry";

type PatchState = { explanation?: string };

const USE_DEV_MOCK = import.meta.env.DEV && (import.meta.env.VITE_DEV_MOCK_NOVA ?? "1") === "1";

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
      setTimeout(() => {
        setPatch({ explanation: "We kozen voor een cleane, smart-casual look: nette jeans, crispy witte sneaker en een licht overshirt. Dit matcht met jouw voorkeur voor minimalistisch en comfortabel." });
        setLoading(false);
        track("nova:done");
      }, 300);
      return;
    }

    openNovaStream(
      "/.netlify/functions/nova",
      { prompt: "leg outfit uit", context: { gender: "female" } },
      {
        onStart: () => {},
        onPatch: (e: NovaEvent) => {
          if (e.type === "FITFI_JSON" && (e as any)?.data?.explanation) {
            setPatch(s => ({ ...s, explanation: (e as any).data.explanation }));
            track("nova:patch");
          }
        },
        onDone: () => { setLoading(false); track("nova:done"); },
        onError: (e: any) => {
          setLoading(false);
          const msg = e?.error?.message || e?.message || "Stream-fout";
          setErr(String(msg));
          track("nova:error", { message: String(msg) });
        },
        onHeartbeat: () => {}
      },
      { signal: abortRef.current.signal }
    );
  };

  useEffect(() => { start(); return () => abortRef.current?.abort(); }, []);

  if (loading) return <ResultSkeleton />;
  if (err) return <ErrorFallback onRetry={start} />;

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <Card className="p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl text-[#0D1B2A]">Onze aanbeveling</h2>
          <Chip tone="accent">Explainability</Chip>
        </div>
        <p className="text-gray-600 mt-3">{patch.explanation}</p>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => track("cta:primary", { where: "results" })}>Shop deze look</Button>
          <Button variant="secondary" onClick={() => track("cta:secondary", { where: "results" })}>Nieuwe analyse</Button>
        </div>
      </Card>
    </div>
  );
}

export default EnhancedResultsPage;