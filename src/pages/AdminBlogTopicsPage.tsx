import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import {
  getAllTopics,
  createTopic,
  updateTopicStatus,
  deleteTopic,
  type BlogTopic
} from '@/services/blog/blogService';
import toast from 'react-hot-toast';

export default function AdminBlogTopicsPage() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [topics, setTopics] = useState<BlogTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<BlogTopic['status'] | 'all'>('all');

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/dashboard');
      return;
    }

    if (isAdmin) {
      loadTopics();
    }
  }, [isAdmin, adminLoading, navigate]);

  async function loadTopics() {
    try {
      setLoading(true);
      const data = await getAllTopics();
      setTopics(data);
    } catch (error: any) {
      toast.error(`Fout bij laden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Weet je zeker dat je dit topic wilt verwijderen?')) {
      return;
    }

    try {
      await deleteTopic(id);
      toast.success('Topic verwijderd');
      loadTopics();
    } catch (error: any) {
      toast.error(`Fout bij verwijderen: ${error.message}`);
    }
  }

  async function handleStatusChange(id: string, status: BlogTopic['status']) {
    try {
      await updateTopicStatus(id, status);
      toast.success('Status bijgewerkt');
      loadTopics();
    } catch (error: any) {
      toast.error(`Fout bij bijwerken: ${error.message}`);
    }
  }

  const filteredTopics = filter === 'all'
    ? topics
    : topics.filter(t => t.status === filter);

  const stats = {
    pending: topics.filter(t => t.status === 'pending').length,
    in_progress: topics.filter(t => t.status === 'in_progress').length,
    completed: topics.filter(t => t.status === 'completed').length
  };

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
        <title>Blog Topics - Admin - FitFi</title>
      </Helmet>

      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/admin/blog')}
              className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug naar blog overzicht
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
                  Blog Topics
                </h1>
                <p className="text-[var(--color-text-muted)]">
                  Beheer ideeën voor toekomstige blog content
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-lg bg-[var(--ff-color-primary-700)] text-white hover:bg-[var(--ff-color-primary-600)] transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nieuw Topic
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Pending</p>
                  <p className="text-2xl font-bold text-[var(--color-text)]">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">In Progress</p>
                  <p className="text-2xl font-bold text-[var(--color-text)]">{stats.in_progress}</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Completed</p>
                  <p className="text-2xl font-bold text-[var(--color-text)]">{stats.completed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-[var(--ff-color-primary-700)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]'
              }`}
            >
              Alles
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'pending'
                  ? 'bg-[var(--ff-color-primary-700)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'in_progress'
                  ? 'bg-[var(--ff-color-primary-700)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'completed'
                  ? 'bg-[var(--ff-color-primary-700)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]'
              }`}
            >
              Completed
            </button>
          </div>

          {/* Topics List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--ff-color-primary-700)] mx-auto mb-4" />
              <p className="text-[var(--color-text-muted)]">Topics laden...</p>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="text-center py-12 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
              <Lightbulb className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-muted)]" />
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                Geen topics gevonden
              </h3>
              <p className="text-[var(--color-text-muted)] mb-4">
                Begin met het toevoegen van topic ideeën voor toekomstige posts
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 rounded-lg bg-[var(--ff-color-primary-700)] text-white hover:bg-[var(--ff-color-primary-600)] transition-colors"
              >
                Eerste Topic Toevoegen
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTopics.map(topic => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  onDelete={() => handleDelete(topic.id)}
                  onStatusChange={(status) => handleStatusChange(topic.id, status)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Topic Modal */}
      {showAddModal && (
        <AddTopicModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadTopics();
          }}
        />
      )}
    </>
  );
}

function TopicCard({ topic, onDelete, onStatusChange }: any) {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    in_progress: { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
    completed: { color: 'bg-green-100 text-green-800', label: 'Completed' }
  };

  const config = statusConfig[topic.status];
  const priorityStars = '★'.repeat(topic.priority_score) + '☆'.repeat(10 - topic.priority_score);

  return (
    <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
            <span className="text-sm text-[var(--color-text-muted)]" title={`Prioriteit: ${topic.priority_score}/10`}>
              {priorityStars}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
            {topic.topic}
          </h3>

          <div className="flex flex-wrap gap-2 mb-3">
            {topic.suggested_keywords.map((keyword, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-full bg-[var(--color-bg)] text-[var(--color-text)] text-xs"
              >
                {keyword}
              </span>
            ))}
          </div>

          <p className="text-sm text-[var(--color-text-muted)]">
            Doelgroep: {topic.target_audience}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {topic.status === 'pending' && (
            <button
              onClick={() => onStatusChange('in_progress')}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
            >
              Start Writing
            </button>
          )}
          {topic.status === 'in_progress' && (
            <button
              onClick={() => onStatusChange('completed')}
              className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm whitespace-nowrap"
            >
              Mark Complete
            </button>
          )}
          <button
            onClick={onDelete}
            className="px-3 py-1.5 rounded-lg border border-red-600 text-red-600 hover:bg-red-50 transition-colors text-sm whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AddTopicModal({ onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    topic: '',
    keywords: [] as string[],
    keywordInput: '',
    targetAudience: 'algemeen',
    priorityScore: 5
  });
  const [saving, setSaving] = useState(false);

  function handleAddKeyword() {
    if (!formData.keywordInput.trim()) return;
    const keyword = formData.keywordInput.trim().toLowerCase();
    if (!formData.keywords.includes(keyword)) {
      setFormData({ ...formData, keywords: [...formData.keywords, keyword], keywordInput: '' });
    } else {
      setFormData({ ...formData, keywordInput: '' });
    }
  }

  function handleRemoveKeyword(keyword: string) {
    setFormData({ ...formData, keywords: formData.keywords.filter(k => k !== keyword) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.topic.trim()) {
      toast.error('Vul een topic in');
      return;
    }

    try {
      setSaving(true);
      await createTopic(
        formData.topic,
        formData.keywords,
        formData.targetAudience,
        formData.priorityScore
      );
      toast.success('Topic toegevoegd');
      onSuccess();
    } catch (error: any) {
      toast.error(`Fout bij opslaan: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] max-w-lg w-full p-6">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          Nieuw Blog Topic
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Topic Idee *
            </label>
            <textarea
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="Bijv: De beste kleuren voor het herfstseizoen 2024"
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder-[var(--color-text-muted)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Keywords voor SEO
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={formData.keywordInput}
                onChange={(e) => setFormData({ ...formData, keywordInput: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                placeholder="Bijv: herfst kleuren, seizoenstrends"
                className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-3 py-2 rounded-lg bg-[var(--ff-color-primary-700)] text-white hover:bg-[var(--ff-color-primary-600)] text-sm"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.keywords.map(keyword => (
                <span
                  key={keyword}
                  className="px-3 py-1 rounded-full bg-[var(--color-bg)] text-[var(--color-text)] text-sm flex items-center gap-2"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="text-[var(--color-text-muted)] hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Doelgroep
            </label>
            <input
              type="text"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              placeholder="Bijv: vrouwen 25-40, stijlbewuste professionals"
              className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Prioriteit: {formData.priorityScore}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.priorityScore}
              onChange={(e) => setFormData({ ...formData, priorityScore: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 rounded-lg bg-[var(--ff-color-primary-700)] text-white hover:bg-[var(--ff-color-primary-600)] transition-colors disabled:opacity-50"
            >
              {saving ? 'Opslaan...' : 'Topic Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
