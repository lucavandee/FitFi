import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import {
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialActive,
  type Testimonial,
  type CreateTestimonialInput,
} from '@/services/testimonials/testimonialsService';
import { useIsAdmin } from '@/hooks/useIsAdmin';

export default function AdminTestimonialsPage() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateTestimonialInput>({
    quote: '',
    author_name: '',
    author_age: null,
    author_avatar_url: null,
    rating: 5,
    is_verified: true,
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
      toast.error('Geen toegang');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadTestimonials();
    }
  }, [isAdmin]);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const data = await getAllTestimonials();
      setTestimonials(data);
    } catch (error) {
      toast.error('Fout bij laden testimonials');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateTestimonial({ id: editingId, ...formData });
        toast.success('Testimonial bijgewerkt');
      } else {
        await createTestimonial(formData);
        toast.success('Testimonial toegevoegd');
      }
      resetForm();
      loadTestimonials();
    } catch (error) {
      toast.error('Fout bij opslaan');
      console.error(error);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setFormData({
      quote: testimonial.quote,
      author_name: testimonial.author_name,
      author_age: testimonial.author_age,
      author_avatar_url: testimonial.author_avatar_url,
      rating: testimonial.rating,
      is_verified: testimonial.is_verified,
      is_active: testimonial.is_active,
      display_order: testimonial.display_order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze testimonial wilt verwijderen?')) return;

    try {
      await deleteTestimonial(id);
      toast.success('Testimonial verwijderd');
      loadTestimonials();
    } catch (error) {
      toast.error('Fout bij verwijderen');
      console.error(error);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await toggleTestimonialActive(id, !currentStatus);
      toast.success(currentStatus ? 'Testimonial verborgen' : 'Testimonial geactiveerd');
      loadTestimonials();
    } catch (error) {
      toast.error('Fout bij wijzigen status');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      quote: '',
      author_name: '',
      author_age: null,
      author_avatar_url: null,
      rating: 5,
      is_verified: true,
      is_active: true,
      display_order: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (adminLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
              Testimonials Beheer
            </h1>
            <p className="text-[#8A8A8A]">
              {testimonials.filter(t => t.is_active).length} actieve testimonials
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-[#A8513A] text-white rounded-xl hover:bg-[#C2654A] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nieuwe Testimonial
          </button>
        </div>

        {showForm && (
          <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">
              {editingId ? 'Testimonial Bewerken' : 'Nieuwe Testimonial'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Quote *
                </label>
                <textarea
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  className="w-full px-4 py-2 bg-[#FAFAF8] border border-[#E5E5E5] rounded-lg text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#A8513A]"
                  rows={4}
                  required
                  placeholder="Bijvoorbeeld: 'FitFi heeft mijn stijl compleet getransformeerd!'"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    Naam *
                  </label>
                  <input
                    type="text"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    className="w-full px-4 py-2 bg-[#FAFAF8] border border-[#E5E5E5] rounded-lg text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#A8513A]"
                    required
                    placeholder="Voornaam"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    Leeftijd
                  </label>
                  <input
                    type="number"
                    value={formData.author_age || ''}
                    onChange={(e) => setFormData({ ...formData, author_age: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2 bg-[#FAFAF8] border border-[#E5E5E5] rounded-lg text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#A8513A]"
                    placeholder="32"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    Rating *
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-[#FAFAF8] border border-[#E5E5E5] rounded-lg text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#A8513A]"
                    required
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} sterren
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    Volgorde
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-[#FAFAF8] border border-[#E5E5E5] rounded-lg text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#A8513A]"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                    className="w-4 h-4 text-[#A8513A] border-[#E5E5E5] rounded focus:ring-[#A8513A]"
                  />
                  <span className="text-sm text-[#1A1A1A]">Geverifieerd</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#A8513A] border-[#E5E5E5] rounded focus:ring-[#A8513A]"
                  />
                  <span className="text-sm text-[#1A1A1A]">Actief</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#A8513A] text-white rounded-xl hover:bg-[#C2654A] transition-colors"
                >
                  {editingId ? 'Bijwerken' : 'Toevoegen'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-[#FFFFFF] border border-[#E5E5E5] text-[#1A1A1A] rounded-xl hover:bg-[#FAFAF8] transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#8A8A8A]">Laden...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12 bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl">
            <p className="text-[#8A8A8A] mb-4">Nog geen testimonials</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-[#A8513A] hover:underline"
            >
              Voeg de eerste toe
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      {testimonial.is_verified && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                          Geverifieerd
                        </span>
                      )}
                      {!testimonial.is_active && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                          Verborgen
                        </span>
                      )}
                    </div>
                    <p className="text-[#1A1A1A] mb-3 italic">
                      "{testimonial.quote}"
                    </p>
                    <p className="text-sm text-[#8A8A8A]">
                      — {testimonial.author_name}
                      {testimonial.author_age && `, ${testimonial.author_age} jaar`}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleToggleActive(testimonial.id, testimonial.is_active)}
                      className="p-2 text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors"
                      title={testimonial.is_active ? 'Verbergen' : 'Activeren'}
                    >
                      {testimonial.is_active ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(testimonial)}
                      className="p-2 text-[#8A8A8A] hover:text-[#A8513A] transition-colors"
                      title="Bewerken"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial.id)}
                      className="p-2 text-[#8A8A8A] hover:text-red-600 transition-colors"
                      title="Verwijderen"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
