import React, { useEffect, useState } from "react";

type Row = { label: string; value: string; ok: boolean };

export default function HealthPage() {
  const [rows, setRows] = useState<Row[]>([
    { label: "Build tag", value: "-", ok: false },
    { label: "Nova mount aanwezig", value: "-", ok: false },
    { label: "SSE endpoint", value: "-", ok: false },
  ]);

  useEffect(() => {
    const buildTag = import.meta.env.VITE_BUILD_TAG ?? "dev";
    const hasMount = !!document.body?.getAttribute("data-nova-mount");

    const update = (idx: number, value: string, ok: boolean) =>
      setRows((r) => r.map((x, i) => (i === idx ? { ...x, value, ok } : x)));

    update(0, buildTag, buildTag !== "dev");

    update(1, hasMount ? "gevonden" : "niet gevonden", hasMount);

    // SSE ping
    fetch("/.netlify/functions/nova", { method: "GET" })
      .then((res) => {
        const ok = res.ok && res.headers.get("content-type")?.includes("text/event-stream");
        update(2, ok ? "200 / event-stream" : `${res.status} / ${res.headers.get("content-type")}`, !!ok);
      })
      .catch((e) => update(2, `fout: ${e?.message ?? "onbekend"}`, false));
  }, []);

  return (
    <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <h1 className="text-2xl font-semibold mb-4">FitFi • Health</h1>
      <div className="max-w-xl divide-y divide-gray-800 border border-gray-800 rounded-lg">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between px-4 py-3">
            <div>{r.label}</div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">{r.value}</span>
              <span
                aria-label={r.ok ? "ok" : "fout"}
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: r.ok ? "#00D2B8" : "#F97316" }}
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}