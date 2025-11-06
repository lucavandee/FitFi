import { useState, useCallback } from 'react';
import { Upload, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface UploadedFile {
  file: File;
  sku: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
  matchedProduct?: {
    id: string;
    name: string;
    current_image?: string;
  };
}

export function BulkImageUploader() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const extractSKUFromFilename = (filename: string): string => {
    const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');

    // Pattern 1: BF-12345 or BF12345
    const bfPattern = /BF[-_]?(\d+)/i;
    const bfMatch = nameWithoutExt.match(bfPattern);
    if (bfMatch) return `BF-${bfMatch[1]}`;

    // Pattern 2: Just numbers (assume BF prefix)
    const numberPattern = /^\d+$/;
    if (numberPattern.test(nameWithoutExt)) {
      return `BF-${nameWithoutExt}`;
    }

    // Pattern 3: Style code format (e.g., XL22-0001)
    const stylePattern = /^[A-Z]{2}\d{2}-\d{4}$/i;
    if (stylePattern.test(nameWithoutExt)) {
      return nameWithoutExt.toUpperCase();
    }

    // Fallback: use full filename
    return nameWithoutExt;
  };

  const validateSKU = async (sku: string): Promise<UploadedFile['matchedProduct']> => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, image_url')
      .eq('sku', sku)
      .maybeSingle();

    if (error || !data) return undefined;

    return {
      id: data.id,
      name: data.name,
      current_image: data.image_url || undefined
    };
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    const newFiles: UploadedFile[] = [];

    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is geen afbeelding`);
        continue;
      }

      const sku = extractSKUFromFilename(file.name);
      const matchedProduct = await validateSKU(sku);

      newFiles.push({
        file,
        sku,
        status: matchedProduct ? 'pending' : 'error',
        error: matchedProduct ? undefined : 'SKU niet gevonden in database',
        matchedProduct
      });
    }

    setFiles(prev => [...prev, ...newFiles]);

    const matched = newFiles.filter(f => f.matchedProduct).length;
    const unmatched = newFiles.filter(f => !f.matchedProduct).length;

    toast.success(`${matched} SKU's gematcht`, { duration: 3000 });
    if (unmatched > 0) {
      toast.error(`${unmatched} SKU's niet gevonden`, { duration: 5000 });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadImage = async (uploadFile: UploadedFile): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      const fileExt = uploadFile.file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${uploadFile.sku}.${fileExt}`;
      const filePath = `products/${uploadFile.sku}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('brams-fruit-images')
        .upload(filePath, uploadFile.file, {
          cacheControl: '3600',
          upsert: true,
          contentType: uploadFile.file.type
        });

      if (uploadError) {
        return { success: false, error: uploadError.message };
      }

      const { data } = supabase.storage
        .from('brams-fruit-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: data.publicUrl })
        .eq('sku', uploadFile.sku);

      if (updateError) {
        return { success: false, error: `Upload OK, maar database update gefaald: ${updateError.message}` };
      }

      return { success: true, url: data.publicUrl };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  };

  const handleUploadAll = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');

    if (pendingFiles.length === 0) {
      toast.error('Geen bestanden om te uploaden');
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const file of pendingFiles) {
      setFiles(prev => prev.map(f =>
        f.file === file.file ? { ...f, status: 'uploading' } : f
      ));

      const result = await uploadImage(file);

      if (result.success) {
        setFiles(prev => prev.map(f =>
          f.file === file.file
            ? { ...f, status: 'success', url: result.url }
            : f
        ));
        successCount++;
      } else {
        setFiles(prev => prev.map(f =>
          f.file === file.file
            ? { ...f, status: 'error', error: result.error }
            : f
        ));
        errorCount++;
      }
    }

    setIsProcessing(false);

    if (errorCount === 0) {
      toast.success(`🎉 ${successCount} afbeeldingen geüpload!`);
    } else {
      toast.error(`${errorCount} fouten, ${successCount} succesvol`);
    }
  };

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'success'));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const stats = {
    total: files.length,
    pending: files.filter(f => f.status === 'pending').length,
    success: files.filter(f => f.status === 'success').length,
    error: files.filter(f => f.status === 'error').length
  };

  return (
    <div className="space-y-6">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-[var(--radius-2xl)] p-12 text-center transition-all
          ${isDragging
            ? 'border-[var(--ff-color-primary-700)] bg-[var(--ff-color-primary-50)]'
            : 'border-[var(--color-border)] bg-[var(--color-surface)]'
          }
        `}
      >
        <input
          type="file"
          id="file-input"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        <label htmlFor="file-input" className="cursor-pointer">
          <Upload className="w-12 h-12 mx-auto mb-4 text-[var(--color-muted)]" />
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
            Sleep afbeeldingen hierheen
          </h3>
          <p className="text-sm text-[var(--color-muted)] mb-4">
            of klik om bestanden te selecteren
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            Bestandsnaam = SKU (bijv. BF-12345.jpg, XL22-0001.png)
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <>
          <div className="grid grid-cols-4 gap-4 p-4 bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)]">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--color-text)]">{stats.total}</div>
              <div className="text-xs text-[var(--color-muted)]">Totaal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--ff-color-primary-700)]">{stats.pending}</div>
              <div className="text-xs text-[var(--color-muted)]">Wachtend</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.success}</div>
              <div className="text-xs text-[var(--color-muted)]">Gelukt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.error}</div>
              <div className="text-xs text-[var(--color-muted)]">Fout</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleUploadAll}
              disabled={isProcessing || stats.pending === 0}
              className="flex-1 py-3 px-6 bg-[var(--ff-color-primary-700)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-600)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploaden...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload {stats.pending} afbeelding{stats.pending !== 1 ? 'en' : ''}
                </>
              )}
            </button>

            {stats.success > 0 && (
              <button
                onClick={clearCompleted}
                className="py-3 px-6 bg-green-50 text-green-700 rounded-[var(--radius-xl)] font-medium hover:bg-green-100 transition-colors"
              >
                Wis gelukte
              </button>
            )}

            <button
              onClick={clearAll}
              className="py-3 px-6 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-[var(--radius-xl)] font-medium hover:bg-[var(--color-bg)] transition-colors"
            >
              Wis alles
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className={`
                  p-4 rounded-[var(--radius-xl)] border transition-all
                  ${file.status === 'success' ? 'bg-green-50 border-green-200' :
                    file.status === 'error' ? 'bg-red-50 border-red-200' :
                    file.status === 'uploading' ? 'bg-blue-50 border-blue-200' :
                    'bg-[var(--color-surface)] border-[var(--color-border)]'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {file.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {file.status === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
                    {file.status === 'uploading' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
                    {file.status === 'pending' && <AlertCircle className="w-5 h-5 text-[var(--color-muted)]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-[var(--color-text)] truncate">
                        {file.file.name}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-mono bg-white rounded border border-[var(--color-border)]">
                        {file.sku}
                      </span>
                    </div>

                    {file.matchedProduct && (
                      <div className="text-sm text-[var(--color-muted)] truncate">
                        → {file.matchedProduct.name}
                      </div>
                    )}

                    {file.error && (
                      <div className="text-sm text-red-600 mt-1">
                        {file.error}
                      </div>
                    )}

                    {file.status === 'success' && file.url && (
                      <div className="text-xs text-green-600 mt-1 truncate">
                        ✓ Geüpload naar {file.url}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-[var(--color-muted)] flex-shrink-0">
                    {(file.file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
