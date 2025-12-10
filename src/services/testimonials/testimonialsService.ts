import { supabase } from '@/lib/supabase';

export interface Testimonial {
  id: string;
  quote: string;
  author_name: string;
  author_age: number | null;
  author_avatar_url: string | null;
  rating: number;
  is_verified: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateTestimonialInput {
  quote: string;
  author_name: string;
  author_age?: number | null;
  author_avatar_url?: string | null;
  rating: number;
  is_verified?: boolean;
  is_active?: boolean;
  display_order?: number;
}

export interface UpdateTestimonialInput extends Partial<CreateTestimonialInput> {
  id: string;
}

/**
 * Fetch active testimonials for public display
 */
export async function getActiveTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active testimonials:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch all testimonials (admin only)
 */
export async function getAllTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all testimonials:', error);
    throw error;
  }

  return data || [];
}

/**
 * Create a new testimonial (admin only)
 */
export async function createTestimonial(input: CreateTestimonialInput): Promise<Testimonial> {
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('testimonials')
    .insert({
      ...input,
      created_by: user?.user?.id || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating testimonial:', error);
    throw error;
  }

  return data;
}

/**
 * Update a testimonial (admin only)
 */
export async function updateTestimonial({ id, ...updates }: UpdateTestimonialInput): Promise<Testimonial> {
  const { data, error } = await supabase
    .from('testimonials')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating testimonial:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a testimonial (admin only)
 */
export async function deleteTestimonial(id: string): Promise<void> {
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting testimonial:', error);
    throw error;
  }
}

/**
 * Toggle testimonial active status
 */
export async function toggleTestimonialActive(id: string, isActive: boolean): Promise<void> {
  await updateTestimonial({ id, is_active: isActive });
}
