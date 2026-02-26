import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  User, Mail, Shield, LogOut, Camera, Trash2, Key,
  ChevronRight, Check, AlertCircle, Sparkles, RefreshCw,
  Crown, Star
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { LS_KEYS, ColorProfile, Archetype } from "@/lib/quiz/types";
import { QuizResetModal } from "@/components/profile/QuizResetModal";
import { EmailPreferences } from "@/components/profile/EmailPreferences";
import { CookieSettings } from "@/components/profile/CookieSettings";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function SectionCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="px-5 py-4 border-b border-[var(--color-border)]">
      <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider">{title}</h2>
      {description && (
        <p className="text-sm text-[var(--color-muted)] mt-0.5 font-normal normal-case tracking-normal">{description}</p>
      )}
    </div>
  );
}

function TierBadge({ tier }: { tier?: string }) {
  if (!tier || tier === 'free') return null;
  const isFounder = tier === 'founder';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
      isFounder
        ? 'bg-[var(--ff-color-accent-100)] text-[var(--ff-color-accent-700)]'
        : 'bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]'
    }`}>
      {isFounder ? <Star className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
      {isFounder ? 'Founder' : 'Premium'}
    </span>
  );
}

function InitialsAvatar({ name, email }: { name: string; email: string }) {
  const initials = name
    ? name.slice(0, 2).toUpperCase()
    : email.slice(0, 2).toUpperCase();
  return (
    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[var(--ff-color-primary-100)] flex items-center justify-center flex-shrink-0">
      <span className="text-xl sm:text-2xl font-bold text-[var(--ff-color-primary-700)]">{initials}</span>
    </div>
  );
}

const SEASON_LABELS: Record<string, string> = {
  lente: 'Lente',
  zomer: 'Zomer',
  herfst: 'Herfst',
  winter: 'Winter',
  spring: 'Lente',
  summer: 'Zomer',
  autumn: 'Herfst',
  fall: 'Herfst',
};

const SEASON_COLORS: Record<string, string> = {
  lente: '#f9a8d4',
  zomer: '#93c5fd',
  herfst: '#fdba74',
  winter: '#a5f3fc',
  spring: '#f9a8d4',
  summer: '#93c5fd',
  autumn: '#fdba74',
  fall: '#fdba74',
};

const ProfilePage: React.FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showResetModal, setShowResetModal] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [displayNameDirty, setDisplayNameDirty] = useState(false);
  const [displayNameError, setDisplayNameError] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const color = readJson<ColorProfile>(LS_KEYS.COLOR_PROFILE);
  const archetype = readJson<Archetype>(LS_KEYS.ARCHETYPE);
  const answers = readJson<any>(LS_KEYS.QUIZ_ANSWERS);

  const isPremium = user?.tier === 'premium' || user?.tier === 'founder' || !!user?.isPremium;

  useEffect(() => {
    if (user?.email) {
      const name = user.email.split("@")[0];
      setDisplayName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, [user]);

  useEffect(() => {
    if (answers?.photoDataUrl) {
      setPhotoPreview(answers.photoDataUrl);
    }
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

  const validateDisplayName = (val: string) => {
    if (!val.trim()) return "Naam mag niet leeg zijn";
    if (val.trim().length < 2) return "Naam is te kort (minimaal 2 tekens)";
    if (val.trim().length > 50) return "Naam is te lang (maximaal 50 tekens)";
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
    if (err) {
      setDisplayNameError(err);
      setDisplayNameDirty(true);
      return;
    }
    setIsSavingName(true);
    try {
      const client = supabase();
      if (client && user) {
        await client.auth.updateUser({ data: { display_name: displayName.trim() } });
      }
      toast.success("Naam opgeslagen");
      setDisplayNameDirty(false);
    } catch {
      toast.error("Kon naam niet opslaan. Probeer het opnieuw.");
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
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Foto is te groot. Maximaal 5 MB.");
      return;
    }
    setIsUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setPhotoPreview(dataUrl);
        const current = readJson<any>(LS_KEYS.QUIZ_ANSWERS) || {};
        localStorage.setItem(LS_KEYS.QUIZ_ANSWERS, JSON.stringify({ ...current, photoDataUrl: dataUrl }));
        toast.success("Foto opgeslagen voor kleuranalyse");
        setIsUploadingPhoto(false);
      };
      reader.onerror = () => {
        toast.error("Kon foto niet lezen. Probeer een ander bestand.");
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Uploaden mislukt");
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    const current = readJson<any>(LS_KEYS.QUIZ_ANSWERS) || {};
    const { photoDataUrl: _removed, ...rest } = current;
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
      toast.success("Reset-link verstuurd naar " + user.email);
    } catch {
      toast.error("Kon reset-link niet versturen. Probeer het opnieuw.");
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
      <main className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <Helmet><title>Profiel – FitFi</title></Helmet>
        <div className="ff-container py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-6">
            <User className="w-7 h-7 text-[var(--color-muted)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-3">Log in om je profiel te bekijken</h1>
          <button
            onClick={() => navigate("/inloggen")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-xl font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
          >
            Inloggen
          </button>
        </div>
      </main>
    );
  }

  const seasonLabel = color?.season ? (SEASON_LABELS[color.season.toLowerCase()] ?? color.season) : null;
  const seasonColor = color?.season ? (SEASON_COLORS[color.season.toLowerCase()] ?? '#e5e7eb') : null;
  const hasStyleProfile = !!(archetypeName || color);

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <Helmet>
        <title>Profiel – FitFi</title>
        <meta name="description" content="Beheer je persoonlijke gegevens, stijlvoorkeuren en foto." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--ff-color-primary-700)] focus:text-white focus:rounded-lg"
      >
        Spring naar hoofdinhoud
      </a>

      <div id="main-content" className="ff-container py-6 sm:py-10 lg:py-14">
        <div className="max-w-xl mx-auto space-y-4">

          {/* ── Identity Hero ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6"
          >
            <div className="flex items-center gap-4">
              <InitialsAvatar name={displayName} email={user.email ?? ''} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <h1 className="text-lg sm:text-xl font-bold text-[var(--color-text)] truncate">
                    {displayName}
                  </h1>
                  <TierBadge tier={user.tier} />
                </div>
                <p className="text-sm text-[var(--color-muted)] truncate">{user.email}</p>
                {hasStyleProfile && (
                  <div className="flex items-center gap-1.5 mt-2">
                    {seasonColor && (
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: seasonColor }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="text-xs text-[var(--color-muted)] font-medium">
                      {[archetypeName, seasonLabel].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
              <button
                onClick={() => navigate("/results")}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-[var(--ff-color-primary-700)] text-white rounded-xl text-sm font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
              >
                <Sparkles className="w-4 h-4" />
                Bekijk outfits
              </button>
              {!isPremium && (
                <button
                  onClick={() => navigate("/pricing")}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-sm font-semibold hover:border-[var(--ff-color-primary-400)] hover:bg-[var(--color-bg)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade
                </button>
              )}
            </div>
          </motion.div>

          {/* ── Stijlprofiel ── */}
          {hasStyleProfile && (
            <SectionCard delay={0.05}>
              <SectionHeader title="Stijlprofiel" />
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--ff-color-primary-50)] flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {archetypeName && (
                      <p className="text-base font-bold text-[var(--color-text)]">{archetypeName as string}</p>
                    )}
                    {color && (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        {seasonLabel && (
                          <span className="flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
                            {seasonColor && (
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: seasonColor }}
                                aria-hidden="true"
                              />
                            )}
                            {seasonLabel}
                          </span>
                        )}
                        {color.temperature && (
                          <span className="text-sm text-[var(--color-muted)] capitalize">{color.temperature}</span>
                        )}
                        {color.contrast && (
                          <span className="text-sm text-[var(--color-muted)] capitalize">{color.contrast} contrast</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {color?.palette && color.palette.length > 0 && (
                  <div>
                    <p className="text-xs text-[var(--color-muted)] font-medium mb-2">Jouw kleurpalet</p>
                    <div className="flex gap-2 flex-wrap">
                      {color.palette.slice(0, 6).map((hex: string, i: number) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <div
                            className="w-8 h-8 rounded-lg border border-[var(--color-border)] shadow-sm"
                            style={{ backgroundColor: hex }}
                            title={hex}
                            aria-label={`Kleur ${hex}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowResetModal(true)}
                  className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors py-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Stijlquiz opnieuw doen
                </button>
              </div>
            </SectionCard>
          )}

          {/* ── Foto voor kleuranalyse ── */}
          <SectionCard delay={0.1}>
            <SectionHeader
              title="Foto voor kleuranalyse"
              description={photoPreview
                ? "Je foto is opgeslagen. Klik 'Vervangen' voor een nieuw bestand."
                : "Optioneel: met een foto geven we preciezer kleuradvies op basis van huidondertoon."}
            />
            <div className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[var(--color-border)] bg-[var(--ff-color-neutral-100)] flex-shrink-0 flex items-center justify-center">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Jouw foto voor kleuranalyse"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-6 h-6 text-[var(--color-muted)]" />
                  )}
                </div>

                <div className="flex-1 flex flex-wrap gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--ff-color-primary-700)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--ff-color-primary-600)] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
                  >
                    {isUploadingPhoto ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                    {photoPreview ? "Vervangen" : "Foto toevoegen"}
                  </button>

                  {photoPreview && (
                    <button
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center gap-2 px-4 py-2.5 border border-[var(--color-border)] text-[var(--color-muted)] rounded-xl text-sm font-semibold hover:text-[var(--ff-color-error-600)] hover:border-[var(--ff-color-error-400)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-error-400)] focus-visible:ring-offset-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Verwijder
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-[var(--color-muted)] mt-3">
                Max 5 MB · JPG, PNG of WebP · Privacyveilig — alleen lokaal opgeslagen
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoSelect}
              className="sr-only"
              aria-label="Upload foto voor kleuranalyse"
            />
          </SectionCard>

          {/* ── Naam ── */}
          <SectionCard delay={0.15}>
            <SectionHeader title="Persoonlijke gegevens" />
            <div className="p-5 space-y-4">
              <div>
                <label
                  htmlFor="display-name"
                  className="block text-sm font-semibold text-[var(--color-text)] mb-1.5"
                >
                  Naam
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={displayName}
                  onChange={handleNameChange}
                  placeholder="Jouw naam"
                  maxLength={50}
                  className={`w-full h-11 px-3.5 rounded-xl border text-[var(--color-text)] bg-[var(--color-bg)] text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)] ${
                    displayNameError && displayNameDirty
                      ? "border-[var(--ff-color-error-500)]"
                      : "border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)]"
                  }`}
                  aria-describedby={displayNameError && displayNameDirty ? "name-error" : undefined}
                />
                {displayNameError && displayNameDirty && (
                  <p
                    id="name-error"
                    role="alert"
                    className="flex items-center gap-1.5 mt-1.5 text-xs text-[var(--ff-color-error-600)]"
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {displayNameError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">
                  E-mailadres
                </label>
                <div className="flex items-center gap-3 h-11 px-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] opacity-60 select-none">
                  <Mail className="w-4 h-4 text-[var(--color-muted)] flex-shrink-0" />
                  <span className="text-sm text-[var(--color-text)] truncate">{user.email}</span>
                </div>
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  E-mailadres kan niet worden gewijzigd
                </p>
              </div>

              {displayNameDirty && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 pt-1"
                >
                  <button
                    onClick={handleSaveName}
                    disabled={isSavingName || !!displayNameError}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--ff-color-primary-700)] text-white rounded-xl text-sm font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
                  >
                    {isSavingName ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Opslaan
                  </button>
                  <button
                    onClick={handleCancelName}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-sm font-semibold hover:bg-[var(--color-bg)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
                  >
                    Annuleren
                  </button>
                </motion.div>
              )}
            </div>
          </SectionCard>

          {/* ── E-mailvoorkeuren ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <EmailPreferences />
          </motion.div>

          {/* ── Privacy & cookies ── */}
          <SectionCard delay={0.25}>
            <SectionHeader
              title="Privacy & cookies"
              description="We slaan alleen op wat nodig is."
            />
            <div className="p-5">
              <CookieSettings />
            </div>
          </SectionCard>

          {/* ── Account-acties ── */}
          <SectionCard delay={0.3}>
            <SectionHeader title="Account" />
            <div className="divide-y divide-[var(--color-border)]">
              <button
                onClick={handlePasswordReset}
                disabled={isSendingReset}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--color-bg)] transition-colors disabled:opacity-50 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0 group-hover:border-[var(--ff-color-primary-300)] transition-colors">
                    <Key className="w-4 h-4 text-[var(--color-muted)]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[var(--color-text)]">Wachtwoord wijzigen</p>
                    <p className="text-xs text-[var(--color-muted)]">
                      Reset-link naar {user.email}
                    </p>
                  </div>
                </div>
                {isSendingReset ? (
                  <RefreshCw className="w-4 h-4 text-[var(--color-muted)] animate-spin" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[var(--color-muted)] group-hover:translate-x-0.5 transition-transform" />
                )}
              </button>

              <button
                onClick={() => navigate("/privacy")}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--color-bg)] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center flex-shrink-0 group-hover:border-[var(--ff-color-primary-300)] transition-colors">
                    <Shield className="w-4 h-4 text-[var(--color-muted)]" />
                  </div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">Privacybeleid</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--color-muted)] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </SectionCard>

          {/* ── Uitloggen ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-[var(--color-border)] text-[var(--color-muted)] text-sm font-semibold hover:text-[var(--ff-color-error-600)] hover:border-[var(--ff-color-error-300)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-error-400)] focus-visible:ring-offset-2"
            >
              <LogOut className="w-4 h-4" />
              Uitloggen
            </button>
          </motion.div>

        </div>
      </div>

      {showResetModal && (
        <QuizResetModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          currentArchetype={typeof archetypeName === "string" ? archetypeName : undefined}
        />
      )}
    </main>
  );
};

export default ProfilePage;
