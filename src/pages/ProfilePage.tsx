import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  User, Mail, LogOut, Camera, Trash2, ChevronRight, Check,
  CircleAlert as AlertCircle, Sparkles, RefreshCw, Crown, Star,
  Lock, Shield, Palette, ArrowRight, Bell, ShoppingBag, Upload,
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
      className={`w-full flex items-center gap-4 py-4 border-b border-[#E5E5E5]/50 last:border-none transition-colors text-left group
        ${onClick ? "hover:bg-[#FAFAF8]" : "cursor-default"}
        ${danger ? "hover:bg-red-50" : ""}
      `}
    >
      {icon && (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          danger
            ? "bg-red-50 text-[#C24A4A]"
            : "bg-[#F5F0EB] text-[#C2654A]"
        }`}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-tight ${danger ? "text-[#C24A4A]" : "text-[#1A1A1A]"}`}>
          {label}
        </p>
        {sub && <p className="text-xs text-[#8A8A8A] mt-0.5 leading-snug">{sub}</p>}
      </div>
      {rightEl ?? (
        onClick && !danger ? (
          <ChevronRight className="w-4 h-4 ml-auto text-[#E5E5E5] group-hover:text-[#C2654A] transition-colors duration-200 flex-shrink-0" />
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
      className="bg-white border border-[#E5E5E5] rounded-2xl p-7 mb-6"
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#8A8A8A] mb-4">
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
      <div className="bg-[#FAFAF8] flex items-center justify-center px-6" style={{ minHeight: "calc(100vh - 72px)" }}>
        <Helmet><title>Profiel – FitFi</title></Helmet>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-white border border-[#E5E5E5] flex items-center justify-center mx-auto mb-6">
            <User className="w-7 h-7 text-[#8A8A8A]" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-[#1A1A1A] mb-3">Log in om je profiel te bekijken</h1>
          <button
            onClick={() => navigate("/inloggen")}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base transition-colors duration-200"
          >
            Inloggen
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAF8]" style={{ minHeight: "calc(100vh - 72px)" }}>
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
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#C2654A] focus:text-white focus:rounded-lg"
      >
        Spring naar hoofdinhoud
      </a>

      {/* ══ PAGE HEADER ══ */}
      <section className="bg-[#F5F0EB] pt-44 md:pt-48 pb-10">
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 flex items-center gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-[#F4E8E3] flex items-center justify-center overflow-hidden">
              {photoPreview ? (
                <img src={photoPreview} alt="Profielfoto" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-[#C2654A] select-none">{userInitial}</span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A]/20"
              style={{ minWidth: 44, minHeight: 44, padding: "calc((44px - 28px) / 2)", boxSizing: "content-box" }}
              aria-label="Foto wijzigen"
            >
              <Camera className="w-3.5 h-3.5 text-[#8A8A8A]" />
            </button>
          </div>

          {/* Name + email + style */}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-[#1A1A1A] leading-tight">{displayName}</h1>
              {isPremium && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#C2654A]/10 text-[#C2654A]"
                >
                  {isFounder ? <Star className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
                  {isFounder ? "Founder" : "Premium"}
                </span>
              )}
            </div>
            <p className="text-sm text-[#8A8A8A]">{user.email}</p>
            {hasStyleProfile && (
              <p className="text-sm text-[#4A4A4A] mt-1">
                {[archetypeName ? String(archetypeName).toUpperCase() : null, seasonLabel].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ══ MAIN CONTENT ══ */}
      <section id="main-content" className="py-10">
        <div className="max-w-[1320px] mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">

          {/* ══ LEFT — all settings sections ══ */}
          <div>

            {/* Stijlprofiel */}
            {hasStyleProfile && (
              <div>
                <SectionLabel>Stijlprofiel</SectionLabel>
                <SectionCard delay={0.04}>
                  <RowItem
                    label={archetypeName ? String(archetypeName) : "Jouw stijl"}
                    sub={[seasonLabel, color?.temperature].filter(Boolean).join(" · ") || "Stijlpersoonlijkheid"}
                    icon={<Sparkles className="w-5 h-5" />}
                    onClick={() => navigate("/results")}
                  />
                  <RowItem
                    label="Quiz opnieuw doen"
                    sub="Pas je stijlprofiel aan"
                    icon={<RefreshCw className="w-5 h-5" />}
                    onClick={() => setShowResetModal(true)}
                  />
                </SectionCard>
              </div>
            )}

            {/* Opgeslagen outfits */}
            <div>
              <SectionLabel>Opgeslagen outfits</SectionLabel>
              <div className="mb-6">
                <SavedOutfitHistory userId={user.id} />
              </div>
            </div>

            {/* Kleuranalyse foto */}
            <div>
              <SectionLabel>Kleuranalyse</SectionLabel>
              <SectionCard delay={0.08}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-[#F5F0EB] border border-[#E5E5E5]">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Kleuranalysefoto" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-[#8A8A8A]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A] leading-tight">
                      {photoPreview ? "Foto actief" : "Foto toevoegen"}
                    </p>
                    <p className="text-xs text-[#8A8A8A] mt-0.5 leading-snug">
                      {photoPreview
                        ? "Kleuranalyse op basis van jouw huidtoon"
                        : "Geeft nauwkeuriger kleuradvies"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-xs py-2.5 px-5 rounded-full inline-flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
                    >
                      {isUploadingPhoto ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      {photoPreview ? "Vervang" : "Upload"}
                    </button>
                    {photoPreview && (
                      <button
                        onClick={handleRemovePhoto}
                        className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl border border-[#E5E5E5] flex items-center justify-center text-[#8A8A8A] hover:text-[#C24A4A] hover:border-[#C24A4A] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C24A4A]/20"
                        aria-label="Foto verwijderen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[#8A8A8A] mt-3">Max 5 MB · JPG, PNG of WebP · Privacyveilig, alleen lokaal opgeslagen</p>
              </SectionCard>
            </div>

            {/* Persoonlijke gegevens */}
            <div>
              <SectionLabel>Persoonlijke gegevens</SectionLabel>
              <SectionCard delay={0.12}>
                <AnimatePresence mode="wait">
                  {!isEditingName ? (
                    <motion.div
                      key="name-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-4 py-4 border-b border-[#E5E5E5]/50"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#F5F0EB] flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-[#C2654A]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1A1A1A] leading-tight">{displayName}</p>
                        <p className="text-xs text-[#8A8A8A] mt-0.5">Weergavenaam</p>
                      </div>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="text-sm font-semibold text-[#C2654A] hover:text-[#A8513A] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A]/20 px-3 py-2.5 min-h-[44px]"
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
                      className="space-y-3 py-4 border-b border-[#E5E5E5]/50"
                    >
                      <label htmlFor="display-name" className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">
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
                        className={`w-full h-11 px-3.5 rounded-xl border text-[#1A1A1A] bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#C2654A]/20 focus:border-[#C2654A] ${
                          displayNameError && displayNameDirty
                            ? "border-[#C24A4A]"
                            : "border-[#E5E5E5] hover:border-[#C2654A]"
                        }`}
                      />
                      {displayNameError && displayNameDirty && (
                        <p className="flex items-center gap-1.5 text-xs text-[#C24A4A]">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          {displayNameError}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveName}
                          disabled={isSavingName || !!displayNameError}
                          className="flex-1 inline-flex items-center justify-center gap-2 py-3 min-h-[44px] bg-[#C2654A] hover:bg-[#A8513A] text-white rounded-xl text-sm font-bold transition-colors duration-200 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A]/20"
                        >
                          {isSavingName ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          Opslaan
                        </button>
                        <button
                          onClick={handleCancelName}
                          className="flex-1 py-3 min-h-[44px] rounded-xl border border-[#E5E5E5] text-sm font-semibold text-[#8A8A8A] hover:bg-[#FAFAF8] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A]/20"
                        >
                          Annuleer
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-4 py-4 opacity-60 select-none">
                  <div className="w-10 h-10 rounded-xl bg-[#F5F0EB] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#C2654A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A] truncate leading-tight">{user.email}</p>
                    <p className="text-xs text-[#8A8A8A] mt-0.5">E-mail (niet wijzigbaar)</p>
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
                className="bg-white border border-[#E5E5E5] rounded-2xl p-7 mb-6 overflow-hidden"
              >
                <EmailPreferences />
              </motion.div>
            </div>

            {/* Privacy & account */}
            <div>
              <SectionLabel>Privacy & account</SectionLabel>
              <SectionCard delay={0.20}>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F5F0EB] flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-[#C2654A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A] leading-tight">Privacy & cookies</p>
                    <p className="text-xs text-[#8A8A8A] mt-0.5">We slaan alleen op wat nodig is</p>
                  </div>
                </div>
                <CookieSettings />

                <AnimatePresence mode="wait">
                  {!showResetConfirm ? (
                    <RowItem
                      key="pw-row"
                      label="Wachtwoord wijzigen"
                      sub={`Reset-link naar ${user.email}`}
                      icon={<Lock className="w-5 h-5" />}
                      onClick={() => setShowResetConfirm(true)}
                    />
                  ) : (
                    <motion.div
                      key="pw-confirm"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="py-4 border-t border-[#E5E5E5]/50 bg-[#F4E8E3] rounded-xl p-4 mt-4"
                    >
                      <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Reset-link versturen?</p>
                      <p className="text-xs text-[#4A4A4A] mb-3 leading-snug">
                        We sturen een link naar <strong>{user.email}</strong>. Je huidige wachtwoord blijft geldig totdat je het wijzigt.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => { await handlePasswordReset(); setShowResetConfirm(false); }}
                          disabled={isSendingReset}
                          className="flex-1 py-3 min-h-[44px] rounded-xl bg-[#C2654A] hover:bg-[#A8513A] text-white text-sm font-bold transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A]/20"
                        >
                          {isSendingReset ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          Verstuur link
                        </button>
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          className="flex-1 py-3 min-h-[44px] rounded-xl border border-[#E5E5E5] text-sm font-semibold text-[#8A8A8A] hover:bg-[#FAFAF8] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A]/20"
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
                  icon={<Shield className="w-5 h-5" />}
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
                className="w-full py-4 text-center text-sm font-semibold text-[#8A8A8A] hover:text-[#C24A4A] transition-colors duration-200 border-t border-[#E5E5E5] flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Uitloggen
              </button>
            </motion.div>

          </div>{/* end left column */}

          {/* ══ RIGHT — sidebar ══ */}
          <div className="hidden lg:flex flex-col gap-6 lg:sticky lg:top-24">

            {/* Snelkoppelingen card */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, delay: 0.1 }}
              className="bg-white border border-[#E5E5E5] rounded-2xl p-7"
            >
              <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#8A8A8A] mb-4">Snelkoppelingen</p>
              {[
                { icon: <Sparkles className="w-5 h-5" />, label: "Mijn outfits", sub: "Bekijk jouw resultaten", to: "/results" },
                { icon: <Palette className="w-5 h-5" />, label: "Stijlquiz", sub: "Herdoe de quiz", to: "/onboarding" },
                { icon: <ShoppingBag className="w-5 h-5" />, label: "Winkel", sub: "Gepersonaliseerde producten", to: "/shop" },
                { icon: <Bell className="w-5 h-5" />, label: "Dashboard", sub: "Jouw overzicht", to: "/dashboard" },
              ].map(({ icon, label, sub, to }) => (
                <button
                  key={label}
                  onClick={() => navigate(to)}
                  className="w-full flex items-center gap-4 py-4 border-b border-[#E5E5E5]/50 last:border-none hover:bg-[#FAFAF8] transition-colors duration-200 text-left group -mx-3 px-3 rounded-xl"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F5F0EB] text-[#C2654A] flex items-center justify-center flex-shrink-0">
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A] leading-tight">{label}</p>
                    <p className="text-xs text-[#8A8A8A] mt-0.5">{sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#E5E5E5] group-hover:text-[#C2654A] transition-colors duration-200 flex-shrink-0" />
                </button>
              ))}
            </motion.div>

            {/* Premium upsell (only if not premium) */}
            {!isPremium && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.18 }}
                className="bg-[#C2654A] rounded-2xl p-7 text-white"
              >
                <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-white/70 mb-2 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Premium
                </p>
                <p className="text-base font-bold text-white mb-2">Ontgrendel je volledige stijlpotentieel</p>
                <p className="text-sm text-white/80 leading-[1.6] mb-5">Uitgebreide kleuranalyse, persoonlijke Nova AI-assistent en meer outfits.</p>
                <button
                  onClick={() => navigate("/pricing")}
                  className="w-full py-3 rounded-full bg-white text-[#C2654A] font-semibold text-sm text-center hover:bg-white/90 transition-colors duration-200"
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
                className="bg-[#F5F0EB] border border-[#E5E5E5] rounded-2xl p-7"
              >
                <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-[#C2654A] mb-2">Jouw stijl-DNA</p>
                {archetypeName && (
                  <p className="text-lg font-bold text-[#1A1A1A] leading-tight mb-1">{archetypeName as string}</p>
                )}
                {seasonLabel && (
                  <p className="text-sm text-[#8A8A8A] mt-1 capitalize">{seasonLabel} type</p>
                )}
                {color?.palette && color.palette.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-4">
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
                  className="w-full mt-5 py-2.5 rounded-full border border-[#E5E5E5] bg-white text-sm font-semibold text-[#1A1A1A] text-center hover:border-[#C2654A] hover:text-[#C2654A] transition-all duration-200"
                >
                  Bekijk outfits
                </button>
              </motion.div>
            )}

          </div>{/* end right column */}
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
