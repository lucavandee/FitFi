import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Sparkles, Heart, Camera, ArrowRight, Plus, Lock, FileText,
  RefreshCw, Settings, ChevronRight, Star, Check
} from "lucide-react";
import { LS_KEYS, ColorProfile, Archetype } from "@/lib/quiz/types";
import { supabase } from "@/lib/supabaseClient";
import { useOutfits } from "@/hooks/useOutfits";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";

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
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user: ctxUser } = useUser();
  const [userName, setUserName] = React.useState<string>("");
  const [userEmail, setUserEmail] = React.useState<string>("");
  const [favCount, setFavCount] = React.useState(0);

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
      setUserEmail(email);
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
    if (!archetype) return null;
    if (typeof archetype === "string") return archetype;
    if (archetype && "name" in archetype) return archetype.name;
    return null;
  }, [archetype]);

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
                <div className="w-16 h-16 rounded-2xl bg-[var(--ff-color-primary-700)] flex items-center justify-center mx-auto mb-8">
                  <Sparkles className="w-8 h-8 text-white" />
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
                  <Sparkles className="w-5 h-5" />
                  Start gratis stijlquiz
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

      <div className="ff-container py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Greeting row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-[var(--color-muted)]">{greeting}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tracking-tight">
                {userName || "Welkom terug"}
              </h1>
              <p className="text-sm text-[var(--color-muted)] mt-0.5">
                Welkom terug. Dit is je laatste stijlrapport.
              </p>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--ff-color-primary-400)] transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </button>
          </motion.div>

          {/* PRIMARY CARD — Last report */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <div className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
              {/* Subtle top accent */}
              <div className="h-1 w-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)]" />

              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-[var(--ff-color-primary-600)]" />
                      <span className="text-xs font-bold uppercase tracking-widest text-[var(--ff-color-primary-600)]">
                        Laatste rapport
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] tracking-tight">
                      {archetypeName || "Stijlprofiel"}
                    </h2>
                    {reportDate && (
                      <p className="text-sm text-[var(--color-muted)] mt-1">
                        Aangemaakt op {reportDate}
                      </p>
                    )}
                  </div>

                  {/* Membership badge */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                    isPremium
                      ? "bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]"
                      : "bg-[var(--ff-color-neutral-100)] text-[var(--color-muted)]"
                  }`}>
                    {isPremium ? <Star className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    {isPremium ? "Premium" : "Gratis"}
                  </div>
                </div>

                {/* Report summary row */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {color?.season && (
                    <span className="px-3 py-1 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text)] font-medium capitalize">
                      {color.season}
                    </span>
                  )}
                  {color?.temperature && (
                    <span className="px-3 py-1 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text)] font-medium capitalize">
                      {color.temperature}
                    </span>
                  )}
                  {outfitsData && outfitsData.length > 0 && (
                    <span className="px-3 py-1 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text)] font-medium">
                      {outfitsData.length} outfits
                    </span>
                  )}
                  {hasPhoto && (
                    <span className="px-3 py-1 rounded-full bg-[var(--ff-color-success-50)] border border-[var(--ff-color-success-200)] text-sm text-[var(--ff-color-success-700)] font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Foto-analyse
                    </span>
                  )}
                </div>

                {/* CTA row */}
                <p className="text-xs text-[var(--color-muted)] mb-3">Ga verder waar je gebleven bent.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate("/results")}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--ff-color-primary-700)] text-white rounded-xl font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors shadow-md flex-1 sm:flex-none"
                  >
                    Open mijn rapport
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate("/onboarding")}
                    title="Pas je antwoorden aan om een nieuw rapport te genereren"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent border border-[var(--color-border)] text-[var(--color-text)] rounded-xl font-semibold hover:border-[var(--ff-color-primary-400)] hover:bg-[var(--color-bg)] transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Maak nieuw rapport
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Saved looks + photo quick action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* Saved looks */}
            <button
              onClick={() => navigate("/results#saved")}
              className="group flex items-center justify-between p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--ff-color-primary-400)] transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--ff-color-primary-50)] flex items-center justify-center">
                  <Heart className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-text)]">Bekijk opgeslagen outfits</p>
                  <p className="text-sm text-[var(--color-muted)]">
                    {favCount > 0 ? `${favCount} looks bewaard` : "Je opgeslagen looks staan hier"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--color-muted)] group-hover:text-[var(--ff-color-primary-600)] transition-colors" />
            </button>

            {/* Photo analysis CTA */}
            <button
              onClick={() => navigate("/onboarding?step=photo")}
              className="group flex items-center justify-between p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--ff-color-primary-400)] transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--ff-color-primary-50)] flex items-center justify-center">
                  <Camera className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-text)]">
                    {hasPhoto ? "Foto bijwerken" : "Foto toevoegen"}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    {hasPhoto ? "Verfijn je kleuranalyse" : "Voor persoonlijk kleuradvies"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--color-muted)] group-hover:text-[var(--ff-color-primary-600)] transition-colors" />
            </button>
          </motion.div>

          {/* Premium status / upgrade card */}
          {!isPremium && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-[var(--color-muted)]" />
                      <span className="text-sm font-semibold text-[var(--color-text)]">Gratis account</span>
                    </div>
                    <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
                      Premium geeft je extra kleur- en shopadvies. De modules hieronder zijn vergrendeld.
                    </p>
                    <ul className="space-y-1.5 mb-4">
                      {[
                        "Volledige kleuranalyse op huidondertoon",
                        "Shopping cheat sheet per kleur",
                        "Uitgebreide outfit-bibliotheek",
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                          <Lock className="w-3.5 h-3.5 text-[var(--color-muted)] opacity-60 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <NavLink
                      to="/prijzen"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--ff-color-primary-700)] text-white rounded-lg text-sm font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors"
                    >
                      <Star className="w-4 h-4" />
                      Upgrade
                    </NavLink>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Recent outfit preview */}
          {outfitsData && outfitsData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-[var(--color-text)]">
                  Jouw outfits
                </h2>
                <button
                  onClick={() => navigate("/results")}
                  className="text-sm font-semibold text-[var(--ff-color-primary-600)] hover:text-[var(--ff-color-primary-700)] transition-colors flex items-center gap-1"
                >
                  Bekijk alles
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {outfitsData.slice(0, 4).map((outfit, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.25 + i * 0.04 }}
                    onClick={() => navigate("/results")}
                    className="aspect-[3/4] rounded-xl overflow-hidden bg-[var(--ff-color-neutral-100)] hover:opacity-90 transition-opacity"
                  >
                    {outfit.image ? (
                      <img
                        src={outfit.image}
                        alt={`Outfit ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-[var(--color-muted)]" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* FAB — new report */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        onClick={() => navigate("/onboarding")}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--ff-color-primary-700)] text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all flex items-center justify-center z-50"
        aria-label="Nieuw stijlrapport starten"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </motion.button>
    </main>
  );
}
