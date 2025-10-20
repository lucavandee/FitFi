import { supabase } from '@/lib/supabase';
import { BramsFruitProduct, BramsFruitCSVRow } from './types';

export async function importBramsFruitProducts(csvData: string): Promise<{
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}> {
  const rows = parseCSV(csvData);
  const products = rows.map(transformCSVToProduct);

  let imported = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const product of products) {
    try {
      const { error } = await supabase
        .from('brams_fruit_products')
        .upsert(product, {
          onConflict: 'sku',
          ignoreDuplicates: false
        });

      if (error) {
        failed++;
        errors.push(`SKU ${product.sku}: ${error.message}`);
      } else {
        imported++;
      }
    } catch (err) {
      failed++;
      errors.push(`SKU ${product.sku}: ${String(err)}`);
    }
  }

  return { success: failed === 0, imported, failed, errors };
}

function parseCSV(csvData: string): BramsFruitCSVRow[] {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });

    return row as unknown as BramsFruitCSVRow;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function transformCSVToProduct(row: BramsFruitCSVRow): Omit<BramsFruitProduct, 'id' | 'created_at' | 'updated_at'> {
  return {
    product_id: row['Product ID'] || '',
    style_code: row['Style Code'] || '',
    parent_id: row['Parent ID'] || '',
    department: row['Department'] || 'Menswear',
    category: row['Category'] || '',
    sub_category: row['Sub Category'] || '',
    product_name: row['Product Name'] || '',
    material_composition: row['Material Composition'] || null,
    barcode: row['Barcode'] || null,
    gender: row['Gender'] || 'Male',
    color_family: row['Color Family'] || '',
    color: row['Color'] || '',
    size: row['Size'] || '',
    country_of_origin: row['Country of Origin'] || null,
    sku: row['SKU'] || '',
    hs_code: row['HS Code'] || null,
    is_pack: row['Is It a Pack?']?.toLowerCase() === 'yes',
    wholesale_price: parseFloat(row['Wholesale Price']) || 0,
    retail_price: parseFloat(row['Retail Price']) || 0,
    currency: row['Currency'] || 'EUR',
    image_url: null,
    affiliate_link: null,
    is_active: true,
  };
}

export async function uploadProductImage(
  styleCode: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${styleCode}.${fileExt}`;
    const filePath = `products/${styleCode}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('brams-fruit-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data } = supabase.storage
      .from('brams-fruit-images')
      .getPublicUrl(filePath);

    return { success: true, url: data.publicUrl };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function updateProductImages(
  styleCode: string,
  imageUrl: string
): Promise<{ success: boolean; updated: number; error?: string }> {
  try {
    const { count, error } = await supabase
      .from('brams_fruit_products')
      .update({ image_url: imageUrl })
      .eq('style_code', styleCode);

    if (error) {
      return { success: false, updated: 0, error: error.message };
    }

    return { success: true, updated: count || 0 };
  } catch (err) {
    return { success: false, updated: 0, error: String(err) };
  }
}
