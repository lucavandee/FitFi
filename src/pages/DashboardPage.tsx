import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Heart, Camera, ArrowRight, Lock, FileText,
  RefreshCw, Settings, ChevronRight, Star, Check, ShoppingBag,
  Sparkles, TrendingUp
} from "lucide-react";
import { LS_KEYS, ColorProfile, Archetype } from "@/lib/quiz/types";
import { supabase } from "@/lib/supabaseClient";
import { useOutfits } from "@/hooks/useOutfits";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { PhotoUploadModal } from "@/components/nova/PhotoUploadModal";

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function formatReportDate(ts: string | null): string {
  if (!ts) return "";
  const date = new Date(parseInt(ts, 10));
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "long" });
}

function getOutfitImage(outfit: any): string | null {
  if (outfit?.image) return outfit.image;
  if (Array.isArray(outfit?.products) && outfit.products[0]?.imageUrl) return outfit.products[0].imageUrl;
  return null;
}

const SEASON_COLORS: Record<string, string> = {
  lente: "var(--ff-color-success-100)",
  zomer: "var(--ff-color-accent-100)",
  herfst: "var(--ff-color-warning-100)",
  winter: "var(--ff-color-primary-100)",
};

const SEASON_TEXT: Record<string, string> = {
  lente: "var(--ff-color-success-700)",
  zomer: "var(--ff-color-accent-700)",
  herfst: "var(--ff-color-warning-700)",
  winter: "var(--ff-color-primary-700)",
};

const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  "Streetwear": "Stoer, comfortabel en altijd actueel. Jij draagt wat je wilt.",
  "Klassiek": "Tijdloos en verfijnd. Jij kiest altijd voor kwaliteit boven trend.",
  "Bohemian": "Vrij, creatief en uniek. Jij maakt van kleding een kunstwerk.",
  "Minimalist": "Bewust, strak en doordacht. Less is always more voor jou.",
  "Romantic": "Zacht, vrouwelijk en aandachtig voor details. Jij draagt met gevoel.",
  "Business": "Professioneel en zelfverzekerd. Jij kleedt je voor succes.",
  "Casual": "Ontspannen, moeiteloos en altijd op je gemak. Comfort first.",
  "Avant Garde": "Gedurfd, experimenteel en grensverleggend. Jij bent de trendsetter.",
};

