import React from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, Camera, Check, ChevronRight,
  Eye, FileText, Heart, RefreshCw, ShoppingBag,
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

  const { color, archetype, gender, hasReport, hasPhoto, reportDate } = React.useMemo(() => {
    const c = readJson<ColorProfile>(LS_KEYS.COLOR_PROFILE);
    const a = readJson<Archetype>(LS_KEYS.ARCHETYPE);
    const ans = readJson<{ photoUrl?: string; gender?: string }>(LS_KEYS.QUIZ_ANSWERS);
    const ts = localStorage.getItem(LS_KEYS.RESULTS_TS);
    return {
      color: c,
      archetype: a,
      gender: ans?.gender ?? undefined,
      hasReport: !!(a || c),
      hasPhoto: !!(ans?.photoUrl),
      reportDate: formatDate(ts),
    };
  }, []);

  const { data: outfitsData } = useOutfits({ archetype: archetype?.name, gender: gender as any, limit: 6, enabled: hasReport });

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
        className="flex items-center justify-center px-6 bg-[#FAFAF8]"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        <Helmet><title>Dashboard – FitFi</title></Helmet>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-sm w-full text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#F4E8E3] flex items-center justify-center mx-auto mb-7">
            <Sparkles className="w-7 h-7 text-[#C2654A]" aria-hidden="true" />
          </div>
          {hasQuizInProgress ? (
            <>
              <h1 className="text-2xl font-bold text-[#1A1A1A] mb-3 tracking-tight">
                Quiz niet afgemaakt
              </h1>
              <p className="text-[#8A8A8A] text-sm mb-8 leading-relaxed">
                Je bent al bezig met de stijlquiz. Ga verder waar je gebleven was.
              </p>
              <button
                onClick={() => navigate("/onboarding")}
                className="inline-flex items-center justify-center gap-2 w-full px-7 py-4 min-h-[54px] text-white rounded-full font-bold text-sm bg-[#C2654A] hover:bg-[#A8513A] transition-colors active:scale-[0.98] mb-3"
              >
                Verder gaan met quiz <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => navigate("/onboarding?step=redo")}
                className="inline-flex items-center justify-center gap-2 w-full px-7 py-3 min-h-[48px] rounded-full font-semibold text-sm transition-all border border-[#E5E5E5] hover:border-[#C2654A] text-[#4A4A4A] hover:text-[#C2654A]"
              >
                Opnieuw beginnen
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[#1A1A1A] mb-3 tracking-tight">
                Nog geen stijlprofiel
              </h1>
              <p className="text-[#8A8A8A] text-sm mb-8 leading-relaxed">
                Doe de quiz en ontdek jouw archetype, kleurpalet en gepersonaliseerde outfits.
              </p>
              <button
                onClick={() => navigate("/onboarding")}
                className="inline-flex items-center justify-center gap-2 w-full px-7 py-4 min-h-[54px] text-white rounded-full font-bold text-sm bg-[#C2654A] hover:bg-[#A8513A] transition-colors active:scale-[0.98]"
              >
                Start de stijlquiz <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  const progressRadius = 19;
  const progressCircumference = 2 * Math.PI * progressRadius;

  return (
    <div className="bg-[#FAFAF8] min-h-screen pt-24 md:pt-28 pb-16">
      <Helmet>
        <title>Dashboard – FitFi</title>
        <meta name="description" content="Jouw persoonlijke stijldashboard met outfits, kleurprofiel en stijladvies." />
        <meta property="og:title" content="Dashboard – FitFi" />
        <meta property="og:description" content="Jouw persoonlijke stijldashboard." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-[1320px] mx-auto px-6 md:px-10">

        {/* ══ 1. WELCOME HERO ══ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative rounded-[28px] overflow-hidden min-h-[280px] flex items-end mb-8"
        >
          {/* Background image */}
          <img
            src="/hero/hero-style-report-lg.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              // Hide image and let gradient show through
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          {/* Fallback gradient (visible if image fails) */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4C5B5] via-[#C0AA95] to-[#8B7B6B] -z-10" />

          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to right, rgba(26,26,26,0.55) 0%, rgba(26,26,26,0.2) 50%, transparent 80%), linear-gradient(to top, rgba(26,26,26,0.4) 0%, transparent 50%)",
            }}
          />

          {/* Content */}
          <div className="relative z-10 w-full p-10 md:p-12 flex flex-col md:flex-row items-end justify-between gap-6">
            {/* Left side */}
            <div>
              <p className="text-[13px] font-medium text-white/60 mb-2">{greeting}</p>
              <h1 className="font-serif italic text-[28px] md:text-[40px] text-white leading-[1.1] mb-2">
                Welkom terug, {userName || "daar"}
              </h1>
              <div className="flex items-center gap-3">
                <p className="text-sm text-white/70">
                  {archetypeName ?? "Stijlprofiel"}
                  {season && ` · ${season}`}
                </p>
                {isPremium && (
                  <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-semibold text-white/90">
                    {isFounder ? <Star className="w-3 h-3" aria-hidden="true" /> : <Crown className="w-3 h-3" aria-hidden="true" />}
                    {isFounder ? "Founder" : "Premium"}
                  </span>
                )}
              </div>
            </div>

            {/* Right side — CTA buttons */}
            <div className="flex gap-3 flex-shrink-0 w-full md:w-auto">
              <button
                onClick={() => navigate("/results")}
                className="inline-flex items-center justify-center gap-2 bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-sm py-3.5 px-7 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(194,101,74,0.25)] flex-1 md:flex-none"
              >
                <Eye className="w-4 h-4" aria-hidden="true" />
                Bekijk je resultaten
              </button>
              <button
                onClick={() => navigate("/shop")}
                className="inline-flex items-center justify-center gap-2 bg-white/12 backdrop-blur-sm text-white font-semibold text-sm py-3.5 px-7 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200 flex-1 md:flex-none"
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                Shop outfits
              </button>
            </div>
          </div>
        </motion.div>

        {/* ══ MAIN GRID ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

          {/* ══ LEFT — main column ══ */}
          <div>

            {/* ══ 2. OUTFIT CATEGORIEËN ══ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {/* Section header */}
              <div className="flex items-baseline justify-between mb-6">
                <div className="flex items-baseline">
                  <h2 className="text-xl font-bold text-[#1A1A1A]">Jouw outfits</h2>
                  <span className="text-sm text-[#8A8A8A] ml-2">Op maat voor {archetypeName ?? "jou"}</span>
                </div>
                <button
                  onClick={() => navigate("/results")}
                  className="text-[13px] font-semibold text-[#C2654A] hover:text-[#A8513A] inline-flex items-center gap-1.5 transition-colors duration-200"
                >
                  Bekijk alles
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              {outfitsData && outfitsData.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {outfitsData.slice(0, 5).map((outfit, i) => {
                    const imgs = getOutfitImages(outfit);
                    const label = (outfit as any)?.occasion || (outfit as any)?.tags?.[0] || (outfit as any)?.name || `Look ${i + 1}`;
                    const occasionTag = ((outfit as any)?.tags?.[0] || (outfit as any)?.occasion || label || "").toLowerCase();
                    const outfitCount = (outfit as any)?.products?.length ?? 0;
                    const coverImg = imgs[0] ?? null;
                    return (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 + i * 0.06 }}
                        onClick={() => navigate(`/results?occasion=${encodeURIComponent(occasionTag)}`)}
                        aria-label={`Bekijk outfit: ${label}`}
                        className="group text-left"
                      >
                        <div className="bg-white border border-[#E5E5E5] rounded-[20px] overflow-hidden cursor-pointer transition-all duration-300 hover:border-[#C2654A] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
                          <div className="aspect-[3/4] overflow-hidden bg-[#F5F0EB]">
                            {coverImg ? (
                              <img
                                src={coverImg}
                                alt={label}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-[#C2654A] opacity-40" aria-hidden="true" />
                              </div>
                            )}
                          </div>
                          <div className="p-4 text-center">
                            <p className="text-sm font-semibold text-[#1A1A1A] capitalize truncate">{label}</p>
                            <p className="text-xs text-[#8A8A8A] mt-1">
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
                    className="text-sm font-semibold text-[#C2654A] hover:text-[#A8513A] inline-flex items-center gap-1.5 transition-colors duration-200"
                  >
                    Genereer nu
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </motion.div>

            {/* ══ 3. QUICK ACTION CARDS ══ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { Icon: Heart, label: "Opgeslagen", sub: favCount > 0 ? `${favCount} outfits` : "Nog geen outfits", onClick: () => navigate("/results#saved") },
                { Icon: Camera, label: "Foto", sub: hasPhoto ? "Toegevoegd" : "Toevoegen voor kleuranalyse", onClick: () => setShowPhotoModal(true) },
                { Icon: User, label: "Profiel", sub: `${donePct}% compleet`, onClick: () => navigate("/profile") },
                { Icon: ShoppingBag, label: "Winkel", sub: "Jouw stijl, direct shoppen", onClick: () => navigate("/shop") },
              ].map(({ Icon, label, sub, onClick }, i) => (
                <motion.button
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.06 }}
                  onClick={onClick}
                  className="bg-white border border-[#E5E5E5] rounded-[20px] p-7 cursor-pointer group relative overflow-hidden transition-all duration-300 hover:border-[#C2654A] hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] text-left"
                >
                  <div className="w-12 h-12 rounded-[14px] bg-[#F5F0EB] group-hover:bg-[#F4E8E3] flex items-center justify-center mb-4 transition-colors duration-200">
                    <Icon className="w-[22px] h-[22px] text-[#C2654A]" aria-hidden="true" />
                  </div>
                  <ChevronRight className="absolute top-6 right-5 w-4 h-4 text-[#E5E5E5] group-hover:text-[#C2654A] transition-colors duration-200" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-[#1A1A1A]">{label}</h3>
                  <p className="text-xs text-[#8A8A8A] mt-1">{sub}</p>
                </motion.button>
              ))}
            </div>

          </div>{/* end left column */}

          {/* ══ RIGHT — sidebar panels ══ */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-24">

            {/* ══ 4. SIDEBAR — Profiel completie ══ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white border border-[#E5E5E5] rounded-[20px] p-7"
            >
              <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#8A8A8A] mb-4">Profiel</p>

              <div className="flex items-center justify-between mb-4">
                <p className="text-base font-bold text-[#1A1A1A]">{donePct}% compleet</p>
                <div className="relative w-12 h-12 flex-shrink-0">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
                    <circle cx="24" cy="24" r={progressRadius} fill="none" stroke="#E5E5E5" strokeWidth="4" />
                    <motion.circle
                      cx="24" cy="24" r={progressRadius} fill="none"
                      stroke="#C2654A" strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={progressCircumference}
                      initial={{ strokeDashoffset: progressCircumference }}
                      animate={{ strokeDashoffset: progressCircumference * (1 - donePct / 100) }}
                      transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-[#C2654A]">{donePct}%</span>
                  </div>
                </div>
              </div>

              <div>
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 border-b border-[#E5E5E5]/50 last:border-none">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.done
                        ? "bg-[#F4E8E3]"
                        : "border-2 border-[#E5E5E5]"
                    }`}>
                      {step.done && <Check className="w-3.5 h-3.5 text-[#C2654A]" aria-hidden="true" />}
                    </div>
                    <span className={`text-[13px] leading-tight ${step.done ? "text-[#1A1A1A]" : "text-[#8A8A8A]"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Upgrade card (non-premium only) */}
            {!isPremium && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.28 }}
              >
                <Link
                  to="/prijzen"
                  className="group flex flex-col p-7 rounded-[20px] bg-[#C2654A]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[1.5px] text-white/70">Upgrade</p>
                  <h4 className="text-base font-bold text-white mt-1">Ontgrendel Premium</h4>
                  <p className="text-sm text-white/80 mt-1">50+ outfits · AI kleuranalyse · persoonlijk advies</p>
                  <span className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-white hover:text-white/90 transition-colors duration-200">
                    Bekijk opties
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </span>
                </Link>
              </motion.div>
            )}

            {/* ══ 5. SIDEBAR — Snelkoppelingen ══ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.36 }}
              className="bg-white border border-[#E5E5E5] rounded-[20px] p-7"
            >
              <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#8A8A8A] mb-4">Snelkoppelingen</p>
              <div>
                {[
                  { Icon: FileText, label: "Stijlresultaten", sub: "Jouw outfits & advies", to: "/results" },
                  { Icon: RefreshCw, label: "Quiz herdoen", sub: "Profiel bijwerken", to: "/onboarding" },
                  { Icon: User, label: "Profiel", sub: "Instellingen & data", to: "/profile" },
                  { Icon: ShoppingBag, label: "Winkel", sub: "Gepersonaliseerde shop", to: "/shop" },
                ].map(({ Icon, label, sub, to }) => (
                  <button
                    key={label}
                    onClick={() => navigate(to)}
                    className="w-full flex items-center gap-3 py-3.5 border-b border-[#E5E5E5]/50 last:border-none cursor-pointer group -mx-2 px-2 rounded-xl hover:bg-[#FAFAF8] transition-colors duration-150 text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#F5F0EB] group-hover:bg-[#F4E8E3] flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                      <Icon className="w-4 h-4 text-[#C2654A]" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1A1A1A] leading-tight">{label}</p>
                      <p className="text-[11px] text-[#8A8A8A]">{sub}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#E5E5E5] group-hover:text-[#C2654A] transition-colors duration-200 flex-shrink-0 ml-auto" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* ══ 6. SIDEBAR — Stijl tip ══ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.44 }}
              className="bg-[#F5F0EB] border border-[#E5E5E5] rounded-[20px] p-7"
            >
              <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#C2654A] mb-3">Stijl tip</p>
              <h4 className="text-[15px] font-bold text-[#1A1A1A] mb-2">
                {archetypeName ? `Als ${archetypeName}` : "Jouw stijl"}
              </h4>
              <p className="text-[13px] text-[#4A4A4A] leading-[1.6] mb-5">{tone || tagline}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/results")}
                  className="flex-1 py-2.5 rounded-full border border-[#E5E5E5] bg-white text-[13px] font-semibold text-[#1A1A1A] text-center hover:border-[#C2654A] hover:text-[#C2654A] transition-all duration-200 cursor-pointer"
                >
                  Outfits zien
                </button>
                <button
                  onClick={() => navigate("/shop")}
                  className="flex-1 py-2.5 rounded-full border border-[#E5E5E5] bg-white text-[13px] font-semibold text-[#1A1A1A] text-center hover:border-[#C2654A] hover:text-[#C2654A] transition-all duration-200 cursor-pointer"
                >
                  Shoppen
                </button>
              </div>
            </motion.div>

          </div>{/* end right column */}
        </div>
      </div>

      <PhotoUploadModal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)} />
    </div>
  );
}
