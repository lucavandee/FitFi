import { useState, useEffect } from 'react';
import Spinner from '@/components/ui/Spinner';
import { motion } from 'framer-motion';
import { TriangleAlert as AlertTriangle, Eye, EyeOff, Trash2, Filter, RefreshCw, Upload, Plus, X, Sparkles, Check, FileSliders as Sliders, Palette, Zap } from 'lucide-react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import toast from 'react-hot-toast';
import { supabase as getSupabaseClient } from '@/lib/supabaseClient';
import '@/utils/convertMoodPhotosToWebP';
import { convertImageToWebP, supportsWebP } from '@/utils/convertImageToWebP';

interface MoodPhoto {
  id: number;
  image_url: string;
  gender: 'male' | 'female' | 'unisex';
  mood_tags: string[];
  archetype_weights: Record<string, number>;
  dominant_colors: string[];
  style_attributes: Record<string, number>;
  active: boolean;
  display_order: number;
  created_at: string;
}

const ARCHETYPES = ['MINIMALIST', 'CLASSIC', 'SMART_CASUAL', 'STREETWEAR', 'ATHLETIC', 'AVANT_GARDE', 'BUSINESS'] as const;

const ARCHETYPE_LABELS: Record<string, string> = {
  MINIMALIST: 'Minimalist',
  CLASSIC: 'Classic',
  SMART_CASUAL: 'Smart Casual',
  STREETWEAR: 'Streetwear',
  ATHLETIC: 'Athletic',
  AVANT_GARDE: 'Avant-Garde',
  BUSINESS: 'Business',
};

const ARCHETYPE_COLORS: Record<string, string> = {
  MINIMALIST: 'bg-gray-100 text-gray-700 border-gray-200',
  CLASSIC: 'bg-amber-50 text-amber-700 border-amber-200',
  SMART_CASUAL: 'bg-teal-50 text-teal-700 border-teal-200',
  STREETWEAR: 'bg-red-50 text-red-700 border-red-200',
  ATHLETIC: 'bg-blue-50 text-blue-700 border-blue-200',
  AVANT_GARDE: 'bg-stone-100 text-stone-700 border-stone-300',
  BUSINESS: 'bg-slate-100 text-slate-700 border-slate-300',
};

const COLOR_SWATCHES: Record<string, string> = {
  zwart: '#1a1a1a', wit: '#f5f5f5', grijs: '#9ca3af', beige: '#d4c5a9',
  camel: '#c19a6b', navy: '#1e3a5f', blauw: '#3b82f6', groen: '#22c55e',
  olijf: '#6b7034', bordeaux: '#722f37', bruin: '#8b5e3c', terracotta: '#c04000',
  roze: '#f9a8d4', creme: '#f5f0e1', cognac: '#9a5b13', goud: '#d4a017',
  rood: '#ef4444', geel: '#eab308', kobalt: '#0047ab', nude: '#e8c4a0',
  oranje: '#f97316', lila: '#c084fc', turquoise: '#06b6d4',
};

