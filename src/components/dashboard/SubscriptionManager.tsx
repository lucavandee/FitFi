import React, { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { Crown, CreditCard, Calendar, AlertCircle, ExternalLink, Loader2, CheckCircle } from 'lucide-react';

export default function SubscriptionManager() {
  const { data: subscriptions, isLoading, refetch } = useSubscription();
  const [processingPortal, setProcessingPortal] = useState(false);

  const activeSubscription = subscriptions?.find(
    sub => sub.status === 'active' || sub.status === 'trialing'
  );

  const handleManageSubscription = async () => {
    setProcessingPortal(true);

    try {
      const client = supabase();

      if (!client) {
        throw new Error('Verbinding niet beschikbaar');
      }

      const { data: { session } } = await client.auth.getSession();

      if (!session) {
        throw new Error('Je moet ingelogd zijn');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-portal-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': anonKey,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Kon portal sessie niet aanmaken');
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(error.message || 'Er ging iets mis');
      setProcessingPortal(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      active: { label: 'Actief', color: 'bg-green-100 text-green-800' },
      trialing: { label: 'Trial', color: 'bg-blue-100 text-blue-800' },
      canceled: { label: 'Geannuleerd', color: 'bg-gray-200 text-gray-700' },
      past_due: { label: 'Betaling achterstallig', color: 'bg-red-100 text-red-800' },
      incomplete: { label: 'Incompleet', color: 'bg-yellow-100 text-yellow-800' },
    };

    const badge = badges[status] || { label: status, color: 'bg-gray-200 text-gray-700' };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {status === 'active' && <CheckCircle className="w-3 h-3" />}
        {badge.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </section>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-soft)]">
        <header className="flex items-start gap-3 mb-4">
          <CreditCard className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1" />
          <div>
            <h2 className="text-xl font-bold">Abonnement</h2>
            <p className="text-sm text-gray-600 mt-1">Je hebt nog geen actief abonnement</p>
          </div>
        </header>

        <a
          href="/prijzen"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-lg)] font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors"
        >
          Bekijk plannen
        </a>
      </section>
    );
  }

  return (
    <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-soft)]">
      <header className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          {activeSubscription?.stripe_products?.interval === 'one_time' ? (
            <Crown className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1" />
          ) : (
            <CreditCard className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1" />
          )}
          <div>
            <h2 className="text-xl font-bold">Jouw abonnement</h2>
            <p className="text-sm text-gray-600 mt-1">Beheer je abonnement en betalingen</p>
          </div>
        </div>
      </header>

      <div className="space-y-4">
        {subscriptions.map((subscription) => {
          const product = subscription.stripe_products;
          const isActive = subscription.status === 'active' || subscription.status === 'trialing';
          const isLifetime = product?.interval === 'one_time';

          return (
            <article
              key={subscription.id}
              className={`border rounded-[var(--radius-lg)] p-4 ${
                isActive
                  ? 'border-[var(--ff-color-primary-300)] bg-[var(--ff-color-primary-50)]'
                  : 'border-[var(--color-border)] bg-[var(--color-bg)]'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{product?.name || 'Abonnement'}</h3>
                  <p className="text-sm text-gray-600 mt-1">{product?.description}</p>
                </div>
                {getStatusBadge(subscription.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Prijs</p>
                  <p className="font-semibold">
                    €{product?.price || '0.00'}
                    {!isLifetime && ` / ${product?.interval === 'month' ? 'maand' : 'jaar'}`}
                  </p>
                </div>

                {!isLifetime && subscription.current_period_end && (
                  <div>
                    <p className="text-gray-600 mb-1">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {subscription.cancel_at_period_end ? 'Verloopt op' : 'Vernieuwt op'}
                    </p>
                    <p className="font-semibold">
                      {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                )}

                {isLifetime && (
                  <div>
                    <p className="text-gray-600 mb-1">Toegang</p>
                    <p className="font-semibold">Lifetime</p>
                  </div>
                )}
              </div>

              {subscription.cancel_at_period_end && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-[var(--radius-lg)] mb-3">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    Je abonnement is geannuleerd en blijft actief tot {formatDate(subscription.current_period_end)}
                  </p>
                </div>
              )}

              {product?.features && product.features.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Inbegrepen:</p>
                  <ul className="space-y-1">
                    {product.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-[var(--ff-color-primary-600)] mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isActive && !isLifetime && (
                <button
                  onClick={handleManageSubscription}
                  disabled={processingPortal}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] rounded-[var(--radius-lg)] font-semibold hover:bg-[var(--color-surface)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingPortal ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Bezig...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Beheer abonnement & facturen
                    </>
                  )}
                </button>
              )}
            </article>
          );
        })}
      </div>

      <footer className="mt-4 pt-4 border-t border-[var(--color-border)]">
        <p className="text-xs text-gray-600">
          Vragen over je abonnement? <a href="/contact" className="text-[var(--ff-color-primary-600)] hover:underline">Neem contact op</a>
        </p>
      </footer>
    </section>
  );
}
