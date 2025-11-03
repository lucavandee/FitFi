import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Eye, EyeOff, Trash2, Filter, RefreshCw, Upload, Plus, X } from 'lucide-react';
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
  const [showUploadModal, setShowUploadModal] = useState(false);

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
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
              Mood Photos Moderatie
            </h1>
            <p className="text-[var(--color-muted)]">
              Review en beheer mood photos voor de visual preference quiz
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-lg hover:bg-[var(--ff-color-primary-600)] transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Nieuwe Foto
          </button>
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

        {showUploadModal && (
          <UploadModal
            onClose={() => setShowUploadModal(false)}
            onSuccess={() => {
              setShowUploadModal(false);
              loadPhotos();
            }}
          />
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

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecteer een image bestand');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Bestand te groot (max 5MB)');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    if (moodTags.includes(tagInput.trim().toLowerCase())) {
      toast.error('Tag bestaat al');
      return;
    }
    if (moodTags.length >= 6) {
      toast.error('Maximum 6 tags toegestaan');
      return;
    }
    setMoodTags([...moodTags, tagInput.trim().toLowerCase()]);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setMoodTags(moodTags.filter(t => t !== tag));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecteer eerst een foto');
      return;
    }

    if (moodTags.length < 3) {
      toast.error('Voeg minimaal 3 mood tags toe');
      return;
    }

    setUploading(true);

    try {
      const { getSupabase } = await import('@/lib/supabase');
      const client = getSupabase();

      if (!client) {
        toast.error('Database niet beschikbaar');
        setUploading(false);
        return;
      }

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${gender}/${fileName}`;

      const { error: uploadError } = await client.storage
        .from('mood-photos')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Fout bij uploaden: ' + uploadError.message);
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = client.storage
        .from('mood-photos')
        .getPublicUrl(filePath);

      const { error: dbError } = await client
        .from('mood_photos')
        .insert({
          image_url: publicUrl,
          gender: gender,
          mood_tags: moodTags,
          active: true,
          display_order: displayOrder
        });

      if (dbError) {
        console.error('Database error:', dbError);
        toast.error('Fout bij opslaan in database');
        setUploading(false);
        return;
      }

      toast.success('Foto succesvol toegevoegd!');
      onSuccess();
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Er ging iets mis bij uploaden');
      setUploading(false);
    }
  };

  const suggestedTags = {
    male: [
      'minimal', 'scandinavian', 'clean', 'refined',
      'professional', 'tailored', 'executive', 'formal',
      'street', 'urban', 'contemporary', 'edgy',
      'smart_casual', 'versatile', 'polished', 'elevated',
      'casual', 'relaxed', 'comfortable', 'weekend',
      'athletic', 'sporty', 'active', 'performance',
      'preppy', 'classic', 'traditional', 'collegiate',
      'monochrome', 'modern', 'minimalist', 'sleek',
      'bold', 'statement', 'confident', 'expressive',
      'coastal', 'laid_back', 'summery'
    ],
    female: [
      'minimal', 'effortless', 'neutral', 'scandinavian',
      'professional', 'structured', 'polished', 'elegant',
      'romantic', 'feminine', 'soft', 'flowing',
      'bohemian', 'artistic', 'layered', 'eclectic',
      'bold', 'statement', 'colorful', 'confident',
      'athleisure', 'sporty', 'active', 'comfortable',
      'street', 'urban', 'edgy', 'contemporary',
      'preppy', 'classic', 'traditional',
      'coastal', 'breezy', 'relaxed',
      'monochrome', 'sophisticated', 'sleek', 'modern'
    ]
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--color-surface)] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center sticky top-0 bg-[var(--color-surface)] z-10">
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Nieuwe Mood Photo</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-bg)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-[var(--color-text)] mb-4">Upload Foto</h3>

            <div className="mb-6">
              <label className="block w-full">
                <div className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-8 text-center cursor-pointer hover:border-[var(--ff-color-primary-700)] transition-colors">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <p className="text-sm text-[var(--color-muted)]">Klik om andere foto te kiezen</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 mx-auto mb-4 text-[var(--color-muted)]" />
                      <p className="text-[var(--color-text)] font-medium mb-2">
                        Klik om foto te uploaden
                      </p>
                      <p className="text-sm text-[var(--color-muted)]">
                        JPEG, PNG of WebP (max 5MB)
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {selectedFile && (
              <div className="text-sm text-[var(--color-muted)] space-y-1">
                <p><strong>Bestand:</strong> {selectedFile.name}</p>
                <p><strong>Grootte:</strong> {(selectedFile.size / 1024).toFixed(0)} KB</p>
                <p><strong>Type:</strong> {selectedFile.type}</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-[var(--color-text)] mb-4">Metadata</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Gender *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Mood Tags * (min 3, max 6)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Type tag en druk Enter"
                    className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-[var(--ff-color-primary-700)] text-white rounded-lg hover:bg-[var(--ff-color-primary-600)] transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {moodTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-[var(--ff-color-primary-700)] text-white rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-200">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <details className="text-sm">
                  <summary className="text-[var(--color-muted)] cursor-pointer hover:text-[var(--color-text)]">
                    Zie suggested tags voor {gender}
                  </summary>
                  <div className="mt-2 flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                    {suggestedTags[gender].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (!moodTags.includes(tag) && moodTags.length < 6) {
                            setMoodTags([...moodTags, tag]);
                          }
                        }}
                        className="px-2 py-1 bg-[var(--color-bg)] text-[var(--color-muted)] rounded text-xs hover:bg-[var(--color-border)] transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[var(--color-border)] flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-6 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-bg)] transition-colors disabled:opacity-50"
          >
            Annuleer
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile || moodTags.length < 3}
            className="px-6 py-2 bg-[var(--ff-color-primary-700)] text-white rounded-lg hover:bg-[var(--ff-color-primary-600)] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Uploaden...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Foto
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
