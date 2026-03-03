import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, Camera, Check, ChevronRight,
  Heart, Lock, RefreshCw, Settings, ShoppingBag, Sparkles, Star, User
} from "lucide-react";
import { LS_KEYS, ColorProfile, Archetype } from "@/lib/quiz/types";
import { supabase } from "@/lib/supabaseClient";
import { useOutfits } from "@/hooks/useOutfits";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { PhotoUploadModal } from "@/components/nova/PhotoUploadModal";

/* ─── helpers ─── */
function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

function formatDate(ts: string | null): string {
  if (!ts) return "";
  const d = new Date(parseInt(ts, 10));
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("nl-NL", { day: "numeric", month: "long" });
}

function getOutfitImage(outfit: any): string | null {
  if (outfit?.image) return outfit.image;
  if (outfit?.imageUrl) return outfit.imageUrl;
  if (Array.isArray(outfit?.products)) {
    for (const p of outfit.products) {
      const img = p?.imageUrl || p?.image_url || p?.image;
      if (img) return img;
    }
  }
  return null;
}

function toTitleCase(s: string) {
  return s.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

/* ─── archetype copy ─── */
const ARCHETYPE_COPY: Record<string, { tagline: string; tone: string }> = {
  "Clean Minimal":  { tagline: "Elk stuk telt.",               tone: "Bewust, strak en tijdloos." },
  "Smart Casual":   { tagline: "Moeiteloos voor elke situatie.", tone: "Veelzijdig, verfijnd en altijd raak." },
  "Sporty Sharp":   { tagline: "Energie en vorm in balans.",    tone: "Scherp, actief en zelfverzekerd." },
  "Classic Soft":   { tagline: "Tijdloze elegantie.",           tone: "Verfijnd, warm en aanwezig." },
  "Streetwear":     { tagline: "Stoer, comfortabel, actueel.",  tone: "Jij draagt wat je wilt — en het werkt." },
  "Klassiek":       { tagline: "Tijdloos en onberispelijk.",    tone: "Kwaliteit boven trend." },
  "Minimalist":     { tagline: "Minder is altijd meer.",        tone: "Bewust, strak en doordacht." },
  "Bohemian":       { tagline: "Vrij, creatief en onmiskenbaar.", tone: "Van kleding maak jij kunst." },
};

function getArchetypeCopy(name: string | null) {
  if (!name) return { tagline: "Jouw stijlpersoonlijkheid.", tone: "" };
  return ARCHETYPE_COPY[name] ?? { tagline: "Jouw unieke stijlidentiteit.", tone: "" };
}

/* ═══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { user: ctxUser } = useUser();
  const [userName, setUserName] = React.useState("");
  const [userInitial, setUserInitial] = React.useState("?");
  const [favCount, setFavCount] = React.useState(0);
  const [showPhotoModal, setShowPhotoModal] = React.useState(false);

  const isPremium = ctxUser?.tier === "premium" || ctxUser?.tier === "founder" || !!ctxUser?.isPremium;

  const { color, archetype, hasReport, hasPhoto, reportDate } = React.useMemo(() => {
    const c = readJson<ColorProfile>(LS_KEYS.COLOR_PROFILE);
    const a = readJson<Archetype>(LS_KEYS.ARCHETYPE);
    const ans = readJson<{ photoUrl?: string }>(LS_KEYS.QUIZ_ANSWERS);
    const ts = localStorage.getItem(LS_KEYS.RESULTS_TS);
    return {
      color: c,
      archetype: a,
      hasReport: !!(a || c),
      hasPhoto: !!(ans?.photoUrl),
      reportDate: formatDate(ts),
    };
  }, []);

  const { data: outfitsData } = useOutfits({ archetype: archetype?.name, limit: 6, enabled: hasReport });

  React.useEffect(() => {
    const client = supabase();
    if (!client) return;
    client.auth.getUser().then(({ data }) => {
      const u = data?.user;
      const email = u?.email ?? "";
      const name =
        u?.user_metadata?.full_name ||
        u?.user_metadata?.name ||
        email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()).trim();
      setUserName(name);
      setUserInitial((name?.[0] ?? email?.[0] ?? "?").toUpperCase());
    }).catch(() => {});
  }, []);

  React.useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("ff_fav_outfits") ?? "[]") as string[];
      setFavCount(Array.isArray(favs) ? favs.length : 0);
    } catch { setFavCount(0); }
  }, []);

  const greeting = React.useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Goedemorgen";
    if (h < 18) return "Goedemiddag";
    return "Goedenavond";
  }, []);

  const archetypeName = React.useMemo(() => {
    if (!archetype) return null;
    const raw = typeof archetype === "string" ? archetype : (archetype as any)?.name ?? null;
    return raw ? toTitleCase(raw) : null;
  }, [archetype]);

  const { tagline, tone } = getArchetypeCopy(archetypeName);
  const season = color?.season ?? null;

  /* completion */
  const steps = [
    { label: "Stijlquiz gedaan",  done: hasReport },
    { label: "Foto toegevoegd",   done: hasPhoto  },
    { label: "Outfit opgeslagen", done: favCount > 0 },
    { label: "Premium actief",    done: isPremium  },
  ];
  const donePct = Math.round(steps.filter(s => s.done).length / steps.length * 100);

  /* ── empty state ── */
  if (!hasReport) {
    return (
      <div
        className="flex items-center justify-center px-6"
        style={{ minHeight: "calc(100vh - 64px)", background: "var(--color-bg)" }}
      >
        <Helmet><title>Dashboard – FitFi</title></Helmet>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-sm w-full text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[var(--ff-color-primary-100)] flex items-center justify-center mx-auto mb-7">
            <Sparkles className="w-7 h-7 text-[var(--ff-color-primary-600)]" aria-hidden="true" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-[var(--color-text)] mb-3 tracking-tight">
            Nog geen stijlprofiel
          </h1>
          <p className="text-[var(--color-muted)] text-sm mb-8 leading-relaxed">
            Doe de quiz en ontdek jouw archetype, kleurpalet en gepersonaliseerde outfits.
          </p>
          <button
            onClick={() => navigate("/onboarding")}
            className="inline-flex items-center justify-center gap-2 w-full px-7 py-4 min-h-[54px] bg-[var(--ff-color-primary-700)] text-white rounded-2xl font-bold text-sm hover:bg-[var(--ff-color-primary-600)] transition-colors active:scale-[0.98]"
          >
            Start de stijlquiz <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </motion.div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════
     MAIN DASHBOARD
  ═══════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--color-bg)" }}>
      <Helmet>
        <title>Dashboard – FitFi</title>
        <meta name="description" content="Jouw persoonlijke stijldashboard." />
      </Helmet>

      <div className="max-w-lg mx-auto px-4 pt-6 pb-24 space-y-3">

        {/* ══ TOP BAR ══ */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 mb-2"
        >
          {/* Avatar */}
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-base flex-shrink-0 select-none"
            style={{
              background: "linear-gradient(135deg, var(--ff-color-primary-800) 0%, var(--ff-color-primary-500) 100%)"
            }}
          >
            {userInitial}
          </div>

          {/* Greeting */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-[0.12em] leading-none mb-0.5">
              {greeting}
            </p>
            <h1 className="font-heading text-lg font-bold text-[var(--color-text)] tracking-tight leading-tight truncate">
              {userName || "Welkom terug"}
            </h1>
          </div>

          {/* Profile link */}
          <button
            onClick={() => navigate("/profile")}
            aria-label="Profielinstellingen"
            className="w-11 h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--ff-color-primary-300)] transition-colors flex-shrink-0"
          >
            <Settings className="w-[18px] h-[18px]" aria-hidden="true" />
          </button>
        </motion.header>

        {/* ══ HERO IDENTITY CARD ══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06 }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(150deg, var(--ff-color-primary-800) 0%, var(--ff-color-primary-700) 40%, var(--ff-color-primary-500) 100%)",
            boxShadow: "0 16px 48px rgba(74,56,40,0.35), 0 2px 0 rgba(255,255,255,0.08) inset"
          }}
        >
          {/* Top shine */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

          <div className="relative px-5 pt-5 pb-5">

            {/* Label + tier */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                Stijlprofiel
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  isPremium
                    ? "bg-[var(--ff-color-warning-400)]/20 text-[var(--ff-color-warning-200)] border border-[var(--ff-color-warning-400)]/25"
                    : "bg-white/10 text-white/40 border border-white/10"
                }`}
              >
                {isPremium ? <Star className="w-2.5 h-2.5" aria-hidden="true" /> : <Lock className="w-2.5 h-2.5" aria-hidden="true" />}
                {isPremium ? "Premium" : "Gratis"}
              </span>
            </div>

            {/* Archetype name — the hero */}
            <h2
              className="font-heading font-bold text-white leading-[0.95] mb-1"
              style={{ fontSize: "clamp(2.4rem, 11vw, 3.5rem)", letterSpacing: "-0.03em" }}
            >
              {archetypeName ?? "Jouw stijl"}
            </h2>

            {/* Tagline */}
            <p className="text-white/60 text-[13px] leading-snug mb-4 mt-1.5">
              {tagline}
              {tone && <span className="block text-white/35 text-[11px] mt-0.5">{tone}</span>}
            </p>

            {/* Chips row */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {season && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/12 border border-white/15 text-[11px] text-white/75 font-semibold capitalize">
                  {season}
                </span>
              )}
              {color?.temperature && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 text-[11px] text-white/60 capitalize">
                  {color.temperature}
                </span>
              )}
              {hasPhoto && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--ff-color-success-600)]/20 border border-[var(--ff-color-success-400)]/25 text-[11px] text-[var(--ff-color-success-300)] font-semibold">
                  <Check className="w-2.5 h-2.5" aria-hidden="true" /> Kleuranalyse
                </span>
              )}
            </div>

            {/* Color palette dots */}
            {color?.palette && color.palette.length > 0 && (
              <div className="flex items-center gap-1.5 mb-5">
                <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mr-1">Palet</span>
                {color.palette.slice(0, 8).map((hex: string, i: number) => (
                  <div
                    key={i}
                    className="w-[18px] h-[18px] rounded-full flex-shrink-0 ring-1 ring-white/15"
                    style={{ backgroundColor: hex }}
                    title={hex}
                    aria-hidden="true"
                  />
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/results")}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 min-h-[48px] rounded-2xl font-bold text-sm transition-all active:scale-[0.97]"
                style={{
                  background: "rgba(255,255,255,0.96)",
                  color: "var(--ff-color-primary-800)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.22)"
                }}
              >
                Bekijk outfits <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                onClick={() => navigate("/onboarding")}
                aria-label="Quiz opnieuw starten"
                className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors flex-shrink-0"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {reportDate && (
              <p className="text-[10px] text-white/25 mt-3.5">Bijgewerkt {reportDate}</p>
            )}
          </div>
        </motion.div>

        {/* ══ OUTFIT STRIP ══ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="rounded-2xl bg-[var(--color-surface)] overflow-hidden border border-[var(--color-border)]"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div>
              <h2 className="text-sm font-bold text-[var(--color-text)] tracking-tight">Jouw outfits</h2>
              <p className="text-[11px] text-[var(--color-muted)] mt-0.5">Op maat voor {archetypeName ?? "jou"}</p>
            </div>
            <button
              onClick={() => navigate("/results")}
              className="inline-flex items-center gap-0.5 min-h-[44px] px-2 text-xs font-bold text-[var(--ff-color-primary-600)] hover:text-[var(--ff-color-primary-700)] transition-colors"
            >
              Alles <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {outfitsData && outfitsData.length > 0 ? (
            <div className="flex gap-2.5 px-4 pb-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {outfitsData.slice(0, 6).map((outfit, i) => {
                const img = getOutfitImage(outfit);
                const label = (outfit as any)?.occasion || (outfit as any)?.name || `Look ${i + 1}`;
                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.18 + i * 0.05 }}
                    onClick={() => navigate("/results")}
                    aria-label={`Bekijk outfit: ${label}`}
                    className="group relative flex-shrink-0 rounded-xl overflow-hidden bg-[var(--ff-color-primary-50)]"
                    style={{ width: 100, height: 130 }}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={label}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 text-[var(--ff-color-primary-200)]" aria-hidden="true" />
                        <span className="text-[10px] font-bold text-[var(--ff-color-primary-300)]">Look {i + 1}</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 pt-6 pb-2 px-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                      <p className="text-white text-[9px] font-bold truncate capitalize leading-tight">{label}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center px-6">
              <Sparkles className="w-6 h-6 text-[var(--ff-color-primary-200)] mb-2.5" aria-hidden="true" />
              <p className="text-xs text-[var(--color-muted)] mb-3 leading-relaxed">
                Outfits worden samengesteld op basis van jouw profiel
              </p>
              <button
                onClick={() => navigate("/results")}
                className="text-xs font-bold text-[var(--ff-color-primary-600)] hover:underline"
              >
                Genereer nu →
              </button>
            </div>
          )}
        </motion.div>

        {/* ══ ACTIONS ROW — 3 cards ══ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="grid grid-cols-3 gap-2.5"
        >
          {/* Saved looks */}
          <button
            onClick={() => navigate("/results#saved")}
            className="flex flex-col items-start p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] transition-all active:scale-[0.97] text-left"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <div className="w-8 h-8 rounded-xl bg-[var(--ff-color-primary-50)] flex items-center justify-center mb-2.5">
              <Heart className="w-4 h-4 text-[var(--ff-color-primary-500)]" aria-hidden="true" />
            </div>
            <p className="text-xs font-bold text-[var(--color-text)] leading-tight">Opgeslagen</p>
            <p className="text-[11px] text-[var(--color-muted)] mt-0.5 leading-tight">
              {favCount > 0 ? `${favCount} look${favCount !== 1 ? "s" : ""}` : "Leeg"}
            </p>
          </button>

          {/* Photo / Kleuranalyse */}
          <button
            onClick={() => setShowPhotoModal(true)}
            className="flex flex-col items-start p-3.5 rounded-2xl border transition-all active:scale-[0.97] text-left"
            style={{
              background: hasPhoto ? "var(--ff-color-success-50)" : "var(--color-surface)",
              borderColor: hasPhoto ? "var(--ff-color-success-200)" : "var(--color-border)",
              boxShadow: "var(--shadow-soft)"
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5"
              style={{ background: hasPhoto ? "var(--ff-color-success-100)" : "var(--ff-color-primary-50)" }}
            >
              <Camera
                className={`w-4 h-4 ${hasPhoto ? "text-[var(--ff-color-success-600)]" : "text-[var(--ff-color-primary-500)]"}`}
                aria-hidden="true"
              />
            </div>
            <p className="text-xs font-bold text-[var(--color-text)] leading-tight">
              {hasPhoto ? "Kleuranalyse" : "Foto"}
            </p>
            <p className={`text-[11px] mt-0.5 leading-tight ${hasPhoto ? "text-[var(--ff-color-success-700)]" : "text-[var(--color-muted)]"}`}>
              {hasPhoto ? "Actief" : "Toevoegen"}
            </p>
          </button>

          {/* Profile completeness */}
          <button
            onClick={() => navigate("/profile")}
            className="flex flex-col items-start p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] transition-all active:scale-[0.97] text-left"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <div className="relative w-8 h-8 flex-shrink-0 mb-2.5">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32" aria-hidden="true">
                <circle cx="16" cy="16" r="13" fill="none" stroke="var(--ff-color-primary-100)" strokeWidth="3" />
                <motion.circle
                  cx="16" cy="16" r="13" fill="none"
                  stroke="var(--ff-color-primary-600)" strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 13}
                  initial={{ strokeDashoffset: 2 * Math.PI * 13 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 13 * (1 - donePct / 100) }}
                  transition={{ duration: 1.2, delay: 0.7, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[9px] font-bold text-[var(--ff-color-primary-700)]" aria-label={`${donePct} procent compleet`}>{donePct}%</span>
              </div>
            </div>
            <p className="text-xs font-bold text-[var(--color-text)] leading-tight">Profiel</p>
            <p className="text-[11px] text-[var(--color-muted)] mt-0.5 leading-tight">{donePct}% compleet</p>
          </button>
        </motion.div>

        {/* ══ UPGRADE BANNER or SHOP ══ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.24 }}
        >
          {isPremium ? (
            <button
              onClick={() => navigate("/shop")}
              className="group w-full flex items-center gap-3.5 p-4 rounded-2xl bg-[var(--color-surface)] text-left transition-colors hover:bg-[var(--ff-color-primary-50)] border border-[var(--color-border)] min-h-[64px]"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <div className="w-11 h-11 rounded-xl bg-[var(--ff-color-primary-50)] flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-5 h-5 text-[var(--ff-color-primary-600)]" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--color-text)] text-sm">Shop jouw stijl</p>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">Producten afgestemd op jou</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--color-muted)] group-hover:translate-x-0.5 transition-transform flex-shrink-0" aria-hidden="true" />
            </button>
          ) : (
            <Link
              to="/prijzen"
              className="group flex items-center gap-4 p-5 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, var(--ff-color-primary-800) 0%, var(--ff-color-primary-700) 100%)",
                boxShadow: "0 8px 28px rgba(74,56,40,0.30)"
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/45 mb-1">Upgrade</p>
                <p className="font-bold text-white text-base leading-tight">Ontgrendel Premium</p>
                <p className="text-xs text-white/55 mt-1 leading-snug">
                  50+ outfits · AI kleuranalyse · persoonlijk advies
                </p>
              </div>
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/15 group-hover:bg-white/22 flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
            </Link>
          )}
        </motion.div>

        {/* ══ FULL REPORT CTA ══ */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          onClick={() => navigate("/results")}
          className="group w-full flex items-center gap-3.5 px-4 py-3.5 min-h-[60px] rounded-2xl border border-[var(--ff-color-primary-200)] bg-[var(--ff-color-primary-50)] text-left transition-colors hover:bg-[var(--ff-color-primary-100)] active:scale-[0.99]"
        >
          <div className="w-9 h-9 rounded-xl bg-[var(--ff-color-primary-100)] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-600)]" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[var(--color-text)] leading-tight">Volledig stijlrapport</p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">Outfits · kleuren · shopping tips</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--ff-color-primary-400)] group-hover:translate-x-0.5 transition-transform flex-shrink-0" aria-hidden="true" />
        </motion.button>

      </div>

      <PhotoUploadModal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)} />
    </div>
  );
}
