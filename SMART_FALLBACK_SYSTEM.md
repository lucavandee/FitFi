# Smart Image Fallback System

Intelligent fallback systeem voor product images dat automatisch color-matched gradients en category icons genereert.

## Features

### 1. Color-Based Gradients
Automatische gradient generatie op basis van productnaam of kleur:
- **Navy** → Blauwe gradient (rgb(20,40,80) → rgb(60,80,120))
- **Green** → Groene gradient (rgb(40,80,50) → rgb(80,120,90))
- **Black** → Donkere gradient (rgb(30,30,30) → rgb(90,90,90))
- **Grey Melange** → Grijze gradient
- En meer... (zie `colorGradients.ts`)

### 2. SVG Category Icons
Custom SVG icons per product category:
- **Jacket/Outerwear** → Jacket icon
- **Shirt/Top** → Shirt icon
- **Pants/Trousers** → Pants icon
- **Shoes** → Shoes icon
- **Accessories** → Accessory icon

### 3. Lazy Loading
- IntersectionObserver voor efficient laden
- Images laden alleen wanneer zichtbaar in viewport
- 50px rootMargin voor smooth UX

### 4. Smooth Transitions
- **Gradient Animation**: Subtiele 8s gradient shift
- **Icon Pulse**: 3s pulse animatie (opacity + scale)
- **Fade-in**: 500ms smooth fade wanneer echte image laadt
- **Prefers-reduced-motion**: Respect voor accessibility preferences

## Usage

### Basic Usage

```tsx
import { ProductImage } from '@/components/ui/ProductImage';

<ProductImage
  src={product.imageUrl}
  alt={product.name}
  productName="Hooded Puffer Jacket - Navy"
  brand="Brams Fruit"
  category="Outerwear"
  aspectRatio="3/4"
/>
```

### Advanced Usage

```tsx
import { SmartFallbackImage } from '@/components/ui/SmartFallbackImage';

<SmartFallbackImage
  src={imageUrl}
  alt="Product Name"
  category="tops"
  color="navy"
  productName="Navy Overshirt"
  aspectRatio="1/1"
  className="rounded-lg"
  fallbackClassName="shadow-inner"
/>
```

## Architecture

### Files

1. **`utils/colorGradients.ts`**
   - Color name → gradient mapping
   - Gradient CSS generator
   - Color extraction from product names

2. **`components/ui/CategoryIcons.tsx`**
   - SVG icon components per category
   - Automatic category detection
   - Consistent styling

3. **`components/ui/SmartFallbackImage.tsx`**
   - Core fallback logic
   - Lazy loading implementation
   - Transition management

4. **`components/ui/ProductImage.tsx`**
   - High-level wrapper
   - Product-specific props
   - Brams Fruit badge integration

5. **`styles/components/smart-fallback.css`**
   - Gradient shift animation
   - Icon pulse animation
   - Fade-in transitions
   - Reduced motion support

## Integration

### Existing Components

Automatically works with:
- ✅ `ProductDetailModal` (updated)
- ✅ Any component using `ProductImage`
- ⚠️ Components using `SmartImage` (legacy fallback still active)

### Bram's Fruit Products

Perfect voor Bram's Fruit omdat:
1. Producten hebben vaak geen images (imported zonder URLs)
2. Kleurnamen zijn beschrijvend ("Navy", "Green", "Black")
3. Categories zijn duidelijk ("Outerwear", "Shirting", "Trousers")
4. Premium brand → premium placeholders

## Color Mappings

| Color Name | Gradient Colors |
|-----------|----------------|
| Black | rgb(30,30,30) → rgb(90,90,90) |
| Navy | rgb(20,40,80) → rgb(60,80,120) |
| Blue | rgb(40,80,160) → rgb(80,120,200) |
| Midnight Blue | rgb(15,30,70) → rgb(45,70,110) |
| Light Blue | rgb(120,160,200) → rgb(160,200,240) |
| Green | rgb(40,80,50) → rgb(80,120,90) |
| Grey | rgb(100,100,100) → rgb(160,160,160) |
| Khaki | rgb(120,110,80) → rgb(160,150,120) |
| Beige | rgb(180,160,140) → rgb(220,200,180) |

## Benefits

### UX Benefits
1. **Visual Consistency**: Gradients matchen productkleuren
2. **Loading States**: Duidelijk onderscheid tussen loading/fallback/loaded
3. **Performance**: Lazy loading + efficient IntersectionObserver
4. **Accessibility**: Reduced motion support

### Business Benefits
1. **Product Launch**: Kan producten tonen VOORDAT images beschikbaar zijn
2. **Brand Identity**: Brams Fruit badge op hover
3. **Premium Feel**: Mooie gradients > generieke placeholders
4. **SEO**: Proper alt texts + progressive enhancement

## Performance

- **Initial Load**: Geen extra images geladen
- **Lazy Loading**: Images laden alleen in viewport
- **CSS Animations**: GPU-accelerated transforms
- **Memory**: Efficient cleanup van observers

## Future Enhancements

1. **Dynamic Image Generation**: Server-side generated placeholders
2. **Color Detection**: Analyze product voor dominante kleuren
3. **Brand Gradients**: Per-brand gradient themes
4. **Smart Cropping**: Auto-detect focal points in loaded images
5. **WebP/AVIF**: Modern format support met fallbacks

## Testing

Test scenarios:
1. Product zonder image → Gradient + icon
2. Product met broken image → Graceful fallback
3. Product met valid image → Smooth fade-in
4. Scroll performance → Lazy loading werkt
5. Reduced motion → Animations disabled

## Browser Support

- ✅ Chrome/Edge 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari 14+, Chrome Android)

## Maintenance

### Adding New Colors

Edit `src/utils/colorGradients.ts`:

```typescript
const COLOR_GRADIENTS: Record<string, GradientColors> = {
  // Add new color
  burgundy: {
    from: 'rgb(100, 30, 40)',
    via: 'rgb(140, 50, 60)',
    to: 'rgb(180, 70, 80)',
  },
};
```

### Adding New Categories

Edit `src/components/ui/CategoryIcons.tsx`:

```typescript
export function CoatIcon({ className, color }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64">
      {/* Your SVG path */}
    </svg>
  );
}

// Update getCategoryIcon()
if (normalized.includes('coat')) {
  return CoatIcon;
}
```

---

**Status**: ✅ Production Ready
**Version**: 1.0
**Last Updated**: 2025-10-20
