import supabase from "@/lib/supabase";

export class DataService {
  async fetchUserData(userId: string) {
    const sb = supabase;
    try {
      const { data, error } = await sb
        .from("users_legacy")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  }

  async fetchOutfits(): Promise<Outfit[]> {
    try {
      const sb = supabase;
      const { data, error } = await sb
        .from("outfits")
        .select("*");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching outfits:", error);
      throw error;
    }
  }

  async fetchProducts(): Promise<Product[]> {
    try {
      const sb = supabase;
      const { data, error } = await sb
        .from("products")
        .select("*");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  async saveQuizAnswers(userId: string, answers: Record<string, any>): Promise<void> {
    const sb = supabase;
    
    for (const [questionId, answer] of Object.entries(answers)) {
      const { error } = await sb
        .from("quiz_answers")
        .upsert({
          user_id: userId,
          question_id: questionId,
          answer: answer,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("Error saving quiz answer:", error);
        throw error;
      }
    }
  }

  async fetchQuizAnswers(userId: string): Promise<Record<string, any>> {
    const sb = supabase;
    
    const { data, error } = await sb
      .from("quiz_answers")
      .select("question_id, answer")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching quiz answers:", error);
      throw error;
    }

    const answers: Record<string, any> = {};
    data?.forEach(row => {
      answers[row.question_id] = row.answer;
    });

    return answers;
  }

  async saveOutfit(userId: string, outfitId: string): Promise<void> {
    const sb = supabase;
    
    const { error } = await sb
      .from("saved_outfits")
      .upsert({
        user_id: userId,
        outfit_id: outfitId,
        saved_at: new Date().toISOString()
      });

    if (error) {
      console.error("Error saving outfit:", error);
      throw error;
    }
  }

  async fetchSavedOutfits(userId: string): Promise<string[]> {
    const sb = supabase;
    
    const { data, error } = await sb
      .from("saved_outfits")
      .select("outfit_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching saved outfits:", error);
      throw error;
    }

    return data?.map(row => row.outfit_id) || [];
  }
}