import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import StatusBadge from "@/components/ui/StatusBadge";

type CheckResult = {
  supabaseUrl: string | null;
  supabaseKeySet: boolean;
  authSession: "ok" | "none" | "error";
  message?: string;
};

function HealthPage() {
  const [loading, setLoading] = useState(true);
  const [res, setRes] = useState<CheckResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const url = import.meta.env.VITE_SUPABASE_URL ?? null;
        const keySet = Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);
        let authSession: CheckResult["authSession"] = "none";

        const { data, error } = await supabase.auth.getSession();
        if (error) authSession = "error";
        else authSession = data?.session ? "ok" : "none";

        const payload: CheckResult = {
          supabaseUrl: url,
          supabaseKeySet: keySet,
          authSession,
        };

        if (!cancelled) {
          setRes(payload);
          setLoading(false);
          // Analytics hook – vervang desgewenst door je helper w() of track()
          try {
            // @ts-ignore – helper bestaat project-breed
            track?.("health:check", { authSession, keySet, hasUrl: Boolean(url) });
          } catch {}
        }
      } catch (e: any) {
        if (!cancelled) {
          setRes({ supabaseUrl: null, supabaseKeySet: false, authSession: "error", message: e?.message || String(e) });
          setLoading(false);
          try {
            // @ts-ignore
            track?.("health:check:error", { message: e?.message || String(e) });
          } catch {}
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-heading text-2xl text-midnight mb-4">Systeemstatus</h1>

      {loading && (
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-40 rounded-lg bg-surface" />
          <div className="h-4 w-64 rounded-lg bg-surface" />
          <div className="h-4 w-56 rounded-lg bg-surface" />
        </div>
      )}

      {!loading && res && (
        <section aria-label="FitFi Health Check" className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-midnight/70">Supabase URL</span>
            <StatusBadge status={res.supabaseUrl ? "ok" : "error"} label={res.supabaseUrl ? "Gevonden" : "Ontbreekt"} />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-midnight/70">Anon key ingesteld</span>
            <StatusBadge status={res.supabaseKeySet ? "ok" : "error"} label={res.supabaseKeySet ? "Ja" : "Nee"} />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-midnight/70">Auth session</span>
            <StatusBadge
              status={res.authSession === "ok" ? "ok" : res.authSession === "none" ? "warn" : "error"}
              label={res.authSession === "ok" ? "Actief" : res.authSession === "none" ? "Geen" : "Fout"}
            />
          </div>

          {res.message && (
            <p className="text-sm text-red-600" role="alert">
              {res.message}
            </p>
          )}

          <div className="mt-6 rounded-2xl border border-surface p-4">
            <p className="text-sm text-midnight/80">
              Route: <code className="rounded bg-surface px-1 py-0.5">/__health</code>. Zorg dat de router deze pagina lazy laadt via{" "}
              <code className="rounded bg-surface px-1 py-0.5">@/pages/HealthPage</code>.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}

export default HealthPage;