import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Heart, Camera, ArrowRight, Lock, FileText,
  RefreshCw, Settings, ChevronRight, Star, Check, ShoppingBag
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

const SEASON_GRADIENT: Record<string, string> = {
  lente: "from-[var(--ff-color-success-50)] to-[var(--color-surface)]",
  zomer: "from-[var(--ff-color-accent-50)] to-[var(--color-surface)]",
  herfst: "from-[var(--ff-color-warning-50)] to-[var(--color-surface)]",
  winter: "from-[var(--ff-color-primary-50)] to-[var(--color-surface)]",
};

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

  const season = color?.season || null;
  const seasonBg = season ? SEASON_COLORS[season] ?? "var(--ff-color-primary-100)" : "var(--ff-color-primary-100)";
  const seasonFg = season ? SEASON_TEXT[season] ?? "var(--ff-color-primary-700)" : "var(--ff-color-primary-700)";
  const heroGradient = season ? SEASON_GRADIENT[season] ?? "from-[var(--ff-color-primary-50)] to-[var(--color-surface)]" : "from-[var(--ff-color-primary-50)] to-[var(--color-surface)]";

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
                  <span className="text-2xl font-bold text-[var(--ff-color-primary-700)] tracking-tight select-none">FF</span>
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
        <div className="max-w-6xl mx-auto">

          {/* Header row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between mb-7"
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

          {/* Bento grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-5">

            {/* CELL 1 — Style profile hero (spans 7 cols on lg) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className={`lg:col-span-7 relative rounded-2xl bg-gradient-to-br ${heroGradient} overflow-hidden`}
              style={{ boxShadow: '0 1px 3px rgba(30,35,51,0.06), 0 4px 16px rgba(30,35,51,0.06)' }}
            >
              {/* Accent bar */}
              <div className="h-0.5 w-full bg-gradient-to-r from-[var(--ff-color-primary-400)] to-[var(--ff-color-accent-400)]" />

              <div className="p-6 sm:p-7">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <FileText className="w-3.5 h-3.5 text-[var(--ff-color-primary-500)]" />
                      <span className="text-xs font-bold uppercase tracking-widest text-[var(--ff-color-primary-500)]">
                        Stijlprofiel
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tracking-tight leading-tight">
                      {archetypeName || "Jouw stijl"}
                    </h2>
                    {reportDate && (
                      <p className="text-xs text-[var(--color-muted)] mt-1">Bijgewerkt {reportDate}</p>
                    )}
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    isPremium
                      ? "bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]"
                      : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted)]"
                  }`}>
                    {isPremium ? <Star className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {isPremium ? "Premium" : "Gratis"}
                  </div>
                </div>

                {/* Attribute pills */}
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
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] font-medium capitalize">
                      {color.temperature}
                    </span>
                  )}
                  {color?.contrast && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text)] font-medium capitalize">
                      {color.contrast} contrast
                    </span>
                  )}
                  {hasPhoto && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--ff-color-success-50)] border border-[var(--ff-color-success-200)] text-xs text-[var(--ff-color-success-700)] font-medium">
                      <Check className="w-3 h-3" />
                      Kleuranalyse
                    </span>
                  )}
                </div>

                {/* Color swatches if available */}
                {color?.palette && color.palette.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-6">
                    {color.palette.slice(0, 5).map((hex: string, i: number) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border-2 border-[var(--color-surface)] flex-shrink-0"
                        style={{ backgroundColor: hex, boxShadow: '0 0 0 1px rgba(30,35,51,0.10)' }}
                        title={hex}
                        aria-label={`Kleur ${hex}`}
                      />
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => navigate("/results")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--ff-color-primary-700)] text-white rounded-xl font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
                    style={{ boxShadow: '0 2px 8px rgba(122,97,74,0.30)' }}
                  >
                    Bekijk outfits
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate("/onboarding")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl font-semibold hover:border-[var(--ff-color-primary-400)] transition-colors text-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Quiz opnieuw
                  </button>
                </div>
              </div>
            </motion.div>

            {/* CELL 2 — Outfit preview (spans 5 cols on lg) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-5 rounded-2xl bg-[var(--color-surface)] overflow-hidden"
              style={{ boxShadow: '0 1px 3px rgba(30,35,51,0.06), 0 4px 16px rgba(30,35,51,0.06)' }}
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <h3 className="text-sm font-bold text-[var(--color-text)] tracking-tight">Jouw outfits</h3>
                <button
                  onClick={() => navigate("/results")}
                  className="text-xs font-semibold text-[var(--ff-color-primary-600)] hover:text-[var(--ff-color-primary-700)] flex items-center gap-0.5 transition-colors"
                >
                  Alles zien
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {outfitsData && outfitsData.length > 0 ? (
                <div className="grid grid-cols-2 gap-0.5 px-0.5 pb-0.5">
                  {outfitsData.slice(0, 4).map((outfit, i) => {
                    const img = getOutfitImage(outfit);
                    return (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.15 + i * 0.04 }}
                        onClick={() => navigate("/results")}
                        className="aspect-[3/4] rounded-lg overflow-hidden bg-[var(--ff-color-primary-25)] hover:opacity-90 transition-opacity"
                      >
                        {img ? (
                          <img
                            src={img}
                            alt={`Outfit ${i + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[var(--ff-color-primary-50)]">
                            <span className="text-xs font-bold text-[var(--ff-color-primary-300)] tracking-widest uppercase select-none">{i + 1}</span>
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-5 pb-5 flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm text-[var(--color-muted)] mb-3">Nog geen outfits geladen</p>
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

            {/* CELL 3 — Saved looks */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="lg:col-span-4"
            >
              <button
                onClick={() => navigate("/results#saved")}
                className="group w-full flex items-center justify-between p-5 rounded-2xl bg-[var(--color-surface)] hover:bg-[var(--ff-color-primary-25)] transition-all text-left h-full"
                style={{ boxShadow: '0 1px 3px rgba(30,35,51,0.06), 0 2px 8px rgba(30,35,51,0.04)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--ff-color-primary-50)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--ff-color-primary-100)] transition-colors">
                    <Heart className="w-[18px] h-[18px] text-[var(--ff-color-primary-600)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-text)] text-sm leading-tight">Opgeslagen looks</p>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">
                      {favCount > 0 ? `${favCount} look${favCount !== 1 ? 's' : ''} bewaard` : "Bewaar outfits via resultaten"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--color-muted)] group-hover:text-[var(--ff-color-primary-600)] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            </motion.div>

            {/* CELL 4 — Photo */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
              className="lg:col-span-4"
            >
              <button
                onClick={() => setShowPhotoModal(true)}
                className="group w-full flex items-center justify-between p-5 rounded-2xl bg-[var(--color-surface)] hover:bg-[var(--ff-color-primary-25)] transition-all text-left h-full"
                style={{ boxShadow: '0 1px 3px rgba(30,35,51,0.06), 0 2px 8px rgba(30,35,51,0.04)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--ff-color-primary-50)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--ff-color-primary-100)] transition-colors">
                    <Camera className="w-[18px] h-[18px] text-[var(--ff-color-primary-600)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-text)] text-sm leading-tight">
                      {hasPhoto ? "Foto bijwerken" : "Foto toevoegen"}
                    </p>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">
                      {hasPhoto ? "Verfijn kleuranalyse" : "Voor persoonlijk kleuradvies"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--color-muted)] group-hover:text-[var(--ff-color-primary-600)] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            </motion.div>

            {/* CELL 5 — Shop / upgrade */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.21 }}
              className="lg:col-span-4"
            >
              {isPremium ? (
                <button
                  onClick={() => navigate("/shop")}
                  className="group w-full flex items-center justify-between p-5 rounded-2xl bg-[var(--color-surface)] hover:bg-[var(--ff-color-primary-25)] transition-all text-left h-full"
                  style={{ boxShadow: '0 1px 3px rgba(30,35,51,0.06), 0 2px 8px rgba(30,35,51,0.04)' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--ff-color-primary-50)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--ff-color-primary-100)] transition-colors">
                      <ShoppingBag className="w-[18px] h-[18px] text-[var(--ff-color-primary-600)]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--color-text)] text-sm leading-tight">Shop jouw stijl</p>
                      <p className="text-xs text-[var(--color-muted)] mt-0.5">Producten afgestemd op jou</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--color-muted)] group-hover:text-[var(--ff-color-primary-600)] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </button>
              ) : (
                <NavLink
                  to="/prijzen"
                  className="group w-full flex items-center justify-between p-5 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-700)] to-[var(--ff-color-primary-600)] hover:from-[var(--ff-color-primary-600)] hover:to-[var(--ff-color-primary-500)] transition-all text-left h-full block"
                  style={{ boxShadow: '0 2px 12px rgba(122,97,74,0.25)' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Star className="w-[18px] h-[18px] text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm leading-tight">Upgrade naar Premium</p>
                      <p className="text-xs text-white/70 mt-0.5">50+ outfits & kleuranalyse</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </NavLink>
              )}
            </motion.div>

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
