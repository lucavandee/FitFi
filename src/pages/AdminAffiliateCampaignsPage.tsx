import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, RefreshCw, Loader as Loader2, Play, Pencil, Trash2, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Link, Package, X } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  provider: string;
  program_id: string | null;
  feed_url: string;
  is_active: boolean;
  last_synced_at: string | null;
  product_count: number;
  notes: string | null;
  created_at: string;
}

interface SyncResult {
  campaignId: string;
  success: boolean;
  program: string;
  total: number;
  inserted: number;
  skipped: number;
  error?: string;
}

const EMPTY_FORM = {
  name: "",
  provider: "daisycon",
  program_id: "",
  feed_url: "",
  is_active: true,
  notes: "",
};

export default function AdminAffiliateCampaignsPage() {
  const { isAdmin, isLoading: authLoading } = useIsAdmin();
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<Record<string, SyncResult>>({});
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) loadCampaigns();
  }, [isAdmin]);

  async function loadCampaigns() {
    setLoading(true);
    const client = supabase();
    if (!client) { setLoading(false); return; }
    const { data, error } = await client
      .from("affiliate_campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setCampaigns(data);
    setLoading(false);
  }

  async function handleSync(campaign: Campaign) {
    const client = supabase();
    if (!client) return;

    setSyncingId(campaign.id);

    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session) throw new Error("Geen sessie");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/import-daisycon-feed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ feedUrl: campaign.feed_url, campaignId: campaign.id }),
      });

      let json: Record<string, unknown> = {};
      try { json = await res.json(); } catch { /* leeg antwoord */ }

      if (!res.ok) {
        const msg = (json.error as string) ?? `HTTP ${res.status} — Sync mislukt`;
        throw new Error(msg);
      }

      setSyncResults(prev => ({
        ...prev,
        [campaign.id]: { campaignId: campaign.id, success: true, ...json },
      }));
      toast.success(`${json.inserted} producten gesynchroniseerd voor ${campaign.name}`);
      loadCampaigns();
    } catch (err) {
      setSyncResults(prev => ({
        ...prev,
        [campaign.id]: { campaignId: campaign.id, success: false, program: campaign.name, total: 0, inserted: 0, skipped: 0, error: String(err) },
      }));
      toast.error(String(err));
    } finally {
      setSyncingId(null);
    }
  }

  async function handleSyncAll() {
    const active = campaigns.filter(c => c.is_active);
    for (const campaign of active) {
      await handleSync(campaign);
    }
  }

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(campaign: Campaign) {
    setForm({
      name: campaign.name,
      provider: campaign.provider,
      program_id: campaign.program_id ?? "",
      feed_url: campaign.feed_url,
      is_active: campaign.is_active,
      notes: campaign.notes ?? "",
    });
    setEditingId(campaign.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.feed_url.trim()) {
      toast.error("Naam en feed URL zijn verplicht");
      return;
    }

    setSaving(true);
    const client = supabase();
    if (!client) { setSaving(false); return; }

    const payload = {
      name: form.name.trim(),
      provider: form.provider,
      program_id: form.program_id.trim() || null,
      feed_url: form.feed_url.trim(),
      is_active: form.is_active,
      notes: form.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    let error: unknown;
    if (editingId) {
      ({ error } = await client.from("affiliate_campaigns").update(payload).eq("id", editingId));
    } else {
      ({ error } = await client.from("affiliate_campaigns").insert(payload));
    }

    if (error) {
      toast.error("Opslaan mislukt");
    } else {
      toast.success(editingId ? "Campagne bijgewerkt" : "Campagne toegevoegd");
      setShowForm(false);
      loadCampaigns();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Campagne verwijderen? Producten blijven bewaard.")) return;
    setDeletingId(id);
    const client = supabase();
    if (!client) { setDeletingId(null); return; }
    const { error } = await client.from("affiliate_campaigns").delete().eq("id", id);
    if (error) {
      toast.error("Verwijderen mislukt");
    } else {
      toast.success("Campagne verwijderd");
      setCampaigns(prev => prev.filter(c => c.id !== id));
    }
    setDeletingId(null);
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

  const activeCampaigns = campaigns.filter(c => c.is_active);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin")}
          className="inline-flex items-center gap-2 text-sm text-[#8A8A8A] hover:text-[#1A1A1A] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin Dashboard
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF5F2] flex items-center justify-center flex-shrink-0">
              <Link className="w-5 h-5 text-[#A8513A]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Affiliate Campagnes</h1>
              <p className="text-sm text-[#8A8A8A]">Feed URLs beheren en producten synchroniseren per campagne</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {activeCampaigns.length > 1 && (
              <button
                onClick={handleSyncAll}
                disabled={syncingId !== null}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E5E5E5] text-sm font-medium text-[#1A1A1A] hover:bg-[#FAF5F2] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncingId ? "animate-spin" : ""}`} />
                Alles synchroniseren ({activeCampaigns.length})
              </button>
            )}
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A8513A] text-white text-sm font-semibold hover:bg-[#C2654A] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Campagne toevoegen
            </button>
          </div>
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E5E5E5] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5]">
              <h2 className="font-bold text-[#1A1A1A]">
                {editingId ? "Campagne bewerken" : "Nieuwe campagne"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FAF5F2] text-[#8A8A8A] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                  Naam <span className="text-[#C24A4A]">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="bijv. H&M NL Dames"
                  className="w-full rounded-xl border border-[#E5E5E5] bg-[#FAFAF8] text-sm text-[#1A1A1A] placeholder:text-[#8A8A8A] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4856E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Netwerk</label>
                  <select
                    value={form.provider}
                    onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}
                    className="w-full rounded-xl border border-[#E5E5E5] bg-[#FAFAF8] text-sm text-[#1A1A1A] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4856E]"
                  >
                    <option value="daisycon">Daisycon</option>
                    <option value="awin">Awin</option>
                    <option value="other">Overig</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Program ID</label>
                  <input
                    type="text"
                    value={form.program_id}
                    onChange={e => setForm(f => ({ ...f, program_id: e.target.value }))}
                    placeholder="bijv. 17004"
                    className="w-full rounded-xl border border-[#E5E5E5] bg-[#FAFAF8] text-sm text-[#1A1A1A] placeholder:text-[#8A8A8A] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4856E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                  Feed URL <span className="text-[#C24A4A]">*</span>
                </label>
                <input
                  type="url"
                  value={form.feed_url}
                  onChange={e => setForm(f => ({ ...f, feed_url: e.target.value }))}
                  placeholder="https://daisycon.io/datafeed/?media_id=..."
                  className="w-full rounded-xl border border-[#E5E5E5] bg-[#FAFAF8] text-sm text-[#1A1A1A] placeholder:text-[#8A8A8A] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4856E] font-mono"
                />
                <p className="text-xs text-[#8A8A8A] mt-1">
                  De volledige feed URL inclusief je media_id en alle parameters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Notities</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="Optioneel: bijv. 'alleen dames, 3000 producten'"
                  className="w-full rounded-xl border border-[#E5E5E5] bg-[#FAFAF8] text-sm text-[#1A1A1A] placeholder:text-[#8A8A8A] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4856E] resize-none"
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#A8513A]"
                />
                <span className="text-sm text-[#1A1A1A]">Actief (wordt meegenomen bij "Alles synchroniseren")</span>
              </label>
            </div>

            <div className="px-6 pb-6 flex gap-2 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl border border-[#E5E5E5] text-sm font-medium text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#FAF5F2] transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#A8513A] text-white text-sm font-semibold hover:bg-[#C2654A] transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editingId ? "Bijwerken" : "Toevoegen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-[#A8513A]" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#E5E5E5] p-12 text-center" style={{ boxShadow: "0 2px 12px rgba(30,35,51,0.06)" }}>
          <div className="w-12 h-12 rounded-2xl bg-[#FAF5F2] flex items-center justify-center mx-auto mb-4">
            <Link className="w-6 h-6 text-[#A8513A]" />
          </div>
          <h3 className="font-bold text-[#1A1A1A] mb-2">Geen campagnes</h3>
          <p className="text-sm text-[#8A8A8A] mb-6 max-w-sm mx-auto">
            Voeg je eerste affiliate campagne toe met de feed URL vanuit Daisycon of een ander netwerk.
          </p>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A8513A] text-white text-sm font-semibold hover:bg-[#C2654A] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Eerste campagne toevoegen
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(campaign => {
            const result = syncResults[campaign.id];
            const isSyncing = syncingId === campaign.id;

            return (
              <div
                key={campaign.id}
                className="rounded-2xl bg-white border border-[#E5E5E5] overflow-hidden"
                style={{ boxShadow: "0 2px 12px rgba(30,35,51,0.06)" }}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Status indicator */}
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${campaign.is_active ? "bg-[#3D8B5E]" : "bg-[#E5E5E5]"}`} />

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-[#1A1A1A]">{campaign.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAF5F2] text-[#A8513A] font-medium capitalize">
                          {campaign.provider}
                        </span>
                        {!campaign.is_active && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#E5E5E5] text-[#8A8A8A]">
                            Inactief
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#8A8A8A] mt-1 truncate font-mono">
                        {campaign.feed_url}
                      </p>

                      <div className="flex items-center gap-4 mt-2 text-xs text-[#8A8A8A]">
                        {campaign.product_count > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Package className="w-3.5 h-3.5" />
                            {campaign.product_count.toLocaleString("nl-NL")} producten
                          </span>
                        )}
                        {campaign.last_synced_at && (
                          <span>
                            Laatste sync: {new Date(campaign.last_synced_at).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                        {campaign.notes && (
                          <span className="italic truncate max-w-[200px]">{campaign.notes}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleSync(campaign)}
                        disabled={isSyncing || syncingId !== null}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#A8513A] text-white text-xs font-semibold hover:bg-[#C2654A] transition-colors disabled:opacity-50"
                      >
                        {isSyncing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                        {isSyncing ? "Bezig…" : "Sync"}
                      </button>
                      <button
                        onClick={() => openEdit(campaign)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E5E5E5] text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#FAF5F2] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(campaign.id)}
                        disabled={deletingId === campaign.id}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E5E5E5] text-[#8A8A8A] hover:text-[#C24A4A] hover:border-[#C24A4A] transition-colors disabled:opacity-50"
                      >
                        {deletingId === campaign.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sync result */}
                {result && (
                  <div className={`px-5 py-3 border-t border-[#E5E5E5] text-xs flex items-center gap-3 ${result.success ? "bg-[#FAF5F2]" : "bg-red-50"}`}>
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-[#3D8B5E] flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#C24A4A] flex-shrink-0" />
                    )}
                    {result.success ? (
                      <span className="text-[#1A1A1A]">
                        <strong>{result.inserted}</strong> ingevoegd &middot; <strong>{result.skipped}</strong> overgeslagen &middot; <strong>{result.total}</strong> totaal in feed
                      </span>
                    ) : (
                      <span className="text-[#C24A4A]">{result.error}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Link to manual import */}
      <div className="mt-6 rounded-xl bg-[#FAF5F2] border border-[#FAF5F2] p-4 flex items-center justify-between gap-4">
        <p className="text-sm text-[#8A8A8A]">
          Wil je een feed handmatig als JSON plakken of uploaden?
        </p>
        <button
          onClick={() => navigate("/admin/daisycon-import")}
          className="text-sm font-medium text-[#A8513A] hover:underline whitespace-nowrap"
        >
          Handmatige import
        </button>
      </div>
    </div>
  );
}
