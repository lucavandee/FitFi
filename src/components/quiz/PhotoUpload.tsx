import React, { useState, useRef, useEffect } from "react";
import { Spinner } from '@/components/ui/Spinner';
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, AlertCircle, CheckCircle, Shield, X, Info, ImageIcon } from "lucide-react";
import { getSessionId } from '@/utils/sessionId';
import {
  SELFIE_ANALYSE_SLEUTEL,
  SELFIE_BUCKET,
  SELFIE_MAX_BYTES,
  SELFIE_PAD_SLEUTEL,
  extensieVoorType,
  isOpslagPad,
  isSelfieAnalyse,
  maakSelfiePad,
  sessieUitPad,
  vraagSelfieAnalyse,
  type SelfieAnalyse,
} from '@/lib/quiz/selfieFoto';

type ColorAnalysis = SelfieAnalyse;

type Props = {
  /** Opslagpad van de selfie (anon_<sessie-id>/<bestand>). Nooit een data-URL. */
  value?: string | null;
  /** De analyse uit de antwoorden (colorAnalysis), om na terugbladeren te tonen. */
  analysis?: unknown;
  onChange: (pad: string | null) => void;
  /** null als de foto weg is of een nieuwe upload begint: de oude analyse telt dan niet meer. */
  onAnalysisComplete?: (analysis: ColorAnalysis | null) => void;
};

// De analyse kijkt naar huid, haar en ogen (prompt in analyze-selfie-color).
// Hier stond "schouder tot heup" en "draag kleding", tips voor een outfitfoto.
const PHOTO_TIPS = [
  "Gezicht en haar goed in beeld",
  "Daglicht, geen felle schaduwen",
  "Zonder filter of bewerking",
  "Een neutrale, lichte achtergrond",
];

type Melding =
  | { soort: "fout"; tekst: string }
  | { soort: "mislukt" }
  | { soort: "limiet" }
  | null;

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

