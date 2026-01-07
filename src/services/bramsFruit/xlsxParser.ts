import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { BramsFruitProduct } from './types';
import { SecurityLogger } from '@/services/security/securityLogger';

export interface XLSXImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
  imagesExtracted: number;
}

export async function importBramsFruitXLSX(file: File): Promise<XLSXImportResult> {
  try {
    // SECURITY: Input validation to mitigate xlsx vulnerabilities (GHSA-4r6h-8v6p-xvw6, GHSA-5pgg-2g8v-p4x9)
    // 1. Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      throw new Error('Only Excel files (.xlsx, .xls) are allowed');
    }

    // 2. Check file size (prevent ReDoS)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      throw new Error(`File too large (max 10MB). Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    // 3. Check MIME type
    const validMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/octet-stream' // Some browsers report this for .xlsx
    ];
    if (file.type && !validMimes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}. Expected Excel file.`);
    }

    // Log security event
    console.log('✅ Excel file validation passed:', {
      filename: file.name,
      size: `${(file.size / 1024).toFixed(2)}KB`,
      type: file.type
    });

    const arrayBuffer = await file.arrayBuffer();

    // Freeze Object.prototype to prevent prototype pollution
    Object.freeze(Object.prototype);

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

    const BATCH_SIZE = 10;
    const batches: string[][][] = [];
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      batches.push(rows.slice(i, i + BATCH_SIZE));
    }

    console.log(`[Import] Processing ${rows.length} products in ${batches.length} batches of ${BATCH_SIZE}`);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchStartIndex = batchIndex * BATCH_SIZE;

      console.log(`[Import] Processing batch ${batchIndex + 1}/${batches.length} (rows ${batchStartIndex + 2}-${batchStartIndex + batch.length + 1})`);

      const batchPromises = batch.map(async (row, rowIndexInBatch) => {
        const i = batchStartIndex + rowIndexInBatch;

        try {
          const product = transformRowToProduct(headers, row);

          const styleCode = product.style_code;
          if (images[i] && styleCode) {
            const uploadResult = await uploadImageBlob(styleCode, images[i]);
            if (uploadResult.success && uploadResult.url) {
              product.image_url = uploadResult.url;
              imagesExtracted++;
              console.log(`[Import] Uploaded image for ${styleCode}`);
            } else if (uploadResult.error) {
              console.warn(`[Import] Failed to upload image for ${styleCode}: ${uploadResult.error}`);
            }
          }

          const productRecord = {
            sku: product.sku || `BF-${product.product_id}`,
            name: product.product_name || 'Unnamed Product',
            description: product.material_composition
              ? `${product.product_name} - ${product.material_composition}`
              : product.product_name || 'Premium Quality Fashion Item',
            image_url: product.image_url || null,
            price: product.retail_price || 0,
            original_price: product.wholesale_price || null,
            retailer: 'Brams Fruit',
            category: product.category || 'clothing',
            brand: 'Brams Fruit',
            gender: product.gender?.toLowerCase() === 'male' ? 'male' :
                    product.gender?.toLowerCase() === 'female' ? 'female' : 'unisex',
            type: product.sub_category || product.category || 'clothing',
            colors: product.color ? [product.color] : [],
            sizes: product.size ? [product.size] : [],
            in_stock: true,
            affiliate_url: product.affiliate_link || null,
            product_url: product.affiliate_link || null,
            tags: [product.department, product.color_family, product.category].filter(Boolean)
          };

          const { error } = await supabase
            .from('products')
            .upsert(productRecord, {
              onConflict: 'sku',
              ignoreDuplicates: false
            });

          if (error) {
            console.error(`Import error for row ${i + 2}:`, {
              error: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code,
              productData: productRecord
            });
            return {
              success: false,
              rowNumber: i + 2,
              sku: productRecord.sku,
              error: error.message
            };
          } else {
            return {
              success: true,
              rowNumber: i + 2,
              sku: productRecord.sku
            };
          }
        } catch (err) {
          return {
            success: false,
            rowNumber: i + 2,
            sku: 'unknown',
            error: String(err)
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      for (const result of batchResults) {
        if (result.success) {
          imported++;
        } else {
          failed++;
          errors.push(`Row ${result.rowNumber} (${result.sku}): ${result.error}`);
        }
      }

      console.log(`[Import] Batch ${batchIndex + 1} complete: ${batchResults.filter(r => r.success).length} success, ${batchResults.filter(r => !r.success).length} failed`);
    }

    // Security logging: Excel upload completed
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await SecurityLogger.logExcelUpload(user.id, file.name, file.size, imported);
      }
    } catch (logError) {
      console.error('Failed to log Excel upload:', logError);
      // Continue execution - don't block on logging failure
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
    if (!workbook.Workbook?.Sheets || workbook.Workbook.Sheets.length === 0) {
      console.log('[XLSX] No sheets found in workbook');
      return images;
    }

    const firstSheet = workbook.Workbook.Sheets[0];

    if (!firstSheet.Drawing || !Array.isArray(firstSheet.Drawing)) {
      console.log('[XLSX] No drawings found in first sheet');
      return images;
    }

    console.log(`[XLSX] Found ${firstSheet.Drawing.length} drawings in workbook`);
    const drawings = firstSheet.Drawing;

    for (let i = 0; i < drawings.length; i++) {
      const drawing = drawings[i];

      if (!drawing.from || !drawing.image) {
        console.warn(`[XLSX] Drawing ${i} missing from or image data`);
        continue;
      }

      const rowIndex = drawing.from.row;
      const imageData = drawing.image;

      if (!imageData.data) {
        console.warn(`[XLSX] Drawing ${i} missing image data`);
        continue;
      }

      const base64Data = imageData.data;
      const mimeType = imageData.type || 'image/jpeg';

      try {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let j = 0; j < byteCharacters.length; j++) {
          byteNumbers[j] = byteCharacters.charCodeAt(j);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        images[rowIndex - 1] = blob;
        console.log(`[XLSX] Extracted image for row ${rowIndex} (${blob.size} bytes, ${mimeType})`);
      } catch (decodeErr) {
        console.error(`[XLSX] Failed to decode image ${i}:`, decodeErr);
      }
    }

    console.log(`[XLSX] Successfully extracted ${Object.keys(images).length} images`);
  } catch (err) {
    console.error('[XLSX] Error extracting images:', err);
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
