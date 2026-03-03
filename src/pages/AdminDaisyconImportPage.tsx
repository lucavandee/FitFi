import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Package,
  RefreshCw,
  FileJson,
  Info,
} from "lucide-react";

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

  async function handleImport() {
    if (!feedJson.trim()) {
      toast.error("Plak of upload eerst een feed URL of JSON.");
      return;
    }

    const trimmed = feedJson.trim();
    let body: Record<string, unknown>;

    if (isUrl(trimmed)) {
      body = { feedUrl: trimmed };
    } else {
      try {
        const parsed = JSON.parse(trimmed);
        body = { feed: parsed };
      } catch {
        toast.error("Ongeldige invoer — plak een feed URL (https://...) of geldige JSON.");
        return;
      }
    }

    setImporting(true);
    setResult(null);

    try {
      const client = supabase();
      if (!client) throw new Error("Supabase niet beschikbaar");
      const { data: { session } } = await client.auth.getSession();
      if (!session) throw new Error("Geen sessie");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/import-daisycon-feed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? "Import mislukt");

      setResult(json);
      toast.success(`${json.inserted} producten geïmporteerd uit ${json.program}`);
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
        <Loader2 className="w-8 h-8 animate-spin text-[var(--ff-color-primary-700)]" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Geen toegang</h1>
          <p className="mt-2 text-[var(--color-muted)]">Admin rechten vereist.</p>
          <button
            onClick={() => navigate("/admin")}
            className="mt-6 px-6 py-2 bg-[var(--ff-color-primary-700)] text-white rounded-xl hover:bg-[var(--ff-color-primary-600)] transition-colors"
          >
            Terug naar Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ff-container py-10 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin")}
          className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin Dashboard
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--ff-color-primary-100)] flex items-center justify-center">
            <Package className="w-5 h-5 text-[var(--ff-color-primary-700)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Daisycon Feed Import</h1>
            <p className="text-sm text-[var(--color-muted)]">Producten inladen vanuit een Daisycon JSON feed</p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-xl bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-100)] p-4 flex gap-3 mb-6">
        <Info className="w-4 h-4 text-[var(--ff-color-primary-700)] flex-shrink-0 mt-0.5" />
        <div className="text-sm text-[var(--color-text)]">
          <strong>Hoe het werkt:</strong> Plak een Daisycon feed <strong>URL</strong> (de feed wordt automatisch opgehaald) of plak de volledige <strong>JSON</strong> inhoud direct. Zowel JSON als XML feeds worden ondersteund. Categorieën, kleuren en stijl worden automatisch afgeleid uit de producttitels. Producten worden op basis van <code className="bg-white px-1 rounded text-xs">daisycon_unique_id</code> geüpsert.
        </div>
      </div>

      {/* Input card */}
      <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden mb-6" style={{ boxShadow: "0 2px 12px rgba(30,35,51,0.06)" }}>
        <div className="border-b border-[var(--color-border)] p-4 flex gap-2">
          <button
            onClick={() => setActiveTab("paste")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "paste" ? "bg-[var(--ff-color-primary-700)] text-white" : "text-[var(--color-muted)] hover:bg-[var(--ff-color-primary-50)]"}`}
          >
            JSON plakken
          </button>
          <button
            onClick={() => setActiveTab("file")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "file" ? "bg-[var(--ff-color-primary-700)] text-white" : "text-[var(--color-muted)] hover:bg-[var(--ff-color-primary-50)]"}`}
          >
            Bestand uploaden
          </button>
        </div>

        <div className="p-6">
          {activeTab === "paste" ? (
            <div>
              <label htmlFor="feed-json" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Plak feed URL of JSON
              </label>
              <textarea
                id="feed-json"
                value={feedJson}
                onChange={(e) => setFeedJson(e.target.value)}
                rows={10}
                placeholder={"https://daisycon.io/datafeed/?media_id=...&type=JSON\n\nOf plak hier de volledige JSON feed inhoud."}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm font-mono text-[var(--color-text)] placeholder:text-[var(--color-muted)] p-3 focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-400)] resize-y"
              />
              {feedJson && (
                <p className="text-xs text-[var(--color-muted)] mt-1">
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
                className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[var(--color-border)] rounded-xl p-10 cursor-pointer hover:border-[var(--ff-color-primary-400)] hover:bg-[var(--ff-color-primary-25)] transition-colors"
              >
                <FileJson className="w-8 h-8 text-[var(--color-muted)]" />
                <div className="text-center">
                  <p className="text-sm font-medium text-[var(--color-text)]">Klik om een JSON-bestand te kiezen</p>
                  <p className="text-xs text-[var(--color-muted)] mt-1">Alleen .json bestanden</p>
                </div>
              </label>
              {feedJson && (
                <p className="text-xs text-[var(--color-muted)] mt-2 text-center">
                  Bestand geladen — {feedJson.length.toLocaleString()} tekens
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={importing || !feedJson.trim()}
            className="mt-5 w-full flex items-center justify-center gap-2 bg-[var(--ff-color-primary-700)] text-white font-semibold py-3 rounded-xl hover:bg-[var(--ff-color-primary-600)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            <h2 className="font-semibold text-[var(--color-text)]">
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
              <div key={s.label} className="rounded-xl bg-white border border-[var(--color-border)] p-3 text-center">
                <p className="text-2xl font-bold text-[var(--color-text)]">{s.value}</p>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">{s.label}</p>
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
      <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(30,35,51,0.06)" }}>
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="font-semibold text-[var(--color-text)] text-sm">Importgeschiedenis</h2>
          <button
            onClick={loadLogs}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? "animate-spin" : ""}`} />
            Verversen
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--color-muted)]">
            Nog geen imports uitgevoerd.{" "}
            <button onClick={loadLogs} className="underline underline-offset-2 hover:text-[var(--color-text)]">
              Laden
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--ff-color-primary-25)]">
                  {["Datum", "Programma", "Producten", "Ingevoegd", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log.id} className={`border-b border-[var(--color-border)] ${i % 2 === 0 ? "" : "bg-[var(--ff-color-primary-25)]"}`}>
                    <td className="px-4 py-3 text-[var(--color-muted)] text-xs whitespace-nowrap">
                      {new Date(log.imported_at).toLocaleString("nl-NL")}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--color-text)]">{log.program_name}</td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">{log.product_count}</td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">{log.inserted_count}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        log.status === "success" ? "bg-green-100 text-green-700" :
                        log.status === "error" ? "bg-red-100 text-red-700" :
                        log.status === "running" ? "bg-blue-100 text-blue-700" :
                        "bg-[var(--color-border)] text-[var(--color-muted)]"
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
