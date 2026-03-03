import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { User, Mail, LogOut, Camera, Trash2, ChevronRight, Check, CircleAlert as AlertCircle, Sparkles, RefreshCw, Crown, Star, Lock, Shield, Palette, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { LS_KEYS, ColorProfile, Archetype } from "@/lib/quiz/types";
import { QuizResetModal } from "@/components/profile/QuizResetModal";
import { EmailPreferences } from "@/components/profile/EmailPreferences";
import { CookieSettings } from "@/components/profile/CookieSettings";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

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

/* ── Row item inside a section card ── */
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

/* ── Section container ── */
function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
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
    <p className="px-4 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)]">
      {children}
    </p>
  );
}

/* ═══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
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

  /* ── handlers ── */
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

  /* ── not logged in ── */
  if (!user) {
    return (
      <div className="bg-[var(--color-bg)] flex items-center justify-center px-6" style={{ minHeight: 'calc(100vh - 64px)' }}>
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
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-[var(--ff-color-primary-700)] text-white rounded-2xl font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors"
          >
            Inloggen
          </button>
        </motion.div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════
     MAIN
  ═══════════════════════════════════════════════════ */
  return (
    <div className="bg-[var(--color-bg)]" style={{ minHeight: 'calc(100vh - 64px)' }}>
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

      <div id="main-content" className="ff-container pt-6 pb-24">
        <div className="flex flex-col lg:flex-row lg:gap-8 xl:gap-10 lg:items-start">

        {/* ══ LEFT COLUMN — sticky profile card (desktop) ══ */}
        <div className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 lg:sticky lg:top-6 space-y-3 mb-3 lg:mb-0">

        {/* ══ HERO PROFILE CARD ══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(150deg, var(--ff-color-primary-900,#4A3828) 0%, var(--ff-color-primary-800,#6B5240) 40%, var(--ff-color-primary-700,#9B7A5E) 100%)",
            boxShadow: "0 16px 48px rgba(74,56,40,0.32), 0 2px 0 rgba(255,255,255,0.08) inset",
          }}
        >
          {/* noise */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

          <div className="relative px-5 pt-5 pb-5">

            {/* Avatar + name row */}
            <div className="flex items-center gap-4 mb-5">
              {/* Avatar — photo or initial */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center"
                  style={{
                    background: photoPreview ? undefined : "rgba(255,255,255,0.15)",
                    boxShadow: "0 0 0 2px rgba(255,255,255,0.15)",
                  }}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profielfoto" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-white select-none">{userInitial}</span>
                  )}
                </div>
                {/* Camera badge */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-7 h-7 min-w-[44px] min-h-[44px] rounded-full bg-[var(--color-surface)] flex items-center justify-center shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
                  style={{ padding: "calc((44px - 28px) / 2)", boxSizing: "content-box" }}
                  aria-label="Foto wijzigen"
                >
                  <Camera className="w-3.5 h-3.5 text-[var(--ff-color-primary-700)]" />
                </button>
              </div>

              {/* Name + tier */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <h1 className="font-heading text-lg font-bold text-white leading-tight truncate">{displayName}</h1>
                  {isPremium && (
                    <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                    style={isFounder
                      ? { background: 'rgba(217,119,6,0.25)', color: 'var(--ff-color-warning-200)', borderColor: 'rgba(217,119,6,0.30)' }
                      : { background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.80)', borderColor: 'rgba(255,255,255,0.20)' }
                    }
                  >
                      {isFounder ? <Star className="w-2.5 h-2.5" /> : <Crown className="w-2.5 h-2.5" />}
                      {isFounder ? "Founder" : "Premium"}
                    </span>
                  )}
                </div>
                <p className="text-white/50 text-[12px] truncate">{user.email}</p>
              </div>
            </div>

            {/* Style profile summary chips */}
            {hasStyleProfile && (
              <div className="flex flex-wrap gap-2 mb-5">
                {archetypeName && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/12 border border-white/15 text-[11px] text-white/80 font-semibold">
                    {archetypeName as string}
                  </span>
                )}
                {seasonLabel && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] text-white/65 capitalize">
                    {seasonLabel}
                  </span>
                )}
                {color?.temperature && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/8 text-[11px] text-white/50 capitalize">
                    {color.temperature}
                  </span>
                )}
              </div>
            )}

            {/* Color palette dots */}
            {color?.palette && color.palette.length > 0 && (
              <div className="flex items-center gap-1.5 mb-5">
                <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mr-1">Palet</span>
                {color.palette.slice(0, 8).map((hex: string, i: number) => (
                  <div
                    key={i}
                    role="img"
                    aria-label={`Kleur ${hex}`}
                    className="w-[18px] h-[18px] rounded-full flex-shrink-0 ring-1 ring-white/15"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            )}

            {/* CTA row */}
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/results")}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.97]"
                style={{
                  background: "rgba(255,255,255,0.96)",
                  color: "var(--ff-color-primary-900)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.22)",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" /> Bekijk outfits
              </button>
              {!isPremium && (
                <button
                  onClick={() => navigate("/pricing")}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm bg-white/12 border border-white/15 text-white/80 hover:bg-white/18 transition-colors active:scale-[0.97]"
                >
                  <Crown className="w-3.5 h-3.5" /> Upgrade
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Desktop-only quick links ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.12 }}
          className="hidden lg:block rounded-2xl bg-[var(--color-surface)] overflow-hidden divide-y divide-[var(--color-border)]"
          style={{ boxShadow: "0 1px 4px rgba(30,35,51,0.06), 0 2px 10px rgba(30,35,51,0.04)" }}
        >
          <p className="px-4 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)]">Snelkoppelingen</p>
          {[
            { icon: <Sparkles className="w-4 h-4" />, label: "Mijn outfits", sub: "Bekijk jouw resultaten", to: "/results" },
            { icon: <Palette className="w-4 h-4" />, label: "Stijlquiz", sub: "Herdoe de quiz", to: "/onboarding" },
            { icon: <ArrowRight className="w-4 h-4" />, label: "Winkel", sub: "Gepersonaliseerde producten", to: "/shop" },
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

        </div>{/* end left column */}

        {/* ══ RIGHT COLUMN — settings sections ══ */}
        <div className="flex-1 min-w-0 space-y-3">

        {/* ══ STIJLPROFIEL SECTIE ══ */}
        {hasStyleProfile && (
          <>
            <SectionLabel>Stijlprofiel</SectionLabel>
            <Section delay={0.06}>
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
            </Section>
          </>
        )}

        {/* ══ FOTO SECTIE ══ */}
        <SectionLabel>Kleuranalyse</SectionLabel>
        <Section delay={0.1}>
          <div className="px-4 py-4">
            <div className="flex items-center gap-3.5">
              {/* Preview thumbnail */}
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
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--ff-color-primary-700)] text-white text-xs font-bold transition-colors hover:bg-[var(--ff-color-primary-600)] disabled:opacity-50"
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
        </Section>

        {/* ══ PERSOONLIJKE GEGEVENS ══ */}
        <SectionLabel>Persoonlijke gegevens</SectionLabel>
        <Section delay={0.14}>
          {/* Name row */}
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
                    className="text-xs font-bold text-[var(--ff-color-primary-600)] hover:text-[var(--ff-color-primary-700)] px-3 py-2.5 min-h-[44px] rounded-lg hover:bg-[var(--ff-color-primary-50)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)]"
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
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3 min-h-[44px] bg-[var(--ff-color-primary-700)] text-white rounded-xl text-sm font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)]"
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

          {/* Email row */}
          <div className="flex items-center gap-3.5 px-4 py-3.5 opacity-60 select-none">
            <div className="w-8 h-8 rounded-xl bg-[var(--ff-color-primary-50)] flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-[var(--ff-color-primary-500)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text)] truncate leading-tight">{user.email}</p>
              <p className="text-[11px] text-[var(--color-muted)] mt-0.5">E-mail (niet wijzigbaar)</p>
            </div>
          </div>
        </Section>

        {/* ══ E-MAILVOORKEUREN ══ */}
        <SectionLabel>Notificaties</SectionLabel>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.18 }}
          className="rounded-2xl bg-[var(--color-surface)] overflow-hidden"
          style={{ boxShadow: "0 1px 4px rgba(30,35,51,0.06), 0 2px 10px rgba(30,35,51,0.04)" }}
        >
          <EmailPreferences />
        </motion.div>

        {/* ══ PRIVACY & ACCOUNT ══ */}
        <SectionLabel>Privacy & account</SectionLabel>
        <Section delay={0.22}>
          {/* Cookie settings inline */}
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

          {/* Password reset */}
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
                    className="flex-1 py-3 min-h-[44px] rounded-xl bg-[var(--ff-color-primary-700)] text-white text-sm font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)]"
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
        </Section>

        {/* ══ UITLOGGEN ══ */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.28 }}
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 py-4 min-h-[44px] rounded-2xl border border-[var(--color-border)] text-[var(--color-muted)] text-sm font-semibold hover:text-[var(--ff-color-danger-500,#ef4444)] hover:border-[var(--ff-color-danger-200,#fecaca)] hover:bg-[var(--ff-color-danger-50,#fef2f2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-danger-400,#f87171)]"
          >
            <LogOut className="w-4 h-4" />
            Uitloggen
          </button>
        </motion.div>

        </div>{/* end right column */}
        </div>{/* end flex row */}
      </div>

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