function getArchetypeDescription(name: string | null): string {
  if (!name) return "Jouw unieke stijlpersoonlijkheid, samengevat in één profiel.";
  return ARCHETYPE_DESCRIPTIONS[name] || "Jouw unieke stijlpersoonlijkheid, samengevat in één profiel.";
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user: ctxUser } = useUser();
  const [userName, setUserName] = React.useState<string>("");
  const [favCount, setFavCount] = React.useState(0);
  const [showPhotoModal, setShowPhotoModal] = React.useState(false);

  const isPremium = ctxUser?.tier === 'premium' || ctxUser?.tier === 'founder' || !!ctxUser?.isPremium;

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
      reportDate: formatReportDate(ts),
    };
  }, []);

  const { data: outfitsData } = useOutfits({
    archetype: archetype?.name,
    limit: 4,
    enabled: hasReport,
  });

  React.useEffect(() => {
    const client = supabase();
    if (!client) return;
    client.auth.getUser().then(({ data }) => {
      const u = data?.user;
      const email = u?.email || "";
      const displayName =
        u?.user_metadata?.full_name ||
        u?.user_metadata?.name ||
        (() => {
          const localPart = email.split("@")[0];
          return localPart
            .replace(/[._-]+/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
            .trim();
        })();
      setUserName(displayName);
    }).catch(() => {});
  }, []);

  React.useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("ff_fav_outfits") || "[]") as string[];
      setFavCount(Array.isArray(favs) ? favs.length : 0);
    } catch {
      setFavCount(0);
    }
  }, []);

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Goedemorgen";
    if (hour < 18) return "Goedemiddag";
    return "Goedenavond";
  }, []);

  const archetypeName = React.useMemo(() => {
    let raw: string | null = null;
    if (!archetype) return null;
    if (typeof archetype === "string") raw = archetype;
    else if (archetype && "name" in archetype) raw = archetype.name;
    if (!raw) return null;
    return raw
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }, [archetype]);

  const archetypeDescription = getArchetypeDescription(archetypeName);
  const season = color?.season || null;
  const seasonBg = season ? SEASON_COLORS[season] ?? "var(--ff-color-primary-100)" : "var(--ff-color-primary-100)";
  const seasonFg = season ? SEASON_TEXT[season] ?? "var(--ff-color-primary-700)" : "var(--ff-color-primary-700)";

  const completionItems = [
    { label: "Quiz afgerond", done: hasReport },
    { label: "Foto toegevoegd", done: hasPhoto },
    { label: "Outfit bekeken", done: (outfitsData?.length ?? 0) > 0 },
    { label: "Premium actief", done: isPremium },
  ];
  const completionCount = completionItems.filter(i => i.done).length;
  const completionPct = Math.round((completionCount / completionItems.length) * 100);

  if (!hasReport) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)]">
        <Helmet><title>Dashboard – FitFi</title></Helmet>
        <div className="min-h-screen flex items-center justify-center">
          <div className="ff-container py-16">
            <div className="max-w-md mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] flex items-center justify-center mx-auto mb-8">
                  <Sparkles className="w-7 h-7 text-[var(--ff-color-primary-600)]" />
                </div>
                <h1 className="text-3xl font-bold text-[var(--color-text)] mb-3 tracking-tight">
                  Nog geen stijlrapport
                </h1>
                <p className="text-[var(--color-muted)] mb-8 leading-relaxed">
                  Doe de stijlquiz en ontdek jouw persoonlijke kleurpalet, archetype en outfit-aanbevelingen.
                </p>
                <button
                  onClick={() => navigate("/onboarding")}
                  className="inline-flex items-center gap-2 px-7 py-4 bg-[var(--ff-color-primary-700)] text-white rounded-xl font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors shadow-lg"
                >
                  Ontvang jouw stijladvies
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <Helmet>
        <title>Dashboard – FitFi</title>
        <meta name="description" content="Jouw persoonlijke style dashboard." />
      </Helmet>

      <div className="ff-container py-6 sm:py-10 lg:py-12">
        <div className="max-w-6xl mx-auto space-y-5">

          {/* ── Header row ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-widest mb-0.5">{greeting}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tracking-tight leading-tight">
                {userName || "Welkom terug"}
              </h1>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--ff-color-primary-400)] bg-[var(--color-surface)] transition-colors shadow-sm"
              aria-label="Account instellingen"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </button>
          </motion.div>

          {/* ── HERO: Stijlidentiteit ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--ff-color-primary-800) 0%, var(--ff-color-primary-600) 60%, var(--ff-color-accent-600) 100%)',
              boxShadow: '0 8px 40px rgba(122,97,74,0.25)'
            }}
          >
            {/* Subtle texture overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)'
              }}
            />

            <div className="relative p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">

                {/* Left: identity */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <FileText className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/60">
                      Jouw stijlprofiel
                    </span>
                    {reportDate && (
                      <span className="text-xs text-white/40 hidden sm:inline">· Bijgewerkt {reportDate}</span>
                    )}
                  </div>

                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-none mb-3">
                    {archetypeName || "Jouw stijl"}
                  </h2>

                  <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-sm mb-5">
                    {archetypeDescription}
                  </p>

                  {/* Pills row */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {season && (
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize"
                        style={{ backgroundColor: seasonBg, color: seasonFg }}
                      >
                        {season}
                      </span>
                    )}
                    {color?.temperature && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 text-xs text-white font-medium capitalize">
                        {color.temperature}
                      </span>
                    )}
                    {color?.contrast && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 text-xs text-white font-medium capitalize">
                        {color.contrast} contrast
                      </span>
                    )}
                    {hasPhoto && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--ff-color-success-500)]/20 border border-[var(--ff-color-success-400)]/40 text-xs text-[var(--ff-color-success-300)] font-medium">
                        <Check className="w-3 h-3" />
                        Kleuranalyse
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      isPremium
                        ? "bg-[var(--ff-color-warning-400)]/20 border border-[var(--ff-color-warning-400)]/40 text-[var(--ff-color-warning-300)]"
                        : "bg-white/10 text-white/60"
                    }`}>
                      {isPremium ? <Star className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {isPremium ? "Premium" : "Gratis"}
                    </span>
                  </div>

                  {/* Color palette */}
                  {color?.palette && color.palette.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-6">
                      <span className="text-xs text-white/50 mr-1">Jouw kleuren</span>
                      {color.palette.slice(0, 6).map((hex: string, i: number) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full border-2 border-white/20 flex-shrink-0"
                          style={{ backgroundColor: hex }}
                          title={hex}
                          aria-label={`Kleur ${hex}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* CTAs */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate("/results")}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[var(--ff-color-primary-800)] rounded-xl font-bold hover:bg-[var(--ff-color-primary-50)] transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
                    >
                      Bekijk outfits
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate("/onboarding")}
                      className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors text-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Opnieuw
                    </button>
                  </div>
                </div>

                {/* Right: completion ring (desktop) */}
                <div className="hidden sm:flex flex-col items-center gap-3 flex-shrink-0">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
                      <circle
                        cx="40" cy="40" r="32" fill="none"
                        stroke="rgba(255,255,255,0.80)" strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 32}`}
                        strokeDashoffset={`${2 * Math.PI * 32 * (1 - completionPct / 100)}`}
                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-white leading-none">{completionPct}%</span>
                      <span className="text-[9px] text-white/50 leading-tight">compleet</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 w-36">
                    {completionItems.map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          item.done ? 'bg-white/80' : 'bg-white/15 border border-white/25'
                        }`}>
                          {item.done && <Check className="w-2 h-2 text-[var(--ff-color-primary-800)]" />}
                        </div>
                        <span className={`text-xs ${item.done ? 'text-white/80' : 'text-white/35'}`}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          {/* ── GRID: Outfits + sidebar ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">

            {/* Outfit grid */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="lg:col-span-7 rounded-2xl bg-[var(--color-surface)] overflow-hidden"
              style={{ boxShadow: '0 1px 3px rgba(30,35,51,0.06), 0 4px 16px rgba(30,35,51,0.06)' }}
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text)] tracking-tight">Jouw outfits</h3>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">Samengesteld op basis van jouw stijlprofiel</p>
                </div>
                <button
                  onClick={() => navigate("/results")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--ff-color-primary-600)] hover:text-[var(--ff-color-primary-700)] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-[var(--ff-color-primary-50)]"
                >
                  Alles zien
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {outfitsData && outfitsData.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0.5 px-0.5 pb-0.5">
                  {outfitsData.slice(0, 4).map((outfit, i) => {
                    const img = getOutfitImage(outfit);
                    const outfitName = (outfit as any)?.name || (outfit as any)?.occasion || `Look ${i + 1}`;
                    return (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.18 + i * 0.05 }}
                        onClick={() => navigate("/results")}
                        className="group relative aspect-[3/4] rounded-lg overflow-hidden bg-[var(--ff-color-primary-25)]"
                      >
                        {img ? (
                          <img
                            src={img}
                            alt={outfitName}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[var(--ff-color-primary-50)]">
                            <span className="text-xs font-bold text-[var(--ff-color-primary-300)] tracking-widest uppercase select-none">{i + 1}</span>
                          </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                          <div className="p-2 w-full">
                            <p className="text-white text-xs font-semibold truncate capitalize">{outfitName}</p>
                            <p className="text-white/70 text-[10px]">Bekijk outfits</p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-5 pb-6 flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[var(--ff-color-primary-50)] flex items-center justify-center mb-3">
                    <Sparkles className="w-5 h-5 text-[var(--ff-color-primary-400)]" />
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text)] mb-1">Outfits worden samengesteld</p>
                  <p className="text-xs text-[var(--color-muted)] mb-4">Gepersonaliseerd op jouw stijlprofiel</p>
                  <button
                    onClick={() => navigate("/results")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--ff-color-primary-700)] text-white rounded-xl text-xs font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors"
                  >
                    Genereer outfits
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </motion.div>

            {/* Sidebar: stats + actions */}
            <div className="lg:col-span-5 flex flex-col gap-3.5">

              {/* Saved looks */}
              <motion.button
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.18 }}
                onClick={() => navigate("/results#saved")}
                className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-surface)] hover:bg-[var(--ff-color-primary-25)] transition-all text-left"
                style={{ boxShadow: '0 1px 3px rgba(30,35,51,0.06), 0 2px 8px rgba(30,35,51,0.04)' }}
              >
                <div className="w-11 h-11 rounded-xl bg-[var(--ff-color-primary-50)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--ff-color-primary-100)] transition-colors">
                  <Heart className="w-[18px] h-[18px] text-[var(--ff-color-primary-600)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--color-text)] text-sm leading-tight">Opgeslagen looks</p>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">
                    {favCount > 0 ? `${favCount} look${favCount !== 1 ? 's' : ''} bewaard` : "Bewaar jouw favoriete outfits"}
                  </p>
                </div>
                {favCount > 0 ? (
                  <span className="text-lg font-bold text-[var(--ff-color-primary-700)] flex-shrink-0">{favCount}</span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-[var(--color-muted)] group-hover:text-[var(--ff-color-primary-600)] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                )}
              </motion.button>

              {/* Photo */}
              <motion.button
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.22 }}
                onClick={() => setShowPhotoModal(true)}
                className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-surface)] hover:bg-[var(--ff-color-primary-25)] transition-all text-left"
                style={{ boxShadow: '0 1px 3px rgba(30,35,51,0.06), 0 2px 8px rgba(30,35,51,0.04)' }}
              >
                <div className="w-11 h-11 rounded-xl bg-[var(--ff-color-primary-50)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--ff-color-primary-100)] transition-colors">
                  <Camera className="w-[18px] h-[18px] text-[var(--ff-color-primary-600)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--color-text)] text-sm leading-tight">
                    {hasPhoto ? "Foto bijwerken" : "Foto toevoegen"}
                  </p>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">
                    {hasPhoto ? "Verfijn jouw kleuranalyse" : "Persoonlijk kleuradvies op basis van jouw huidtint"}
                  </p>
                </div>
                {hasPhoto ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--ff-color-success-100)] text-[var(--ff-color-success-700)] text-[10px] font-bold flex-shrink-0">
                    <Check className="w-2.5 h-2.5" />
                    Actief
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-[var(--color-muted)] group-hover:text-[var(--ff-color-primary-600)] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                )}
              </motion.button>

              {/* Shop / upgrade */}
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.26 }}
              >
                {isPremium ? (
                  <button
                    onClick={() => navigate("/shop")}
                    className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-surface)] hover:bg-[var(--ff-color-primary-25)] transition-all text-left"
                    style={{ boxShadow: '0 1px 3px rgba(30,35,51,0.06), 0 2px 8px rgba(30,35,51,0.04)' }}
                  >
                    <div className="w-11 h-11 rounded-xl bg-[var(--ff-color-primary-50)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--ff-color-primary-100)] transition-colors">
                      <ShoppingBag className="w-[18px] h-[18px] text-[var(--ff-color-primary-600)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--color-text)] text-sm leading-tight">Shop jouw stijl</p>
                      <p className="text-xs text-[var(--color-muted)] mt-0.5">Producten afgestemd op jou</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--color-muted)] group-hover:text-[var(--ff-color-primary-600)] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>
                ) : (
                  <NavLink
                    to="/prijzen"
                    className="group w-full flex items-center gap-4 p-4 rounded-2xl text-left block"
                    style={{
                      background: 'linear-gradient(135deg, var(--ff-color-primary-700), var(--ff-color-primary-500))',
                      boxShadow: '0 4px 20px rgba(122,97,74,0.30)'
                    }}
                  >
                    <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0 group-hover:bg-white/25 transition-colors">
                      <TrendingUp className="w-[18px] h-[18px] text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm leading-tight">Upgrade naar Premium</p>
                      <p className="text-xs text-white/65 mt-0.5">50+ outfits · kleuranalyse · AI-advies</p>
                    </div>
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </div>
                  </NavLink>
                )}
              </motion.div>

            </div>
          </div>

          {/* ── BOTTOM: Completion tracker (mobile) + Style insights teaser ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Completion tracker (mobile only) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="sm:hidden rounded-2xl bg-[var(--color-surface)] p-5"
              style={{ boxShadow: '0 1px 3px rgba(30,35,51,0.06), 0 2px 8px rgba(30,35,51,0.04)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-[var(--color-text)]">Jouw voortgang</p>
                <span className="text-sm font-bold text-[var(--ff-color-primary-600)]">{completionPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-[var(--ff-color-primary-100)] rounded-full overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPct}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  className="h-full bg-[var(--ff-color-primary-600)] rounded-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {completionItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.done
                        ? 'bg-[var(--ff-color-primary-600)]'
                        : 'bg-[var(--ff-color-primary-100)] border border-[var(--ff-color-primary-200)]'
                    }`}>
                      {item.done && <Check className="w-2 h-2 text-white" />}
                    </div>
                    <span className={`text-xs ${item.done ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Style insights teaser */}
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.32 }}
              onClick={() => navigate("/results")}
              className="group w-full rounded-2xl bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-100)] p-5 text-left hover:bg-[var(--ff-color-primary-100)] transition-colors sm:col-span-2"
              style={{ boxShadow: '0 1px 3px rgba(122,97,74,0.06)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--ff-color-primary-100)] group-hover:bg-[var(--ff-color-primary-200)] flex items-center justify-center flex-shrink-0 transition-colors">
                    <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-600)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-text)] text-sm leading-tight">Bekijk jouw volledige stijlrapport</p>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">Outfits, kleuradvies, shopping-tips en meer</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--ff-color-primary-500)] group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>
            </motion.button>

          </div>

        </div>
      </div>

      <PhotoUploadModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
      />
    </main>
  );
}
