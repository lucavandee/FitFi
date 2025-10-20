export interface BramsFruitProduct {
  id: string;
  product_id: string;
  style_code: string;
  parent_id: string;
  department: string;
  category: string;
  sub_category: string;
  product_name: string;
  material_composition: string | null;
  barcode: string | null;
  gender: string;
  color_family: string;
  color: string;
  size: string;
  country_of_origin: string | null;
  sku: string;
  hs_code: string | null;
  is_pack: boolean;
  wholesale_price: number;
  retail_price: number;
  currency: string;
  image_url: string | null;
  affiliate_link: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BramsFruitCSVRow {
  'Product Image': string;
  'Product ID': string;
  'Style Code': string;
  'Parent ID': string;
  'Department': string;
  'Category': string;
  'Sub Category': string;
  'Product Name': string;
  'Material Composition': string;
  'Barcode': string;
  'Gender': string;
  'Color Family': string;
  'Color': string;
  'Size': string;
  'Country of Origin': string;
  'SKU': string;
  'HS Code': string;
  'Is It a Pack?': string;
  'Wholesale Price': string;
  'Retail Price': string;
  'Currency': string;
}

export interface BramsFruitProductGroup {
  style_code: string;
  product_name: string;
  category: string;
  sub_category: string;
  variants: BramsFruitProduct[];
  colors: string[];
  sizes: string[];
  price_range: {
    min: number;
    max: number;
  };
  image_url: string | null;
}
