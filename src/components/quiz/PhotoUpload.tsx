import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Camera, Upload, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Loader as Loader2, Lock, Shield } from "lucide-react";

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

    // Get session ID (works for both logged-in and anonymous users)
    const sessionId = localStorage.getItem('ff_session_id') || crypto.randomUUID();
    localStorage.setItem('ff_session_id', sessionId);

    // IMPORTANT: For onboarding, ALWAYS use anonymous upload
    // This avoids RLS issues with expired/invalid sessions
    // Profile page uses authenticated upload instead
    const userId: string | null = null; // Force anonymous for onboarding

    console.log('[PhotoUpload] Using anonymous upload for onboarding (sessionId:', sessionId, ')');

    // DIRECT UPLOAD TO SUPABASE STORAGE
    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `anon_${sessionId}/${fileName}`; // Always anonymous for onboarding

      console.log('[PhotoUpload] Uploading to user-photos bucket:', filePath);

      // CRITICAL: Create a fresh anonymous client to avoid using cached expired sessions
      // The default supabase client might have a persisted session from localStorage
      // that is expired/invalid, causing RLS policy violations
      const anonClient = await import('@supabase/supabase-js').then(({ createClient }) => {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
        return createClient(url, key, {
          auth: {
            persistSession: false, // Don't use any stored session
            autoRefreshToken: false,
          }
        });
      });

      // Upload directly to storage using the anonymous client
      const { data: uploadData, error: uploadError } = await anonClient.storage
        .from('user-photos')
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('[PhotoUpload] Upload error:', uploadError);
        throw new Error(uploadError.message || 'Upload failed');
      }

      // Get public URL using the same anonymous client
      const { data: { publicUrl } } = anonClient.storage
        .from('user-photos')
        .getPublicUrl(uploadData.path);

      console.log('[PhotoUpload] Upload successful:', publicUrl);

      // Store photo URL in localStorage (onboarding always uses localStorage)
      localStorage.setItem('ff_onboarding_photo_url', publicUrl);

      setUploading(false);
      setError(null);

      // Optional: Trigger AI color analysis using Supabase Edge Function
      setAnalyzing(true);
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const analysisResponse = await fetch(`${supabaseUrl}/functions/v1/analyze-selfie-color`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseAnonKey}`,
            "apikey": supabaseAnonKey
          },
          body: JSON.stringify({
            photoUrl: publicUrl,
            userId: sessionId, // Always use sessionId for onboarding
            isAnonymous: true // Onboarding is always anonymous
          }),
        });

        if (!analysisResponse.ok) {
          throw new Error(`Color analysis failed: ${analysisResponse.status}`);
        }

        const analysisData: ColorAnalysis = await analysisResponse.json();
        setAnalysis(analysisData);

        // Store analysis in localStorage (onboarding always uses localStorage)
        localStorage.setItem('ff_onboarding_photo_analysis', JSON.stringify(analysisData));

        if (onAnalysisComplete) {
          onAnalysisComplete(analysisData);
        }

        // Trigger Nova insight about color analysis
        if (analysisData && analysisData.seasonal_type) {
          const novaMessage = `Geweldig! Ik zie dat je een ${analysisData.seasonal_type} kleurtype bent met een ${analysisData.undertone} ondertoon. Dat betekent dat kleuren zoals ${analysisData.best_colors.slice(0, 3).join(', ')} perfect bij je passen!`;

          // Store Nova insight for display
          const insights = JSON.parse(localStorage.getItem('ff_nova_insights') || '[]');
          insights.push({
            type: 'color_analysis',
            message: novaMessage,
            timestamp: Date.now()
          });
          localStorage.setItem('ff_nova_insights', JSON.stringify(insights));
        }
      } catch (analysisError) {
        console.warn('[PhotoUpload] Analysis failed, but photo uploaded successfully:', analysisError);
        // Don't throw - photo is uploaded successfully
      }

      setAnalyzing(false);
    } catch (err) {
      console.error("[PhotoUpload] Upload failed:", err);
      setError(
        err instanceof Error ? err.message : "Upload mislukt. Probeer opnieuw."
      );
      setUploading(false);
      setAnalyzing(false);
      onChange(null); // Clear preview on error
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

        {/* Privacy Badge */}
        <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-medium text-green-800">
          <Lock className="w-3.5 h-3.5" />
          <span>100% privé • Geen gezichtsherkenning</span>
        </div>
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

      {/* Enhanced Privacy Notice */}
      <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
        <div className="flex items-start gap-3 mb-3">
          <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)] mb-1">
              Jouw privacy is heilig
            </p>
            <ul className="space-y-1 text-xs text-[var(--color-text)]/70">
              <li className="flex items-start gap-1.5">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Blijft 100% privé, alleen voor kleuradvies</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Geen gezichtsherkenning of biometrische data</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Wordt niet gedeeld met derden, nooit</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Verwijder op elk moment via je profiel</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
