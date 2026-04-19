import { useState } from 'react';
import Spinner from '@/components/ui/Spinner';
import { useNavigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

interface ImportStats {
  total: number;
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export default function AdminZalandoImportPage() {
  const { isAdmin, user, isLoading: authLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState<ImportStats | null>(null);

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
          <button
            onClick={() => navigate('/admin')}
            className="mt-6 px-6 py-2 bg-[#A8513A] text-white rounded-xl hover:bg-[#C2654A] transition-colors"
          >
            Terug naar Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setStats(null);

    const stats: ImportStats = {
      total: 0,
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    try {
      const csvText = await file.text();
      const lines = csvText.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        throw new Error('CSV bestand is leeg of heeft geen data');
      }

      const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());

      const requiredFields = ['name', 'price', 'image_url', 'category', 'gender'];
      const missingFields = requiredFields.filter(f => !headers.includes(f));

      if (missingFields.length > 0) {
        throw new Error(`Ontbrekende verplichte kolommen: ${missingFields.join(', ')}`);
      }

      const client = supabase();
      if (!client) {
        throw new Error('Supabase client niet beschikbaar');
      }

      stats.total = lines.length - 1;

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);

        if (values.length !== headers.length) {
          stats.errors.push(`Regel ${i + 1}: kolommen komen niet overeen`);
          stats.skipped++;
          continue;
        }

        const row: Record<string, string> = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx];
        });

        if (!row.name || !row.price) {
          stats.errors.push(`Regel ${i + 1}: name of price ontbreekt`);
          stats.skipped++;
          continue;
        }

        const productData = {
          name: row.name,
          description: row.description || row.name,
          price: parseFloat(row.price.replace(/[^0-9.]/g, '')),
          original_price: row.original_price ? parseFloat(row.original_price.replace(/[^0-9.]/g, '')) : null,
          image_url: row.image_url || null,
          affiliate_url: row.affiliate_url || row.product_url || null,
          product_url: row.product_url || row.affiliate_url || null,
          gender: (row.gender || 'unisex').toLowerCase(),
          type: row.type || row.category || 'clothing',
          category: row.category || 'general',
          brand: row.brand || 'Zalando',
          retailer: row.retailer || 'Zalando',
          tags: row.tags ? row.tags.split('|').map(t => t.trim()) : [],
          colors: row.colors ? row.colors.split('|').map(c => c.trim()) : [],
          sizes: row.sizes ? row.sizes.split('|').map(s => s.trim()) : [],
          in_stock: row.in_stock !== 'false',
          rating: row.rating ? parseFloat(row.rating) : null,
          review_count: row.review_count ? parseInt(row.review_count) : null
        };

        const { data: existing } = await client
          .from('products')
          .select('id')
          .eq('name', productData.name)
          .eq('retailer', productData.retailer)
          .maybeSingle();

        if (existing) {
          const { error: updateError } = await client
            .from('products')
            .update({
              ...productData,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);

          if (updateError) {
            stats.errors.push(`Regel ${i + 1}: ${updateError.message}`);
            stats.skipped++;
          } else {
            stats.updated++;
          }
        } else {
          const { error: insertError } = await client
            .from('products')
            .insert(productData);

          if (insertError) {
            stats.errors.push(`Regel ${i + 1}: ${insertError.message}`);
            stats.skipped++;
          } else {
            stats.imported++;
          }
        }
      }

      setStats(stats);

      if (stats.imported > 0 || stats.updated > 0) {
        toast.success(`✅ ${stats.imported} geïmporteerd, ${stats.updated} bijgewerkt`);
      }

      if (stats.skipped > 0) {
        toast.error(`⚠️ ${stats.skipped} producten overgeslagen`);
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Onbekende fout';
      toast.error(`Import gefaald: ${message}`);
      stats.errors.push(message);
      setStats(stats);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="mb-4 text-sm text-[#8A8A8A] hover:text-[#1A1A1A]"
          >
            ← Terug naar Admin Dashboard
          </button>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">
            Zalando Product Import
          </h1>
          <p className="mt-2 text-[#8A8A8A]">
            Import producten via CSV naar de unified catalog
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">
              CSV Upload
            </h2>

            <div className="mb-4 p-4 bg-[#FAFAF8] rounded-lg border border-[#E5E5E5]">
              <h3 className="font-medium text-[#1A1A1A] mb-2">Verwachte kolommen:</h3>
              <div className="text-sm text-[#8A8A8A] space-y-1">
                <div><strong>Verplicht:</strong> name, price, image_url, category, gender</div>
                <div><strong>Optioneel:</strong> description, original_price, brand, retailer, type, tags, colors, sizes, product_url, affiliate_url, in_stock, rating, review_count</div>
                <div className="mt-2 text-xs">
                  <strong>Let op:</strong> Arrays (tags, colors, sizes) scheiden met <code className="bg-white px-1 rounded">|</code> bijv. <code className="bg-white px-1 rounded">casual|premium|sustainable</code>
                </div>
              </div>
            </div>

            <label className="block">
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
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
                <Spinner size="md" className="mx-auto" />
                <p className="mt-2 text-sm text-[#8A8A8A]">
                  Importeren...
                </p>
              </div>
            )}

            {stats && (
              <div className="mt-4 p-4 rounded-lg bg-[#FAFAF8] border border-[#E5E5E5]">
                <h3 className="font-medium text-[#1A1A1A] mb-3">Import Resultaat</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[#8A8A8A]">Totaal:</span>
                    <span className="ml-2 font-medium text-[#1A1A1A]">{stats.total}</span>
                  </div>
                  <div>
                    <span className="text-[#8A8A8A]">Geïmporteerd:</span>
                    <span className="ml-2 font-medium text-green-600">{stats.imported}</span>
                  </div>
                  <div>
                    <span className="text-[#8A8A8A]">Bijgewerkt:</span>
                    <span className="ml-2 font-medium text-blue-600">{stats.updated}</span>
                  </div>
                  <div>
                    <span className="text-[#8A8A8A]">Overgeslagen:</span>
                    <span className="ml-2 font-medium text-orange-600">{stats.skipped}</span>
                  </div>
                </div>

                {stats.errors.length > 0 && (
                  <details className="mt-4">
                    <summary className="text-sm font-medium text-[#1A1A1A] cursor-pointer">
                      Fouten weergeven ({stats.errors.length})
                    </summary>
                    <div className="mt-2 max-h-60 overflow-y-auto space-y-1">
                      {stats.errors.map((error, idx) => (
                        <div key={idx} className="text-xs text-red-600 bg-red-50 dark:bg-red-900/10 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">
              CSV Template
            </h2>
            <p className="text-sm text-[#8A8A8A] mb-4">
              Download eenvoorbeeld CSV met de juiste kolommen:
            </p>
            <button
              onClick={() => {
                const csv = `name,price,original_price,image_url,description,brand,retailer,category,type,gender,tags,colors,sizes,product_url,affiliate_url,in_stock,rating,review_count
"Premium Slim Fit Chino",79.99,99.99,"https://example.com/image.jpg","Premium katoenen chino in slim fit","Zalando","Zalando","Trousers","Pants","male","casual|premium|slim-fit","navy|khaki|grey","28|30|32|34|36","https://zalando.com/product","https://zalando.com/aff/product",true,4.5,127
"Organic Cotton T-Shirt",29.99,,"https://example.com/tshirt.jpg","Biologisch katoenen basis tee","Zalando","Zalando","Tops","T-Shirts","male","casual|sustainable|basics","white|black|grey","S|M|L|XL","https://zalando.com/tshirt","https://zalando.com/aff/tshirt",true,4.8,245`;

                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'zalando-import-template.csv';
                a.click();
                URL.revokeObjectURL(url);

                toast.success('Template gedownload');
              }}
              className="px-4 py-2 bg-[#FAFAF8] border border-[#E5E5E5] text-[#1A1A1A] rounded-lg hover:border-[#A8513A] transition-colors text-sm"
            >
              Download Template CSV
            </button>
          </div>

          <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">
              Tips
            </h2>
            <ul className="space-y-2 text-sm text-[#8A8A8A]">
              <li>• Gebruik UTF-8 encoding voor het CSV bestand</li>
              <li>• Kolommen met komma's of aanhalingstekens moeten tussen quotes staan</li>
              <li>• Arrays (tags, colors, sizes) scheiden met | (pipe)</li>
              <li>• Bestaande producten (zelfde name + retailer) worden bijgewerkt</li>
              <li>• Nieuwe producten worden automatisch toegevoegd aan de unified catalog</li>
              <li>• Gender moet lowercase zijn: male, female, of unisex</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
