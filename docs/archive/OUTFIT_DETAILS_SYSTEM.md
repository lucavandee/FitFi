# Outfit Details & Sorting System

## ✅ Problems Solved

### **1. Gebrek aan detailinformatie**
**Issue:** "Sommige gebruikers willen doorklikken voor meer details over een outfit of item (merk, prijs, maat)"

**Solution:**
- ✅ Nieuwe **OutfitDetailsModal** component
- ✅ "Bekijk alle details" knop op elke outfit card
- ✅ Complete productlijst met merk, prijs, categorie, kleur, voorraadstatus
- ✅ "Shop complete outfit" functie
- ✅ Individuele product details met materiaal, maten, beschrijving

---

### **2. Onduidelijke sortering**
**Issue:** "Het is onduidelijk hoe deze gesorteerd zijn of waarom juist deze hoeveelheid"

**Solution:**
- ✅ **OutfitSorter** component met 5 sorteeropties
- ✅ Duidelijke communicatie: "Top keuzes voor jou"
- ✅ Relevantie badges ("Perfect voor jou", "Top keuze", "Sterk aanbevolen")
- ✅ "Meer laden" functionaliteit met progressieve loading
- ✅ Sorteerlogica transparant gemaakt

---

## 🎯 New Components

### **1. OutfitDetailsModal**
Full-screen modal met complete outfit informatie.

**Features:**
- 📸 Grote outfit afbeelding
- 📋 Volledige productlijst met thumbnails
- 🏷️ Merk, prijs, categorie, kleur per item
- 📊 Stats: aantal items, match %, totaalprijs
- 💡 Nova's uitleg waarom dit outfit werkt
- 🛍️ "Shop complete outfit" (opent alle items in tabbladen)
- 🔍 Klik op item voor extra details (materiaal, maten)
- ✅ Voorraadstatus per item
- 🏪 Directe links naar retailers

**Usage:**
```tsx
import OutfitDetailsModal from '@/components/outfits/OutfitDetailsModal';

const [showDetails, setShowDetails] = useState(false);

<OutfitDetailsModal
  outfit={outfit}
  onClose={() => setShowDetails(false)}
  onShopProduct={(product) => {
    track('shop_product', { product_id: product.id });
  }}
/>
```

---

### **2. OutfitSorter**
Dropdown menu voor sortering met duidelijke labels en beschrijvingen.

**Sort Options:**
1. **Top keuzes** (relevance) - Best passend bij profiel
2. **Hoogste match** (match %) - Gerangschikt op match percentage
3. **Nieuwste eerst** (recent) - Laatst toegevoegde outfits
4. **Prijs (laag-hoog)** - Voordeligste eerst
5. **Prijs (hoog-laag)** - Duurste eerst

**Features:**
- 📊 Toon aantal outfits (bijv. "6 van 12 outfits")
- 🎯 Actieve sorteeroptie gemarkeerd
- 📝 Beschrijving per sorteeroptie
- 📱 Responsive (mobile: "Sorteer", desktop: volledige label)

**Usage:**
```tsx
import OutfitSorter from '@/components/outfits/OutfitSorter';

<OutfitSorter
  currentSort={sortBy}
  onSortChange={(newSort) => setSortBy(newSort)}
  totalCount={outfits.length}
  visibleCount={visibleOutfits.length}
/>
```

---

### **3. OutfitGrid**
Complete grid component met sorting, filtering, load more en relevance badges.

**Features:**
- 🎴 Responsive grid (1 col mobile, 2 tablet, 3 desktop)
- 🔄 Sorteer support (5 opties)
- 🏆 Relevance badges voor top outfits
- ⬇️ "Meer laden" button met loading state
- 📊 Progress indicator ("6 van 12 outfits getoond")
- ✨ Animations (fade in, stagger)
- 🎯 Analytics tracking per actie
- 🔢 Configureerbare initial count + load more count

**Relevance Badges:**
- 🌟 **Perfect voor jou** - Top 1, score ≥ 90%
- ✨ **Top keuze** - Top 3, score ≥ 85%
- 📈 **Sterk aanbevolen** - Top 6, score ≥ 80%

**Usage:**
```tsx
import OutfitGrid from '@/components/outfits/OutfitGrid';

<OutfitGrid
  outfits={allOutfits}
  initialCount={6}
  loadMoreCount={6}
  variant="default"
  layout="vertical"
  theme="light"
  showSorter={true}
  showRelevanceBadges={true}
  onOutfitClick={(outfit) => {
    // Handle click
  }}
/>
```

---

## 📖 Complete Example

