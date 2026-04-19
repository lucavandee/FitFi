import { useState } from 'react';
import Spinner from '@/components/ui/Spinner';
import { useNavigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { importBramsFruitProducts, uploadProductImage, updateProductImages } from '@/services/bramsFruit/importService';
import { importBramsFruitXLSX } from '@/services/bramsFruit/xlsxParser';
import toast from 'react-hot-toast';

export default function AdminBramsFruitPage() {
  const { isAdmin, user, isLoading: authLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [importing, setImporting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    failed: number;
    errors: string[];
  } | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-[#1A1A1A]">Admin verificatie...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Geen toegang</h1>
          <p className="mt-2 text-[#8A8A8A]">
            Je hebt admin rechten nodig om deze pagina te bekijken.
          </p>
          {user ? (
            <p className="mt-4 text-sm text-[#8A8A8A] bg-[#FFFFFF] p-4 rounded-lg border border-[#E5E5E5]">
              Ingelogd als: <strong className="text-[#1A1A1A]">{user.email}</strong>
              <br />
              <span className="text-xs">
                Admin toegang vereist een @fitfi.ai email of admin in je email.
              </span>
            </p>
          ) : (
            <p className="mt-4 text-sm text-[#8A8A8A]">
              Log eerst in om toegang te krijgen.
            </p>
          )}
          <div className="flex gap-3 mt-6 justify-center">
            <button
              onClick={() => navigate('/inloggen')}
              className="px-6 py-2 bg-[#A8513A] text-white rounded-xl hover:bg-[#C2654A] transition-colors"
            >
              Inloggen
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 border border-[#E5E5E5] text-[#1A1A1A] rounded-xl hover:border-[#A8513A] transition-colors"
            >
              Terug naar home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      let result;

      if (isExcel) {
        result = await importBramsFruitXLSX(file);

        if (result.success) {
          toast.success(
            `Imported ${result.imported} products successfully!\n` +
            `${result.imagesExtracted} images extracted from Excel.`
          );
        } else {
          toast.error(`Import completed with ${result.failed} errors`);
        }
      } else {
        const csvData = await file.text();
        result = await importBramsFruitProducts(csvData);

        if (result.success) {
          toast.success(`Imported ${result.imported} products successfully!`);
        } else {
          toast.error(`Import completed with ${result.failed} errors`);
        }
      }

      setImportResult(result);
    } catch (err) {
      toast.error('Failed to import file');
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
    <div className="min-h-screen bg-[#FAFAF8] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">
            Brams Fruit Admin
          </h1>
          <p className="mt-2 text-[#8A8A8A]">
            Manage product catalog and images
          </p>
        </div>

        <div className="space-y-6">
          {/* File Import */}
          <div className="bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-6">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">
              Import Products from Spreadsheet
            </h2>
            <p className="text-sm text-[#8A8A8A] mb-4">
              Upload the Brams Fruit product spreadsheet (.XLSX or .CSV). Excel files will automatically extract embedded images!
            </p>

            <label className="block">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileImport}
                disabled={importing}
                className="block w-full text-sm text-[#1A1A1A]
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#A8513A] file:text-white
                  hover:file:bg-[#C2654A]
                  file:cursor-pointer file:transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>

            {importing && (
              <div className="mt-4 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                <p className="mt-2 text-sm text-[#8A8A8A]">
                  Importing products...
                </p>
              </div>
            )}

            {importResult && (
              <div className="mt-4 p-4 rounded-lg bg-[#FAFAF8]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#1A1A1A]">
                    Imported: {importResult.imported}
                  </span>
                  <span className="text-sm font-medium text-[#1A1A1A]">
                    Failed: {importResult.failed}
                  </span>
                </div>

                {importResult.errors.length > 0 && (
                  <details className="mt-3">
                    <summary className="text-sm font-medium text-[#1A1A1A] cursor-pointer">
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
          <div className="bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-[#1A1A1A]">
                  Upload Product Images
                </h2>
                <p className="text-sm text-[#8A8A8A] mt-2">
                  Upload product images. File names should match the style code (e.g., "900-Black.jpg").
                  Multiple files can be selected at once.
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/images')}
                className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-[#A8513A] to-[#C2654A] text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
              >
                → Nieuwe Image Manager
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900 font-medium">
                💡 <strong>Nieuw:</strong> Gebruik de nieuwe{' '}
                <button
                  onClick={() => navigate('/admin/images')}
                  className="underline hover:no-underline font-semibold"
                >
                  Image Manager
                </button>
                {' '}voor bulk uploads met drag & drop, SKU auto-detectie en real-time validatie!
              </p>
            </div>

            <label className="block">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
                className="block w-full text-sm text-[#1A1A1A]
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#A8513A] file:text-white
                  hover:file:bg-[#C2654A]
                  file:cursor-pointer file:transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>

            {uploading && (
              <div className="mt-4 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                <p className="mt-2 text-sm text-[#8A8A8A]">
                  Uploading images...
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] p-6">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">
              Instructions
            </h2>
            <div className="space-y-3 text-sm text-[#8A8A8A]">
              <div>
                <strong className="text-[#1A1A1A]">Step 1: Import Spreadsheet</strong>
                <p>Upload the product spreadsheet (.XLSX or .CSV). Excel files automatically extract embedded images!</p>
              </div>
              <div>
                <strong className="text-[#1A1A1A]">Step 2: Upload Additional Images (Optional)</strong>
                <p>If using CSV or need to update images, upload them separately. Name them using the style code (e.g., "900.jpg", "919-Green.jpg").</p>
              </div>
              <div>
                <strong className="text-[#1A1A1A]">Step 3: Verify</strong>
                <p>Check the products are displaying correctly in the preview catalog.</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
              <button
                onClick={() => navigate('/admin/preview/brams-fruit')}
                className="px-6 py-2 bg-[#A8513A] text-white rounded-xl hover:bg-[#C2654A] transition-colors font-medium"
              >
                Preview Catalog
              </button>
              <p className="mt-2 text-xs text-[#8A8A8A]">
                View all Brams Fruit products as they appear in the unified catalog
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
