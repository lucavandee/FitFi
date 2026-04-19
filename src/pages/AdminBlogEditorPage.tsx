import { useState, useEffect } from 'react';
import Spinner from '@/components/ui/Spinner';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Sparkles, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import {
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  generateSlug,
  validateSlug,
  type CreateBlogPostInput
} from '@/services/blog/blogService';
import toast from 'react-hot-toast';

export default function AdminBlogEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState<CreateBlogPostInput>({
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    author_name: 'FitFi Redactie',
    author_bio: '',
    category: 'Stijltips',
    tags: [],
    featured_image_url: '',
    read_time_minutes: 5,
    status: 'draft',
    seo_meta_title: '',
    seo_meta_description: '',
    seo_focus_keyword: '',
    ai_generated: false,
    ai_model: '',
    featured: false
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/dashboard');
      return;
    }

    if (isAdmin && id) {
      loadPost();
    }
  }, [isAdmin, adminLoading, id, navigate]);

  async function loadPost() {
    if (!id) return;

    try {
      setLoading(true);
      const post = await getBlogPostById(id);
      if (post) {
        setFormData({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          author_name: post.author_name,
          author_bio: post.author_bio,
          category: post.category,
          tags: post.tags,
          featured_image_url: post.featured_image_url,
          read_time_minutes: post.read_time_minutes,
          status: post.status,
          seo_meta_title: post.seo_meta_title,
          seo_meta_description: post.seo_meta_description,
          seo_focus_keyword: post.seo_focus_keyword,
          ai_generated: post.ai_generated,
          ai_model: post.ai_model,
          featured: post.featured
        });
      }
    } catch (error: any) {
      toast.error(`Fout bij laden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleTitleChange(title: string) {
    const newSlug = generateSlug(title);
    setFormData({ ...formData, title, slug: newSlug });
  }

  function handleAddTag() {
    if (!tagInput.trim()) return;
    const newTag = tagInput.trim().toLowerCase();
    if (!formData.tags?.includes(newTag)) {
      setFormData({ ...formData, tags: [...(formData.tags || []), newTag] });
    }
    setTagInput('');
  }

  function handleRemoveTag(tag: string) {
    setFormData({ ...formData, tags: formData.tags?.filter(t => t !== tag) });
  }

  async function handleSave(status?: 'draft' | 'review' | 'published') {
    if (!formData.title || !formData.slug || !formData.excerpt || !formData.content) {
      toast.error('Vul alle verplichte velden in');
      return;
    }

    if (!validateSlug(formData.slug)) {
      toast.error('Ongeldige slug (alleen lowercase letters, cijfers en streepjes)');
      return;
    }

    try {
      setSaving(true);
      const dataToSave = {
        ...formData,
        status: status || formData.status
      };

      if (id) {
        await updateBlogPost({ id, ...dataToSave });
        toast.success('Post opgeslagen');
      } else {
        const newPost = await createBlogPost(dataToSave);
        toast.success('Post aangemaakt');
        navigate(`/admin/blog/edit/${newPost.id}`);
      }
    } catch (error: any) {
      toast.error(`Fout bij opslaan: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (adminLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-[#8A8A8A]">Laden...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-[#8A8A8A]">Post laden...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{id ? 'Bewerk Post' : 'Nieuwe Post'} - Admin - FitFi</title>
      </Helmet>

      <div className="min-h-screen bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/admin/blog')}
                className="flex items-center gap-2 text-[#8A8A8A] hover:text-[#1A1A1A] mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Terug naar overzicht
              </button>
              <h1 className="text-3xl font-bold text-[#1A1A1A]">
                {id ? 'Bewerk Blog Post' : 'Nieuwe Blog Post'}
              </h1>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 rounded-xl border border-[#E5E5E5] bg-white text-[#1A1A1A] hover:bg-[#FAFAF8] transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Editor' : 'Preview'}
              </button>
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="px-4 py-2 rounded-xl border border-[#E5E5E5] bg-white text-[#1A1A1A] hover:bg-[#FAFAF8] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Opslaan...' : 'Opslaan als Draft'}
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-[#A8513A] text-white hover:bg-[#C2654A] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {saving ? 'Opslaan...' : 'Publiceren'}
              </button>
            </div>
          </div>

          {showPreview ? (
            /* Preview Mode */
            <div className="bg-white rounded-lg border border-[#E5E5E5] p-8">
              <div className="max-w-3xl mx-auto">
                {formData.featured_image_url && (
                  <img
                    src={formData.featured_image_url}
                    alt={formData.title}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                )}
                <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">
                  {formData.title || 'Titel'}
                </h1>
                <div className="flex items-center gap-4 text-sm text-[#8A8A8A] mb-6">
                  <span>{formData.author_name}</span>
                  <span>•</span>
                  <span>{formData.read_time_minutes} min leestijd</span>
                  <span>•</span>
                  <span>{formData.category}</span>
                </div>
                <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap">
                    {formData.content || 'Content komt hier...'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Editor Mode */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Editor */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
                  <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">
                    Basis Informatie
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                        Titel *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="De titel van je blog post"
                        className="w-full px-4 py-2 rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#A8513A]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-2 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Slug * <span className="text-[#8A8A8A] font-normal">(URL pad)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="de-titel-van-je-post"
                        className="w-full px-4 py-2 rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#A8513A] font-mono text-sm"
                      />
                      <p className="mt-1 text-xs text-[#8A8A8A]">
                        URL: fitfi.ai/blog/{formData.slug || 'slug'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                        Excerpt * <span className="text-[#8A8A8A] font-normal">(Max 160 tekens voor SEO)</span>
                      </label>
                      <textarea
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        placeholder="Een korte samenvatting van je post..."
                        rows={3}
                        maxLength={160}
                        className="w-full px-4 py-2 rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#A8513A]"
                      />
                      <p className="mt-1 text-xs text-[#8A8A8A]">
                        {formData.excerpt.length}/160 tekens
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                        Content * <span className="text-[#8A8A8A] font-normal">(Markdown ondersteund)</span>
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="# Hoofdstuk 1&#10;&#10;Je content hier...&#10;&#10;## Subkop&#10;&#10;Meer tekst..."
                        rows={20}
                        className="w-full px-4 py-2 rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#A8513A] font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* SEO Settings */}
                <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
                  <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">
                    SEO Instellingen
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                        SEO Titel <span className="text-[#8A8A8A] font-normal">(Indien leeg, wordt titel gebruikt)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.seo_meta_title}
                        onChange={(e) => setFormData({ ...formData, seo_meta_title: e.target.value })}
                        placeholder={formData.title || 'SEO titel'}
                        className="w-full px-4 py-2 rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#A8513A]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                        SEO Beschrijving <span className="text-[#8A8A8A] font-normal">(Indien leeg, wordt excerpt gebruikt)</span>
                      </label>
                      <textarea
                        value={formData.seo_meta_description}
                        onChange={(e) => setFormData({ ...formData, seo_meta_description: e.target.value })}
                        placeholder={formData.excerpt || 'SEO beschrijving'}
                        rows={2}
                        maxLength={160}
                        className="w-full px-4 py-2 rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#A8513A]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                        Focus Keyword
                      </label>
                      <input
                        type="text"
                        value={formData.seo_focus_keyword}
                        onChange={(e) => setFormData({ ...formData, seo_focus_keyword: e.target.value })}
                        placeholder="stijltips, kleuradvies, etc."
                        className="w-full px-4 py-2 rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#A8513A]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Meta Settings */}
                <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
                  <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">
                    Meta
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                        Categorie
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] text-[#1A1A1A]"
                      >
                        <option value="Stijltips">Stijltips</option>
                        <option value="Kleuradvies">Kleuradvies</option>
                        <option value="Trends">Trends</option>
                        <option value="Duurzaamheid">Duurzaamheid</option>
                        <option value="Accessoires">Accessoires</option>
                        <option value="Gids">Gids</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                        Auteur
                      </label>
                      <input
                        type="text"
                        value={formData.author_name}
                        onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] text-[#1A1A1A]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                        Auteur Bio
                      </label>
                      <textarea
                        value={formData.author_bio}
                        onChange={(e) => setFormData({ ...formData, author_bio: e.target.value })}
                        placeholder="Een korte bio van de auteur..."
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] text-[#1A1A1A] placeholder-[#8A8A8A]"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="rounded border-[#E5E5E5]"
                        />
                        <span className="text-sm font-medium text-[#1A1A1A]">
                          Featured Post
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.ai_generated}
                          onChange={(e) => setFormData({ ...formData, ai_generated: e.target.checked })}
                          className="rounded border-[#E5E5E5]"
                        />
                        <span className="text-sm font-medium text-[#1A1A1A]">
                          AI Gegenereerd
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Featured Image */}
                <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
                  <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Featured Image
                  </h2>

                  <div className="space-y-4">
                    <input
                      type="url"
                      value={formData.featured_image_url}
                      onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                      placeholder="https://images.pexels.com/..."
                      className="w-full px-4 py-2 rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] text-[#1A1A1A] placeholder-[#8A8A8A] text-sm"
                    />
                    {formData.featured_image_url && (
                      <img
                        src={formData.featured_image_url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    <p className="text-xs text-[#8A8A8A]">
                      Tip: Gebruik Pexels voor gratis stock foto's
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
                  <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">
                    Tags
                  </h2>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="Voeg tag toe..."
                        className="flex-1 px-3 py-2 rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] text-[#1A1A1A] text-sm"
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-3 py-2 rounded-xl bg-[#A8513A] text-white hover:bg-[#C2654A] text-sm"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {formData.tags?.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-[#FAFAF8] text-[#1A1A1A] text-sm flex items-center gap-2"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="text-[#8A8A8A] hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
