# Brams Fruit Outfit Generator Integratie

Complete integratie van Brams Fruit producten in de FitFi outfit generator.

## Wat is toegevoegd

### 1. Category Mapping Service
**Bestand**: `src/services/bramsFruit/categoryMapper.ts`

Maps Brams Fruit categorieën naar FitFi product types:
- `Outerwear` → `outerwear`
- `Shirting` → `tops`
- `Knitwear` → `tops`
- `Sweatshirts` → `tops`
- `Polo's & T-shirts` → `tops`
- `Trousers` → `bottoms`
- `Accessories` → `accessories`

Voegt automatisch style tags toe:
- Basis tags van categorie (bijv. `jacket`, `outerwear`, `casual`)
- Specifieke tags van sub-categorie (bijv. `hoodie`, `streetwear`)
- Brams Fruit brand tags (`brams-fruit`, `premium`, `menswear`)

### 2. Product Service Update
**Bestand**: `src/services/bramsFruit/productService.ts`

Nieuwe functie: `getBramsFruitProductsForOutfitEngine()`
- Haalt alle actieve Brams Fruit producten op
- Selecteert één variant per style code (voorkeur voor black/navy)
- Filtert producten zonder afbeelding
- Converteert naar FitFi `Product` interface

### 3. Outfit Service Integratie
**Bestand**: `src/services/outfits/outfitService.ts`

Updates:
- Laadt zowel reguliere producten als Brams Fruit producten parallel
- Toggle functionaliteit via `setIncludeBramsFruit(boolean)`
- Cache management: cache wordt cleared bij toggle
- Logging van product counts per bron

Nieuwe methodes:
- `getRegularProducts()` - Haalt reguliere producten op
- `getBramsFruitProducts()` - Haalt Brams Fruit producten op
- `setIncludeBramsFruit()` - Zet toggle aan/uit
- `getIncludeBramsFruit()` - Haalt huidige toggle status op

### 4. Product Feed Loader Update
**Bestand**: `src/services/productFeedLoader.ts`

Nieuwe functies:
- `loadBramsFruitProducts()` - Laadt Brams Fruit producten
- `loadAllProducts(options)` - Combineert alle product bronnen
  - Parameter: `includeBramsFruit?: boolean` (default: true)

### 5. UI Toggle Component
**Bestand**: `src/components/settings/BramsFruitToggle.tsx`

Premium toggle component voor dashboard:
- Clean design volgens huisstijl
- Persistent via localStorage (`ff_brams_fruit_enabled`)
- Loading states tijdens update
- Visual feedback bij enabled state
- Accessible (ARIA labels, keyboard support)

### 6. Dashboard Integratie
**Bestand**: `src/pages/DashboardPage.tsx`

Brams Fruit toggle toegevoegd:
- Geplaatst na Subscription Manager
- Zichtbaar voor alle gebruikers
- Direct effect op outfit generatie

## Hoe het werkt

### Flow
1. **User toggle aan/uit**
   ```
   BramsFruitToggle → outfitService.setIncludeBramsFruit(true/false)
   ```

2. **Outfit generatie**
   ```
   generateOutfits() → getProducts()
   ├── getRegularProducts() (Supabase products table)
   └── getBramsFruitProducts() (Supabase brams_fruit_products table)
   ```

3. **Product conversie**
   ```
   BramsFruitProduct → mapBramsFruitToFitFiProduct() → Product
   ```

4. **Outfit generation**
   ```
   generateRecommendationsFromAnswers(quizAnswers, allProducts, count)
   ```

### Data Mapping

**Brams Fruit Product**
```typescript
{
  style_code: "900",
  category: "Outerwear",
  sub_category: "Jackets",
  product_name: "Premium Winter Jacket",
  color: "Black",
  size: "L",
  retail_price: 129.99,
  image_url: "products/900/900.jpg"
}
```

