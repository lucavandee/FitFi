import { outfits } from '../data/outfits';
import { Outfit } from '../data/outfits';
import supabase from '../lib/supabase';
import { USE_SUPABASE } from '../config/app-config';

/**
 * Fetches outfits from Supabase with fallback to local data
 * Simulates API behavior with latency and potential errors
 * 
 * @returns Promise<Outfit[]> - Array of outfits or empty array on error
 */
export async function fetchOutfits(): Promise<Outfit[]> {
  try {
    // Simulate network latency (300ms)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simulate 10% chance of a fetch error for testing purposes
    if (Math.random() < 0.1) {
      throw new Error('Simulated fetch error');
    }
    
    // If Supabase is enabled, try to fetch from there first
    if (USE_SUPABASE) {
      try {
        // Fetch outfits from Supabase
        const { data, error } = await supabase
          .from('outfits')
          .select(`
            *,
            products:outfit_items(*)
          `);
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log(`Fetched ${data.length} outfits from Supabase`);
          
          // Transform Supabase data to match Outfit interface
          const transformedOutfits = data.map(outfit => ({
            id: outfit.id,
            name: outfit.title,
            gender: outfit.gender || 'female', // Default to female if not specified
            archetype: outfit.archetype || 'casual_chic', // Default to casual_chic if not specified
            season: outfit.season || 'fall', // Default to fall if not specified
            products: outfit.products.map((product: any) => product.id),
            imageUrl: outfit.image_url || outfit.imageUrl || 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg',
            explanation: outfit.explanation || `Deze outfit is perfect voor ${outfit.season || 'het huidige seizoen'}.`
          }));
          
          return transformedOutfits;
        }
      } catch (supabaseError) {
        console.warn('Failed to fetch outfits from Supabase:', supabaseError);
        // Continue to fallback
      }
    }
    
    // Return outfits from local data as fallback
    console.warn('Using local fallback data for outfits');
    return outfits;
  } catch (error) {
    // Log warning and return empty array as fallback
    console.warn('Failed to fetch outfits. Using fallback.', error);
    return [];
  }
}

/**
 * Fetches a specific outfit by ID
 * 
 * @param id - Outfit ID to fetch
 * @returns Promise<Outfit | null> - Outfit or null if not found
 */
export async function fetchOutfitById(id: string): Promise<Outfit | null> {
  try {
    // Simulate network latency (200ms)
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Simulate 10% chance of a fetch error
    if (Math.random() < 0.1) {
      throw new Error('Simulated fetch error');
    }
    
    // If Supabase is enabled, try to fetch from there first
    if (USE_SUPABASE) {
      try {
        // Fetch outfit from Supabase
        const { data, error } = await supabase
          .from('outfits')
          .select(`
            *,
            products:outfit_items(*)
          `)
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Transform Supabase data to match Outfit interface
          return {
            id: data.id,
            name: data.title,
            gender: data.gender || 'female',
            archetype: data.archetype || 'casual_chic',
            season: data.season || 'fall',
            products: data.products.map((product: any) => product.id),
            imageUrl: data.image_url || data.imageUrl || 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg',
            explanation: data.explanation || `Deze outfit is perfect voor ${data.season || 'het huidige seizoen'}.`
          };
        }
      } catch (supabaseError) {
        console.warn(`Failed to fetch outfit with ID ${id} from Supabase:`, supabaseError);
        // Continue to fallback
      }
    }
    
    // Find outfit by ID in local data as fallback
    const outfit = outfits.find(outfit => outfit.id === id);
    
    if (!outfit) {
      throw new Error(`Outfit with ID ${id} not found`);
    }
    
    return outfit;
  } catch (error) {
    // Log warning and return null
    console.warn(`Failed to fetch outfit with ID ${id}. Using fallback.`, error);
    return null;
  }
}

/**
 * Fetches outfits filtered by gender, season, and/or archetype
 * Uses Supabase's built-in filtering capabilities when available
 * 
 * @param filters - Object with gender, season, and/or archetype filters
 * @returns Promise<Outfit[]> - Filtered array of outfits
 */
