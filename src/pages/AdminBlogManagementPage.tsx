import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Search,
  Sparkles,
  TrendingUp,
  FileText,
  Clock
} from 'lucide-react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import {
  getAllBlogPosts,
  deleteBlogPost,
  publishBlogPost,
  unpublishBlogPost,
  getDashboardMetrics,
  type BlogPost,
  type BlogPostFilters
} from '@/services/blog/blogService';
import toast from 'react-hot-toast';

export default function AdminBlogManagementPage() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<BlogPostFilters>({});
  const [metrics, setMetrics] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/dashboard');
      return;
    }

    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, adminLoading, navigate, filters]);

  async function loadData() {
    try {
      setLoading(true);
      const [postsData, metricsData] = await Promise.all([
        getAllBlogPosts(filters),
        getDashboardMetrics()
      ]);
      setPosts(postsData);
      setMetrics(metricsData);
    } catch (error: any) {
      toast.error(`Fout bij laden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Weet je zeker dat je deze post wilt verwijderen?')) {
      return;
    }

    try {
      await deleteBlogPost(id);
      toast.success('Post verwijderd');
      loadData();
    } catch (error: any) {
      toast.error(`Fout bij verwijderen: ${error.message}`);
    }
  }

  async function handleTogglePublish(post: BlogPost) {
    try {
      if (post.status === 'published') {
        await unpublishBlogPost(post.id);
        toast.success('Post gedepubliceerd');
      } else {
        await publishBlogPost(post.id);
        toast.success('Post gepubliceerd');
      }
      loadData();
    } catch (error: any) {
      toast.error(`Fout: ${error.message}`);
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (adminLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--ff-color-primary-700)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Blog Beheer - Admin - FitFi</title>
      </Helmet>

      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
              Blog Beheer
            </h1>
            <p className="text-[var(--color-text-muted)]">
              Beheer AI-gegenereerde en handmatige blog content
            </p>
          </div>

          {/* Metrics Cards */}
          {metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard
                icon={FileText}
                label="Totaal Posts"
                value={metrics.total_posts}
                color="blue"
              />
              <MetricCard
                icon={Eye}
                label="Gepubliceerd"
                value={metrics.published_posts}
                color="green"
              />
              <MetricCard
                icon={Sparkles}
                label="AI Gegenereerd"
                value={metrics.ai_generated_posts}
                color="purple"
              />
              <MetricCard
                icon={TrendingUp}
                label="Views (30d)"
                value={metrics.recent_views}
                color="orange"
              />
            </div>
          )}

          {/* Actions Bar */}
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  placeholder="Zoek posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-700)]"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                <button
                  onClick={() => navigate('/admin/blog/topics')}
                  className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Topics
                </button>
                <button
                  onClick={() => navigate('/admin/blog/new')}
                  className="px-4 py-2 rounded-lg bg-[var(--ff-color-primary-700)] text-white hover:bg-[var(--ff-color-primary-600)] transition-colors flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Nieuwe Post
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-[var(--color-border)] grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status || 'all'}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value === 'all' ? undefined : e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
                  >
                    <option value="all">Alle statussen</option>
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="published">Gepubliceerd</option>
                    <option value="archived">Gearchiveerd</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Type
                  </label>
                  <select
                    value={filters.ai_generated === undefined ? 'all' : filters.ai_generated ? 'ai' : 'manual'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFilters({ ...filters, ai_generated: val === 'all' ? undefined : val === 'ai' });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
                  >
                    <option value="all">Alle types</option>
                    <option value="ai">AI Gegenereerd</option>
                    <option value="manual">Handmatig</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Featured
                  </label>
                  <select
                    value={filters.featured === undefined ? 'all' : filters.featured ? 'yes' : 'no'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFilters({ ...filters, featured: val === 'all' ? undefined : val === 'yes' });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
                  >
                    <option value="all">Alle posts</option>
                    <option value="yes">Featured</option>
                    <option value="no">Niet featured</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Posts List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--ff-color-primary-700)] mx-auto mb-4" />
              <p className="text-[var(--color-text-muted)]">Posts laden...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
              <FileText className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-muted)]" />
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                Geen posts gevonden
              </h3>
              <p className="text-[var(--color-text-muted)] mb-4">
                {searchQuery ? 'Probeer een andere zoekopdracht' : 'Begin met het maken van je eerste blog post'}
              </p>
              <button
                onClick={() => navigate('/admin/blog/new')}
                className="px-6 py-2 rounded-lg bg-[var(--ff-color-primary-700)] text-white hover:bg-[var(--ff-color-primary-600)] transition-colors"
              >
                Nieuwe Post Maken
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={() => navigate(`/admin/blog/edit/${post.id}`)}
                  onDelete={() => handleDelete(post.id)}
                  onTogglePublish={() => handleTogglePublish(post)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function MetricCard({ icon: Icon, label, value, color }: any) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-opacity-10 ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
          <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, onEdit, onDelete, onTogglePublish }: any) {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    review: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    draft: 'Draft',
    review: 'Review',
    published: 'Gepubliceerd',
    archived: 'Gearchiveerd'
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Image */}
        {post.featured_image_url && (
          <div className="w-full sm:w-32 h-32 flex-shrink-0">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">
                {post.title}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
                {post.excerpt}
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[post.status]}`}>
                {statusLabels[post.status]}
              </span>
              {post.featured && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Featured
                </span>
              )}
              {post.ai_generated && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI
                </span>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)] mb-3">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.read_time_minutes} min
            </span>
            <span>{post.category}</span>
            <span>{post.view_count} views</span>
            <span>/{post.slug}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors flex items-center gap-1 text-sm"
            >
              <Edit2 className="w-4 h-4" />
              Bewerk
            </button>
            <button
              onClick={onTogglePublish}
              className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1 text-sm ${
                post.status === 'published'
                  ? 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg)]'
                  : 'border-green-600 bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {post.status === 'published' ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Depubliceer
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Publiceer
                </>
              )}
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1.5 rounded-lg border border-red-600 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Verwijder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
