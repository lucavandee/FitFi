import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useStripeProducts } from '@/hooks/useStripeProducts';
import { supabase } from '@/lib/supabaseClient';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle2, ExternalLink, Copy, Save } from 'lucide-react';

export default function AdminStripeSetupPage() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: products, isLoading, refetch } = useStripeProducts();
  const [priceIds, setPriceIds] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Laden...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSave = async (productId: string, priceId: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('stripe_products')
        .update({ stripe_price_id: priceId })
        .eq('id', productId);

      if (error) throw error;

      toast.success('Price ID opgeslagen!');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Er ging iets mis');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Gekopieerd naar clipboard!');
  };

  const hasAllPriceIds = products?.every(p => p.stripe_price_id);

  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-text)] min-h-screen py-10 sm:py-14 md:py-20">
      <Helmet>
        <title>Stripe Setup - Admin</title>
      </Helmet>

      <div className="ff-container max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Stripe Configuratie</h1>
          <p className="text-lg text-gray-600">
            Configureer je Stripe Price IDs om betalingen te activeren.
          </p>
        </header>

        {/* Status Banner */}
        {hasAllPriceIds ? (
          <div className="bg-green-50 border border-green-200 rounded-[var(--radius-xl)] p-6 mb-8 flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-green-900 mb-1">Stripe is geconfigureerd</h3>
              <p className="text-sm text-green-700">
                Alle producten hebben een geldige Price ID. Checkout zou moeten werken.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-[var(--radius-xl)] p-6 mb-8 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-amber-900 mb-1">Configuratie vereist</h3>
              <p className="text-sm text-amber-700 mb-2">
                Sommige producten missen een Stripe Price ID. Volg de stappen hieronder.
              </p>
            </div>
          </div>
        )}

        {/* Setup Steps */}
        <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-8 mb-8 shadow-[var(--shadow-soft)]">
          <h2 className="text-2xl font-bold mb-6">Setup Stappen</h2>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[var(--ff-color-primary-600)] text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-2">Configureer Stripe Secret Key</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Ga naar Supabase en voeg je Stripe Secret Key toe als environment variable.
                </p>
                <a
                  href="https://dashboard.stripe.com/test/apikeys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[var(--ff-color-primary-600)] hover:text-[var(--ff-color-primary-700)] font-semibold"
                >
                  Ga naar Stripe API Keys
                  <ExternalLink className="w-4 h-4" />
                </a>
                <div className="mt-3 p-3 bg-gray-50 rounded-[var(--radius-lg)] border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-1">In Supabase Functions:</p>
                  <code className="text-xs text-gray-800 font-mono">
                    Secret name: STRIPE_SECRET_KEY
                  </code>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[var(--ff-color-primary-600)] text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-2">Maak Products aan in Stripe</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Ga naar Stripe Dashboard en maak de volgende producten aan:
                </p>

                {products?.map((product, idx) => (
                  <div key={product.id} className="mb-4 p-4 bg-gray-50 rounded-[var(--radius-lg)] border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          €{product.price} {product.interval === 'one_time' ? 'eenmalig' : `per ${product.interval === 'month' ? 'maand' : 'jaar'}`}
                        </p>
                      </div>
                      {product.stripe_price_id ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-700 min-w-[80px]">
                          Price ID:
                        </label>
                        {product.stripe_price_id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <code className="text-xs bg-white px-2 py-1 rounded border border-gray-300 font-mono flex-1">
                              {product.stripe_price_id}
                            </code>
                            <button
                              onClick={() => copyToClipboard(product.stripe_price_id)}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Kopieer"
                            >
                              <Copy className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        ) : (
                          <input
                            type="text"
                            placeholder="price_xxxxxxxxxxxxx"
                            value={priceIds[product.id] || ''}
                            onChange={(e) => setPriceIds({ ...priceIds, [product.id]: e.target.value })}
                            className="flex-1 px-3 py-1 text-xs bg-white border border-gray-300 rounded-[var(--radius-lg)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)] font-mono"
                          />
                        )}
                      </div>

                      {!product.stripe_price_id && priceIds[product.id] && (
                        <button
                          onClick={() => handleSave(product.id, priceIds[product.id])}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-lg)] text-sm font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          Opslaan
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <a
                  href="https://dashboard.stripe.com/test/products"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[var(--ff-color-primary-600)] hover:text-[var(--ff-color-primary-700)] font-semibold mt-2"
                >
                  Ga naar Stripe Products
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[var(--ff-color-primary-600)] text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-2">Test de Checkout</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Ga naar de prijzen pagina en test de checkout met een Stripe test card.
                </p>
                <div className="p-3 bg-gray-50 rounded-[var(--radius-lg)] border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Test Card:</p>
                  <code className="text-xs text-gray-800 font-mono block">
                    Nummer: 4242 4242 4242 4242<br />
                    Datum: 12/34<br />
                    CVC: 123
                  </code>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Help Section */}
        <section className="bg-blue-50 border border-blue-200 rounded-[var(--radius-xl)] p-6">
          <h3 className="font-bold text-blue-900 mb-2">Hulp nodig?</h3>
          <p className="text-sm text-blue-700 mb-3">
            Lees de volledige setup guide voor gedetailleerde instructies.
          </p>
          <a
            href="/STRIPE_SETUP_GUIDE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 font-semibold"
          >
            Open Setup Guide
            <ExternalLink className="w-4 h-4" />
          </a>
        </section>
      </div>
    </main>
  );
}
