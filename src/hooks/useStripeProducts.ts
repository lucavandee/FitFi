import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

interface StripeProduct {
  id: string;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  is_featured: boolean;
  is_active: boolean;
}

export function useStripeProducts() {
  return useQuery({
    queryKey: ['stripe-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stripe_products')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('price', { ascending: false });

      if (error) throw error;
      return data as StripeProduct[];
    },
    staleTime: 1000 * 60 * 5,
  });
}
