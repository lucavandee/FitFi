import React from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, Camera, Check, ChevronRight,
  Heart, RefreshCw, ShoppingBag,
  Sparkles, Star, User, Crown,
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
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

function formatDate(ts: string | null): string {
  if (!ts) return "";
  const d = new Date(parseInt(ts, 10));
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("nl-NL", { day: "numeric", month: "long" });
}

const CATEGORY_ORDER = ['outerwear', 'top', 'dress', 'bottom', 'footwear', 'accessory'];

function getOutfitImages(outfit: any): string[] {
  const imgs: string[] = [];
  if (Array.isArray(outfit?.products) && outfit.products.length > 0) {
    const sorted = [...outfit.products].sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a?.category ?? '');
      const bi = CATEGORY_ORDER.indexOf(b?.category ?? '');
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    for (const p of sorted) {
      const img = p?.imageUrl || p?.image_url || p?.image;
      if (img && !imgs.includes(img)) imgs.push(img);
      if (imgs.length >= 3) break;
    }
  }
  if (imgs.length === 0 && outfit?.image) imgs.push(outfit.image);
  if (imgs.length === 0 && outfit?.imageUrl) imgs.push(outfit.imageUrl);
  return imgs;
}

function toTitleCase(s: string) {
  return s.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

const ARCHETYPE_COPY: Record<string, { tagline: string; tone: string }> = {
  "Clean Minimal":  { tagline: "Elk stuk telt.",                tone: "Bewust, strak en tijdloos." },
  "Smart Casual":   { tagline: "Moeiteloos voor elke situatie.", tone: "Veelzijdig, verfijnd en altijd raak." },
  "Sporty Sharp":   { tagline: "Energie en vorm in balans.",     tone: "Scherp, actief en zelfverzekerd." },
  "Classic Soft":   { tagline: "Tijdloze elegantie.",            tone: "Verfijnd, warm en aanwezig." },
  "Streetwear":     { tagline: "Stoer, comfortabel, actueel.",   tone: "Jij draagt wat je wilt — en het werkt." },
  "Klassiek":       { tagline: "Tijdloos en onberispelijk.",     tone: "Kwaliteit boven trend." },
  "Minimalist":     { tagline: "Minder is altijd meer.",         tone: "Bewust, strak en doordacht." },
  "Bohemian":       { tagline: "Vrij, creatief en onmiskenbaar.", tone: "Van kleding maak jij kunst." },
};

function getArchetypeCopy(name: string | null) {
  if (!name) return { tagline: "Jouw stijlpersoonlijkheid.", tone: "" };
  return ARCHETYPE_COPY[name] ?? { tagline: "Jouw unieke stijlidentiteit.", tone: "" };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: ctxUser } = useUser();
  const [userName, setUserName] = React.useState("");
  const [userInitial, setUserInitial] = React.useState("?");
  const [favCount, setFavCount] = React.useState(0);
  const [showPhotoModal, setShowPhotoModal] = React.useState(false);

  const isPremium = ctxUser?.tier === "premium" || ctxUser?.tier === "founder" || !!ctxUser?.isPremium;
  const isFounder = ctxUser?.tier === "founder";

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

  React.useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      import("@/utils/telemetry").then(({ default: track }) => {
        track("checkout_success", { tier: ctxUser?.tier || "unknown" });
      }).catch(() => {});
    }
  }, [searchParams, ctxUser?.tier]);

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

  const steps = [
    { label: "Stijlquiz gedaan",  done: hasReport },
    { label: "Foto toegevoegd",   done: hasPhoto  },
    { label: "Outfit opgeslagen", done: favCount > 0 },
    { label: "Premium actief",    done: isPremium  },
  ];
  const donePct = Math.round(steps.filter(s => s.done).length / steps.length * 100);

  const hasQuizInProgress = React.useMemo(() => {
    try {
      const lsAnswers = localStorage.getItem(LS_KEYS.QUIZ_ANSWERS);
      const lsStep = localStorage.getItem('ff_quiz_step');
      if (!lsAnswers || !lsStep) return false;
      const ans = JSON.parse(lsAnswers);
      return Object.keys(ans).length > 0 && parseInt(lsStep, 10) > 0;
    } catch { return false; }
  }, []);

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
          {hasQuizInProgress ? (
            <>
              <h1 className="font-heading text-2xl font-bold text-[var(--color-text)] mb-3 tracking-tight">
                Quiz niet afgemaakt
              </h1>
              <p className="text-[var(--color-muted)] text-sm mb-8 leading-relaxed">
                Je bent al bezig met de stijlquiz. Ga verder waar je gebleven was.
              </p>
              <button
                onClick={() => navigate("/onboarding")}
                className="inline-flex items-center justify-center gap-2 w-full px-7 py-4 min-h-[54px] text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity active:scale-[0.98] mb-3"
                style={{ background: "var(--ff-color-primary-700)" }}
              >
                Verder gaan met quiz <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => navigate("/onboarding?step=redo")}
                className="inline-flex items-center justify-center gap-2 w-full px-7 py-3 min-h-[48px] rounded-2xl font-semibold text-sm transition-all border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] text-[var(--color-muted)]"
              >
                Opnieuw beginnen
              </button>
            </>
          ) : (
            <>
              <h1 className="font-heading text-2xl font-bold text-[var(--color-text)] mb-3 tracking-tight">
                Nog geen stijlprofiel
              </h1>
              <p className="text-[var(--color-muted)] text-sm mb-8 leading-relaxed">
                Doe de quiz en ontdek jouw archetype, kleurpalet en gepersonaliseerde outfits.
              </p>
              <button
                onClick={() => navigate("/onboarding")}
                className="inline-flex items-center justify-center gap-2 w-full px-7 py-4 min-h-[54px] text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity active:scale-[0.98]"
                style={{ background: "var(--ff-color-primary-700)" }}
              >
                Start de stijlquiz <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--color-bg)" }}>
      <Helmet>
        <title>Dashboard – FitFi</title>
        <meta name="description" content="Jouw persoonlijke stijldashboard met outfits, kleurprofiel en stijladvies." />
        <meta property="og:title" content="Dashboard – FitFi" />
        <meta property="og:description" content="Jouw persoonlijke stijldashboard." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* ══ MAIN CONTENT — wide bento grid ══ */}
      <section className="pt-8 pb-16">
        <div className="ff-container">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-6 lg:gap-8 xl:gap-10 items-start">

            {/* ══ LEFT — main column ══ */}
            <div className="space-y-5">

              {/* Profile card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.04 }}
                className="bg-white border border-[#E5E5E5] rounded-2xl p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-[#F5F0EB] flex items-center justify-center text-xl font-semibold text-[#C2654A] flex-shrink-0 select-none">
                    {userInitial}
                  </div>

                  {/* Name + archetype */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#8A8A8A] mb-0.5">{greeting}</p>
                    <h2 className="text-xl font-semibold text-[#1A1A1A] leading-tight truncate">
                      {userName || "Welkom terug"}
                    </h2>
                    <p className="text-sm text-[#4A4A4A] mt-0.5">
                      {archetypeName ?? "Stijlprofiel nog niet bepaald"}
                      {season && <span className="text-[#8A8A8A]"> · {season}</span>}
                    </p>
                    {isPremium && (
                      <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-[#F4E8E3] text-[#C2654A] text-xs font-semibold">
                        {isFounder ? <Star className="w-3 h-3" aria-hidden="true" /> : <Crown className="w-3 h-3" aria-hidden="true" />}
                        {isFounder ? "Founder" : "Premium"}
                      </span>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-0.5 sm:text-right">
                    <p className="text-2xl font-bold text-[#C2654A] leading-none">{donePct}%</p>
                    <p className="text-xs text-[#8A8A8A]">profiel voltooid</p>
                  </div>
                </div>
              </motion.div>

              {/* Outfit categorie-sectie */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.10 }}
                className="mt-8 mb-8"
              >
                {/* Sectie-header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1A1A1A]">Jouw outfits</h3>
                    <p className="text-sm text-[#8A8A8A] mt-0.5">Op maat voor {archetypeName ?? "jou"}</p>
                  </div>
                  <button
                    onClick={() => navigate("/results")}
                    className="text-sm font-medium text-[#C2654A] hover:text-[#A8513A] transition-colors duration-200 underline underline-offset-4"
                  >
                    Bekijk alles
                  </button>
                </div>

                {outfitsData && outfitsData.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide lg:grid lg:grid-cols-5 lg:overflow-visible">
                    {outfitsData.slice(0, 5).map((outfit, i) => {
                      const imgs = getOutfitImages(outfit);
                      const label = (outfit as any)?.occasion || (outfit as any)?.tags?.[0] || (outfit as any)?.name || `Look ${i + 1}`;
                      const outfitCount = (outfit as any)?.products?.length ?? 0;
                      const coverImg = imgs[0] ?? null;
                      return (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.32, delay: 0.12 + i * 0.055 }}
                          onClick={() => navigate("/results")}
                          aria-label={`Bekijk outfit: ${label}`}
                          className="flex-shrink-0 w-40 lg:w-auto group text-left"
                        >
                          <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden hover:shadow-md hover:border-[#C2654A] transition-all duration-200">
                            <div className="aspect-[3/4] w-full overflow-hidden bg-[#F5F0EB]">
                              {coverImg ? (
                                <img
                                  src={coverImg}
                                  alt={label}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Sparkles className="w-6 h-6 text-[#C2654A] opacity-40" aria-hidden="true" />
                                </div>
                              )}
                            </div>
                            <div className="p-3 text-center">
                              <p className="text-sm font-medium text-[#1A1A1A] truncate">{label}</p>
                              <p className="text-xs text-[#8A8A8A] mt-0.5">
                                {outfitCount > 0 ? `${outfitCount} items` : "Bekijk outfit"}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-10 text-center">
                    <Sparkles className="w-7 h-7 text-[#C2654A] opacity-30 mb-3" aria-hidden="true" />
                    <p className="text-sm text-[#8A8A8A] mb-4 leading-relaxed">
                      Outfits worden samengesteld op basis van jouw profiel
                    </p>
                    <button
                      onClick={() => navigate("/results")}
                      className="text-sm font-medium text-[#C2654A] hover:text-[#A8513A] transition-colors duration-200 underline underline-offset-4"
                    >
                      Genereer nu
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Quick action bento cards */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.16 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 mb-8"
              >
                {/* Opgeslagen */}
                <button
                  onClick={() => navigate("/results#saved")}
                  className="bg-white border border-[#E5E5E5] rounded-2xl p-5 hover:shadow-md hover:border-[#C2654A] transition-all duration-200 group text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F5F0EB] flex items-center justify-center mb-3">
                    <Heart className="w-5 h-5 text-[#C2654A]" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#C2654A] transition-colors duration-200">
                    Opgeslagen
                  </h3>
                  <p className="text-xs text-[#8A8A8A] mt-1">
                    {favCount > 0 ? `${favCount} outfits` : "Nog geen outfits"}
                  </p>
                </button>

                {/* Foto */}
                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="bg-white border border-[#E5E5E5] rounded-2xl p-5 hover:shadow-md hover:border-[#C2654A] transition-all duration-200 group text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F5F0EB] flex items-center justify-center mb-3">
                    <Camera className="w-5 h-5 text-[#C2654A]" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#C2654A] transition-colors duration-200">
                    Foto
                  </h3>
                  <p className="text-xs text-[#8A8A8A] mt-1">
                    {hasPhoto ? "Toegevoegd" : "Toevoegen voor kleuranalyse"}
                  </p>
                </button>

                {/* Profiel */}
                <button
                  onClick={() => navigate("/profile")}
                  className="bg-white border border-[#E5E5E5] rounded-2xl p-5 hover:shadow-md hover:border-[#C2654A] transition-all duration-200 group text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F5F0EB] flex items-center justify-center mb-3">
                    <User className="w-5 h-5 text-[#C2654A]" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#C2654A] transition-colors duration-200">
                    Profiel
                  </h3>
                  <p className="text-xs text-[#8A8A8A] mt-1">
                    {donePct}% compleet
                  </p>
                </button>

                {/* Winkel */}
                <button
                  onClick={() => navigate("/shop")}
                  className="bg-white border border-[#E5E5E5] rounded-2xl p-5 hover:shadow-md hover:border-[#C2654A] transition-all duration-200 group text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F5F0EB] flex items-center justify-center mb-3">
                    <ShoppingBag className="w-5 h-5 text-[#C2654A]" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#C2654A] transition-colors duration-200">
                    Winkel
                  </h3>
                  <p className="text-xs text-[#8A8A8A] mt-1">
                    Jouw stijl, direct shoppen
                  </p>
                </button>
              </motion.div>

            </div>{/* end left column */}

            {/* ══ RIGHT — sidebar panels ══ */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-6">

              {/* Profile completion checklist */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.12 }}
                className="bg-white border border-[#E5E5E5] rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-[#8A8A8A] uppercase tracking-wide">Profiel</p>
                    <p className="text-base font-semibold text-[#1A1A1A] mt-1">{donePct}% compleet</p>
                  </div>
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
                      <circle cx="24" cy="24" r="19" fill="none" stroke="#E5E5E5" strokeWidth="4" />
                      <motion.circle
                        cx="24" cy="24" r="19" fill="none"
                        stroke="#C2654A" strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 19}
                        initial={{ strokeDashoffset: 2 * Math.PI * 19 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 19 * (1 - donePct / 100) }}
                        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-[#C2654A]">{donePct}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.done
                          ? "bg-[#3D8B5E]"
                          : "border-2 border-[#E5E5E5]"
                      }`}>
                        {step.done && <Check className="w-3 h-3 text-white" aria-hidden="true" />}
                      </div>
                      <span className={`text-sm leading-tight ${step.done ? "text-[#1A1A1A]" : "text-[#8A8A8A]"}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Upgrade card (non-premium only) */}
              {!isPremium && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.38, delay: 0.18 }}
                >
                  <Link
                    to="/prijzen"
                    className="group flex flex-col p-5 rounded-2xl bg-[#C2654A]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Upgrade</p>
                    <h4 className="text-base font-semibold text-white mt-1">Ontgrendel Premium</h4>
                    <p className="text-sm text-white/80 mt-1">50+ outfits · AI kleuranalyse · persoonlijk advies</p>
                    <span className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-white hover:text-white/90 transition-colors duration-200">
                      Bekijk opties
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </Link>
                </motion.div>
              )}

              {/* Quick links */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.22 }}
                className="bg-white border border-[#E5E5E5] rounded-2xl p-5"
              >
                <p className="text-xs font-semibold text-[#8A8A8A] uppercase tracking-wide mb-4">Snelkoppelingen</p>
                <div className="space-y-1">
                  {[
                    { Icon: Sparkles, label: "Stijlresultaten", sub: "Jouw outfits & advies", to: "/results" },
                    { Icon: RefreshCw, label: "Quiz herdoen", sub: "Profiel bijwerken", to: "/onboarding" },
                    { Icon: User, label: "Profiel", sub: "Instellingen & data", to: "/profile" },
                    { Icon: ShoppingBag, label: "Winkel", sub: "Gepersonaliseerde shop", to: "/shop" },
                  ].map(({ Icon, label, sub, to }) => (
                    <button
                      key={label}
                      onClick={() => navigate(to)}
                      className="w-full flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-[#F5F0EB] transition-colors duration-200 group text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#F5F0EB] group-hover:bg-[#E5E5E5] flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                        <Icon className="w-4 h-4 text-[#C2654A]" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A1A1A] leading-tight">{label}</p>
                        <p className="text-xs text-[#8A8A8A] mt-0.5">{sub}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8A8A8A] group-hover:text-[#C2654A] transition-colors duration-200 flex-shrink-0" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Style tips card */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.28 }}
                className="bg-[#F5F0EB] rounded-2xl p-5"
              >
                <p className="text-xs font-semibold text-[#8A8A8A] uppercase tracking-wide">Stijl tip</p>
                <h4 className="text-base font-semibold text-[#1A1A1A] mt-2">
                  {archetypeName ? `Als ${archetypeName}` : "Jouw stijl"}
                </h4>
                <p className="text-sm text-[#4A4A4A] mt-1">{tone || tagline}</p>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => navigate("/results")}
                    className="flex-1 text-center py-2 px-3 bg-white border border-[#E5E5E5] rounded-xl text-sm font-medium text-[#1A1A1A] hover:border-[#C2654A] transition-colors duration-200"
                  >
                    Outfits zien
                  </button>
                  <button
                    onClick={() => navigate("/shop")}
                    className="flex-1 text-center py-2 px-3 bg-white border border-[#E5E5E5] rounded-xl text-sm font-medium text-[#1A1A1A] hover:border-[#C2654A] transition-colors duration-200"
                  >
                    Shoppen
                  </button>
                </div>
              </motion.div>

            </div>{/* end right column */}
          </div>
        </div>
      </section>

      <PhotoUploadModal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)} />
    </div>
  );
}
