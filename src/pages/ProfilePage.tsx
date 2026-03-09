import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  User, Mail, LogOut, Camera, Trash2, ChevronRight, Check,
  CircleAlert as AlertCircle, Sparkles, RefreshCw, Crown, Star,
  Lock, Shield, Palette, ArrowRight, Bell, ShoppingBag,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { LS_KEYS, ColorProfile, Archetype } from "@/lib/quiz/types";
import { QuizResetModal } from "@/components/profile/QuizResetModal";
import { EmailPreferences } from "@/components/profile/EmailPreferences";
import { CookieSettings } from "@/components/profile/CookieSettings";
import SavedOutfitHistory from "@/components/profile/SavedOutfitHistory";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch { return null; }
}

const SEASON_LABELS: Record<string, string> = {
  lente: "Lente", zomer: "Zomer", herfst: "Herfst", winter: "Winter",
  spring: "Lente", summer: "Zomer", autumn: "Herfst", fall: "Herfst",
};

function RowItem({
  label, sub, icon, onClick, danger = false, rightEl,
}: {
  label: string;
  sub?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  rightEl?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`w-full flex items-center gap-3.5 px-4 py-3.5 min-h-[44px] transition-colors text-left group
        ${onClick ? "hover:bg-[var(--color-bg)] active:bg-[var(--ff-color-primary-25)]" : "cursor-default"}
        ${danger ? "hover:bg-[var(--ff-color-danger-50,#fef2f2)]" : ""}
      `}
    >
      {icon && (
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
          danger
            ? "bg-[var(--ff-color-danger-50,#fef2f2)] text-[var(--ff-color-danger-400,#f87171)]"
            : "bg-[var(--ff-color-primary-50)] text-[var(--ff-color-primary-500)]"
        }`}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-tight ${danger ? "text-[var(--ff-color-danger-500,#ef4444)]" : "text-[var(--color-text)]"}`}>
          {label}
        </p>
        {sub && <p className="text-[11px] text-[var(--color-muted)] mt-0.5 leading-snug">{sub}</p>}
      </div>
      {rightEl ?? (
        onClick && !danger ? (
          <ChevronRight className="w-4 h-4 text-[var(--color-muted)] group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
        ) : null
      )}
    </button>
  );
}

function SectionCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay }}
      className="rounded-2xl bg-[var(--color-surface)] overflow-hidden divide-y divide-[var(--color-border)]"
      style={{ boxShadow: "0 1px 4px rgba(30,35,51,0.06), 0 2px 10px rgba(30,35,51,0.04)" }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="pt-1 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)]">
      {children}
    </p>
  );
}

