import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  User, Mail, Shield, LogOut, Camera, Trash2, Key,
  ChevronRight, Check, AlertCircle, Sparkles, RefreshCw
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
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="px-6 py-4 border-b border-[var(--color-border)]">
      <h2 className="text-base font-bold text-[var(--color-text)]">{title}</h2>
      {description && (
        <p className="text-sm text-[var(--color-muted)] mt-0.5">{description}</p>
      )}
    </div>
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

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const color = readJson<ColorProfile>(LS_KEYS.COLOR_PROFILE);
  const archetype = readJson<Archetype>(LS_KEYS.ARCHETYPE);
  const answers = readJson<any>(LS_KEYS.QUIZ_ANSWERS);
  const hasPhoto = !!(answers?.photoDataUrl);

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
      toast.success("Profiel opgeslagen");
      setDisplayNameDirty(false);
    } catch {
      toast.error("Kon profiel niet opslaan. Probeer het opnieuw.");
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
      toast.success("Reset-link verstuurd. Controleer je inbox.");
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
          <div className="w-14 h-14 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-6">
            <User className="w-7 h-7 text-[var(--color-muted)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-3">Log in om je profiel te bekijken</h1>
          <button
            onClick={() => navigate("/inloggen")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-xl font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors"
          >
            Inloggen
          </button>
        </div>
      </main>
    );
  }

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

      <div id="main-content" className="ff-container py-8 sm:py-12 lg:py-16">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Page heading */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-2"
          >
            <p className="text-sm text-[var(--color-muted)]">Accountinstellingen</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tracking-tight">
              Jouw profiel
            </h1>
            <p className="text-sm text-[var(--color-muted)] mt-1">
              Je profiel helpt ons je advies consistent te houden.
            </p>
          </motion.div>

          {/* Personal data */}
          <SectionCard delay={0.05}>
            <SectionHeader
              title="Persoonlijke gegevens"
              description="Wijzig je voorkeuren en klik op Opslaan."
            />
            <div className="p-6 space-y-5">
              {/* Display name field */}
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
                  className={`w-full h-11 px-3.5 rounded-lg border text-[var(--color-text)] bg-[var(--color-bg)] text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)] ${
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

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">
                  E-mailadres
                </label>
                <div className="flex items-center gap-3 h-11 px-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] opacity-60">
                  <Mail className="w-4 h-4 text-[var(--color-muted)] flex-shrink-0" />
                  <span className="text-sm text-[var(--color-text)] truncate">{user.email}</span>
                </div>
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  E-mailadres kan niet worden gewijzigd
                </p>
              </div>

              {/* CTA row */}
              {displayNameDirty && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 pt-1"
                >
                  <button
                    onClick={handleSaveName}
                    disabled={isSavingName || !!displayNameError}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--ff-color-primary-700)] text-white rounded-lg text-sm font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg text-sm font-semibold hover:bg-[var(--color-bg)] transition-colors"
                  >
                    Annuleren
                  </button>
                </motion.div>
              )}
            </div>
          </SectionCard>

          {/* Photo module */}
          <SectionCard delay={0.1}>
            <SectionHeader
              title="Foto voor kleuranalyse"
              description="Foto's gebruiken we alleen voor optionele kleuranalyse. Je kunt je foto altijd verwijderen."
            />
            <div className="p-6">
              <div className="flex items-start gap-5">
                {/* Preview */}
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-[var(--color-border)] bg-[var(--ff-color-neutral-100)] flex-shrink-0 flex items-center justify-center">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Jouw profielfoto voor kleuranalyse"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-7 h-7 text-[var(--color-muted)]" />
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                    {photoPreview
                      ? "Je foto is opgeslagen voor kleuranalyse. Je kunt je foto altijd verwijderen."
                      : "Foto's gebruiken we alleen voor kleuranalyse (als jij dat wilt). Voeg een foto toe voor advies op basis van huidondertoon, haar en ogen."}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ff-color-primary-700)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--ff-color-primary-600)] transition-colors disabled:opacity-50"
                    >
                      {isUploadingPhoto ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      {photoPreview ? "Foto vervangen" : "Upload foto"}
                    </button>

                    {photoPreview && (
                      <button
                        onClick={handleRemovePhoto}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] text-[var(--color-muted)] rounded-lg text-sm font-semibold hover:text-[var(--ff-color-error-600)] hover:border-[var(--ff-color-error-400)] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Verwijder foto
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-[var(--color-muted)]">
                    Max 5 MB · JPG of PNG · Privacyveilig opgeslagen
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                className="sr-only"
                aria-label="Upload profielfoto"
              />
            </div>
          </SectionCard>

          {/* Style profile summary */}
          {(archetypeName || color) && (
            <SectionCard delay={0.15}>
              <SectionHeader
                title="Jouw stijlprofiel"
                description="Nieuw rapport maken? Kan altijd."
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xl font-bold text-[var(--color-text)]">
                      {archetypeName || "Stijlprofiel"}
                    </p>
                    {color?.season && (
                      <p className="text-sm text-[var(--color-muted)] capitalize mt-0.5">
                        {color.season} · {color.temperature}
                      </p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[var(--ff-color-primary-50)] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate("/results")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ff-color-primary-700)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--ff-color-primary-600)] transition-colors"
                  >
                    Bekijk outfits
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowResetModal(true)}
                    title="Pas je antwoorden aan om een nieuw rapport te genereren"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg text-sm font-semibold hover:border-[var(--ff-color-primary-400)] transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Nieuw rapport
                  </button>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Email preferences */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <EmailPreferences />
          </motion.div>

          {/* Privacy & cookies */}
          <SectionCard delay={0.25}>
            <SectionHeader
              title="Privacy & cookies"
              description="We slaan alleen op wat nodig is. Beheer hoe wij je gegevens gebruiken."
            />
            <div className="p-6">
              <CookieSettings />
            </div>
          </SectionCard>

          {/* Account actions */}
          <SectionCard delay={0.3}>
            <SectionHeader
              title="Account"
            />
            <div className="divide-y divide-[var(--color-border)]">
              {/* Password reset */}
              <button
                onClick={handlePasswordReset}
                disabled={isSendingReset}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-[var(--color-bg)] transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center">
                    <Key className="w-4 h-4 text-[var(--color-muted)]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[var(--color-text)]">Wachtwoord wijzigen</p>
                    <p className="text-xs text-[var(--color-muted)]">
                      We sturen een reset-link naar {user.email}
                    </p>
                  </div>
                </div>
                {isSendingReset ? (
                  <RefreshCw className="w-4 h-4 text-[var(--color-muted)] animate-spin" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[var(--color-muted)]" />
                )}
              </button>

              {/* Privacy policy link */}
              <button
                onClick={() => navigate("/privacy")}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-[var(--color-bg)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center">
                    <Shield className="w-4 h-4 text-[var(--color-muted)]" />
                  </div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">Privacybeleid</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--color-muted)]" />
              </button>
            </div>
          </SectionCard>

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-[var(--color-border)] text-[var(--color-muted)] text-sm font-semibold hover:text-[var(--ff-color-error-600)] hover:border-[var(--ff-color-error-400)] transition-colors"
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
