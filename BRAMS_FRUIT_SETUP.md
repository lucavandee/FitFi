# Brams Fruit Product Integration

Complete setup voor Brams Fruit producten in FitFi.

## ✅ Wat is geïmplementeerd

### 1. Database
- **Table**: `brams_fruit_products` met 21 kolommen
- **Storage bucket**: `brams-fruit-images` voor productfoto's
- **Indexes**: Style code, SKU, category, is_active
- **RLS**: Public read voor actieve producten, admin-only write

### 2. Admin Interface
**Locatie**: `/admin/brams-fruit`

**Features**:
- CSV import (hele spreadsheet in één keer)
- Bulk image upload
- Automatische koppeling via style code
- Error reporting bij import
- Progress tracking

### 3. Public Catalog
**Locatie**: `/collectie/brams-fruit`

**Features**:
- Product grid met filtering op category
- Variant info (kleuren, maten)
- Prijsinformatie
- Responsive design

### 4. Services
- `importService.ts` - CSV import en image upload
- `productService.ts` - Product ophalen en filteren
- `types.ts` - TypeScript types

---

## 📝 Hoe te gebruiken

### Stap 1: Import Producten

1. Log in met een `@fitfi.ai` email (admin privileges)
2. Ga naar: `/admin/brams-fruit`
3. Klik op "Choose File" onder "Import Products from CSV"
4. Selecteer de spreadsheet: `BFFW25MASTERSHEET.xlsx - Products.csv`
5. Wacht tot import compleet is
6. Check import results (imported/failed count)

**Resultaat**: ~315 producten in database

### Stap 2: Upload Images

**Naamgeving conventie**:
- Simpel: `900.jpg` (voor alle kleuren van style 900)
- Specifiek: `900-Black.jpg` (voor specifieke kleur)

**Upload**:
1. Blijf op `/admin/brams-fruit`
2. Scroll naar "Upload Product Images"
3. Selecteer meerdere images tegelijk
4. Upload
5. Systeem koppelt automatisch via style code

**Storage structuur**:
```
brams-fruit-images/
  products/
    900/
      900.jpg
    919/
      919-Green.jpg
```

### Stap 3: Verifieer

1. Ga naar `/collectie/brams-fruit`
2. Check of producten tonen met images
3. Test category filtering
4. Verifieer pricing

---

## 🗂️ Database Schema

```sql
CREATE TABLE brams_fruit_products (
  id uuid PRIMARY KEY,
  product_id text NOT NULL,
  style_code text NOT NULL,           -- "900", "919", etc.
  parent_id text NOT NULL,
  department text DEFAULT 'Menswear',
  category text NOT NULL,             -- "Outerwear", "Shirting", etc.
  sub_category text NOT NULL,         -- "Jackets", "T-Shirts", etc.
  product_name text NOT NULL,
  material_composition text,
  barcode text,
  gender text DEFAULT 'Male',
  color_family text NOT NULL,
  color text NOT NULL,                -- "Black", "Navy", "Green", etc.
  size text NOT NULL,                 -- "S", "M", "L", "XL"
  country_of_origin text,
  sku text UNIQUE NOT NULL,           -- "900-Black-S"
  hs_code text,
  is_pack boolean DEFAULT false,
  wholesale_price numeric(10,2),
  retail_price numeric(10,2),
  currency text DEFAULT 'EUR',
  image_url text,                     -- Supabase Storage URL
  affiliate_link text,                -- Optional affiliate URL
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

## 🎨 FitFi Integratie

### Volgende stappen (optioneel)

**1. Outfit Generator Integratie**
- Map Brams Fruit categories naar FitFi types:
  - `Outerwear/Jackets` → `outerwear`
  - `Shirting/Overshirt` → `tops`
  - `Polo's & T-shirts/T-Shirts` → `tops`
  - `Trousers` → `bottoms`
  - `Accessories/Caps` → `accessories`

**2. Affiliate Links**
- Voeg affiliate tracking URLs toe per product
- Track clicks via bestaande `affiliate_clicks` table

**3. Filter Systeem**
- Integreer in bestaande product filter
- Show/hide Brams Fruit via toggle
- Mix met andere brands in outfit suggestions

**4. Admin Features**
- Product edit interface
- Bulk activate/deactivate
- Stock management (optioneel)

---

## 📊 Data Overzicht

**Huidige data** (uit spreadsheet):
- **Totaal producten**: ~315 SKUs
- **Style codes**: ~75 unieke producten
- **Categorieën**:
  - Outerwear (Jackets, Bodywarmers)
  - Shirting (Overshirts)
  - Knitwear
  - Sweatshirts (Hoodies, Crewnecks, Longsleeves)
  - Polo's & T-shirts
  - Trousers
  - Accessories (Caps, Bags, Beanies, Scarves)

**Prijs range**: €55 - €420
**Currency**: EUR
**Sizes**: S, M, L, XL
**Country of Origin**: India, China, Turkey, Netherlands

---

## 🔒 Security

- **RLS enabled**: Alleen actieve producten zijn publiek zichtbaar
- **Admin access**: Alleen `@fitfi.ai` emails kunnen importeren/uploaden
- **Image security**: Public read, admin-only write
- **Data validation**: CSV parser valideert alle velden

---

## 🐛 Troubleshooting

**Import faalt**:
- Check of user admin privileges heeft (@fitfi.ai email)
- Verifieer CSV format matches verwachte kolommen
- Check error log in import result panel

**Images tonen niet**:
- Verifieer bestandsnaam matches style code
- Check Storage bucket permissions
- Bekijk browser console voor 404 errors

**Producten tonen niet in catalog**:
- Check `is_active = true` in database
- Verifieer category spelling
- Check RLS policies via Supabase dashboard

---

## 📁 Bestanden

Nieuwe bestanden toegevoegd:

```
src/
  services/
    bramsFruit/
      importService.ts       # CSV import + image upload
      productService.ts      # Product queries
      types.ts               # TypeScript interfaces
  pages/
    AdminBramsFruitPage.tsx  # Admin import interface
    BramsFruitCatalogPage.tsx # Public product catalog

supabase/
  migrations/
    create_brams_fruit_products.sql        # Database table
    create_brams_fruit_storage_bucket.sql  # Storage bucket + policies
```

---

## ✨ Tips

1. **Bulk operations**: Import alle producten eerst, images daarna
2. **Image quality**: Gebruik consistent aspect ratio (1:1 of 3:4)
3. **Naming**: Houd image namen simpel (`style-color.jpg`)
4. **Testing**: Test import met kleine CSV subset eerst
5. **Backup**: Download CSV backup voordat je re-imports

---

**Status**: ✅ Ready to use
**Last updated**: 2025-10-20
