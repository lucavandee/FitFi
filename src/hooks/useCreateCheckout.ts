import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

interface CheckoutParams {
  productId?: string;
  priceId?: string;
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: async ({ productId, priceId }: CheckoutParams) => {
      const client = supabase();

      if (!client) {
        throw new Error('Supabase client niet beschikbaar');
      }

      const { data: { session } } = await client.auth.getSession();

      if (!session) {
        throw new Error('Je moet ingelogd zijn om te kunnen betalen');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': anonKey,
          },
          body: JSON.stringify({ productId, priceId }),
        }
      );

      if (!response.ok) {
        let errorMessage = 'Checkout sessie aanmaken mislukt';
        try {
          const error = await response.json();
          console.error('Checkout error response:', error);
          errorMessage = error.error || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    },
  });
}