**→ FitFi Product**
```typescript
{
  id: "bf-900-Black-L",
  name: "Premium Winter Jacket",
  type: "outerwear",
  category: "outerwear",
  styleTags: ["outerwear", "jacket", "casual", "smart", "brams-fruit", "premium", "menswear"],
  brand: "Brams Fruit",
  price: 129.99,
  season: ["autumn", "winter", "spring"],
  imageUrl: "https://[supabase-url]/storage/v1/object/public/brams-fruit-images/products/900/900.jpg"
}
```

## User Experience

### Dashboard
1. Gebruiker ziet **Brams Fruit Collectie** toggle
2. Toggle staat standaard **AAN**
3. Bij toggle krijgt gebruiker direct feedback
4. Preference wordt opgeslagen in localStorage

### Outfit Generatie
- Als toggle **AAN**: Mix van reguliere producten + Brams Fruit
- Als toggle **UIT**: Alleen reguliere producten
- Cache wordt automatisch gecleared bij toggle
- Volgende outfit refresh gebruikt nieuwe settings

## Technische Details

### Performance
- Parallel loading van beide product bronnen
- 30 minuten cache (CACHE_DURATION)
- Efficient filtering (één variant per style code)
- Image validation (alleen producten met images)

### Data Quality
- Alleen `is_active = true` producten
- Alleen producten met `image_url`
- Voorkeur voor neutrale kleuren (black, navy)
- Automatische season mapping per categorie

### Error Handling
- Graceful degradation bij Brams Fruit load failure
- Console logging voor debugging
- Fallback naar reguliere producten

## Testing

### Handmatig testen
1. Ga naar `/dashboard`
2. Scroll naar "Brams Fruit Collectie"
3. Toggle AAN/UIT
4. Genereer nieuwe outfits (via quiz of refresh)
5. Check console logs voor product counts

### Console Logs
```
[OutfitService] Loaded 247 products (Regular: 172, Brams Fruit: 75)
[BramsFruit] Loaded 75 products for outfit engine
```

## Future Enhancements

### Potentiële verbeteringen
1. **Advanced Filtering**
   - Filter per Brams Fruit categorie
   - Filter per prijs range
   - Filter per materiaal

2. **Analytics**
   - Track Brams Fruit click-through rates
   - A/B test toggle placement
   - Monitor conversion rates

3. **Personalization**
   - User preference learning
   - Brams Fruit product recommendations
   - Size preference memory

4. **UI Enhancements**
   - Brams Fruit badge op outfit cards
   - Dedicated Brams Fruit outfit tab
   - Product detail modal met variants

## Database Schema

```sql
-- Existing table
CREATE TABLE brams_fruit_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  style_code text NOT NULL,           -- Gebruikt voor deduplicatie
  category text NOT NULL,             -- Mapped naar FitFi type
  sub_category text NOT NULL,         -- Extra style tags
  product_name text NOT NULL,
  color text NOT NULL,                -- Gebruikt voor variant selectie
  size text NOT NULL,
  retail_price numeric(10,2),
  image_url text,                     -- Verplicht voor outfit engine
  is_active boolean DEFAULT true,     -- Filter voor zichtbaarheid
  -- ... andere velden
);

-- Indexes voor performance
CREATE INDEX idx_brams_fruit_style_code ON brams_fruit_products(style_code);
CREATE INDEX idx_brams_fruit_category ON brams_fruit_products(category);
CREATE INDEX idx_brams_fruit_is_active ON brams_fruit_products(is_active);
```

## Files Changed/Added

### Nieuwe bestanden
- `src/services/bramsFruit/categoryMapper.ts`
- `src/components/settings/BramsFruitToggle.tsx`

### Gewijzigde bestanden
- `src/services/bramsFruit/productService.ts`
- `src/services/outfits/outfitService.ts`
- `src/services/productFeedLoader.ts`
- `src/pages/DashboardPage.tsx`

## Configuratie

### LocalStorage Keys
- `ff_brams_fruit_enabled`: boolean - Toggle status

### Default Settings
- `includeBramsFruit`: `true` (standaard aan)
- `CACHE_DURATION`: `1800000` (30 minuten)

---

**Status**: ✅ Productie ready
**Versie**: 1.0
**Datum**: 2025-10-20
