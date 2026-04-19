import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { Upload, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Loader as Loader2, ArrowLeft, Package, RefreshCw, FileJson, Info } from "lucide-react";

interface ImportResult {
  success: boolean;
  program: string;
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors?: string[];
}

interface ImportLog {
  id: string;
  imported_at: string;
  program_name: string;
  product_count: number;
  inserted_count: number;
  updated_count: number;
  skipped_count: number;
  status: string;
  error_message: string | null;
}

export default function AdminDaisyconImportPage() {
  const { isAdmin, isLoading: authLoading } = useIsAdmin();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [feedJson, setFeedJson] = useState("");
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"paste" | "file">("paste");

  async function loadLogs() {
    setLogsLoading(true);
    const client = supabase();
    if (!client) { setLogsLoading(false); return; }
    const { data, error } = await client
      .from("daisycon_imports")
      .select("*")
      .order("imported_at", { ascending: false })
      .limit(10);

    if (!error && data) setLogs(data);
    setLogsLoading(false);
  }

  function isUrl(value: string): boolean {
    const trimmed = value.trim();
    return trimmed.startsWith("http://") || trimmed.startsWith("https://");
  }

  async function fetchFeedFromUrl(url: string): Promise<unknown> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Feed ophalen mislukt: HTTP ${res.status}`);
    const contentType = res.headers.get("content-type") ?? "";
    const text = await res.text();
    if (!text.trim()) throw new Error("Feed is leeg");
    if (contentType.includes("json") || text.trimStart().startsWith("{") || text.trimStart().startsWith("[")) {
      return JSON.parse(text);
    }
    throw new Error("Alleen JSON feeds worden ondersteund bij URL import. Download de feed en plak de inhoud.");
  }

  function normalizeToProducts(parsed: unknown): { products: unknown[]; programName: string } {
    if (Array.isArray(parsed)) {
      return { products: parsed, programName: "Daisycon Feed" };
    }
    const p = parsed as Record<string, unknown>;
    if (p?.datafeed) {
      const df = p.datafeed as Record<string, unknown>;
      const programs = df.programs as Array<Record<string, unknown>>;
      if (programs?.length) {
        const prog = programs[0];
        const info = prog.program_info as Record<string, unknown> | undefined;
        return {
          products: (prog.products as unknown[]) ?? [],
          programName: String(info?.name ?? "Daisycon Feed"),
        };
      }
    }
    if (p?.products && Array.isArray(p.products)) {
      return { products: p.products, programName: String((p as Record<string, unknown>).program_name ?? "Daisycon Feed") };
    }
    if (p?.items && Array.isArray(p.items)) {
      return { products: p.items, programName: "Daisycon Feed" };
    }
    throw new Error("Onbekende feed structuur. Verwacht een array of object met 'products'/'items'.");
  }

  async function sendBatch(
    session: { access_token: string },
    products: unknown[],
    programName: string,
    campaignId?: string,
  ): Promise<ImportResult> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const feed = {
      datafeed: {
        info: { product_count: products.length },
        programs: [{
          program_info: { id: 0, name: programName, currency: "EUR", product_count: products.length },
          products,
        }],
      },
    };

    const res = await fetch(`${supabaseUrl}/functions/v1/import-daisycon-feed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ feed, ...(campaignId ? { campaignId } : {}) }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Import mislukt");
    return json as ImportResult;
  }

  async function handleImport() {
    if (!feedJson.trim()) {
      toast.error("Plak of upload eerst een feed URL of JSON.");
      return;
    }

    const trimmed = feedJson.trim();
    setImporting(true);
    setResult(null);

    try {
      const client = supabase();
      if (!client) throw new Error("Supabase niet beschikbaar");
      const { data: { session } } = await client.auth.getSession();
      if (!session) throw new Error("Geen sessie");

      let parsed: unknown;
      if (isUrl(trimmed)) {
        toast("Feed ophalen...", { icon: "⏳" });
        parsed = await fetchFeedFromUrl(trimmed);
      } else {
        try {
          parsed = JSON.parse(trimmed);
        } catch {
          toast.error("Ongeldige invoer — plak een feed URL (https://...) of geldige JSON.");
          return;
        }
      }

      const { products, programName } = normalizeToProducts(parsed);

      if (products.length === 0) {
        toast.error("Geen producten gevonden in de feed.");
        return;
      }

      const BATCH_SIZE = 200;
      let totalInserted = 0;
      let totalSkipped = 0;
      let lastResult: ImportResult | null = null;

      toast(`${products.length} producten gevonden, importeren in batches...`, { icon: "📦" });

      for (let i = 0; i < products.length; i += BATCH_SIZE) {
        const batch = products.slice(i, i + BATCH_SIZE);
        const batchResult = await sendBatch(session, batch, programName);
        totalInserted += batchResult.inserted ?? 0;
        totalSkipped += batchResult.skipped ?? 0;
        lastResult = batchResult;
      }

      const finalResult: ImportResult = {
        success: true,
        program: programName,
        total: products.length,
        inserted: totalInserted,
        updated: 0,
        skipped: totalSkipped,
        errors: lastResult?.errors,
      };

      setResult(finalResult);
      toast.success(`${totalInserted} producten geïmporteerd uit ${programName}`);
      loadLogs();
    } catch (err) {
      toast.error(String(err));
    } finally {
      setImporting(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setFeedJson(text);
      toast.success("Bestand geladen");
    };
    reader.readAsText(file);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#A8513A]" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Geen toegang</h1>
          <p className="mt-2 text-[#8A8A8A]">Admin rechten vereist.</p>
          <button
            onClick={() => navigate("/admin")}
            className="mt-6 px-6 py-2 bg-[#A8513A] text-white rounded-xl hover:bg-[#C2654A] transition-colors"
          >
            Terug naar Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin")}
          className="inline-flex items-center gap-2 text-sm text-[#8A8A8A] hover:text-[#1A1A1A] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin Dashboard
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5F2] flex items-center justify-center">
            <Package className="w-5 h-5 text-[#A8513A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Daisycon Feed Import</h1>
            <p className="text-sm text-[#8A8A8A]">Producten inladen vanuit een Daisycon JSON feed</p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-xl bg-[#FAF5F2] border border-[#FAF5F2] p-4 flex gap-3 mb-6">
        <Info className="w-4 h-4 text-[#A8513A] flex-shrink-0 mt-0.5" />
        <div className="text-sm text-[#1A1A1A]">
          <strong>Hoe het werkt:</strong> Plak een Daisycon feed <strong>URL</strong> of de volledige <strong>JSON</strong> inhoud. Bij een URL wordt de feed eerst in de browser opgehaald, daarna automatisch in batches van 200 producten geïmporteerd. Categorieën, kleuren en stijl worden automatisch afgeleid. Producten worden op basis van <code className="bg-white px-1 rounded text-xs">external_id</code> geüpsert (geen duplicaten).
        </div>
      </div>

      {/* Input card */}
      <div className="rounded-2xl bg-white border border-[#E5E5E5] overflow-hidden mb-6" style={{ boxShadow: "0 2px 12px rgba(30,35,51,0.06)" }}>
        <div className="border-b border-[#E5E5E5] p-4 flex gap-2">
          <button
            onClick={() => setActiveTab("paste")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === "paste" ? "bg-[#A8513A] text-white" : "text-[#8A8A8A] hover:bg-[#FAF5F2]"}`}
          >
            JSON plakken
          </button>
          <button
            onClick={() => setActiveTab("file")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === "file" ? "bg-[#A8513A] text-white" : "text-[#8A8A8A] hover:bg-[#FAF5F2]"}`}
          >
            Bestand uploaden
          </button>
        </div>

        <div className="p-6">
          {activeTab === "paste" ? (
            <div>
              <label htmlFor="feed-json" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Plak feed URL of JSON
              </label>
              <textarea
                id="feed-json"
                value={feedJson}
                onChange={(e) => setFeedJson(e.target.value)}
                rows={10}
                placeholder={"https://daisycon.io/datafeed/?media_id=...&type=JSON\n\nOf plak hier de volledige JSON feed inhoud."}
                className="w-full rounded-xl border border-[#E5E5E5] bg-[#FAFAF8] text-sm font-mono text-[#1A1A1A] placeholder:text-[#8A8A8A] p-3 focus:outline-none focus:ring-2 focus:ring-[#D4856E] resize-y"
              />
              {feedJson && (
                <p className="text-xs text-[#8A8A8A] mt-1">
                  {feedJson.length.toLocaleString()} tekens geladen
                </p>
              )}
            </div>
          ) : (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="sr-only"
                id="feed-file"
              />
              <label
                htmlFor="feed-file"
                className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#E5E5E5] rounded-xl p-10 cursor-pointer hover:border-[#D4856E] hover:bg-[#FAF5F2] transition-colors"
              >
                <FileJson className="w-8 h-8 text-[#8A8A8A]" />
                <div className="text-center">
                  <p className="text-sm font-medium text-[#1A1A1A]">Klik om een JSON-bestand te kiezen</p>
                  <p className="text-xs text-[#8A8A8A] mt-1">Alleen .json bestanden</p>
                </div>
              </label>
              {feedJson && (
                <p className="text-xs text-[#8A8A8A] mt-2 text-center">
                  Bestand geladen — {feedJson.length.toLocaleString()} tekens
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={importing || !feedJson.trim()}
            className="mt-5 w-full flex items-center justify-center gap-2 bg-[#A8513A] text-white font-semibold py-3 rounded-xl hover:bg-[#C2654A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importeren…
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Feed importeren
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-2xl border p-6 mb-6 ${result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center gap-2 mb-4">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <h2 className="font-semibold text-[#1A1A1A]">
              {result.success ? "Import voltooid" : "Import met fouten"} — {result.program}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Totaal in feed", value: result.total },
              { label: "Ingevoegd / bijgewerkt", value: result.inserted },
              { label: "Bijgewerkt", value: result.updated },
              { label: "Overgeslagen", value: result.skipped },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white border border-[#E5E5E5] p-3 text-center">
                <p className="text-2xl font-bold text-[#1A1A1A]">{s.value}</p>
                <p className="text-xs text-[#8A8A8A] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          {result.errors && result.errors.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-red-700 mb-1">Fouten:</p>
              <ul className="text-xs text-red-600 space-y-1">
                {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Import log */}
      <div className="rounded-2xl bg-white border border-[#E5E5E5] overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(30,35,51,0.06)" }}>
        <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
          <h2 className="font-semibold text-[#1A1A1A] text-sm">Importgeschiedenis</h2>
          <button
            onClick={loadLogs}
            className="inline-flex items-center gap-1.5 text-xs text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? "animate-spin" : ""}`} />
            Verversen
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#8A8A8A]">
            Nog geen imports uitgevoerd.{" "}
            <button onClick={loadLogs} className="underline underline-offset-2 hover:text-[#1A1A1A]">
              Laden
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#FAF5F2]">
                  {["Datum", "Programma", "Producten", "Ingevoegd", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#8A8A8A]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log.id} className={`border-b border-[#E5E5E5] ${i % 2 === 0 ? "" : "bg-[#FAF5F2]"}`}>
                    <td className="px-4 py-3 text-[#8A8A8A] text-xs whitespace-nowrap">
                      {new Date(log.imported_at).toLocaleString("nl-NL")}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1A1A1A]">{log.program_name}</td>
                    <td className="px-4 py-3 text-[#8A8A8A]">{log.product_count}</td>
                    <td className="px-4 py-3 text-[#8A8A8A]">{log.inserted_count}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        log.status === "success" ? "bg-green-100 text-green-700" :
                        log.status === "error" ? "bg-red-100 text-red-700" :
                        log.status === "running" ? "bg-blue-100 text-blue-700" :
                        "bg-[#E5E5E5] text-[#8A8A8A]"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