export default function PhotoUpload({ value, analysis: bewaardeAnalyse, onChange, onAnalysisComplete }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [melding, setMelding] = useState<Melding>(null);
  // Na terugbladeren is er geen voorbeeld meer, wel het pad en misschien de analyse.
  const [analysis, setAnalysis] = useState<ColorAnalysis | null>(() =>
    isOpslagPad(value) && isSelfieAnalyse(bewaardeAnalyse) ? bewaardeAnalyse : null
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Het voorbeeld is een lokale object-URL van het gekozen bestand. De foto
  // zelf gaat niet in de antwoorden: daar staat alleen het opslagpad.
  const previewRef = useRef<string | null>(null);
  function toonVoorbeeld(file: File | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = file ? URL.createObjectURL(file) : null;
    setPreview(previewRef.current);
  }
  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  function vergeetAnalyse() {
    setAnalysis(null);
    try {
      // Oude sleutel: de analyse staat nu alleen in de antwoorden.
      localStorage.removeItem(SELFIE_ANALYSE_SLEUTEL);
    } catch {
      /* geen opslag beschikbaar */
    }
    onAnalysisComplete?.(null);
  }

  async function analyseer(pad: string) {
    setMelding(null);
    setAnalyzing(true);
    const uitkomst = await vraagSelfieAnalyse({
      pad,
      sessionId: sessieUitPad(pad) ?? getSessionId(),
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    });
    setAnalyzing(false);

    if (uitkomst.status === "ok") {
      setAnalysis(uitkomst.analyse);
      onAnalysisComplete?.(uitkomst.analyse);
      return;
    }
    // Geen stille doorgang meer: de foto staat er, de analyse niet, en dat ziet de gebruiker.
    setMelding({ soort: uitkomst.status });
  }

  async function processFile(file: File) {
    if (!extensieVoorType(file.type)) {
      setMelding({ soort: "fout", tekst: "Kies een foto in JPG, PNG of WEBP." });
      return;
    }
    if (file.size > SELFIE_MAX_BYTES) {
      setMelding({ soort: "fout", tekst: "Kies een foto kleiner dan 5 MB." });
      return;
    }

    setMelding(null);
    vergeetAnalyse();
    toonVoorbeeld(file);

    const pad = maakSelfiePad(getSessionId(), file.type);
    if (!pad) return;

    setUploading(true);
    try {
      const anonClient = await import("@supabase/supabase-js").then(({ createClient }) =>
        createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      );

      const { error: uploadError } = await anonClient.storage
        .from(SELFIE_BUCKET)
        .upload(pad, file, { contentType: file.type, cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;
    } catch {
      setUploading(false);
      toonVoorbeeld(null);
      onChange(null);
      setMelding({ soort: "fout", tekst: "Uploaden lukte niet. Probeer het opnieuw of sla deze stap over." });
      return;
    }
    setUploading(false);

    try {
      localStorage.setItem(SELFIE_PAD_SLEUTEL, pad);
    } catch {
      /* geen opslag beschikbaar */
    }
    onChange(pad);
    await analyseer(pad);
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

  // Haalt de foto uit de quiz. Het bestand in de opslag blijft staan; daarvoor
  // is een verzoek aan privacy@fitfi.ai nodig (privacyverklaring, sectie 2).
  function clearPhoto() {
    onChange(null);
    vergeetAnalyse();
    toonVoorbeeld(null);
    setMelding(null);
    try {
      localStorage.removeItem(SELFIE_PAD_SLEUTEL);
    } catch {
      /* geen opslag beschikbaar */
    }
    if (inputRef.current) inputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  const isBusy = uploading || analyzing;
  const opgeslagenPad = isOpslagPad(value) ? value : null;
  const heeftFoto = Boolean(opgeslagenPad || preview);
  // Een opgeslagen foto zonder analyse: mislukt, limiet, of terugbladeren na
  // een mislukte poging. In alle drie de gevallen zegt het scherm dat.
  const zonderAnalyse = !isBusy && Boolean(opgeslagenPad) && !analysis;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-xs font-semibold"
          style={{ background: "var(--overlay-accent-08a)", border: "1px solid #E5E5E5", color: "#9A503B" }}
        >
          <span>Optionele stap</span>
        </div>
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-1">
          Kleuranalyse via foto
        </h2>
        <p className="text-sm text-[#6E6E6E] max-w-md mx-auto leading-relaxed">
          Een selfie in daglicht. De analyse bepaalt je ondertoon en kleurseizoen uit je huid, haar en ogen.
        </p>
      </div>

      {/* Wat voor foto: voorbeeldkaart */}
      <div
        className="rounded-2xl border border-[#E5E5E5] overflow-hidden"
        style={{ background: "#FFFFFF" }}
      >
        <button
          type="button"
          onClick={() => setShowTips(p => !p)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-[#1A1A1A] hover:bg-[#F5F0EB] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#9A503B]" />
            Wat voor foto werkt het best?
          </span>
          <motion.span
            animate={{ rotate: showTips ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-[#6E6E6E]"
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
              <div className="px-4 pb-4 border-t border-[#E5E5E5]">
                <div className="flex gap-4 mt-4">
                  {/* Illustration */}
                  <div
                    className="flex-shrink-0 w-24 h-32 rounded-xl flex flex-col items-center justify-center gap-1"
                    style={{ background: "#FAFAF8", border: "2px dashed #E5E5E5" }}
                  >
                    <ImageIcon className="w-8 h-8 text-[#6E6E6E]" />
                    <span className="text-xs text-center text-[#6E6E6E] leading-tight px-1">gezicht en haar</span>
                  </div>
                  {/* Tips list */}
                  <ul className="flex-1 space-y-2 pt-1">
                    {PHOTO_TIPS.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#1A1A1A]">
                        <span className="mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#9A503B" }}>
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
        {heeftFoto ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="relative rounded-2xl overflow-hidden"
            style={{ border: "2px solid #E5E5E5" }}
          >
            {preview ? (
              <img
                src={preview}
                alt="Jouw geüploade foto"
                className="w-full max-h-72 object-cover"
              />
            ) : (
              // Na terugbladeren staat alleen het pad in de antwoorden. De foto
              // zelf is niet openbaar op te halen en wordt dus niet getoond.
              <div className="flex flex-wrap items-center gap-3 bg-[#FFFFFF] px-4 py-4 pr-14">
                <ImageIcon className="w-5 h-5 text-[#9A503B] flex-shrink-0" />
                <p className="text-sm text-[#4A4A4A] flex-1">Je foto is toegevoegd.</p>
                {!isBusy && (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="bg-white border border-[#E5E5E5] hover:border-[#A85740] text-[#1A1A1A] font-medium text-base py-3 px-6 rounded-xl min-h-[48px] transition-colors duration-200"
                  >
                    Andere foto kiezen
                  </button>
                )}
              </div>
            )}

            {/* Busy overlay */}
            {isBusy && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                <Spinner size="md" />
                <p className="text-white font-semibold text-sm">
                  {uploading ? "Foto uploaden..." : "Kleuren analyseren..."}
                </p>
              </div>
            )}

            {/* Wisknop: haalt de foto uit de quiz, niet uit de opslag */}
            {!isBusy && (
              <button
                type="button"
                onClick={clearPhoto}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
                aria-label="Foto weghalen uit de quiz"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}

            {/* Replace button */}
            {!isBusy && preview && (
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
                border: `2px dashed ${isDragging ? "#A85740" : "#E5E5E5"}`,
                background: isDragging ? "#F5F0EB" : "#FAFAF8",
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
                    background: isDragging ? "#F5F0EB" : "#FFFFFF",
                    border: "1px solid #E5E5E5",
                    transform: isDragging ? "scale(1.08)" : "scale(1)",
                  }}
                >
                  <Upload className="w-7 h-7 text-[#9A503B]" />
                </div>
                <p className="text-sm font-semibold text-[#1A1A1A] mb-1">
                  Sleep hier een foto naartoe
                </p>
                <p className="text-xs text-[#6E6E6E]">
                  of klik om te bladeren · JPG, PNG, WEBP · max. 5 MB
                </p>
              </div>
            </div>

            {/* Action buttons: gallery + camera (native on mobile) */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-[#E5E5E5] bg-[#FFFFFF] text-sm font-semibold text-[#1A1A1A] hover:border-[#A85740] hover:bg-[#F5F0EB] active:scale-[0.98] transition-all min-h-[48px]"
              >
                <ImageIcon className="w-4 h-4 text-[#9A503B]" />
                Uit galerij
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 bg-[#9A503B] border-[#9A503B] text-sm font-semibold text-white hover:bg-[#A85740] active:scale-[0.98] transition-all min-h-[48px]"
              >
                <Camera className="w-4 h-4" />
                Maak foto
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Melding: een fout bij kiezen of uploaden, of een foto zonder analyse */}
      <AnimatePresence>
        {(melding?.soort === "fout" || zonderAnalyse) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 p-4 bg-[#F5F0EB] border border-[#E5E5E5] rounded-2xl"
            role="status"
            aria-live="polite"
          >
            <AlertCircle className="w-5 h-5 text-[#A85740] flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-3">
              <p className="text-sm text-[#4A4A4A] leading-relaxed">
                {melding?.soort === "fout"
                  ? melding.tekst
                  : melding?.soort === "limiet"
                    ? "Het maximum aantal foto-analyses voor deze sessie is bereikt. Je kleuradvies komt nu uit je quizantwoorden."
                    : "De kleuranalyse is niet gelukt. Je foto staat wel opgeslagen. Probeer het opnieuw, of ga verder: je kleuradvies komt dan uit je quizantwoorden."}
              </p>
              {melding?.soort !== "fout" && melding?.soort !== "limiet" && opgeslagenPad && (
                <button
                  type="button"
                  onClick={() => analyseer(opgeslagenPad)}
                  className="bg-white border border-[#E5E5E5] hover:border-[#A85740] text-[#1A1A1A] font-medium text-base py-3 px-6 rounded-xl min-h-[48px] transition-colors duration-200"
                >
                  Opnieuw proberen
                </button>
              )}
            </div>
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
                {/* Geen "Betrouwbaarheid: n%": dat getal schat het model zelf, het is niet gemeten. */}
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
        style={{ background: "#FFFFFF", border: "1px solid #E5E5E5" }}
      >
        <Shield className="w-4 h-4 text-[#A85740] flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs text-[#6E6E6E] leading-relaxed">
          <span className="font-semibold text-[#1A1A1A]">Wat er met je foto gebeurt: </span>
          we bewaren hem bij Supabase in Frankfurt, zonder openbare link. Voor de kleuranalyse krijgt OpenAI in de VS een link naar de foto die 60 seconden werkt. De foto blijft staan tot je om verwijdering vraagt via{" "}
          <a href="mailto:privacy@fitfi.ai" className="underline hover:text-[#1A1A1A] transition-colors">
            privacy@fitfi.ai
          </a>
          ; meer in ons{" "}
          <a href="/privacy" className="underline hover:text-[#1A1A1A] transition-colors">
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
