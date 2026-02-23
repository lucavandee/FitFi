import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, AlertCircle, CheckCircle, Loader2, Shield, X, Info, ImageIcon } from "lucide-react";

interface ColorAnalysis {
  undertone: "warm" | "cool" | "neutral";
  skin_tone: string;
  hair_color: string;
  eye_color: string;
  seasonal_type: "spring" | "summer" | "autumn" | "winter";
  best_colors: string[];
  avoid_colors: string[];
  confidence: number;
  reasoning?: string;
}

type Props = {
  value?: string | null;
  onChange: (dataUrl: string | null) => void;
  onAnalysisComplete?: (analysis: ColorAnalysis) => void;
};

const PHOTO_TIPS = [
  "Sta voor een neutrale (lichte) achtergrond",
  "Gebruik daglicht, vermijd felle schaduwen",
  "Foto van schouder tot heup werkt het best",
  "Draag kleding die je normaal zou kiezen",
];

const SEASONAL_LABELS: Record<string, string> = {
  spring: "Lente",
  summer: "Zomer",
  autumn: "Herfst",
  winter: "Winter",
};

const UNDERTONE_LABELS: Record<string, string> = {
  warm: "Warm",
  cool: "Koel",
  neutral: "Neutraal",
};

export default function PhotoUpload({ value, onChange, onAnalysisComplete }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ColorAnalysis | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  async function processFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Upload alsjeblieft een afbeelding (JPG, PNG of WEBP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Afbeelding moet kleiner zijn dan 5MB");
      return;
    }

    setError(null);
    setAnalysis(null);

    const reader = new FileReader();
    reader.onload = () => onChange((reader.result as string) || null);
    reader.readAsDataURL(file);

    const sessionId = localStorage.getItem("ff_session_id") || crypto.randomUUID();
    localStorage.setItem("ff_session_id", sessionId);

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `anon_${sessionId}/${fileName}`;

      const anonClient = await import("@supabase/supabase-js").then(({ createClient }) =>
        createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      );

      const { data: uploadData, error: uploadError } = await anonClient.storage
        .from("user-photos")
        .upload(filePath, file, { contentType: file.type, cacheControl: "3600", upsert: false });

      if (uploadError) throw new Error(uploadError.message || "Upload mislukt");

      const { data: { publicUrl } } = anonClient.storage.from("user-photos").getPublicUrl(uploadData.path);
      localStorage.setItem("ff_onboarding_photo_url", publicUrl);

      setUploading(false);
      setAnalyzing(true);

      try {
        const analysisResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-selfie-color`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ photoUrl: publicUrl, userId: sessionId, isAnonymous: true }),
          }
        );

        if (!analysisResponse.ok) throw new Error(`Analyse mislukt: ${analysisResponse.status}`);

        const analysisData: ColorAnalysis = await analysisResponse.json();
        setAnalysis(analysisData);
        localStorage.setItem("ff_onboarding_photo_analysis", JSON.stringify(analysisData));
        onAnalysisComplete?.(analysisData);

        if (analysisData?.seasonal_type) {
          const insights = JSON.parse(localStorage.getItem("ff_nova_insights") || "[]");
          insights.push({
            type: "color_analysis",
            message: `Geweldig! Ik zie dat je een ${analysisData.seasonal_type} kleurtype bent met een ${analysisData.undertone} ondertoon. Kleuren zoals ${analysisData.best_colors.slice(0, 3).join(", ")} passen perfect bij je!`,
            timestamp: Date.now(),
          });
          localStorage.setItem("ff_nova_insights", JSON.stringify(insights));
        }
      } catch {
        // Photo uploaded, analysis optional — continue silently
      }

      setAnalyzing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload mislukt. Probeer opnieuw.");
      setUploading(false);
      setAnalyzing(false);
      onChange(null);
    }
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function clearPhoto() {
    onChange(null);
    setAnalysis(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  const isBusy = uploading || analyzing;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-xs font-semibold"
          style={{ background: "var(--overlay-accent-08a)", border: "1px solid var(--color-border)", color: "var(--ff-color-primary-700)" }}
        >
          <span>Optionele stap</span>
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-1">
          Kleuranalyse via foto
        </h2>
        <p className="text-sm text-[var(--color-muted)] max-w-md mx-auto leading-relaxed">
          Upload een foto van je outfit of jezelf — Nova analyseert welke kleuren het beste bij je passen. <strong className="text-[var(--color-text)]">Geen biometrische data, geen gezichtsherkenning.</strong>
        </p>
      </div>

      {/* What kind of photo — example card */}
      <div
        className="rounded-2xl border border-[var(--color-border)] overflow-hidden"
        style={{ background: "var(--color-surface)" }}
      >
        <button
          type="button"
          onClick={() => setShowTips(p => !p)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--ff-color-primary-50)] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[var(--ff-color-primary-700)]" />
            Wat voor foto werkt het best?
          </span>
          <motion.span
            animate={{ rotate: showTips ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-[var(--color-muted)]"
          >
            ▾
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {showTips && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 border-t border-[var(--color-border)]">
                <div className="flex gap-4 mt-4">
                  {/* Illustration */}
                  <div
                    className="flex-shrink-0 w-24 h-32 rounded-xl flex flex-col items-center justify-center gap-1"
                    style={{ background: "var(--color-bg)", border: "2px dashed var(--color-border)" }}
                  >
                    <ImageIcon className="w-8 h-8 text-[var(--color-muted)]" />
                    <span className="text-[10px] text-center text-[var(--color-muted)] leading-tight px-1">schouder tot heup</span>
                  </div>
                  {/* Tips list */}
                  <ul className="flex-1 space-y-2 pt-1">
                    {PHOTO_TIPS.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text)]">
                        <span className="mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "var(--ff-color-primary-700)" }}>
                          {i + 1}
                        </span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview or Dropzone */}
      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="relative rounded-2xl overflow-hidden"
            style={{ border: "2px solid var(--color-border)" }}
          >
            <img
              src={value}
              alt="Jouw geüploade foto"
              className="w-full max-h-72 object-cover"
            />

            {/* Busy overlay */}
            {isBusy && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
                <p className="text-white font-semibold text-sm">
                  {uploading ? "Foto uploaden..." : "Kleuren analyseren..."}
                </p>
                <p className="text-white/70 text-xs">
                  {analyzing && "Wordt direct verwijderd na analyse"}
                </p>
              </div>
            )}

            {/* Clear button */}
            {!isBusy && (
              <button
                type="button"
                onClick={clearPhoto}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
                aria-label="Foto verwijderen"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}

            {/* Replace button */}
            {!isBusy && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-semibold hover:bg-black/80 transition-colors whitespace-nowrap"
              >
                Andere foto kiezen
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className="relative rounded-2xl transition-all duration-200 cursor-pointer"
              style={{
                border: `2px dashed ${isDragging ? "var(--ff-color-primary-600)" : "var(--color-border)"}`,
                background: isDragging ? "var(--ff-color-primary-50)" : "var(--color-bg)",
                minHeight: "180px",
              }}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
              aria-label="Foto uploaden dropzone"
            >
              <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-200"
                  style={{
                    background: isDragging ? "var(--ff-color-primary-100)" : "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    transform: isDragging ? "scale(1.08)" : "scale(1)",
                  }}
                >
                  <Upload className="w-7 h-7 text-[var(--ff-color-primary-700)]" />
                </div>
                <p className="text-sm font-semibold text-[var(--color-text)] mb-1">
                  Sleep hier een foto naartoe
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  of klik om te bladeren · JPG, PNG, WEBP · max. 5 MB
                </p>
              </div>
            </div>

            {/* Action buttons: gallery + camera (native on mobile) */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-semibold text-[var(--color-text)] hover:border-[var(--ff-color-primary-400)] hover:bg-[var(--ff-color-primary-50)] active:scale-[0.98] transition-all min-h-[48px]"
              >
                <ImageIcon className="w-4 h-4 text-[var(--ff-color-primary-700)]" />
                Uit galerij
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 bg-[var(--ff-color-primary-700)] border-[var(--ff-color-primary-700)] text-sm font-semibold text-white hover:bg-[var(--ff-color-primary-600)] active:scale-[0.98] transition-all min-h-[48px]"
              >
                <Camera className="w-4 h-4" />
                Maak foto
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis result */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl overflow-hidden border border-green-200"
            style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" }}
          >
            <div className="px-4 py-3 flex items-center gap-3 border-b border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-900">Kleuranalyse gereed</p>
                {analysis.confidence && (
                  <p className="text-xs text-green-700">
                    Betrouwbaarheid: {Math.round(analysis.confidence * 100)}%
                  </p>
                )}
              </div>
            </div>
            <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <p className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-0.5">Seizoenstype</p>
                <p className="font-bold text-green-900">{SEASONAL_LABELS[analysis.seasonal_type] ?? analysis.seasonal_type}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-0.5">Ondertoon</p>
                <p className="font-bold text-green-900">{UNDERTONE_LABELS[analysis.undertone] ?? analysis.undertone}</p>
              </div>
              {analysis.best_colors.length > 0 && (
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-1.5">Jouw beste kleuren</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.best_colors.slice(0, 5).map((c, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-white border border-green-200 text-xs font-medium text-green-900">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy notice */}
      <div
        className="rounded-xl px-4 py-3 flex items-start gap-3"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-[var(--color-muted)] leading-relaxed">
          <span className="font-semibold text-[var(--color-text)]">Hoe we jouw foto verwerken: </span>
          De foto wordt alleen gebruikt voor kleuranalyse van kleding. Er vindt geen gezichtsherkenning of biometrische verwerking plaats. Na analyse wordt de foto direct van onze servers verwijderd. Meer info in ons{" "}
          <a href="/privacy" className="underline hover:text-[var(--color-text)] transition-colors">
            privacybeleid
          </a>
          .
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileInput} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileInput} />
    </div>
  );
}