export async function fetchFilteredOutfits(
  filters: {
    gender?: 'male' | 'female';
    season?: 'summer' | 'fall' | 'winter' | 'spring';
    archetype?: string;
  }
): Promise<Outfit[]> {
  try {
    // Simulate network latency (350ms)
    await new Promise(resolve => setTimeout(resolve, 350));
    
    // Simulate 10% chance of a fetch error
    if (Math.random() < 0.1) {
      throw new Error('Simulated fetch error');
    }
    
    // If Supabase is enabled, try to fetch with server-side filtering
    if (USE_SUPABASE) {
      try {
        // Start building the query
        let query = supabase
          .from('outfits')
          .select(`
            *,
            products:outfit_items(*)
          `);
        
        // Add filters conditionally
        if (filters.gender) {
          query = query.eq('gender', filters.gender);
        }
        
        if (filters.season) {
          query = query.eq('season', filters.season);
        }
        
        if (filters.archetype) {
          query = query.eq('archetype', filters.archetype);
        }
        
        // Log the query being executed
        console.log(`Executing Supabase query with filters:`, filters);
        
        // Execute the query
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log(`Fetched ${data.length} filtered outfits from Supabase`);
          
          // Transform Supabase data to match Outfit interface
          const transformedOutfits = data.map(outfit => ({
            id: outfit.id,
            name: outfit.title,
            gender: outfit.gender || 'female',
            archetype: outfit.archetype || 'casual_chic',
            season: outfit.season || 'fall',
            products: outfit.products.map((product: any) => product.id),
            imageUrl: outfit.image_url || outfit.imageUrl || 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg',
            explanation: outfit.explanation || `Deze outfit is perfect voor ${outfit.season || 'het huidige seizoen'}.`
          }));
          
          return transformedOutfits;
        } else {
          console.log(`No outfits found in Supabase matching filters:`, filters);
        }
      } catch (supabaseError) {
        console.warn('Failed to fetch filtered outfits from Supabase:', supabaseError);
        // Continue to fallback
      }
    }
    
    // Filter outfits based on provided filters using local data as fallback
    let filteredOutfits = [...outfits];
    
    if (filters.gender) {
      filteredOutfits = filteredOutfits.filter(outfit => outfit.gender === filters.gender);
    }
    
    if (filters.season) {
      filteredOutfits = filteredOutfits.filter(outfit => outfit.season === filters.season);
    }
    
    if (filters.archetype) {
      filteredOutfits = filteredOutfits.filter(outfit => outfit.archetype === filters.archetype);
    }
    
    console.warn('Using local fallback data for filtered outfits');
    return filteredOutfits;
  } catch (error) {
    // Log warning and return empty array as fallback
    console.warn('Failed to fetch filtered outfits. Using fallback.', error);
    return [];
  }
}

/**
 * Fetches recommended outfits for a user
 * In a real implementation, this would use user preferences to filter outfits
 * 
 * @param userId - User ID to fetch recommendations for
 * @param count - Number of recommendations to return
 * @returns Promise<Outfit[]> - Array of recommended outfits
 */
export async function fetchRecommendedOutfits(
  userId: string,
  count: number = 3
): Promise<Outfit[]> {
  try {
    // Simulate network latency (400ms)
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Simulate 10% chance of a fetch error
    if (Math.random() < 0.1) {
      throw new Error('Simulated fetch error');
    }
    
    // If Supabase is enabled, try to fetch from there first
    if (USE_SUPABASE) {
      try {
        // First, get user preferences
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(`
            *,
            style_preferences(*)
          `)
          .eq('id', userId)
          .single();
        
        if (userError) {
          throw userError;
        }
        
        if (userData) {
          // Use user preferences to fetch recommended outfits
          // This is a simplified example - in a real app, you would use more sophisticated matching
          const stylePreferences = userData.style_preferences;
          
          // Determine the user's preferred archetype based on style preferences
          let preferredArchetype = 'casual_chic'; // Default
          
          if (stylePreferences) {
            const preferences = {
              casual: stylePreferences.casual || 3,
              formal: stylePreferences.formal || 3,
              sporty: stylePreferences.sporty || 3,
              vintage: stylePreferences.vintage || 3,
              minimalist: stylePreferences.minimalist || 3
            };
            
            // Simple logic to determine preferred archetype
            if (preferences.formal > preferences.casual && preferences.formal > preferences.sporty) {
              preferredArchetype = 'klassiek';
            } else if (preferences.sporty > preferences.casual && preferences.sporty > preferences.formal) {
              preferredArchetype = 'streetstyle';
            } else if (preferences.vintage > preferences.casual && preferences.vintage > preferences.formal) {
              preferredArchetype = 'retro';
            } else if (preferences.minimalist > preferences.casual && preferences.minimalist > preferences.formal) {
              preferredArchetype = 'urban';
            }
          }
          
          // Fetch outfits matching the preferred archetype
          const { data: outfitData, error: outfitError } = await supabase
            .from('outfits')
            .select(`
              *,
              products:outfit_items(*)
            `)
            .eq('archetype', preferredArchetype)
            .eq('gender', userData.gender || 'female')
            .limit(count);
          
          if (outfitError) {
            throw outfitError;
          }
          
          if (outfitData && outfitData.length > 0) {
            console.log(`Fetched ${outfitData.length} recommended outfits from Supabase`);
            
            // Transform Supabase data to match Outfit interface
            const transformedOutfits = outfitData.map(outfit => ({
              id: outfit.id,
              name: outfit.title,
              gender: outfit.gender || 'female',
              archetype: outfit.archetype || 'casual_chic',
              season: outfit.season || 'fall',
              products: outfit.products.map((product: any) => product.id),
              imageUrl: outfit.image_url || outfit.imageUrl || 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg',
              explanation: outfit.explanation || `Deze outfit is perfect voor ${outfit.season || 'het huidige seizoen'}.`
            }));
            
            return transformedOutfits;
          }
        }
      } catch (supabaseError) {
        console.warn(`Failed to fetch recommended outfits for user ${userId} from Supabase:`, supabaseError);
        // Continue to fallback
      }
    }
    
    // In a real implementation, we would fetch user preferences
    // and use them to filter outfits. For now, we'll just return
    // a random selection of outfits from local data as fallback.
    
    // Shuffle outfits and take the requested count
    const shuffled = [...outfits].sort(() => 0.5 - Math.random());
    console.warn('Using local fallback data for recommended outfits');
    return shuffled.slice(0, count);
  } catch (error) {
    // Log warning and return empty array as fallback
    console.warn(`Failed to fetch recommended outfits for user ${userId}. Using fallback.`, error);
    return [];
  }
}

export default {
  fetchOutfits,
  fetchOutfitById,
  fetchFilteredOutfits,
  fetchRecommendedOutfits
};