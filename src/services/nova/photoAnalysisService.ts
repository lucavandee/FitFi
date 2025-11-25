import { supabase } from "@/lib/supabaseClient";
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
 * Upload photo via Edge Function (workaround for Storage API bucket sync issues)
 */
async function uploadPhoto(file: File, userId: string): Promise<string> {
  console.log("[uploadPhoto] Starting upload for user:", userId);
  console.log("[uploadPhoto] File details:", {
    name: file.name,
    size: file.size,
    type: file.type
  });

  const sb = supabase();
  if (!sb) {
    console.error("[uploadPhoto] Supabase client is null!");
    throw new Error("Supabase client not initialized");
  }

  // Get current session for auth token
  const { data: { session } } = await sb.auth.getSession();
  if (!session?.access_token) {
    throw new Error("No active session");
  }

  // Convert file to base64
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  console.log("[uploadPhoto] Calling Edge Function...");

  // Call Edge Function to upload
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/upload-outfit-photo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': supabaseAnonKey,
    },
    body: JSON.stringify({
      file: base64,
      filename: file.name,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("[uploadPhoto] Edge Function error:", error);
    throw new Error(error.error || "Upload failed");
  }

  const result = await response.json();
  console.log("[uploadPhoto] Upload successful:", result);

  return result.url;
}

/**
 * Call Edge Function to analyze photo with OpenAI Vision
 */
async function callAnalysisAPI(
  photoBase64: string,
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
      photoBase64,
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
    // 1. Convert file to base64 for AI analysis
    console.log("[PhotoAnalysis] Step 1: Converting to base64...");
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // 2. Upload photo to storage (for record keeping)
    console.log("[PhotoAnalysis] Step 2: Uploading photo...");
    const photoUrl = await uploadPhoto(file, user.id);
    console.log("[PhotoAnalysis] Step 2: Photo uploaded:", photoUrl);

    // 3. Analyze with AI (using base64)
    console.log("[PhotoAnalysis] Step 3: Calling AI analysis...");
    const analysisResult = await callAnalysisAPI(base64, photoUrl, userContext);
    console.log("[PhotoAnalysis] Step 3: AI analysis complete:", analysisResult);

    // 4. Save to database
    console.log("[PhotoAnalysis] Step 4: Saving to database...");
    const savedAnalysis = await saveAnalysis(user.id, photoUrl, analysisResult);
    console.log("[PhotoAnalysis] Step 4: Saved successfully:", savedAnalysis);

    return savedAnalysis;
  } catch (error) {
    console.error("[PhotoAnalysis] Error at step:", error);
    console.error("[PhotoAnalysis] Full error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
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
