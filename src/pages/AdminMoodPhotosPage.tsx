import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Eye, EyeOff, Trash2, Filter } from 'lucide-react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import toast from 'react-hot-toast';

interface MoodPhoto {
  id: number;
  image_url: string;
  gender: 'male' | 'female' | 'unisex';
  mood_tags: string[];
  active: boolean;
  display_order: number;
  created_at: string;
}

export default function AdminMoodPhotosPage() {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [photos, setPhotos] = useState<MoodPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female' | 'unisex'>('all');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (isAdmin) {
      loadPhotos();
    }
  }, [isAdmin]);

  const loadPhotos = async () => {
    try {
      const { getSupabase } = await import('@/lib/supabase');
      const client = getSupabase();

      if (!client) {
        toast.error('Supabase not available');
        return;
      }

      let query = client
        .from('mood_photos')
        .select('*')
        .order('display_order', { ascending: true });

      if (filterGender !== 'all') {
        query = query.eq('gender', filterGender);
      }

      if (filterActive === 'active') {
        query = query.eq('active', true);
      } else if (filterActive === 'inactive') {
        query = query.eq('active', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading photos:', error);
        toast.error('Failed to load photos');
        return;
      }

      setPhotos(data || []);
    } catch (err) {
      console.error('Failed to load photos:', err);
      toast.error('Error loading photos');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: number, currentActive: boolean) => {
    try {
      const { getSupabase } = await import('@/lib/supabase');
      const client = getSupabase();

      const { error } = await client
        .from('mood_photos')
        .update({ active: !currentActive })
        .eq('id', id);

      if (error) {
        toast.error('Failed to update photo');
        return;
      }

      toast.success(currentActive ? 'Photo deactivated' : 'Photo activated');
      loadPhotos();
    } catch (err) {
      console.error('Error toggling active:', err);
      toast.error('Error updating photo');
    }
  };

  const deletePhoto = async (id: number) => {
    if (!confirm('Are you sure you want to DELETE this photo? This cannot be undone.')) {
      return;
    }

    try {
      const { getSupabase } = await import('@/lib/supabase');
      const client = getSupabase();

      const { error } = await client
        .from('mood_photos')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Failed to delete photo');
        return;
      }

      toast.success('Photo deleted');
      loadPhotos();
    } catch (err) {
      console.error('Error deleting photo:', err);
      toast.error('Error deleting photo');
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--ff-color-primary-700)] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[var(--color-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Access Denied</h1>
          <p className="text-[var(--color-muted)]">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const filteredPhotos = photos;
  const activeCount = photos.filter(p => p.active).length;
  const inactiveCount = photos.filter(p => !p.active).length;
  const maleCount = photos.filter(p => p.gender === 'male').length;
  const femaleCount = photos.filter(p => p.gender === 'female').length;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
            Mood Photos Moderation
          </h1>
          <p className="text-[var(--color-muted)]">
            Review and manage mood photos for the visual preference quiz
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-muted)] mb-1">Total Photos</div>
            <div className="text-2xl font-bold text-[var(--color-text)]">{photos.length}</div>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-muted)] mb-1">Active</div>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-muted)] mb-1">Male</div>
            <div className="text-2xl font-bold text-blue-600">{maleCount}</div>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-muted)] mb-1">Female</div>
            <div className="text-2xl font-bold text-pink-600">{femaleCount}</div>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)] mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-5 h-5 text-[var(--color-muted)]" />
            <h2 className="font-semibold text-[var(--color-text)]">Filters</h2>
          </div>
          <div className="flex gap-4">
            <select
              value={filterGender}
              onChange={(e) => {
                setFilterGender(e.target.value as any);
                loadPhotos();
              }}
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
            >
              <option value="all">All Genders</option>
              <option value="male">Male Only</option>
              <option value="female">Female Only</option>
              <option value="unisex">Unisex Only</option>
            </select>
            <select
              value={filterActive}
              onChange={(e) => {
                setFilterActive(e.target.value as any);
                loadPhotos();
              }}
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <button
              onClick={loadPhotos}
              className="px-4 py-2 bg-[var(--ff-color-primary-700)] text-white rounded-lg hover:bg-[var(--ff-color-primary-600)] transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onToggleActive={toggleActive}
              onDelete={deletePhoto}
            />
          ))}
        </div>

        {filteredPhotos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--color-muted)]">No photos found with current filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface PhotoCardProps {
  photo: MoodPhoto;
  onToggleActive: (id: number, currentActive: boolean) => void;
  onDelete: (id: number) => void;
}

function PhotoCard({ photo, onToggleActive, onDelete }: PhotoCardProps) {
  const [imageError, setImageError] = useState(false);

  const genderColors = {
    male: 'bg-blue-100 text-blue-700 border-blue-200',
    female: 'bg-pink-100 text-pink-700 border-pink-200',
    unisex: 'bg-purple-100 text-purple-700 border-purple-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[var(--color-surface)] rounded-lg border-2 overflow-hidden ${
        photo.active ? 'border-green-500' : 'border-red-500'
      }`}
    >
      <div className="relative aspect-[3/4] bg-[var(--color-bg)]">
        {!imageError ? (
          <img
            src={photo.image_url}
            alt={`Mood photo ${photo.id}`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-[var(--color-muted)]">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Image failed to load</p>
            </div>
          </div>
        )}
        {!photo.active && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <EyeOff className="w-12 h-12 text-white" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs px-2 py-1 rounded-full border ${genderColors[photo.gender]}`}>
            {photo.gender}
          </span>
          <span className="text-xs text-[var(--color-muted)]">
            Order: {photo.display_order}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {photo.mood_tags?.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="text-xs px-2 py-1 bg-[var(--color-bg)] text-[var(--color-muted)] rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onToggleActive(photo.id, photo.active)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              photo.active
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {photo.active ? (
              <>
                <EyeOff className="w-4 h-4 inline mr-1" />
                Deactivate
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 inline mr-1" />
                Activate
              </>
            )}
          </button>
          <button
            onClick={() => onDelete(photo.id)}
            className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
            title="Delete permanently"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <a
          href={photo.image_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-2 text-xs text-[var(--ff-color-primary-700)] hover:underline truncate"
        >
          View original
        </a>
      </div>
    </motion.div>
  );
}
