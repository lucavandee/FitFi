import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { BramsFruitProduct } from './types';

export interface XLSXImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
  imagesExtracted: number;
}

export async function importBramsFruitXLSX(file: File): Promise<XLSXImportResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      cellStyles: true,
      cellHTML: true,
      bookImages: true
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: ''
    }) as string[][];

    if (jsonData.length === 0) {
      return {
        success: false,
        imported: 0,
        failed: 0,
        errors: ['Empty spreadsheet'],
        imagesExtracted: 0
      };
    }

    const headers = jsonData[0];
    const rows = jsonData.slice(1);

    const imageIndex = headers.indexOf('Product Image');
    const images = await extractImagesFromWorkbook(workbook, imageIndex);

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];
    let imagesExtracted = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        const product = transformRowToProduct(headers, row);

        const styleCode = product.style_code;
        if (images[i] && styleCode) {
          const uploadResult = await uploadImageBlob(styleCode, images[i]);
          if (uploadResult.success && uploadResult.url) {
            product.image_url = uploadResult.url;
            imagesExtracted++;
          }
        }

        const { error } = await supabase
          .from('products')
          .upsert({
            ...product,
            retailer: 'Brams Fruit',
            available_sizes: [product.size],
            in_stock: true
          }, {
            onConflict: 'sku',
            ignoreDuplicates: false
          });

        if (error) {
          failed++;
          errors.push(`Row ${i + 2}: ${error.message}`);
        } else {
          imported++;
        }
      } catch (err) {
        failed++;
        errors.push(`Row ${i + 2}: ${String(err)}`);
      }
    }

    return {
      success: failed === 0,
      imported,
      failed,
      errors,
      imagesExtracted
    };
  } catch (err) {
    return {
      success: false,
      imported: 0,
      failed: 0,
      errors: [String(err)],
      imagesExtracted: 0
    };
  }
}

async function extractImagesFromWorkbook(
  workbook: XLSX.WorkBook,
  imageColumnIndex: number
): Promise<Record<number, Blob>> {
  const images: Record<number, Blob> = {};

  try {
    if (!workbook.Workbook?.Sheets?.[0]?.Drawing) {
      return images;
    }

    const drawings = workbook.Workbook.Sheets[0].Drawing;

    for (const drawing of drawings) {
      if (drawing.from && drawing.image) {
        const rowIndex = drawing.from.row;
        const imageData = drawing.image;

        const base64Data = imageData.data;
        const mimeType = imageData.type || 'image/jpeg';

        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        images[rowIndex - 1] = blob;
      }
    }
  } catch (err) {
    console.warn('Could not extract images from Excel:', err);
  }

  return images;
}

async function uploadImageBlob(
  styleCode: string,
  blob: Blob
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileExt = blob.type.split('/')[1] || 'jpg';
    const fileName = `${styleCode}.${fileExt}`;
    const filePath = `products/${styleCode}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('brams-fruit-images')
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: true,
        contentType: blob.type
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

function transformRowToProduct(
  headers: string[],
  row: string[]
): Omit<BramsFruitProduct, 'id' | 'created_at' | 'updated_at'> {
  const getCell = (header: string): string => {
    const index = headers.indexOf(header);
    return index >= 0 ? String(row[index] || '') : '';
  };

  return {
    product_id: getCell('Product ID'),
    style_code: getCell('Style Code'),
    parent_id: getCell('Parent ID'),
    department: getCell('Department') || 'Menswear',
    category: getCell('Category'),
    sub_category: getCell('Sub Category'),
    product_name: getCell('Product Name'),
    material_composition: getCell('Material Composition') || null,
    barcode: getCell('Barcode') || null,
    gender: getCell('Gender') || 'Male',
    color_family: getCell('Color Family'),
    color: getCell('Color'),
    size: getCell('Size'),
    country_of_origin: getCell('Country of Origin') || null,
    sku: getCell('SKU'),
    hs_code: getCell('HS Code') || null,
    is_pack: getCell('Is It a Pack?')?.toLowerCase() === 'yes',
    wholesale_price: parseFloat(getCell('Wholesale Price')) || 0,
    retail_price: parseFloat(getCell('Retail Price')) || 0,
    currency: getCell('Currency') || 'EUR',
    image_url: null,
    affiliate_link: null,
    is_active: true,
  };
}