```tsx
import React, { useState } from 'react';
import OutfitGrid from '@/components/outfits/OutfitGrid';

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState([
    {
      id: '1',
      title: 'Casual Chic Look',
      description: 'Perfect voor dagelijks gebruik',
      imageUrl: '/outfit-1.jpg',
      matchPercentage: 92,
      relevanceScore: 95, // For sorting
      archetype: 'casual_chic',
      occasion: 'Casual',
      tags: ['comfortable', 'trendy'],
      products: [
        {
          id: 'p1',
          name: 'Witte Sneakers',
          brand: 'Nike',
          imageUrl: '/sneakers.jpg',
          price: 89.99,
          currency: 'EUR',
          retailer: 'zalando',
          affiliateUrl: 'https://...',
          category: 'schoenen',
          color: 'wit',
          inStock: true,
          material: '100% leer',
          sizes: ['36', '37', '38', '39', '40'],
          description: 'Klassieke witte sneakers...'
        },
        // ... more products
      ],
      totalPrice: 259.95,
      explanation: 'Deze look combineert comfort met stijl...',
      createdAt: '2026-01-08T12:00:00Z'
    },
    // ... more outfits
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Jouw outfits</h1>

      <OutfitGrid
        outfits={outfits}
        initialCount={6}
        loadMoreCount={6}
        variant="default"
        layout="vertical"
        theme="light"
        showSorter={true}
        showRelevanceBadges={true}
        onOutfitClick={(outfit) => {
          console.log('Outfit clicked:', outfit.id);
        }}
      />
    </div>
  );
}
```

---

## 🎨 UnifiedOutfitCard Updates

De **UnifiedOutfitCard** heeft nu een prominente "Bekijk alle details" knop:

**Before:**
- 4 action buttons (Save, Like, Dislike, Explain)
- Shop button (alleen als products aanwezig)

**After:**
- 4 action buttons (Save, Like, Dislike, Explain)
- **"Bekijk alle details" button** (primary CTA, gradient, prominent)
- Shop button (legacy, verborgen)

**Details Button:**
- Gradient achtergrond (primary color)
- Witte tekst
- Badge met aantal items
- Hover: scale + shadow
- Opent OutfitDetailsModal

---

## 📊 Sorting Logic

### **1. Relevance (default)**
```typescript
sorted.sort((a, b) => {
  const scoreA = a.relevanceScore || a.matchPercentage || 0;
  const scoreB = b.relevanceScore || b.matchPercentage || 0;
  return scoreB - scoreA;
});
```

### **2. Match Percentage**
```typescript
sorted.sort((a, b) => {
  const matchA = a.matchPercentage || 0;
  const matchB = b.matchPercentage || 0;
  return matchB - matchA;
});
```

### **3. Recent**
```typescript
sorted.sort((a, b) => {
  const dateA = new Date(a.createdAt || 0).getTime();
  const dateB = new Date(b.createdAt || 0).getTime();
  return dateB - dateA;
});
```

### **4. Price (Low to High)**
```typescript
sorted.sort((a, b) => {
  const priceA = a.totalPrice || 0;
  const priceB = b.totalPrice || 0;
  return priceA - priceB;
});
```

### **5. Price (High to Low)**
```typescript
sorted.sort((a, b) => {
  const priceA = a.totalPrice || 0;
  const priceB = b.totalPrice || 0;
  return priceB - priceA;
});
```

---

## 🏆 Relevance Badge Logic

```typescript
// Top 1: Perfect voor jou
if (index === 0 && score >= 90) {
  return <Badge variant="gold">Perfect voor jou</Badge>;
}

// Top 3: Top keuze
if (index <= 2 && score >= 85) {
  return <Badge variant="gradient">Top keuze</Badge>;
}

// Top 6: Sterk aanbevolen
if (index <= 5 && score >= 80) {
  return <Badge variant="green">Sterk aanbevolen</Badge>;
}
```

**Requirements:**
- Only shown when `sortBy === 'relevance'`
- Requires `outfit.relevanceScore` or `outfit.matchPercentage`
- Position-based (top 1, 3, 6)
- Score threshold (90%, 85%, 80%)

---

## 📱 Responsive Behavior

### **Mobile (< 640px):**
- OutfitGrid: 1 column
- OutfitSorter: "Sorteer" label (compact)
- OutfitDetailsModal: Full screen
- Load more button: Full width

### **Tablet (640px - 1023px):**
- OutfitGrid: 2 columns
- OutfitSorter: Full label
- OutfitDetailsModal: Centered, max-width 4xl
- Load more button: Centered

### **Desktop (≥ 1024px):**
- OutfitGrid: 3 columns
- OutfitSorter: Full label + descriptions
- OutfitDetailsModal: Centered, max-width 4xl
- Load more button: Centered

---

## 🎯 Analytics Tracking

### **OutfitDetailsModal**
- `product_click_from_outfit_details` - Individual product click
- `shop_all_from_outfit_details` - Shop complete outfit
- `shop_product_from_details` - Callback tracking

