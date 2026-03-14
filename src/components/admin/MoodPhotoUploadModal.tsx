import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Sparkles, Plus, ArrowLeft, RotateCcw, Check, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase as getSupabaseClient } from '@/lib/supabaseClient';
import { convertImageToWebP, supportsWebP } from '@/utils/convertImageToWebP';
import { ARCHETYPES, type ArchetypeKey } from '@/config/archetypes';

type UploadPhase = 'select' | 'analyzing' | 'review' | 'saving';

interface MoodPhotoUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ARCHETYPE_KEYS: ArchetypeKey[] = [
  'MINIMALIST', 'CLASSIC', 'SMART_CASUAL', 'STREETWEAR', 'ATHLETIC', 'AVANT_GARDE'
];

const DUTCH_COLOR_MAP: Record<string, string> = {
  zwart: '#1a1a1a',
  wit: '#FFFFFF',
  grijs: '#808080',
  beige: '#D4C5A9',
  camel: '#C19A6B',
  navy: '#1B2A4A',
  blauw: '#4169E1',
  groen: '#2D6A4F',
  bordeaux: '#722F37',
  bruin: '#8B5E3C',
  terracotta: '#CC6B49',
  roze: '#E8909C',
  creme: '#F5F0E1',
  cognac: '#9A5B3A',
  olijf: '#6B7F3B',
  goud: '#C5A34E',
  rood: '#C42B2B',
  geel: '#E8C840',
  kobalt: '#0047AB',
  nude: '#CEAE96',
};

const ARCHETYPE_COLORS: Record<string, string> = {
  MINIMALIST: '#808080',
  CLASSIC: '#2C3E50',
  SMART_CASUAL: '#8B7355',
  STREETWEAR: '#1C1C1C',
  ATHLETIC: '#34495E',
  AVANT_GARDE: '#5C3D6E',
};

