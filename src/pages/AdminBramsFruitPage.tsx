import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { importBramsFruitProducts, uploadProductImage, updateProductImages } from '@/services/bramsFruit/importService';
import toast from 'react-hot-toast';

export default function AdminBramsFruitPage() {
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [importing, setImporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    failed: number;
    errors: string[];
  } | null>(null);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Access Denied</h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Admin privileges required
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-[var(--ff-color-primary-700)] text-white rounded-lg hover:bg-[var(--ff-color-primary-600)] transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const csvData = await file.text();
      const result = await importBramsFruitProducts(csvData);

      setImportResult(result);

      if (result.success) {
        toast.success(`Imported ${result.imported} products successfully!`);
      } else {
        toast.error(`Import completed with ${result.failed} errors`);
      }
    } catch (err) {
      toast.error('Failed to import CSV');
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const file of Array.from(files)) {
        const styleCode = file.name.split('.')[0].split('-')[0];

        const uploadResult = await uploadProductImage(styleCode, file);

        if (uploadResult.success && uploadResult.url) {
          const updateResult = await updateProductImages(styleCode, uploadResult.url);

          if (updateResult.success) {
            successCount += updateResult.updated;
          } else {
            failCount++;
          }
        } else {
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Updated ${successCount} products with images`);
      }
      if (failCount > 0) {
        toast.error(`Failed to process ${failCount} images`);
      }
    } catch (err) {
      toast.error('Failed to upload images');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">
            Brams Fruit Admin
          </h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Manage product catalog and images
          </p>
        </div>

        <div className="space-y-6">
          {/* CSV Import */}
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
              Import Products from CSV
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Upload the Brams Fruit product spreadsheet (CSV format). Existing products will be updated.
            </p>

            <label className="block">
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                disabled={importing}
                className="block w-full text-sm text-[var(--color-text)]
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[var(--ff-color-primary-700)] file:text-white
                  hover:file:bg-[var(--ff-color-primary-600)]
                  file:cursor-pointer file:transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>

            {importing && (
              <div className="mt-4 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                  Importing products...
                </p>
              </div>
            )}

            {importResult && (
              <div className="mt-4 p-4 rounded-lg bg-[var(--color-bg)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    Imported: {importResult.imported}
                  </span>
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    Failed: {importResult.failed}
                  </span>
                </div>

                {importResult.errors.length > 0 && (
                  <details className="mt-3">
                    <summary className="text-sm font-medium text-[var(--color-text)] cursor-pointer">
                      View Errors ({importResult.errors.length})
                    </summary>
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      {importResult.errors.map((error, idx) => (
                        <div key={idx} className="text-xs text-red-600 mt-1">
                          {error}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
              Upload Product Images
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              Upload product images. File names should match the style code (e.g., "900-Black.jpg").
              Multiple files can be selected at once.
            </p>

            <label className="block">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
                className="block w-full text-sm text-[var(--color-text)]
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[var(--ff-color-primary-700)] file:text-white
                  hover:file:bg-[var(--ff-color-primary-600)]
                  file:cursor-pointer file:transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>

            {uploading && (
              <div className="mt-4 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                  Uploading images...
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-6">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
              Instructions
            </h2>
            <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <div>
                <strong className="text-[var(--color-text)]">Step 1: Import CSV</strong>
                <p>Upload the product spreadsheet to populate the database with all product variants.</p>
              </div>
              <div>
                <strong className="text-[var(--color-text)]">Step 2: Upload Images</strong>
                <p>Upload product images. Name them using the style code (e.g., "900.jpg", "919-Green.jpg").</p>
              </div>
              <div>
                <strong className="text-[var(--color-text)]">Step 3: Verify</strong>
                <p>Check the products are displaying correctly on the main site.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