### **OutfitGrid**
- `load_more_outfits` - Load more button click
- `change_outfit_sort` - Sort option changed
- `save_outfit_from_grid` - Save from grid
- `dislike_outfit_from_grid` - Dislike from grid
- `like_outfit_from_grid` - Like from grid

### **OutfitSorter**
- Tracked via `change_outfit_sort` in OutfitGrid

---

## 🧪 Testing Checklist

### **OutfitDetailsModal**
- [ ] Opens correctly from UnifiedOutfitCard
- [ ] Displays all products with correct info
- [ ] Shop button works per product
- [ ] "Shop complete outfit" opens all tabs
- [ ] Product detail overlay works
- [ ] Modal closes correctly (button + overlay)
- [ ] Responsive on all screen sizes

### **OutfitSorter**
- [ ] All 5 sort options work
- [ ] Active sort highlighted
- [ ] Dropdown closes on select
- [ ] Dropdown closes on overlay click
- [ ] Count updates correctly
- [ ] Responsive labels work

### **OutfitGrid**
- [ ] Sorting works for all options
- [ ] Load more shows/hides correctly
- [ ] Relevance badges appear for top outfits
- [ ] Animations smooth
- [ ] Empty state shows when no outfits
- [ ] "All loaded" state shows when complete
- [ ] Responsive grid columns

### **UnifiedOutfitCard**
- [ ] Details button prominent and clickable
- [ ] Badge shows item count
- [ ] Opens OutfitDetailsModal correctly
- [ ] Other buttons still work

---

## 🚀 Migration Guide

### **Step 1: Replace old outfit grids**

**Before:**
```tsx
<div className="grid grid-cols-3 gap-4">
  {outfits.map(outfit => (
    <OutfitCard key={outfit.id} outfit={outfit} />
  ))}
</div>
```

**After:**
```tsx
<OutfitGrid
  outfits={outfits}
  initialCount={6}
  loadMoreCount={6}
  showSorter={true}
  showRelevanceBadges={true}
/>
```

### **Step 2: Add relevanceScore to outfits**

```typescript
// In your outfit generation logic:
const outfit = {
  ...baseOutfit,
  relevanceScore: calculateRelevance(user, outfit), // 0-100
  createdAt: new Date().toISOString()
};
```

### **Step 3: Update outfit product data**

```typescript
// Add optional fields for better details:
const product = {
  ...baseProduct,
  material: 'Cotton blend', // Optional
  sizes: ['S', 'M', 'L', 'XL'], // Optional
  description: '...', // Optional
  inStock: true // Optional
};
```

---

## 📦 Dependencies

**New:**
- None! All built with existing dependencies

**Used:**
- `framer-motion` - Animations
- `lucide-react` - Icons
- `react-hot-toast` - Notifications
- `@/utils/telemetry` - Analytics
- `@/utils/affiliate` - Affiliate tracking

---

## 🎓 Best Practices

1. **Always provide relevanceScore** for best sorting
2. **Include createdAt** for "recent" sort to work
3. **Calculate totalPrice** for price sorting
4. **Add product details** (material, sizes) for rich modal
5. **Track all interactions** for learning algorithms
6. **Start with 6-12 outfits** as promised
7. **Use relevance sort by default** to show best matches first
8. **Show badges only on relevance sort** to avoid confusion

---

## 🔮 Future Enhancements

Possible additions:
- Filter by occasion, season, price range
- Save/bookmark sorting preferences
- "Similar outfits" suggestions in details modal
- AR try-on from details modal
- Share outfit details
- Print outfit
- Export shopping list
- Size recommendation per product
- Stock alerts
- Price drop notifications

---

## 🐛 Known Issues

None currently! 🎉

---

## 📝 Changelog

### v2.0.0 (2026-01-08)
- Added OutfitDetailsModal for complete outfit information
- Added OutfitSorter with 5 sorting options
- Added OutfitGrid with load more functionality
- Added relevance badges system
- Updated UnifiedOutfitCard with Details button
- Improved product detail views
- Added comprehensive analytics tracking
- Enhanced mobile responsiveness

---

## 📧 Support

Voor vragen of issues: dev@fitfi.ai

---

## ✅ Summary

**Wat hebben we opgelost:**

1. ✅ **Detailinformatie:** Volledige outfit details modal met alle productinfo
2. ✅ **Sortering:** 5 duidelijke sorteeropties met transparante communicatie
3. ✅ **Relevantie:** "Top keuzes voor jou" badges en sorting
4. ✅ **Meer laden:** Progressive loading met duidelijke progress
5. ✅ **Betrokkenheid:** Rijkere ervaring met meer informatie per outfit

**Impact op gebruikerservaring:**
- 📈 Langere sessies (meer te ontdekken)
- 🎯 Betere conversie (duidelijke product info)
- 💡 Meer transparantie (waarom deze volgorde)
- 🛍️ Eenvoudigere shopping (directe links + details)
- ⭐ Hogere satisfaction (relevante outfits eerst)