export default function AdminMoodPhotosPage() {
  const { isAdmin, user, isLoading: authLoading } = useIsAdmin();
  const [photos, setPhotos] = useState<MoodPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female' | 'unisex'>('all');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
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

      if (filterGender !== 'all') query = query.eq('gender', filterGender);
      if (filterActive === 'active') query = query.eq('active', true);
      else if (filterActive === 'inactive') query = query.eq('active', false);

      const { data, error } = await query;
      if (error) {
        toast.error('Fout bij laden foto\'s');
        setLoading(false);
        return;
      }
      setPhotos(data || []);
    } catch {
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
        .eq('id', id)
        .select();

      if (error) {
        toast.error('Fout bij updaten: ' + error.message);
        return;
      }
      toast.success(currentActive ? 'Gedeactiveerd' : 'Geactiveerd');
      setPhotos(prev => prev.map(p => p.id === id ? { ...p, active: !currentActive } : p));
    } catch (err) {
      toast.error('Fout bij updaten: ' + (err as Error).message);
    }
  };

  const deletePhoto = async (id: number) => {
    if (!confirm('Weet je zeker dat je deze foto wilt verwijderen?')) return;
    try {
      const { getSupabase } = await import('@/lib/supabase');
      const client = getSupabase();
      const photo = photos.find(p => p.id === id);
      if (!photo) return;

      const { error: dbError } = await client.from('mood_photos').delete().eq('id', id);
      if (dbError) {
        toast.error('Fout bij verwijderen: ' + dbError.message);
        return;
      }
      if (photo.image_url.includes('supabase')) {
        const urlParts = photo.image_url.split('/mood-photos/');
        if (urlParts.length === 2) {
          await client.storage.from('mood-photos').remove([urlParts[1]]);
        }
      }
      toast.success('Foto verwijderd');
      setPhotos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      toast.error('Fout bij verwijderen: ' + (err as Error).message);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <Spinner size="md" className="mx-auto mb-4" />
          <p className="text-[var(--color-muted)]">Admin verificatie...</p>
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
          <p className="text-[var(--color-muted)]">
            Je hebt admin rechten nodig. Ingelogd als: {user.email}
          </p>
        </div>
      </div>
    );
  }

  const activeCount = photos.filter(p => p.active).length;
  const enrichedCount = photos.filter(p => p.archetype_weights && Object.keys(p.archetype_weights).length > 0).length;
  const maleCount = photos.filter(p => p.gender === 'male').length;
  const femaleCount = photos.filter(p => p.gender === 'female').length;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
              Mood Photos Beheer
            </h1>
            <p className="text-[var(--color-muted)]">
              Upload en beheer foto's voor het swipe-systeem met AI-gestuurde metadata
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-xl hover:bg-[var(--ff-color-primary-600)] transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Nieuwe Foto
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Totaal" value={photos.length} />
          <StatCard label="Actief" value={activeCount} color="text-green-600" />
          <StatCard label="Verrijkt" value={enrichedCount} color="text-[var(--ff-color-primary-700)]" />
          <StatCard label="Male" value={maleCount} color="text-blue-600" />
          <StatCard label="Female" value={femaleCount} color="text-pink-600" />
        </div>

        <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)] mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <Filter className="w-5 h-5 text-[var(--color-muted)]" />
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value as typeof filterGender)}
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
            >
              <option value="all">Alle Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value as typeof filterActive)}
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
            >
              <option value="all">Alle Status</option>
              <option value="active">Actief</option>
              <option value="inactive">Inactief</option>
            </select>
            <button
              onClick={loadPhotos}
              disabled={loading}
              className="px-4 py-2 bg-[var(--ff-color-primary-700)] text-white rounded-xl hover:bg-[var(--ff-color-primary-600)] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Ververs
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Spinner size="md" className="mx-auto mb-4" />
            <p className="text-[var(--color-muted)]">Laden...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--color-muted)]">Geen foto's gevonden</p>
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
            onSuccess={() => { setShowUploadModal(false); loadPhotos(); }}
          />
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color = 'text-[var(--color-text)]' }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)]">
      <div className="text-sm text-[var(--color-muted)] mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function PhotoCard({ photo, onToggleActive, onDelete }: {
  photo: MoodPhoto;
  onToggleActive: (id: number, active: boolean) => void;
  onDelete: (id: number) => void;
}) {
  const [imageError, setImageError] = useState(false);
  const hasWeights = photo.archetype_weights && Object.keys(photo.archetype_weights).length > 0;
  const topArchetype = hasWeights
    ? Object.entries(photo.archetype_weights).sort(([, a], [, b]) => b - a)[0]
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[var(--color-surface)] rounded-lg border-2 overflow-hidden ${
        photo.active ? 'border-green-500/40' : 'border-red-500/40'
      }`}
    >
      <div className="relative aspect-[3/4] bg-[var(--color-bg)]">
        {!imageError ? (
          <img
            src={photo.image_url}
            alt={`Mood photo ${photo.id}`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <AlertTriangle className="w-8 h-8 text-[var(--color-muted)]" />
          </div>
        )}
        {!photo.active && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <EyeOff className="w-12 h-12 text-white" />
          </div>
        )}
        {!hasWeights && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-amber-500 text-white text-xs rounded font-medium">
            Niet verrijkt
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full border ${
            photo.gender === 'male' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-pink-50 text-pink-700 border-pink-200'
          }`}>
            {photo.gender}
          </span>
          <span className="text-xs text-[var(--color-muted)]">#{photo.id}</span>
        </div>

        {topArchetype && (
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded border font-medium ${ARCHETYPE_COLORS[topArchetype[0]] || 'bg-gray-100 text-gray-700'}`}>
              {ARCHETYPE_LABELS[topArchetype[0]] || topArchetype[0]}
            </span>
            <span className="text-xs text-[var(--color-muted)]">
              {Math.round(topArchetype[1] * 100)}%
            </span>
          </div>
        )}

        {photo.dominant_colors?.length > 0 && (
          <div className="flex items-center gap-1.5">
            {photo.dominant_colors.map((color, i) => (
              <div key={i} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full border border-[var(--color-border)]"
                  style={{ backgroundColor: COLOR_SWATCHES[color] || '#ccc' }}
                />
                <span className="text-xs text-[var(--color-muted)]">{color}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {photo.mood_tags?.slice(0, 4).map((tag, i) => (
            <span key={i} className="text-xs px-2 py-0.5 bg-[var(--color-bg)] text-[var(--color-muted)] rounded">
              {tag}
            </span>
          ))}
          {photo.mood_tags?.length > 4 && (
            <span className="text-xs text-[var(--color-muted)]">+{photo.mood_tags.length - 4}</span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onToggleActive(photo.id, photo.active)}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
              photo.active ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            {photo.active ? <><EyeOff className="w-3.5 h-3.5 inline mr-1" />Uit</> : <><Eye className="w-3.5 h-3.5 inline mr-1" />Aan</>}
          </button>
          <button
            onClick={() => onDelete(photo.id)}
            className="p-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function UploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [uploading, setUploading] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [aiReasoning, setAiReasoning] = useState('');
  const [aiConfidence, setAiConfidence] = useState(0);

  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [archetypeWeights, setArchetypeWeights] = useState<Record<string, number>>({});
  const [dominantColors, setDominantColors] = useState<string[]>([]);
  const [formality, setFormality] = useState(0.5);
  const [boldness, setBoldness] = useState(0.3);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Selecteer een afbeelding'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalyzed(false);
    setAiReasoning('');
    setAiConfidence(0);
  };

  const analyzeWithAI = async () => {
    if (!selectedFile) { toast.error('Selecteer eerst een foto'); return; }
    setAnalyzing(true);

    try {
      const client = getSupabaseClient();
      if (!client) { toast.error('Database niet beschikbaar'); setAnalyzing(false); return; }

      const { data: sessionData } = await client.auth.getSession();
      if (!sessionData?.session?.access_token) { toast.error('Sessie verlopen'); setAnalyzing(false); return; }

      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('gender', gender);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const response = await fetch(`${supabaseUrl}/functions/v1/ai-mood-tags`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'apikey': anonKey
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        toast.error('AI analyse mislukt');
        setAnalyzing(false);
        return;
      }

      const result = await response.json();

      if (result.success) {
        setMoodTags(result.moodTags || []);
        setArchetypeWeights(result.archetypeWeights || {});
        setDominantColors(result.dominantColors || []);
        setFormality(result.styleAttributes?.formality ?? 0.5);
        setBoldness(result.styleAttributes?.boldness ?? 0.3);
        setAiReasoning(result.reasoning || '');
        setAiConfidence(result.confidence || 0);
        setAnalyzed(true);
        toast.success('AI analyse compleet - alle velden ingevuld!');
      } else {
        toast.error('Analyse gaf geen resultaat');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        toast.error('Timeout - probeer opnieuw');
      } else {
        toast.error('AI analyse mislukt');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag) return;
    if (moodTags.includes(tag)) { toast.error('Tag bestaat al'); return; }
    if (moodTags.length >= 8) { toast.error('Max 8 tags'); return; }
    setMoodTags([...moodTags, tag]);
    setTagInput('');
  };

  const updateWeight = (arch: string, value: number) => {
    const newWeights = { ...archetypeWeights };
    if (value <= 0) {
      delete newWeights[arch];
    } else {
      newWeights[arch] = Math.round(value * 100) / 100;
    }
    setArchetypeWeights(newWeights);
  };

  const normalizeWeights = () => {
    const sum = Object.values(archetypeWeights).reduce((a, b) => a + b, 0);
    if (sum <= 0) return;
    const normalized: Record<string, number> = {};
    for (const [k, v] of Object.entries(archetypeWeights)) {
      normalized[k] = Math.round((v / sum) * 100) / 100;
    }
    setArchetypeWeights(normalized);
    toast.success('Gewichten genormaliseerd naar 1.0');
  };

  const toggleColor = (color: string) => {
    if (dominantColors.includes(color)) {
      setDominantColors(dominantColors.filter(c => c !== color));
    } else if (dominantColors.length < 3) {
      setDominantColors([...dominantColors, color]);
    } else {
      toast.error('Max 3 kleuren');
    }
  };

  const weightSum = Object.values(archetypeWeights).reduce((a, b) => a + b, 0);
  const isWeightValid = Math.abs(weightSum - 1.0) < 0.02;
  const canUpload = selectedFile && moodTags.length >= 3 && Object.keys(archetypeWeights).length > 0 && isWeightValid && dominantColors.length > 0;

  const handleUpload = async () => {
    if (!canUpload) return;
    setUploading(true);

    try {
      let fileToUpload = selectedFile!;
      if (supportsWebP() && selectedFile!.type !== 'image/webp') {
        try {
          fileToUpload = await convertImageToWebP(selectedFile!, 0.85);
        } catch { /* use original */ }
      }

      const client = getSupabaseClient();
      if (!client) { toast.error('Database niet beschikbaar'); setUploading(false); return; }

      const { data: sessionData } = await client.auth.getSession();
      if (!sessionData?.session?.access_token) { toast.error('Sessie verlopen'); setUploading(false); return; }

      const fd = new FormData();
      fd.append('file', fileToUpload);
      fd.append('gender', gender);
      fd.append('moodTags', JSON.stringify(moodTags));
      fd.append('displayOrder', displayOrder.toString());
      fd.append('archetypeWeights', JSON.stringify(archetypeWeights));
      fd.append('dominantColors', JSON.stringify(dominantColors));
      fd.append('styleAttributes', JSON.stringify({ formality, boldness }));

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${supabaseUrl}/functions/v1/admin-upload-mood-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'apikey': anonKey
        },
        body: fd,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let msg = 'Upload mislukt';
        try { msg = JSON.parse(errorText).error || msg; } catch { /* ignore */ }
        toast.error(msg);
        setUploading(false);
        return;
      }

      toast.success('Foto succesvol ge-upload met alle metadata!');
      onSuccess();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        toast.error('Upload timeout');
      } else {
        toast.error('Upload mislukt: ' + (err as Error).message);
      }
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--color-surface)] rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center sticky top-0 bg-[var(--color-surface)] z-10">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">Nieuwe Mood Photo</h2>
            <p className="text-sm text-[var(--color-muted)]">Upload een foto en laat AI alle metadata genereren</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--color-bg)] rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Photo + Gender + AI Analyze */}
          <div className="grid md:grid-cols-[300px_1fr] gap-6 mb-8">
            <div>
              <label className="block w-full cursor-pointer">
                <div className="border-2 border-dashed border-[var(--color-border)] rounded-xl overflow-hidden hover:border-[var(--ff-color-primary-700)] transition-colors aspect-[3/4]">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                      <Upload className="w-10 h-10 mb-3 text-[var(--color-muted)]" />
                      <p className="text-sm font-medium text-[var(--color-text)] mb-1">Klik om te uploaden</p>
                      <p className="text-xs text-[var(--color-muted)]">JPEG, PNG of WebP (max 5MB)</p>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileSelect} className="hidden" />
              </label>
              {selectedFile && (
                <p className="text-xs text-[var(--color-muted)] mt-2 text-center">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Volgorde</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
                  />
                </div>
              </div>

              <button
                onClick={analyzeWithAI}
                disabled={analyzing || !selectedFile}
                className="w-full py-3.5 rounded-xl font-semibold text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2.5"
                style={{ background: 'var(--ff-color-primary-700)' }}
              >
                {analyzing ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    AI analyseert de foto...
                  </>
                ) : analyzed ? (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Opnieuw analyseren
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyseer met AI
                  </>
                )}
              </button>

              {analyzed && aiReasoning && (
                <div className="p-3 bg-[var(--ff-color-primary-50)] rounded-lg border border-[var(--ff-color-primary-200)]">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-[var(--ff-color-primary-700)]" />
                    <span className="text-xs font-medium text-[var(--ff-color-primary-700)]">
                      AI Analyse (confidence: {Math.round(aiConfidence * 100)}%)
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text)]">{aiReasoning}</p>
                </div>
              )}

              {!analyzed && !analyzing && selectedFile && (
                <p className="text-sm text-[var(--color-muted)] text-center">
                  Klik op "Analyseer met AI" om automatisch alle metadata in te vullen
                </p>
              )}
            </div>
          </div>

          {/* Step 2: All metadata (visible after analysis or manually) */}
          <div className="space-y-6">
            {/* Archetype Weights */}
            <div className="p-5 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[var(--color-muted)]" />
                  <h3 className="font-semibold text-[var(--color-text)]">Archetype Gewichten</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    isWeightValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    Som: {weightSum.toFixed(2)}
                  </span>
                  {!isWeightValid && Object.keys(archetypeWeights).length > 0 && (
                    <button onClick={normalizeWeights} className="text-xs text-[var(--ff-color-primary-700)] hover:underline font-medium">
                      Normaliseer
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ARCHETYPES.map(arch => {
                  const value = archetypeWeights[arch] || 0;
                  return (
                    <div key={arch} className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded border font-medium min-w-[90px] text-center ${ARCHETYPE_COLORS[arch]}`}>
                        {ARCHETYPE_LABELS[arch]}
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.round(value * 100)}
                        onChange={(e) => updateWeight(arch, parseInt(e.target.value) / 100)}
                        className="flex-1 h-1.5 accent-[var(--ff-color-primary-700)]"
                      />
                      <span className="text-xs font-mono text-[var(--color-muted)] w-8 text-right">
                        {Math.round(value * 100)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dominant Colors */}
            <div className="p-5 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-4 h-4 text-[var(--color-muted)]" />
                <h3 className="font-semibold text-[var(--color-text)]">Dominante Kleuren</h3>
                <span className="text-xs text-[var(--color-muted)]">(selecteer 1-3)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(COLOR_SWATCHES).map(([name, hex]) => {
                  const selected = dominantColors.includes(name);
                  return (
                    <button
                      key={name}
                      onClick={() => toggleColor(name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        selected
                          ? 'border-[var(--ff-color-primary-700)] bg-[var(--ff-color-primary-50)] text-[var(--ff-color-primary-700)] ring-1 ring-[var(--ff-color-primary-700)]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--ff-color-primary-300)]'
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: hex }} />
                      {name}
                      {selected && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mood Tags */}
            <div className="p-5 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-semibold text-[var(--color-text)]">Mood Tags</h3>
                <span className="text-xs text-[var(--color-muted)]">(min 3, max 8)</span>
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="Type en druk Enter"
                  className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm"
                />
                <button onClick={addTag} className="px-3 py-2 bg-[var(--ff-color-primary-700)] text-white rounded-xl hover:bg-[var(--ff-color-primary-600)]">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {moodTags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-[var(--ff-color-primary-700)] text-white rounded-full text-xs font-medium flex items-center gap-1.5">
                    {tag}
                    <button onClick={() => setMoodTags(moodTags.filter(t => t !== tag))} className="hover:text-red-200">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {moodTags.length === 0 && (
                  <span className="text-xs text-[var(--color-muted)]">Nog geen tags - analyseer met AI of voeg handmatig toe</span>
                )}
              </div>
            </div>

            {/* Style Attributes */}
            <div className="p-5 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
              <h3 className="font-semibold text-[var(--color-text)] mb-4">Stijlkenmerken</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-[var(--color-text)]">Formaliteit</label>
                    <span className="text-xs font-mono text-[var(--color-muted)]">{formality.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="100"
                    value={Math.round(formality * 100)}
                    onChange={(e) => setFormality(parseInt(e.target.value) / 100)}
                    className="w-full h-2 accent-[var(--ff-color-primary-700)]"
                  />
                  <div className="flex justify-between text-xs text-[var(--color-muted)] mt-1">
                    <span>Sportief</span>
                    <span>Black tie</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-[var(--color-text)]">Gedurfdheid</label>
                    <span className="text-xs font-mono text-[var(--color-muted)]">{boldness.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="100"
                    value={Math.round(boldness * 100)}
                    onChange={(e) => setBoldness(parseInt(e.target.value) / 100)}
                    className="w-full h-2 accent-[var(--ff-color-primary-700)]"
                  />
                  <div className="flex justify-between text-xs text-[var(--color-muted)] mt-1">
                    <span>Subtiel</span>
                    <span>Statement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--color-border)] flex items-center justify-between sticky bottom-0 bg-[var(--color-surface)]">
          <div className="text-xs text-[var(--color-muted)] space-y-0.5">
            {!canUpload && (
              <div className="space-y-0.5">
                {moodTags.length < 3 && <p>- Minimaal 3 mood tags nodig</p>}
                {Object.keys(archetypeWeights).length === 0 && <p>- Archetype gewichten nodig</p>}
                {!isWeightValid && Object.keys(archetypeWeights).length > 0 && <p>- Gewichten moeten optellen tot 1.0</p>}
                {dominantColors.length === 0 && <p>- Selecteer minimaal 1 kleur</p>}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={uploading}
              className="px-6 py-2.5 border border-[var(--color-border)] text-[var(--color-text)] rounded-xl hover:bg-[var(--color-bg)] transition-colors disabled:opacity-50"
            >
              Annuleer
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || !canUpload}
              className="px-6 py-2.5 text-white rounded-xl transition-all disabled:opacity-40 flex items-center gap-2 font-medium"
              style={{ background: 'var(--ff-color-primary-700)' }}
            >
              {uploading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Uploaden...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload met Metadata
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
