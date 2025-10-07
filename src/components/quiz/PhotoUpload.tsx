import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Camera, Upload, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Loader as Loader2 } from "lucide-react";

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

export default function PhotoUpload({ value, onChange, onAnalysisComplete }: Props) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ColorAnalysis | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      setError("Upload alsjeblieft een afbeelding");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Afbeelding moet kleiner zijn dan 5MB");
      return;
    }

    setError(null);

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = () => onChange((reader.result as string) || null);
    reader.readAsDataURL(file);

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Je moet ingelogd zijn om een foto te uploaden");
      return;
    }

    // Upload to Supabase Storage
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/selfie-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("user-photos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("user-photos").getPublicUrl(fileName);

      // Save photo URL to style_profiles
      const { error: updateError } = await supabase
        .from("style_profiles")
        .update({ photo_url: publicUrl })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Failed to save photo URL:", updateError);
      }

      setUploading(false);

      // Trigger AI color analysis
      setAnalyzing(true);
      const response = await fetch("/.netlify/functions/analyze-color", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl: publicUrl, userId: user.id }),
      });

      if (!response.ok) {
        throw new Error(`Color analysis failed: ${response.status}`);
      }

      const analysisData: ColorAnalysis = await response.json();
      setAnalysis(analysisData);

      if (onAnalysisComplete) {
        onAnalysisComplete(analysisData);
      }
    } catch (err) {
      console.error("Upload/analysis error:", err);
      setError(
        err instanceof Error ? err.message : "Upload mislukt. Probeer opnieuw."
      );
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  }

  function pickFile() {
    inputRef.current?.click();
  }

  return (
    <div
      className={[
        "rounded-[var(--radius-2xl)] border border-[var(--color-border)]",
        "bg-[var(--color-surface)] shadow-[var(--shadow-soft)]",
        "pt-7 pb-6 px-5 sm:px-6",
      ].join(" ")}
    >
      <div className="text-center mb-4">
        <Camera className="w-12 h-12 mx-auto mb-3 text-[var(--color-text)]/40" />
        <h2 className="text-lg font-semibold">Upload een selfie (optioneel)</h2>
        <p className="mt-2 text-sm text-[var(--color-text)]/70">
          Voor de beste kleurenanalyse: natuurlijk licht, geen filters, frontaal
          gezicht
        </p>
      </div>

      {value && (
        <div className="relative mb-4">
          <img
            src={value}
            alt="Preview"
            className="w-full max-w-sm mx-auto rounded-[var(--radius-xl)] border border-[var(--color-border)]"
          />
          {(uploading || analyzing) && (
            <div className="absolute inset-0 bg-black/50 rounded-[var(--radius-xl)] flex items-center justify-center">
              <div className="text-white text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">
                  {uploading ? "Uploaden..." : "Kleuren analyseren..."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-[var(--radius-lg)]">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {analysis && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-[var(--radius-lg)]">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-green-900">Kleurenanalyse compleet!</h3>
          </div>
          <div className="space-y-2 text-sm text-green-800">
            <p>
              <strong>Ondertoon:</strong> {analysis.undertone}
            </p>
            <p>
              <strong>Seizoenstype:</strong> {analysis.seasonal_type}
            </p>
            <p>
              <strong>Jouw beste kleuren:</strong>{" "}
              {analysis.best_colors.slice(0, 5).join(", ")}
            </p>
            {analysis.confidence && (
              <p className="text-xs opacity-70">
                Betrouwbaarheid: {Math.round(analysis.confidence * 100)}%
              </p>
            )}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />

      <button
        type="button"
        className="w-full rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm font-medium hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={pickFile}
        disabled={uploading || analyzing}
      >
        {uploading || analyzing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        {uploading
          ? "Uploaden..."
          : analyzing
          ? "Analyseren..."
          : value
          ? "Kies andere foto"
          : "Kies een foto"}
      </button>

      <p className="mt-3 text-xs text-[var(--color-text)]/50 text-center">
        Je foto wordt veilig opgeslagen en alleen gebruikt voor kleurenanalyse. Je
        kunt deze later verwijderen.
      </p>
    </div>
  );
}
