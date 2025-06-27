import supabase from './supabase';
import { Product } from '../types/Product';

/**
 * Fetches products from Supabase database
 * @returns Array of products
 */
export const fetchProductsFromSupabase = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products from Supabase:', error);
      return [];
    }
    
    return data as Product[];
  } catch (error) {
    console.error('Exception when fetching products from Supabase:', error);
    return [];
  }
};

export default {
  fetchProductsFromSupabase
};