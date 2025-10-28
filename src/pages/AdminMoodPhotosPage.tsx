import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Eye, EyeOff, Trash2, Filter, RefreshCw } from 'lucide-react';
import { useUser } from '@/context/UserContext';
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
  const { user } = useUser();
  const [photos, setPhotos] = useState<MoodPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female' | 'unisex'>('all');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const isAdmin = user?.email?.endsWith('@fitfi.ai') || false;

  useEffect(() => {
    if (user) {
      loadPhotos();
    }
  }, [user]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const { getSupabase } = await import('@/lib/supabase');
      const client = getSupabase();

      if (!client) {
        toast.error('Database niet beschikbaar');
        setLoading(false);
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
        toast.error('Fout bij laden foto\'s');
        setLoading(false);
        return;
      }

      setPhotos(data || []);
    } catch (err) {
      console.error('Failed to load photos:', err);
      toast.error('Fout bij laden foto\'s');
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
        toast.error('Fout bij updaten');
        return;
      }

      toast.success(currentActive ? 'Gedeactiveerd' : 'Geactiveerd');
      loadPhotos();
    } catch (err) {
      console.error('Error toggling active:', err);
      toast.error('Fout bij updaten');
    }
  };

  const deletePhoto = async (id: number) => {
    if (!confirm('Weet je zeker dat je deze foto wilt VERWIJDEREN? Dit kan niet ongedaan worden.')) {
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
        toast.error('Fout bij verwijderen');
        return;
      }

      toast.success('Foto verwijderd');
      loadPhotos();
    } catch (err) {
      console.error('Error deleting photo:', err);
      toast.error('Fout bij verwijderen');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--ff-color-primary-700)] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[var(--color-muted)]">Laden...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Geen Toegang</h1>
          <p className="text-[var(--color-muted)] mb-4">
            Je hebt admin rechten nodig om deze pagina te bekijken.
          </p>
          <p className="text-sm text-[var(--color-muted)]">
            Ingelogd als: {user.email}
          </p>
        </div>
      </div>
    );
  }

  const activeCount = photos.filter(p => p.active).length;
  const inactiveCount = photos.filter(p => !p.active).length;
  const maleCount = photos.filter(p => p.gender === 'male').length;
  const femaleCount = photos.filter(p => p.gender === 'female').length;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
            Mood Photos Moderatie
          </h1>
          <p className="text-[var(--color-muted)]">
            Review en beheer mood photos voor de visual preference quiz
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-muted)] mb-1">Totaal</div>
            <div className="text-2xl font-bold text-[var(--color-text)]">{photos.length}</div>
          </div>
          <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)]">
            <div className="text-sm text-[var(--color-muted)] mb-1">Actief</div>
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
          <div className="flex flex-wrap gap-4">
            <select
              value={filterGender}
              onChange={(e) => {
                setFilterGender(e.target.value as any);
              }}
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
            >
              <option value="all">Alle Genders</option>
              <option value="male">Alleen Male</option>
              <option value="female">Alleen Female</option>
              <option value="unisex">Alleen Unisex</option>
            </select>
            <select
              value={filterActive}
              onChange={(e) => {
                setFilterActive(e.target.value as any);
              }}
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
            >
              <option value="all">Alle Status</option>
              <option value="active">Alleen Actief</option>
              <option value="inactive">Alleen Inactief</option>
            </select>
            <button
              onClick={loadPhotos}
              disabled={loading}
              className="px-4 py-2 bg-[var(--ff-color-primary-700)] text-white rounded-lg hover:bg-[var(--ff-color-primary-600)] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Ververs
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-[var(--ff-color-primary-700)] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[var(--color-muted)]">Foto's laden...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--color-muted)]">Geen foto's gevonden met deze filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onToggleActive={toggleActive}
                onDelete={deletePhoto}
              />
            ))}
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
              <p className="text-sm">Foto laadt niet</p>
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
            ID: {photo.id}
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
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
              photo.active
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {photo.active ? (
              <>
                <EyeOff className="w-4 h-4 inline mr-1" />
                Deactiveer
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 inline mr-1" />
                Activeer
              </>
            )}
          </button>
          <button
            onClick={() => onDelete(photo.id)}
            className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
            title="Verwijder permanent"
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
          View origineel →
        </a>
      </div>
    </motion.div>
  );
}
