import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  stripe_product_id: string;
  stripe_price_id: string;
  product_id: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  stripe_products?: {
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: string;
    features: string[];
  };
}

export function useSubscription() {
  return useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      const client = supabase();

      if (!client) {
        throw new Error('Supabase client not available');
      }

      const { data: { user } } = await client.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await client
        .from('customer_subscriptions')
        .select(`
          *,
          stripe_products (
            name,
            description,
            price,
            currency,
            interval,
            features
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []) as Subscription[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useActiveSubscription() {
  const { data: subscriptions, ...rest } = useSubscription();

  const activeSubscription = subscriptions?.find(
    sub => sub.status === 'active' || sub.status === 'trialing'
  );

  return {
    subscription: activeSubscription,
    hasActiveSubscription: !!activeSubscription,
    ...rest,
  };
}
