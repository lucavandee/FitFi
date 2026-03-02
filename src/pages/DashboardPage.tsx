import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, Camera, Check, ChevronRight,
  Heart, Lock, RefreshCw, Settings, ShoppingBag, Sparkles, Star
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
  if (Array.isArray(outfit?.products) && outfit.products[0]?.imageUrl) return outfit.products[0].imageUrl;
  return null;
}

function toTitleCase(s: string) {
  return s.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

/* ─── archetype copy ─── */
const ARCHETYPE_COPY: Record<string, { tagline: string; tone: string }> = {
  "Clean Minimal":  { tagline: "Jij spreekt door stilte. Elk stuk telt.", tone: "Bewust, strak en tijdloos." },
  "Smart Casual":   { tagline: "Moeiteloos gekleed voor elke situatie.", tone: "Veelzijdig, verfijnd en altijd raak." },
  "Sporty Sharp":   { tagline: "Energie en vorm in perfecte balans.", tone: "Scherp, actief en zelfverzekerd." },
  "Classic Soft":   { tagline: "Tijdloze elegantie met een zachte touch.", tone: "Verfijnd, warm en aanwezig." },
  "Streetwear":     { tagline: "Stoer, comfortabel en altijd actueel.", tone: "Jij draagt wat je wilt — en het werkt." },
  "Klassiek":       { tagline: "Tijdloos en onberispelijk.", tone: "Jij kiest altijd voor kwaliteit boven trend." },
  "Minimalist":     { tagline: "Minder is altijd meer.", tone: "Bewust, strak en doordacht." },
  "Bohemian":       { tagline: "Vrij, creatief en onmiskenbaar jij.", tone: "Van kleding maak jij een kunstwerk." },
};

function getArchetypeCopy(name: string | null) {
  if (!name) return { tagline: "Jouw stijlpersoonlijkheid in één profiel.", tone: "" };
  return ARCHETYPE_COPY[name] ?? { tagline: "Jouw unieke stijlidentiteit.", tone: "" };
}

/* ─── season gradient map ─── */
const SEASON_PILL: Record<string, { bg: string; fg: string }> = {
  lente:  { bg: "var(--ff-color-success-100)",  fg: "var(--ff-color-success-800)"  },
  zomer:  { bg: "var(--ff-color-accent-100)",   fg: "var(--ff-color-accent-800)"   },
  herfst: { bg: "var(--ff-color-warning-100)",  fg: "var(--ff-color-warning-800)"  },
  winter: { bg: "var(--ff-color-primary-100)",  fg: "var(--ff-color-primary-800)"  },
};

/* ═══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { user: ctxUser } = useUser();
  const [userName, setUserName] = React.useState("");
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

  const { data: outfitsData } = useOutfits({ archetype: archetype?.name, limit: 4, enabled: hasReport });

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
  const seasonPill = season ? SEASON_PILL[season] : null;

  /* completion items */
  const steps = [
    { label: "Stijlquiz gedaan",   done: hasReport },
    { label: "Foto toegevoegd",    done: hasPhoto  },
    { label: "Outfit opgeslagen",  done: favCount > 0 },
    { label: "Premium actief",     done: isPremium  },
  ];
  const donePct = Math.round(steps.filter(s => s.done).length / steps.length * 100);

  /* ── empty state ── */
  if (!hasReport) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <Helmet><title>Dashboard – FitFi</title></Helmet>
        <div className="max-w-sm mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="w-14 h-14 rounded-2xl bg-[var(--ff-color-primary-100)] flex items-center justify-center mx-auto mb-7">
              <Sparkles className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-3 tracking-tight">Nog geen stijlprofiel</h1>
            <p className="text-[var(--color-muted)] text-sm mb-7 leading-relaxed">
              Doe de quiz en ontdek jouw archetype, kleurpalet en gepersonaliseerde outfit-aanbevelingen.
            </p>
            <button
              onClick={() => navigate("/onboarding")}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[var(--ff-color-primary-700)] text-white rounded-xl font-bold text-sm hover:bg-[var(--ff-color-primary-600)] transition-colors"
            >
              Start de stijlquiz <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </main>
    );
  }

  /* ══════════════════════════════════════════════
     MAIN DASHBOARD
  ══════════════════════════════════════════════ */
  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <Helmet>
        <title>Dashboard – FitFi</title>
        <meta name="description" content="Jouw persoonlijke stijldashboard." />
      </Helmet>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-7 pb-16 space-y-4">

        {/* ── TOP BAR ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-between mb-1"
        >
          <div>
            <p className="text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-widest">{greeting}</p>
            <h1 className="text-xl font-bold text-[var(--color-text)] tracking-tight mt-0.5">{userName || "Welkom terug"}</h1>
          </div>
          <button
            onClick={() => navigate("/profile")}
            aria-label="Account"
            className="w-9 h-9 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--ff-color-primary-300)] transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </motion.div>

        {/* ═══════════════════════════════════════
            HERO IDENTITY CARD
        ════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06 }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #5C4937 0%, #7A614A 45%, #A6886A 100%)",
            boxShadow: "0 12px 48px rgba(92,73,55,0.30)"
          }}
        >
          {/* noise texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
              opacity: 0.6
            }}
          />
          {/* shine */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="relative p-6 sm:p-7">
            {/* label row */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">Stijlprofiel</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                isPremium
                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                  : "bg-white/10 text-white/50"
              }`}>
                {isPremium ? <Star className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                {isPremium ? "Premium" : "Gratis"}
              </span>
            </div>

            {/* archetype name */}
            <h2
              className="font-bold text-white leading-none mb-2"
              style={{ fontSize: "clamp(2rem, 9vw, 3rem)", letterSpacing: "-0.02em" }}
            >
              {archetypeName || "Jouw stijl"}
            </h2>

            {/* tagline */}
            <p className="text-white/65 text-sm leading-relaxed mb-5 max-w-xs">
              {tagline}
              {tone && <span className="block text-white/40 mt-0.5 text-xs">{tone}</span>}
            </p>

            {/* color swatches + season pill */}
            <div className="flex items-center gap-3 mb-6">
              {seasonPill && (
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold capitalize"
                  style={{ backgroundColor: seasonPill.bg, color: seasonPill.fg }}
                >
                  {season}
                </span>
              )}
              {color?.temperature && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 text-[11px] text-white/70 capitalize">
                  {color.temperature}
                </span>
              )}
              {hasPhoto && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[11px] text-emerald-300 font-medium">
                  <Check className="w-2.5 h-2.5" /> Kleuranalyse
                </span>
              )}
            </div>

            {/* palette dots */}
            {color?.palette && color.palette.length > 0 && (
              <div className="flex items-center gap-1.5 mb-6">
                <span className="text-[10px] text-white/35 uppercase tracking-wider mr-1">Palet</span>
                {color.palette.slice(0, 7).map((hex: string, i: number) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: hex, boxShadow: "0 0 0 1.5px rgba(255,255,255,0.15)" }}
                    title={hex}
                  />
                ))}
              </div>
            )}

            {/* CTA row */}
            <div className="flex gap-2.5">
              <button
                onClick={() => navigate("/results")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: "rgba(255,255,255,0.95)",
                  color: "#5C4937",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.18)"
                }}
              >
                Bekijk outfits <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate("/onboarding")}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-white/70 bg-white/10 border border-white/15 hover:bg-white/18 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Opnieuw
              </button>
            </div>

            {/* update date */}
            {reportDate && (
              <p className="text-[10px] text-white/30 mt-4">Bijgewerkt {reportDate}</p>
            )}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════
            OUTFIT PREVIEW STRIP
        ════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.13 }}
          className="rounded-2xl bg-[var(--color-surface)] overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(30,35,51,0.07)" }}
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-2.5">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text)] tracking-tight">Jouw outfits</h3>
              <p className="text-[11px] text-[var(--color-muted)] mt-0.5">Op maat voor {archetypeName ?? "jou"}</p>
            </div>
            <button
              onClick={() => navigate("/results")}
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-[var(--ff-color-primary-600)] hover:text-[var(--ff-color-primary-700)] transition-colors"
            >
              Alles <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {outfitsData && outfitsData.length > 0 ? (
            <div className="flex gap-0.5 px-0.5 pb-0.5 overflow-x-auto scrollbar-none">
              {outfitsData.slice(0, 4).map((outfit, i) => {
                const img = getOutfitImage(outfit);
                const label = (outfit as any)?.occasion || (outfit as any)?.name || `Look ${i + 1}`;
                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
                    onClick={() => navigate("/results")}
                    className="group relative flex-shrink-0 rounded-lg overflow-hidden bg-[var(--ff-color-primary-50)]"
                    style={{ width: "calc(25% - 2px)", aspectRatio: "3/4" }}
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
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs font-bold text-[var(--ff-color-primary-300)] select-none">{i + 1}</span>
                      </div>
                    )}
                    {/* caption overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent pt-6 pb-1.5 px-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <p className="text-white text-[9px] font-semibold truncate capitalize leading-tight">{label}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center px-6">
              <Sparkles className="w-6 h-6 text-[var(--ff-color-primary-300)] mb-2" />
              <p className="text-xs text-[var(--color-muted)] mb-3">Outfits worden samengesteld op basis van jouw profiel</p>
              <button
                onClick={() => navigate("/results")}
                className="text-xs font-bold text-[var(--ff-color-primary-600)] hover:underline"
              >
                Genereer nu →
              </button>
            </div>
          )}
        </motion.div>

        {/* ═══════════════════════════════════════
            PROGRESS — compact ring card
        ════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.19 }}
          className="rounded-2xl bg-[var(--color-surface)] p-5"
          style={{ boxShadow: "0 2px 12px rgba(30,35,51,0.07)" }}
        >
          <div className="flex items-center gap-4">
            {/* SVG ring */}
            <div className="relative w-14 h-14 flex-shrink-0">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" fill="none" stroke="var(--ff-color-primary-100)" strokeWidth="5" />
                <motion.circle
                  cx="28" cy="28" r="22" fill="none"
                  stroke="var(--ff-color-primary-600)" strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 22}
                  initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 22 * (1 - donePct / 100) }}
                  transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-[var(--ff-color-primary-700)]">{donePct}%</span>
              </div>
            </div>

            {/* steps */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--color-text)] mb-2">Jouw profiel is {donePct}% compleet</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                {steps.map(step => (
                  <div key={step.label} className="flex items-center gap-1.5">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.done
                        ? "bg-[var(--ff-color-primary-600)]"
                        : "border border-[var(--ff-color-primary-200)] bg-[var(--ff-color-primary-50)]"
                    }`}>
                      {step.done && <Check className="w-2 h-2 text-white" />}
                    </div>
                    <span className={`text-[11px] ${step.done ? "text-[var(--color-text)]" : "text-[var(--color-muted)]"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════
            ACTION CARDS — differentiated
        ════════════════════════════════════════ */}
        <div className="grid grid-cols-2 gap-3">

          {/* Saved looks */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.24 }}
            onClick={() => navigate("/results#saved")}
            className="group relative rounded-2xl p-4 text-left overflow-hidden transition-transform active:scale-[0.98]"
            style={{
              background: "var(--ff-color-primary-50)",
              border: "1px solid var(--ff-color-primary-100)",
              boxShadow: "0 1px 4px rgba(122,97,74,0.06)"
            }}
          >
            <Heart className="w-5 h-5 text-[var(--ff-color-primary-500)] mb-3" />
            <p className="text-sm font-bold text-[var(--color-text)] leading-tight">Opgeslagen</p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5 leading-tight">
              {favCount > 0 ? `${favCount} look${favCount !== 1 ? "s" : ""}` : "Nog leeg"}
            </p>
            {favCount > 0 && (
              <span className="absolute top-3.5 right-3.5 text-lg font-bold text-[var(--ff-color-primary-600)]">{favCount}</span>
            )}
          </motion.button>

          {/* Photo */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.27 }}
            onClick={() => setShowPhotoModal(true)}
            className="group relative rounded-2xl p-4 text-left overflow-hidden transition-transform active:scale-[0.98]"
            style={{
              background: hasPhoto ? "var(--ff-color-success-50)" : "var(--ff-color-primary-50)",
              border: hasPhoto
                ? "1px solid var(--ff-color-success-200)"
                : "1px solid var(--ff-color-primary-100)",
              boxShadow: "0 1px 4px rgba(30,35,51,0.05)"
            }}
          >
            <Camera className={`w-5 h-5 mb-3 ${hasPhoto ? "text-[var(--ff-color-success-600)]" : "text-[var(--ff-color-primary-500)]"}`} />
            <p className="text-sm font-bold text-[var(--color-text)] leading-tight">
              {hasPhoto ? "Kleuranalyse" : "Foto"}
            </p>
            <p className={`text-xs mt-0.5 leading-tight ${hasPhoto ? "text-[var(--ff-color-success-700)]" : "text-[var(--color-muted)]"}`}>
              {hasPhoto ? "Actief" : "Toevoegen"}
            </p>
            {hasPhoto && (
              <span className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-[var(--ff-color-success-500)] flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </span>
            )}
          </motion.button>
        </div>

        {/* ═══════════════════════════════════════
            UPGRADE BANNER or SHOP CTA
        ════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.31 }}
        >
          {isPremium ? (
            <button
              onClick={() => navigate("/shop")}
              className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-surface)] text-left transition-colors hover:bg-[var(--ff-color-primary-25)]"
              style={{ boxShadow: "0 2px 10px rgba(30,35,51,0.07)" }}
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--ff-color-primary-50)] flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-[18px] h-[18px] text-[var(--ff-color-primary-600)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[var(--color-text)] text-sm">Shop jouw stijl</p>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">Producten afgestemd op jou</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--color-muted)] group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </button>
          ) : (
            <Link
              to="/prijzen"
              className="group flex items-center gap-4 p-5 rounded-2xl text-left block"
              style={{
                background: "linear-gradient(135deg, #5C4937 0%, #8F7459 100%)",
                boxShadow: "0 6px 24px rgba(92,73,55,0.28)"
              }}
            >
              {/* left: icon + text */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Upgrade</p>
                <p className="font-bold text-white text-base leading-tight">Ontgrendel Premium</p>
                <p className="text-xs text-white/60 mt-1 leading-snug">
                  50+ outfits · AI kleuranalyse · persoonlijk advies
                </p>
              </div>
              {/* right: arrow chip */}
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/15 group-hover:bg-white/25 flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </Link>
          )}
        </motion.div>

        {/* ═══════════════════════════════════════
            BOTTOM CTA — full report
        ════════════════════════════════════════ */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.36 }}
          onClick={() => navigate("/results")}
          className="group w-full flex items-center justify-between px-5 py-4 rounded-2xl text-left transition-colors"
          style={{
            background: "var(--ff-color-primary-25)",
            border: "1px solid var(--ff-color-primary-100)"
          }}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-400)] flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)] leading-tight">Volledig stijlrapport</p>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">Outfits · kleuren · shopping tips</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--ff-color-primary-400)] group-hover:translate-x-1 transition-transform flex-shrink-0" />
        </motion.button>

      </div>

      <PhotoUploadModal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)} />
    </main>
  );
}