export default function MoodPhotoUploadModal({ onClose, onSuccess }: MoodPhotoUploadModalProps) {
  const [phase, setPhase] = useState<UploadPhase>('select');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [displayOrder, setDisplayOrder] = useState(1);

  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [archetypeWeights, setArchetypeWeights] = useState<Record<string, number>>({
    MINIMALIST: 0, CLASSIC: 0, SMART_CASUAL: 0,
    STREETWEAR: 0, ATHLETIC: 0, AVANT_GARDE: 0
  });
  const [dominantColors, setDominantColors] = useState<string[]>([]);
  const [styleAttributes, setStyleAttributes] = useState({ formality: 0.5, boldness: 0.3 });
  const [aiConfidence, setAiConfidence] = useState(0);
  const [aiReasoning, setAiReasoning] = useState('');
  const [tagInput, setTagInput] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Selecteer een afbeelding');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Bestand te groot (max 10MB)');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const analyzeWithAI = async () => {
    if (!selectedFile) return;
    setPhase('analyzing');

    try {
      const client = getSupabaseClient();
      if (!client) { toast.error('Database niet beschikbaar'); setPhase('select'); return; }

      const { data: sessionData } = await client.auth.getSession();
      if (!sessionData?.session?.access_token) { toast.error('Sessie verlopen'); setPhase('select'); return; }

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
        setPhase('select');
        return;
      }

      const result = await response.json();

      if (result.success) {
        setMoodTags(result.moodTags || []);
        setArchetypeWeights(result.archetypeWeights || {
          MINIMALIST: 0, CLASSIC: 0, SMART_CASUAL: 0,
          STREETWEAR: 0, ATHLETIC: 0, AVANT_GARDE: 0
        });
        setDominantColors(result.dominantColors || []);
        setStyleAttributes(result.styleAttributes || { formality: 0.5, boldness: 0.3 });
        setAiConfidence(result.confidence || 0);
        setAiReasoning(result.reasoning || '');
        setPhase('review');
        toast.success('AI analyse compleet!');
      } else {
        toast.error('Geen resultaat van AI');
        setPhase('select');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        toast.error('AI analyse timeout (45s)');
      } else {
        toast.error('AI analyse mislukt');
      }
      setPhase('select');
    }
  };

  const handleArchetypeChange = (changedKey: string, newPercent: number) => {
    const newValue = newPercent / 100;
    const oldValue = archetypeWeights[changedKey] || 0;
    const delta = newValue - oldValue;
    const otherKeys = ARCHETYPE_KEYS.filter(k => k !== changedKey);
    const otherSum = otherKeys.reduce((sum, k) => sum + (archetypeWeights[k] || 0), 0);

    const updated = { ...archetypeWeights, [changedKey]: newValue };

    if (otherSum > 0 && delta !== 0) {
      for (const key of otherKeys) {
        const ratio = (archetypeWeights[key] || 0) / otherSum;
        updated[key] = Math.max(0, (archetypeWeights[key] || 0) - delta * ratio);
      }
    }

    const total = Object.values(updated).reduce((a, b) => a + b, 0);
    if (total > 0) {
      for (const key of Object.keys(updated)) {
        updated[key] = Math.round((updated[key] / total) * 100) / 100;
      }
    }

    setArchetypeWeights(updated);
  };

  const toggleColor = (color: string) => {
    if (dominantColors.includes(color)) {
      setDominantColors(dominantColors.filter(c => c !== color));
    } else if (dominantColors.length < 4) {
      setDominantColors([...dominantColors, color]);
    } else {
      toast.error('Maximum 4 kleuren');
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag) return;
    if (moodTags.includes(tag)) { toast.error('Tag bestaat al'); return; }
    if (moodTags.length >= 8) { toast.error('Maximum 8 tags'); return; }
    setMoodTags([...moodTags, tag]);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setMoodTags(moodTags.filter(t => t !== tag));
  };

  const weightSum = Object.values(archetypeWeights).reduce((a, b) => a + b, 0);
  const isValidWeightSum = Math.abs(weightSum - 1.0) < 0.03;

  const handleUpload = async () => {
    if (!selectedFile) return;
    if (moodTags.length < 3) { toast.error('Minimaal 3 tags nodig'); return; }
    if (!isValidWeightSum) { toast.error('Archetype weights moeten ~100% zijn'); return; }
    if (dominantColors.length === 0) { toast.error('Selecteer minimaal 1 kleur'); return; }

    setPhase('saving');

    try {
      let fileToUpload = selectedFile;
      if (supportsWebP() && selectedFile.type !== 'image/webp') {
        try {
          fileToUpload = await convertImageToWebP(selectedFile, 0.85);
        } catch {
          // use original
        }
      }

      const client = getSupabaseClient();
      if (!client) { toast.error('Database niet beschikbaar'); setPhase('review'); return; }

      const { data: sessionData } = await client.auth.getSession();
      if (!sessionData?.session?.access_token) { toast.error('Sessie verlopen'); setPhase('review'); return; }

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('gender', gender);
      formData.append('moodTags', JSON.stringify(moodTags));
      formData.append('displayOrder', displayOrder.toString());
      formData.append('archetypeWeights', JSON.stringify(archetypeWeights));
      formData.append('dominantColors', JSON.stringify(dominantColors));
      formData.append('styleAttributes', JSON.stringify(styleAttributes));

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
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let msg = 'Upload mislukt';
        try { msg = JSON.parse(errorText).error || msg; } catch {}
        toast.error(msg);
        setPhase('review');
        return;
      }

      toast.success('Foto opgeslagen met alle metadata!');
      onSuccess();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        toast.error('Upload timeout');
      } else {
        toast.error('Upload mislukt');
      }
      setPhase('review');
    }
  };

  const formalityLabel = styleAttributes.formality <= 0.25
    ? 'Casual' : styleAttributes.formality <= 0.50
    ? 'Smart Casual' : styleAttributes.formality <= 0.75
    ? 'Formeel' : 'Zeer Formeel';

  const boldnessLabel = styleAttributes.boldness <= 0.25
    ? 'Understated' : styleAttributes.boldness <= 0.50
    ? 'Balanced' : styleAttributes.boldness <= 0.75
    ? 'Bold' : 'Statement';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--color-surface)] rounded-2xl w-full max-h-[92vh] overflow-hidden flex flex-col"
        style={{ maxWidth: phase === 'review' ? '56rem' : '32rem' }}
      >
        <div className="p-5 border-b border-[var(--color-border)] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            {phase === 'review' && (
              <button
                onClick={() => setPhase('select')}
                className="p-1.5 rounded-lg hover:bg-[var(--color-bg)] transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-[var(--color-muted)]" />
              </button>
            )}
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              {phase === 'select' && 'Nieuwe Mood Photo'}
              {phase === 'analyzing' && 'AI Analyse...'}
              {phase === 'review' && 'Review Metadata'}
              {phase === 'saving' && 'Opslaan...'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--color-bg)] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[var(--color-muted)]" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <AnimatePresence mode="wait">

            {/* PHASE: SELECT */}
            {phase === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 space-y-5"
              >
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-6 text-center hover:border-[var(--ff-color-primary-500)] transition-colors">
                    {previewUrl ? (
                      <div className="space-y-3">
                        <img src={previewUrl} alt="Preview" className="w-full max-h-80 object-contain rounded-lg mx-auto" />
                        <p className="text-sm text-[var(--color-muted)]">Klik om te wijzigen</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mx-auto mb-3 text-[var(--color-muted)]" />
                        <p className="font-medium text-[var(--color-text)] mb-1">Sleep of klik om foto te uploaden</p>
                        <p className="text-sm text-[var(--color-muted)]">JPEG, PNG of WebP (max 10MB)</p>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                      className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Volgorde</label>
                    <input
                      type="number"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={analyzeWithAI}
                  disabled={!selectedFile}
                  className="w-full py-3.5 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2.5 disabled:opacity-40"
                  style={{ background: 'var(--ff-color-primary-700)' }}
                >
                  <Sparkles className="w-5 h-5" />
                  Analyseer met AI
                </button>
              </motion.div>
            )}

            {/* PHASE: ANALYZING */}
            {phase === 'analyzing' && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                <div className="relative rounded-xl overflow-hidden">
                  {previewUrl && (
                    <img src={previewUrl} alt="Analyzing" className="w-full max-h-80 object-contain" />
                  )}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ background: 'linear-gradient(to bottom, rgba(62,49,37,0.75), rgba(62,49,37,0.90))' }}
                  >
                    <div className="animate-spin w-10 h-10 border-3 border-white/80 border-t-transparent rounded-full mb-4" />
                    <p className="text-white font-semibold text-lg">AI analyseert outfit...</p>
                    <p className="text-white/60 text-sm mt-1">Archetype, kleuren & stijl detectie</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PHASE: REVIEW */}
            {phase === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                <div className="grid lg:grid-cols-[280px_1fr] gap-6">
                  {/* Left: Image + Confidence */}
                  <div className="space-y-4">
                    <div className="rounded-xl overflow-hidden border border-[var(--color-border)]">
                      {previewUrl && (
                        <img src={previewUrl} alt="Preview" className="w-full aspect-[3/4] object-cover" />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className="px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{
                          background: aiConfidence >= 0.8 ? 'var(--ff-color-success-600)' : aiConfidence >= 0.6 ? '#D97706' : 'var(--ff-color-danger-500)',
                          color: 'white'
                        }}
                      >
                        {Math.round(aiConfidence * 100)}% confidence
                      </div>
                      <span className="text-xs text-[var(--color-muted)]">{gender}</span>
                    </div>

                    {aiReasoning && (
                      <p className="text-xs text-[var(--color-muted)] italic leading-relaxed">{aiReasoning}</p>
                    )}

                    <button
                      onClick={analyzeWithAI}
                      className="w-full py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--ff-color-primary-500)] transition-colors flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Opnieuw analyseren
                    </button>
                  </div>

                  {/* Right: Editable metadata */}
                  <div className="space-y-6">

                    {/* Section: Mood Tags */}
                    <section>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wide">Mood Tags</h3>
                        <span className={`text-xs font-medium ${moodTags.length >= 3 ? 'text-green-600' : 'text-red-500'}`}>
                          {moodTags.length} tags
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {moodTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{ background: 'var(--ff-color-primary-50)', color: 'var(--ff-color-primary-700)' }}
                          >
                            {tag}
                            <button onClick={() => removeTag(tag)} className="hover:text-red-600 ml-0.5">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                          placeholder="Nieuwe tag..."
                          className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm"
                        />
                        <button
                          onClick={addTag}
                          className="px-3 py-2 rounded-xl text-white text-sm"
                          style={{ background: 'var(--ff-color-primary-700)' }}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </section>

                    {/* Section: Archetype Weights */}
                    <section>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wide">Archetype Verdeling</h3>
                        <span className={`text-xs font-mono font-semibold ${isValidWeightSum ? 'text-green-600' : 'text-red-500'}`}>
                          {Math.round(weightSum * 100)}%
                        </span>
                      </div>
                      <div className="space-y-3">
                        {ARCHETYPE_KEYS.map((key) => {
                          const pct = Math.round((archetypeWeights[key] || 0) * 100);
                          return (
                            <div key={key} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <label className="text-xs font-medium text-[var(--color-text)]">
                                  {ARCHETYPES[key].label}
                                </label>
                                <span className="text-xs font-mono text-[var(--color-muted)] w-10 text-right">
                                  {pct}%
                                </span>
                              </div>
                              <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-bg)' }}>
                                <div
                                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-150"
                                  style={{
                                    width: `${pct}%`,
                                    background: ARCHETYPE_COLORS[key]
                                  }}
                                />
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={pct}
                                onChange={(e) => handleArchetypeChange(key, parseInt(e.target.value))}
                                className="w-full h-2 opacity-0 absolute cursor-pointer"
                                style={{ marginTop: '-10px', position: 'relative' }}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Visual archetype bar */}
                      <div className="mt-3 flex gap-0.5 h-3 rounded-full overflow-hidden">
                        {ARCHETYPE_KEYS.filter(k => (archetypeWeights[k] || 0) > 0.02).map((key) => (
                          <div
                            key={key}
                            className="h-full transition-all duration-200"
                            style={{
                              width: `${(archetypeWeights[key] || 0) * 100}%`,
                              background: ARCHETYPE_COLORS[key],
                              borderRadius: '2px'
                            }}
                            title={`${ARCHETYPES[key].label}: ${Math.round((archetypeWeights[key] || 0) * 100)}%`}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                        {ARCHETYPE_KEYS.filter(k => (archetypeWeights[k] || 0) > 0.02).map((key) => (
                          <div key={key} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: ARCHETYPE_COLORS[key] }} />
                            <span className="text-[10px] text-[var(--color-muted)]">{ARCHETYPES[key].label}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Section: Dominant Colors */}
                    <section>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wide">Kleuren</h3>
                        <span className={`text-xs font-medium ${dominantColors.length > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {dominantColors.length}/4
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(DUTCH_COLOR_MAP).map(([name, hex]) => {
                          const isSelected = dominantColors.includes(name);
                          const isLight = ['wit', 'creme', 'beige', 'geel', 'nude'].includes(name);
                          return (
                            <button
                              key={name}
                              onClick={() => toggleColor(name)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all border ${
                                isSelected
                                  ? 'border-[var(--ff-color-primary-700)] bg-[var(--ff-color-primary-50)] text-[var(--ff-color-primary-700)] ring-1 ring-[var(--ff-color-primary-300)]'
                                  : 'border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] text-[var(--color-muted)]'
                              }`}
                            >
                              <span
                                className="w-3.5 h-3.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor: hex,
                                  border: isLight ? '1px solid var(--color-border)' : 'none'
                                }}
                              />
                              {name}
                              {isSelected && <Check className="w-3 h-3" />}
                            </button>
                          );
                        })}
                      </div>
                    </section>

                    {/* Section: Style Attributes */}
                    <section>
                      <h3 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wide mb-3">Stijl Attributen</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="text-xs font-medium text-[var(--color-text)]">Formaliteit</label>
                            <span className="text-xs text-[var(--color-muted)]">
                              {formalityLabel} ({Math.round(styleAttributes.formality * 100)}%)
                            </span>
                          </div>
                          <div className="relative">
                            <div className="h-2 rounded-full" style={{ background: 'var(--color-bg)' }}>
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${styleAttributes.formality * 100}%`,
                                  background: 'var(--ff-color-primary-700)'
                                }}
                              />
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={Math.round(styleAttributes.formality * 100)}
                              onChange={(e) => setStyleAttributes(prev => ({ ...prev, formality: parseInt(e.target.value) / 100 }))}
                              className="absolute inset-0 w-full opacity-0 cursor-pointer"
                            />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-[10px] text-[var(--color-muted)]">Athleisure</span>
                            <span className="text-[10px] text-[var(--color-muted)]">Black Tie</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="text-xs font-medium text-[var(--color-text)]">Boldness</label>
                            <span className="text-xs text-[var(--color-muted)]">
                              {boldnessLabel} ({Math.round(styleAttributes.boldness * 100)}%)
                            </span>
                          </div>
                          <div className="relative">
                            <div className="h-2 rounded-full" style={{ background: 'var(--color-bg)' }}>
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${styleAttributes.boldness * 100}%`,
                                  background: 'var(--ff-color-primary-700)'
                                }}
                              />
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={Math.round(styleAttributes.boldness * 100)}
                              onChange={(e) => setStyleAttributes(prev => ({ ...prev, boldness: parseInt(e.target.value) / 100 }))}
                              className="absolute inset-0 w-full opacity-0 cursor-pointer"
                            />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-[10px] text-[var(--color-muted)]">Neutraal</span>
                            <span className="text-[10px] text-[var(--color-muted)]">Statement</span>
                          </div>
                        </div>
                      </div>
                    </section>

                  </div>
                </div>
              </motion.div>
            )}

            {/* PHASE: SAVING */}
            {phase === 'saving' && (
              <motion.div
                key="saving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 text-center"
              >
                <div className="animate-spin w-10 h-10 border-3 border-[var(--ff-color-primary-700)] border-t-transparent rounded-full mx-auto mb-4" />
                <p className="font-medium text-[var(--color-text)]">Foto opslaan met metadata...</p>
                <p className="text-sm text-[var(--color-muted)] mt-1">WebP conversie + upload + database</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        {phase === 'review' && (
          <div className="p-5 border-t border-[var(--color-border)] flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
              <Info className="w-3.5 h-3.5" />
              <span>Pas metadata aan voor opslaan</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-sm font-medium hover:bg-[var(--color-bg)] transition-colors"
              >
                Annuleer
              </button>
              <button
                onClick={handleUpload}
                disabled={moodTags.length < 3 || !isValidWeightSum || dominantColors.length === 0}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 flex items-center gap-2"
                style={{ background: 'var(--ff-color-primary-700)' }}
              >
                <Check className="w-4 h-4" />
                Opslaan
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export { DUTCH_COLOR_MAP, ARCHETYPE_COLORS };
