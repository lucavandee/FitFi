import { supabase } from "@/lib/supabase";
import type { EnhancedNovaContext } from "./enhancedUserContext";

export interface PhotoAnalysisResult {
  id: string;
  photo_url: string;
  detected_items: string[];
  detected_colors: string[];
  detected_style: string;
  match_score: number;
  feedback: string;
  suggestions: string[];
  created_at: string;
}

export interface AnalyzePhotoOptions {
  file: File;
  userContext?: EnhancedNovaContext;
}

/**
 * Upload photo to Supabase storage
 */
async function uploadPhoto(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("outfit-photos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload photo: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("outfit-photos").getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Call Edge Function to analyze photo with OpenAI Vision
 */
async function callAnalysisAPI(
  photoUrl: string,
  userContext?: EnhancedNovaContext
): Promise<any> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase configuration missing");
  }

  // Get session token for authenticated request
  const sb = supabase();
  const {
    data: { session },
  } = await sb.auth.getSession();

  if (!session) {
    throw new Error("User must be authenticated");
  }

  const endpoint = `${supabaseUrl}/functions/v1/analyze-outfit-photo`;

  // Build user profile for analysis
  const userProfile = userContext
    ? {
        archetype: userContext.archetype,
        undertone: userContext.colorProfile.undertone,
        colorPalette: userContext.colorProfile.palette,
        stylePreferences: userContext.stylePreferences || [],
      }
    : undefined;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify({
      photoUrl,
      userProfile,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to analyze photo");
  }

  return await response.json();
}

/**
 * Save analysis result to database
 */
async function saveAnalysis(
  userId: string,
  photoUrl: string,
  analysisResult: any
): Promise<PhotoAnalysisResult> {
  const { data, error } = await supabase()
    .from("photo_analyses")
    .insert({
      user_id: userId,
      photo_url: photoUrl,
      analysis_result: analysisResult,
      detected_items: analysisResult.analysis?.detected_items || [],
      detected_colors: analysisResult.analysis?.detected_colors || [],
      detected_style: analysisResult.analysis?.detected_style || "unknown",
      match_score: analysisResult.analysis?.match_score || 0,
      feedback: analysisResult.analysis?.feedback || "",
      suggestions: analysisResult.analysis?.suggestions || [],
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save analysis: ${error.message}`);
  }

  return data as PhotoAnalysisResult;
}

/**
 * Main function: Analyze outfit photo
 */
export async function analyzeOutfitPhoto(
  options: AnalyzePhotoOptions
): Promise<PhotoAnalysisResult> {
  const { file, userContext } = options;

  // Get current user
  const sb = supabase();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated");
  }

  try {
    // 1. Upload photo
    const photoUrl = await uploadPhoto(file, user.id);

    // 2. Analyze with AI
    const analysisResult = await callAnalysisAPI(photoUrl, userContext);

    // 3. Save to database
    const savedAnalysis = await saveAnalysis(user.id, photoUrl, analysisResult);

    return savedAnalysis;
  } catch (error) {
    console.error("[PhotoAnalysis] Error:", error);
    throw error;
  }
}

/**
 * Fetch user's photo analyses
 */
export async function getUserPhotoAnalyses(
  userId: string,
  limit = 10
): Promise<PhotoAnalysisResult[]> {
  try {
    const { data, error } = await supabase()
      .from("photo_analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[getUserPhotoAnalyses] Database error:", error);
      // Return empty array instead of throwing - graceful degradation
      return [];
    }

    return (data || []) as PhotoAnalysisResult[];
  } catch (err) {
    console.error("[getUserPhotoAnalyses] Unexpected error:", err);
    // Return empty array for graceful degradation
    return [];
  }
}

/**
 * Delete photo analysis
 */
export async function deletePhotoAnalysis(id: string): Promise<void> {
  const { error } = await supabase().from("photo_analyses").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete analysis: ${error.message}`);
  }
}