const ProfilePage: React.FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showResetModal, setShowResetModal] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [displayNameDirty, setDisplayNameDirty] = useState(false);
  const [displayNameError, setDisplayNameError] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const color = readJson<ColorProfile>(LS_KEYS.COLOR_PROFILE);
  const archetype = readJson<Archetype>(LS_KEYS.ARCHETYPE);
  const answers = readJson<any>(LS_KEYS.QUIZ_ANSWERS);

  const isPremium = user?.tier === "premium" || user?.tier === "founder" || !!user?.isPremium;
  const isFounder = user?.tier === "founder";

  useEffect(() => {
    if (user?.email) {
      const name = user.email.split("@")[0];
      setDisplayName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, [user]);

  useEffect(() => {
    if (answers?.photoDataUrl) setPhotoPreview(answers.photoDataUrl);
  }, [answers]);

  const { data: styleProfile } = useQuery({
    queryKey: ["styleProfile", user?.id],
    queryFn: async () => {
      const client = supabase();
      if (!client || !user) return null;
      const { data } = await client
        .from("style_profiles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .maybeSingle();
      return data;
    },
    enabled: !!user,
    staleTime: 300000,
  });

  const archetypeName = React.useMemo(() => {
    if (!archetype) return styleProfile?.archetype || null;
    if (typeof archetype === "string") return archetype;
    if (archetype && "name" in (archetype as any)) return (archetype as any).name;
    return archetype;
  }, [archetype, styleProfile]);

  const hasStyleProfile = !!(archetypeName || color);
  const season = color?.season ?? null;
  const seasonLabel = season ? (SEASON_LABELS[season.toLowerCase()] ?? season) : null;

  const userInitial = React.useMemo(() => {
    const n = displayName || user?.email || "?";
    return n[0].toUpperCase();
  }, [displayName, user?.email]);

  const validateDisplayName = (val: string) => {
    if (!val.trim()) return "Naam mag niet leeg zijn";
    if (val.trim().length < 2) return "Naam is te kort";
    if (val.trim().length > 50) return "Naam is te lang";
    return "";
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDisplayName(val);
    setDisplayNameDirty(true);
    setDisplayNameError(validateDisplayName(val));
  };

  const handleSaveName = async () => {
    const err = validateDisplayName(displayName);
    if (err) { setDisplayNameError(err); setDisplayNameDirty(true); return; }
    setIsSavingName(true);
    try {
      const client = supabase();
      if (client && user) {
        await client.auth.updateUser({ data: { display_name: displayName.trim() } });
      }
      toast.success("Naam opgeslagen");
      setDisplayNameDirty(false);
      setIsEditingName(false);
    } catch {
      toast.error("Kon naam niet opslaan.");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCancelName = () => {
    if (user?.email) {
      const name = user.email.split("@")[0];
      setDisplayName(name.charAt(0).toUpperCase() + name.slice(1));
    }
    setDisplayNameDirty(false);
    setDisplayNameError("");
    setIsEditingName(false);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Foto is te groot. Maximaal 5 MB."); return; }
    setIsUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setPhotoPreview(dataUrl);
        const current = readJson<any>(LS_KEYS.QUIZ_ANSWERS) || {};
        localStorage.setItem(LS_KEYS.QUIZ_ANSWERS, JSON.stringify({ ...current, photoDataUrl: dataUrl }));
        toast.success("Foto opgeslagen");
        setIsUploadingPhoto(false);
      };
      reader.onerror = () => { toast.error("Kon foto niet lezen."); setIsUploadingPhoto(false); };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Uploaden mislukt");
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    const current = readJson<any>(LS_KEYS.QUIZ_ANSWERS) || {};
    const { photoDataUrl: _r, ...rest } = current;
    localStorage.setItem(LS_KEYS.QUIZ_ANSWERS, JSON.stringify(rest));
    toast.success("Foto verwijderd");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsSendingReset(true);
    try {
      const client = supabase();
      if (client) {
        await client.auth.resetPasswordForEmail(user.email, {
          redirectTo: `${window.location.origin}/inloggen`,
        });
      }
      toast.success("Reset-link verstuurd");
    } catch {
      toast.error("Kon reset-link niet versturen.");
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleLogout = () => {
    toast.success("Tot snel!");
    setTimeout(() => logout(), 400);
  };

  if (!user) {
    return (
      <div className="bg-[var(--color-bg)] flex items-center justify-center px-6" style={{ minHeight: "calc(100vh - 64px)" }}>
        <Helmet><title>Profiel – FitFi</title></Helmet>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-6">
            <User className="w-7 h-7 text-[var(--color-muted)]" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-[var(--color-text)] mb-3">Log in om je profiel te bekijken</h1>
          <button
            onClick={() => navigate("/inloggen")}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold hover:opacity-90 transition-opacity"
            style={{ background: "var(--ff-color-primary-700)", color: "#fff" }}
          >
            Inloggen
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg)]" style={{ minHeight: "calc(100vh - 64px)" }}>
      <Helmet>
        <title>Profiel – FitFi</title>
        <meta name="description" content="Beheer je persoonlijke gegevens en stijlprofiel." />
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:title" content="Profiel – FitFi" />
        <meta property="og:description" content="Beheer je persoonlijke gegevens en stijlprofiel." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </Helmet>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--ff-color-primary-700)] focus:text-white focus:rounded-lg"
      >
        Spring naar hoofdinhoud
      </a>

      {/* ══ HERO BANNER ══ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, var(--ff-color-primary-900) 0%, var(--ff-color-primary-700) 100%)",
          paddingTop: "clamp(2.5rem, 5vw, 4rem)",
          paddingBottom: "clamp(2.5rem, 5vw, 4rem)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url(/hero/hero-style-report-lg.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            opacity: 0.08,
          }}
        />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="ff-container relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

            {/* Avatar + identity */}
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <div
                  className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center"
                  style={{
                    background: photoPreview ? undefined : "rgba(255,255,255,0.15)",
                    boxShadow: "0 0 0 2px rgba(255,255,255,0.2), 0 8px 24px rgba(0,0,0,0.25)",
                  }}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profielfoto" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-white select-none">{userInitial}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  style={{ minWidth: 44, minHeight: 44, padding: "calc((44px - 28px) / 2)", boxSizing: "content-box" }}
                  aria-label="Foto wijzigen"
                >
                  <Camera className="w-3.5 h-3.5 text-[var(--ff-color-primary-700)]" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap mb-1">
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white leading-tight">{displayName}</h1>
                  {isPremium && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                      style={isFounder
                        ? { background: "rgba(217,119,6,0.25)", color: "var(--ff-color-warning-200,#fde68a)", borderColor: "rgba(217,119,6,0.35)" }
                        : { background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)", borderColor: "rgba(255,255,255,0.22)" }
                      }
                    >
                      {isFounder ? <Star className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
                      {isFounder ? "Founder" : "Premium"}
                    </span>
                  )}
                </div>
                <p className="text-white/50 text-sm">{user.email}</p>
                {hasStyleProfile && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {archetypeName && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/12 border border-white/15 text-[11px] text-white/80 font-semibold">
                        {archetypeName as string}
                      </span>
                    )}
                    {seasonLabel && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/8 border border-white/10 text-[11px] text-white/60 capitalize">
                        {seasonLabel}
                      </span>
                    )}
                    {color?.palette && color.palette.length > 0 && (
                      <div className="flex items-center gap-1 ml-1">
                        {color.palette.slice(0, 6).map((hex: string, i: number) => (
                          <div
                            key={i}
                            role="img"
                            aria-label={`Kleur ${hex}`}
                            className="w-[16px] h-[16px] rounded-full flex-shrink-0 ring-1 ring-white/20"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Hero action buttons */}
            <div className="flex sm:flex-col gap-2 sm:items-end flex-shrink-0">
              <button
                onClick={() => navigate("/results")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.97]"
                style={{
                  background: "rgba(255,255,255,0.96)",
                  color: "var(--ff-color-primary-900)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.22)",
                }}
              >
                <Sparkles className="w-4 h-4" /> Mijn outfits
              </button>
              {!isPremium && (
                <button
                  onClick={() => navigate("/pricing")}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border border-white/20 text-white/85 hover:bg-white/10 transition-colors active:scale-[0.97]"
                  style={{ background: "rgba(255,255,255,0.09)", backdropFilter: "blur(8px)" }}
                >
                  <Crown className="w-4 h-4" /> Upgrade
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ MAIN CONTENT ══ */}
      <section id="main-content" className="ff-section">
        <div className="ff-container">

          {/* Quick-nav chips — mobile only */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 lg:hidden scrollbar-hide -mx-4 px-4">
            {[
              { icon: <Sparkles className="w-3.5 h-3.5" />, label: "Outfits", to: "/results" },
              { icon: <Palette className="w-3.5 h-3.5" />, label: "Quiz", to: "/onboarding" },
              { icon: <ShoppingBag className="w-3.5 h-3.5" />, label: "Winkel", to: "/shop" },
            ].map(({ icon, label, to }) => (
              <button
                key={label}
                onClick={() => navigate(to)}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--ff-color-primary-300)] hover:bg-[var(--ff-color-primary-50)] transition-colors"
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* ── Wide grid: left = settings, right = quick-links + style summary ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-6 lg:gap-10 xl:gap-14 items-start">

            {/* ══ LEFT — all settings sections ══ */}
            <div className="space-y-5">

              {/* Stijlprofiel */}
              {hasStyleProfile && (
                <div>
                  <SectionLabel>Stijlprofiel</SectionLabel>
                  <SectionCard delay={0.04}>
                    <RowItem
                      label={archetypeName ? String(archetypeName) : "Jouw stijl"}
                      sub={[seasonLabel, color?.temperature].filter(Boolean).join(" · ") || "Stijlpersoonlijkheid"}
                      icon={<Sparkles className="w-4 h-4" />}
                      onClick={() => navigate("/results")}
                    />
                    <RowItem
                      label="Quiz opnieuw doen"
                      sub="Pas je stijlprofiel aan"
                      icon={<RefreshCw className="w-4 h-4" />}
                      onClick={() => setShowResetModal(true)}
                    />
                  </SectionCard>
                </div>
              )}

              {/* Opgeslagen outfits */}
              <div>
                <SectionLabel>Opgeslagen outfits</SectionLabel>
                <SavedOutfitHistory userId={user.id} />
              </div>

              {/* Kleuranalyse foto */}
              <div>
                <SectionLabel>Kleuranalyse</SectionLabel>
                <SectionCard delay={0.08}>
                  <div className="px-4 py-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-[var(--ff-color-primary-50)]"
                        style={{ border: "1.5px solid var(--color-border)" }}
                      >
                        {photoPreview ? (
                          <img src={photoPreview} alt="Kleuranalysefoto" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-5 h-5 text-[var(--color-muted)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-text)] leading-tight">
                          {photoPreview ? "Foto actief" : "Foto toevoegen"}
                        </p>
                        <p className="text-[11px] text-[var(--color-muted)] mt-0.5 leading-snug">
                          {photoPreview
                            ? "Kleuranalyse op basis van jouw huidtoon"
                            : "Geeft nauwkeuriger kleuradvies"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingPhoto}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-bold transition-colors hover:opacity-90 disabled:opacity-50"
                          style={{ background: "var(--ff-color-primary-700)" }}
                        >
                          {isUploadingPhoto ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                          {photoPreview ? "Vervang" : "Upload"}
                        </button>
                        {photoPreview && (
                          <button
                            onClick={handleRemovePhoto}
                            className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--ff-color-danger-500)] hover:border-[var(--ff-color-danger-200)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-danger-400)]"
                            aria-label="Foto verwijderen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-[var(--color-muted)] mt-3">Max 5 MB · JPG, PNG of WebP · Privacyveilig, alleen lokaal opgeslagen</p>
                  </div>
                </SectionCard>
              </div>

              {/* Persoonlijke gegevens */}
              <div>
                <SectionLabel>Persoonlijke gegevens</SectionLabel>
                <SectionCard delay={0.12}>
                  <div className="px-4 py-3.5">
                    <AnimatePresence mode="wait">
                      {!isEditingName ? (
                        <motion.div
                          key="name-view"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-3.5"
                        >
                          <div className="w-8 h-8 rounded-xl bg-[var(--ff-color-primary-50)] flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-[var(--ff-color-primary-500)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[var(--color-text)] leading-tight">{displayName}</p>
                            <p className="text-[11px] text-[var(--color-muted)] mt-0.5">Weergavenaam</p>
                          </div>
                          <button
                            onClick={() => setIsEditingName(true)}
                            className="text-xs font-bold px-3 py-2.5 min-h-[44px] rounded-lg hover:bg-[var(--ff-color-primary-50)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)]"
                            style={{ color: "var(--ff-color-primary-600)" }}
                          >
                            Wijzig
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="name-edit"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="space-y-3"
                        >
                          <label htmlFor="display-name" className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wide">
                            Naam
                          </label>
                          <input
                            id="display-name"
                            type="text"
                            value={displayName}
                            onChange={handleNameChange}
                            placeholder="Jouw naam"
                            maxLength={50}
                            autoFocus
                            className={`w-full h-11 px-3.5 rounded-xl border text-[var(--color-text)] bg-[var(--color-bg)] text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-400)] ${
                              displayNameError && displayNameDirty
                                ? "border-[var(--ff-color-danger-400)]"
                                : "border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)]"
                            }`}
                          />
                          {displayNameError && displayNameDirty && (
                            <p className="flex items-center gap-1.5 text-xs text-[var(--ff-color-danger-500)]">
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              {displayNameError}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveName}
                              disabled={isSavingName || !!displayNameError}
                              className="flex-1 inline-flex items-center justify-center gap-2 py-3 min-h-[44px] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)]"
                              style={{ background: "var(--ff-color-primary-700)" }}
                            >
                              {isSavingName ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              Opslaan
                            </button>
                            <button
                              onClick={handleCancelName}
                              className="flex-1 py-3 min-h-[44px] rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-muted)] hover:bg-[var(--color-bg)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)]"
                            >
                              Annuleer
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center gap-3.5 px-4 py-3.5 opacity-60 select-none">
                    <div className="w-8 h-8 rounded-xl bg-[var(--ff-color-primary-50)] flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-[var(--ff-color-primary-500)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text)] truncate leading-tight">{user.email}</p>
                      <p className="text-[11px] text-[var(--color-muted)] mt-0.5">E-mail (niet wijzigbaar)</p>
                    </div>
                  </div>
                </SectionCard>
              </div>

              {/* Notificaties */}
              <div>
                <SectionLabel>Notificaties</SectionLabel>
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.38, delay: 0.16 }}
                  className="rounded-2xl bg-[var(--color-surface)] overflow-hidden"
                  style={{ boxShadow: "0 1px 4px rgba(30,35,51,0.06), 0 2px 10px rgba(30,35,51,0.04)" }}
                >
                  <EmailPreferences />
                </motion.div>
              </div>

              {/* Privacy & account */}
              <div>
                <SectionLabel>Privacy & account</SectionLabel>
                <SectionCard delay={0.20}>
                  <div className="px-4 py-3.5">
                    <div className="flex items-center gap-3.5 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-[var(--ff-color-primary-50)] flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-[var(--ff-color-primary-500)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-text)] leading-tight">Privacy & cookies</p>
                        <p className="text-[11px] text-[var(--color-muted)] mt-0.5">We slaan alleen op wat nodig is</p>
                      </div>
                    </div>
                    <CookieSettings />
                  </div>

                  <AnimatePresence mode="wait">
                    {!showResetConfirm ? (
                      <RowItem
                        key="pw-row"
                        label="Wachtwoord wijzigen"
                        sub={`Reset-link naar ${user.email}`}
                        icon={<Lock className="w-4 h-4" />}
                        onClick={() => setShowResetConfirm(true)}
                      />
                    ) : (
                      <motion.div
                        key="pw-confirm"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="px-4 py-4 bg-[var(--ff-color-primary-25)] border-t border-[var(--ff-color-primary-100)]"
                      >
                        <p className="text-sm font-semibold text-[var(--color-text)] mb-1">Reset-link versturen?</p>
                        <p className="text-xs text-[var(--color-muted)] mb-3 leading-snug">
                          We sturen een link naar <strong>{user.email}</strong>. Je huidige wachtwoord blijft geldig totdat je het wijzigt.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={async () => { await handlePasswordReset(); setShowResetConfirm(false); }}
                            disabled={isSendingReset}
                            className="flex-1 py-3 min-h-[44px] rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)]"
                            style={{ background: "var(--ff-color-primary-700)" }}
                          >
                            {isSendingReset ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            Verstuur link
                          </button>
                          <button
                            onClick={() => setShowResetConfirm(false)}
                            className="flex-1 py-3 min-h-[44px] rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-muted)] hover:bg-[var(--color-bg)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)]"
                          >
                            Annuleer
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <RowItem
                    label="Privacybeleid"
                    sub="Hoe we je data gebruiken"
                    icon={<Shield className="w-4 h-4" />}
                    onClick={() => navigate("/privacy")}
                  />
                </SectionCard>
              </div>

              {/* Uitloggen */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.26 }}
              >
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2.5 py-4 min-h-[44px] rounded-2xl border border-[var(--color-border)] text-[var(--color-muted)] text-sm font-semibold hover:text-[var(--ff-color-danger-500,#ef4444)] hover:border-[var(--ff-color-danger-200,#fecaca)] hover:bg-[var(--ff-color-danger-50,#fef2f2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-danger-400,#f87171)]"
                >
                  <LogOut className="w-4 h-4" />
                  Uitloggen
                </button>
              </motion.div>

            </div>{/* end left column */}

            {/* ══ RIGHT — quick-links + style summary panel ══ */}
            <div className="hidden lg:flex flex-col gap-4 lg:sticky lg:top-6">

              {/* Quick-links card */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.1 }}
                className="rounded-2xl bg-[var(--color-surface)] overflow-hidden divide-y divide-[var(--color-border)]"
                style={{ boxShadow: "0 1px 4px rgba(30,35,51,0.06), 0 2px 10px rgba(30,35,51,0.04)" }}
              >
                <p className="px-4 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)]">Snelkoppelingen</p>
                {[
                  { icon: <Sparkles className="w-4 h-4" />, label: "Mijn outfits", sub: "Bekijk jouw resultaten", to: "/results" },
                  { icon: <Palette className="w-4 h-4" />, label: "Stijlquiz", sub: "Herdoe de quiz", to: "/onboarding" },
                  { icon: <ShoppingBag className="w-4 h-4" />, label: "Winkel", sub: "Gepersonaliseerde producten", to: "/shop" },
                  { icon: <Bell className="w-4 h-4" />, label: "Dashboard", sub: "Jouw overzicht", to: "/dashboard" },
                ].map(({ icon, label, sub, to }) => (
                  <button
                    key={label}
                    onClick={() => navigate(to)}
                    className="w-full flex items-center gap-3.5 px-4 py-3.5 min-h-[44px] hover:bg-[var(--color-bg)] active:bg-[var(--ff-color-primary-25)] transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[var(--ff-color-primary-50)] text-[var(--ff-color-primary-500)] flex items-center justify-center flex-shrink-0">
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text)] leading-tight">{label}</p>
                      <p className="text-[11px] text-[var(--color-muted)] mt-0.5">{sub}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--color-muted)] group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                  </button>
                ))}
              </motion.div>

              {/* Premium upsell (only if not premium) */}
              {!isPremium && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.38, delay: 0.18 }}
                  className="rounded-2xl overflow-hidden p-5"
                  style={{
                    background: "linear-gradient(135deg, var(--ff-color-primary-900) 0%, var(--ff-color-primary-700) 100%)",
                    boxShadow: "0 8px 32px rgba(74,56,40,0.22)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                    <span className="text-xs font-bold text-yellow-300 uppercase tracking-wide">Premium</span>
                  </div>
                  <p className="text-white font-semibold text-sm leading-snug mb-1">Ontgrendel je volledige stijlpotentieel</p>
                  <p className="text-white/55 text-[11px] leading-relaxed mb-4">Uitgebreide kleuranalyse, persoonlijke Nova AI-assistent en meer outfits.</p>
                  <button
                    onClick={() => navigate("/pricing")}
                    className="w-full py-3 rounded-xl font-bold text-sm text-[var(--ff-color-primary-900)] transition-all hover:opacity-90 active:scale-[0.97]"
                    style={{ background: "rgba(255,255,255,0.96)", boxShadow: "0 2px 12px rgba(0,0,0,0.18)" }}
                  >
                    Bekijk plannen
                  </button>
                </motion.div>
              )}

              {/* Style profile summary (if has profile) */}
              {hasStyleProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.38, delay: 0.24 }}
                  className="rounded-2xl bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] p-5"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ff-color-primary-500)] mb-3">Jouw stijl-DNA</p>
                  {archetypeName && (
                    <p className="font-heading font-bold text-[var(--ff-color-primary-900)] text-lg leading-tight mb-1">{archetypeName as string}</p>
                  )}
                  {seasonLabel && (
                    <p className="text-sm text-[var(--ff-color-primary-700)] capitalize mb-3">{seasonLabel} type</p>
                  )}
                  {color?.palette && color.palette.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {color.palette.slice(0, 8).map((hex: string, i: number) => (
                        <div
                          key={i}
                          role="img"
                          aria-label={`Kleur ${hex}`}
                          className="w-6 h-6 rounded-full ring-2 ring-white shadow-sm"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => navigate("/results")}
                    className="mt-4 w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border border-[var(--ff-color-primary-200)] text-[var(--ff-color-primary-700)] hover:bg-white transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" /> Bekijk outfits
                  </button>
                </motion.div>
              )}

            </div>{/* end right column */}
          </div>
        </div>
      </section>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handlePhotoSelect}
        className="sr-only"
        aria-label="Upload foto voor kleuranalyse"
      />

      {showResetModal && (
        <QuizResetModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          currentArchetype={typeof archetypeName === "string" ? archetypeName : undefined}
        />
      )}
    </div>
  );
};

export default ProfilePage;
