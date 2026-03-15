/**
 * Centralized kids product detection for all import pipelines.
 *
 * Every product import (Daisycon, Brams Fruit, future partners) MUST call
 * `isKidsProduct()` before inserting into the database. This is the
 * import-time safety layer (Layer 1 in the defense-in-depth strategy).
 *
 * Defense layers:
 *   1. Import-time  → this module (kidsProductDetector)
 *   2. Database      → is_kids column flag
 *   3. Query-time    → WHERE is_kids = false on all product queries
 *   4. Client-side   → productClassifier + productFilter
 */

/** EU kids clothing sizes (height in cm): 50–176 */
const EU_KIDS_SIZES = new Set([
  '50', '56', '62', '68', '74', '80', '86', '92',
  '98', '104', '110', '116', '122', '128', '134',
  '140', '146', '152', '158', '164', '170', '176',
]);

/** Adult sizes that prove a product is NOT kids-only */
const ADULT_SIZE_PATTERN = /^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|4XL|ONE SIZE)$/i;

/** Kids keywords — Dutch and English */
const KIDS_KEYWORDS_REGEX = /\b(baby|babies|peuter|kleuter|dreumes|newborn|infant|toddler|kinder|kinderen|junior|kids?|jongens|meisjes|boys|girls|child|children)\b/i;

/** Age range patterns like "2-4Y", "6-8 jaar", "maat 10-12Y" */
const AGE_RANGE_REGEX = /\b\d{1,2}\s*[-–]\s*\d{1,2}\s*(Y|jaar|jr)\b/i;

/** EU kids shoe sizes (typically 16–35) */
const EU_KIDS_SHOE_REGEX = /\bmaat\s*(1[6-9]|2[0-9]|3[0-5])\b/i;

/** Known kids departments (for Brams Fruit and similar) */
const KIDS_DEPARTMENTS = /\b(kids?wear|kinderkleding|kinderafdeling|children'?s?wear|junior|boys|girls|baby)\b/i;

/** Image URL path segments indicating kids products */
const KIDS_IMAGE_URL_REGEX = /\/(kids|children|kinder|junior|boys|girls)\//i;

export interface ProductImportData {
  name?: string;
  title?: string;
  description?: string;
  category?: string;
  category_path?: string;
  type?: string;
  department?: string;
  gender?: string;
  gender_target?: string;
  age_group?: string;
  sizes?: string[] | string;
  price?: number;
  image_url?: string;
}

/**
 * Detect if a product is kids' clothing. Must be called by every import pipeline.
 *
 * Returns { isKids: true, reason: "..." } if the product is for kids.
 */
export function isKidsProduct(product: ProductImportData): { isKids: boolean; reason?: string } {
  const name = (product.name || product.title || '').trim();
  const desc = (product.description || '').trim();
  const category = (product.category || '').trim();
  const categoryPath = (product.category_path || '').trim();
  const type = (product.type || '').trim();
  const department = (product.department || '').trim();
  const ageGroup = (product.age_group || '').trim().toLowerCase();
  const imageUrl = (product.image_url || '').trim();

  // 1. Explicit age_group field (strongest signal — some feeds provide this)
  if (ageGroup && ageGroup !== 'adult' && ageGroup !== 'volwassene') {
    if (['kids', 'children', 'infant', 'toddler', 'baby', 'newborn', 'kinderen', 'peuter', 'kleuter'].includes(ageGroup)) {
      return { isKids: true, reason: `age_group: "${ageGroup}"` };
    }
  }

  // 2. Kids department (Brams Fruit, wholesale imports)
  if (KIDS_DEPARTMENTS.test(department)) {
    return { isKids: true, reason: `department: "${department}"` };
  }

  // 3. Keywords in text fields
  const textFields = [name, desc, category, categoryPath, type];
  for (const text of textFields) {
    if (text && KIDS_KEYWORDS_REGEX.test(text)) {
      return { isKids: true, reason: `keyword in "${text.slice(0, 60)}"` };
    }
  }

  // 4. Age range patterns (e.g., "2-4Y", "6-8 jaar")
  if (AGE_RANGE_REGEX.test(name) || AGE_RANGE_REGEX.test(desc)) {
    return { isKids: true, reason: `age range in name/description` };
  }

  // 5. EU kids shoe sizes in name
  if (EU_KIDS_SHOE_REGEX.test(name)) {
    return { isKids: true, reason: `kids shoe size in name` };
  }

  // 6. Size-based detection: all sizes are EU kids sizes, no adult sizes
  const sizes = normalizeSizes(product.sizes);
  if (sizes.length > 0) {
    const hasAdultSize = sizes.some(s => ADULT_SIZE_PATTERN.test(s));
    if (!hasAdultSize) {
      const numericSizes = sizes.filter(s => /^\d{2,3}$/.test(s));
      const allKidsSizes = numericSizes.length > 0 && numericSizes.every(s => EU_KIDS_SIZES.has(s));
      if (allKidsSizes) {
        return { isKids: true, reason: `all sizes are EU kids sizes: [${numericSizes.join(', ')}]` };
      }
    }
  }

  // 7. Image URL path
  if (imageUrl && KIDS_IMAGE_URL_REGEX.test(imageUrl)) {
    return { isKids: true, reason: `kids path in image URL` };
  }

  return { isKids: false };
}

function normalizeSizes(sizes?: string[] | string): string[] {
  if (!sizes) return [];
  if (typeof sizes === 'string') {
    return sizes.split(/[,;]/).map(s => s.trim()).filter(Boolean);
  }
  return sizes.map(s => s.trim()).filter(Boolean);
}

/**
 * Batch filter: returns only adult products from a list.
 * Logs rejected products for debugging.
 */
export function filterKidsProducts<T extends ProductImportData>(
  products: T[],
  logPrefix = '[KidsFilter]'
): { adults: T[]; kids: T[]; stats: { total: number; adults: number; kids: number } } {
  const adults: T[] = [];
  const kids: T[] = [];

  for (const product of products) {
    const result = isKidsProduct(product);
    if (result.isKids) {
      kids.push(product);
      console.log(`${logPrefix} Rejected: "${product.name || product.title}" — ${result.reason}`);
    } else {
      adults.push(product);
    }
  }

  const stats = { total: products.length, adults: adults.length, kids: kids.length };
  console.log(`${logPrefix} ${stats.total} products → ${stats.adults} adults, ${stats.kids} kids rejected`);

  return { adults, kids, stats };
}
