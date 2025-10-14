import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useStripeProducts } from '@/hooks/useStripeProducts';
import { supabase } from '@/lib/supabaseClient';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  currency: string;
  interval: string;
  features: string;
  is_featured: boolean;
  is_active: boolean;
}

export default function AdminProductsPage() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: products, isLoading, refetch } = useStripeProducts();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    price: '',
    currency: 'EUR',
    interval: 'month',
    features: '',
    is_featured: false,
    is_active: true,
  });

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

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      currency: product.currency,
      interval: product.interval,
      features: product.features.join('\n'),
      is_featured: product.is_featured,
      is_active: product.is_active,
    });
    setShowCreateForm(false);
  };

  const handleCreate = () => {
    setShowCreateForm(true);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: 'EUR',
      interval: 'month',
      features: '',
      is_featured: false,
      is_active: true,
    });
  };

  const handleSave = async () => {
    try {
      const featuresArray = formData.features
        .split('\n')
        .filter(f => f.trim() !== '');

      const data = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        interval: formData.interval,
        features: featuresArray,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
      };

      if (editingId) {
        const { error } = await supabase
          .from('stripe_products')
          .update(data)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Product bijgewerkt');
      } else {
        const { error } = await supabase
          .from('stripe_products')
          .insert(data);

        if (error) throw error;
        toast.success('Product aangemaakt');
      }

      setEditingId(null);
      setShowCreateForm(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Er ging iets mis');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit product wilt verwijderen?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('stripe_products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Product verwijderd');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Er ging iets mis');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowCreateForm(false);
  };

  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-text)] min-h-screen py-20">
      <Helmet>
        <title>Product Management - Admin</title>
      </Helmet>

      <div className="ff-container max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Stripe Producten</h1>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-lg)] font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nieuw Product
          </button>
        </header>

        {(showCreateForm || editingId) && (
          <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 mb-8 shadow-[var(--shadow-soft)]">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? 'Product bewerken' : 'Nieuw product'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Naam</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Prijs (EUR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Interval</label>
                <select
                  value={formData.interval}
                  onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)]"
                >
                  <option value="month">Maandelijks</option>
                  <option value="year">Jaarlijks</option>
                  <option value="one_time">Eenmalig</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold">Featured</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold">Actief</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Beschrijving</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">
                  Features (één per regel)
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  rows={6}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  className="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-600)] font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-lg)] font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors"
              >
                <Save className="w-4 h-4" />
                Opslaan
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-[var(--radius-lg)] font-semibold hover:bg-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
                Annuleren
              </button>
            </div>
          </section>
        )}

        <section className="space-y-4">
          {isLoading ? (
            <p className="text-center text-gray-600 py-12">Producten laden...</p>
          ) : !products || products.length === 0 ? (
            <p className="text-center text-gray-600 py-12">Geen producten gevonden</p>
          ) : (
            products.map((product) => (
              <article
                key={product.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-soft)]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{product.name}</h3>
                      {product.is_featured && (
                        <span className="px-2 py-1 text-xs font-bold bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] rounded-full">
                          Featured
                        </span>
                      )}
                      {!product.is_active && (
                        <span className="px-2 py-1 text-xs font-bold bg-gray-200 text-gray-600 rounded-full">
                          Inactief
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{product.description}</p>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-3xl font-bold">€{product.price}</span>
                      <span className="text-gray-600">
                        / {product.interval === 'one_time' ? 'eenmalig' : product.interval === 'month' ? 'maand' : 'jaar'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Features:</p>
                      <ul className="space-y-1">
                        {product.features.map((feature: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-[var(--ff-color-primary-600)]">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-gray-600 hover:text-[var(--ff-color-primary-600)] transition-colors"
                      title="Bewerken"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      title="Verwijderen"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
