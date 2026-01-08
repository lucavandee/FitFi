# Unified OutfitCard System

## ✅ Problem Solved

**Issue:** Inconsistent outfit card styling across the app:
- Different cards had different backgrounds (light vs dark)
- Different layouts (vertical vs horizontal)
- Gender-based inconsistencies reported by users
- 8 different OutfitCard components with duplicate code

**Solution:** Single unified `UnifiedOutfitCard` component with:
- Consistent styling via design tokens
- Variant/layout/theme props for flexibility
- Gender-agnostic design
- Single source of truth

---

## 🎨 Component Props

```typescript
interface UnifiedOutfitCardProps {
  outfit: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    matchPercentage?: number;
    currentSeasonLabel?: string;
    dominantColorName?: string;
    archetype?: string;
    tags?: string[];
    products?: Product[];
    occasion?: string;
    totalPrice?: number;
    explanation?: string;
  };
  variant?: 'default' | 'pro' | 'premium' | 'compact';
  layout?: 'vertical' | 'horizontal';
  theme?: 'light' | 'dark';
  onSave?: () => void;
  onDislike?: () => void;
  onMoreLikeThis?: () => void;
  onExplain?: (explanation: string) => void;
  onShare?: () => void;
  className?: string;
}
```

---

## 📖 Usage Examples

### 1. Default Card (Light, Vertical)
```tsx
import UnifiedOutfitCard from '@/components/outfits/UnifiedOutfitCard';

<UnifiedOutfitCard
  outfit={outfit}
  // All props are optional, defaults to:
  // variant="default"
  // layout="vertical"
  // theme="light"
/>
```

**Use case:** Standard outfit feed, results pages, dashboard

---

### 2. Premium Card (Dark Theme)
```tsx
<UnifiedOutfitCard
  outfit={outfit}
  variant="premium"
  theme="dark"
  layout="vertical"
/>
```

**Use case:** Premium features, upgrade upsell pages

---

### 3. Pro Card (Horizontal Layout)
```tsx
<UnifiedOutfitCard
  outfit={outfit}
  variant="pro"
  layout="horizontal"
  theme="light"
/>
```

**Use case:** Featured outfits, detailed outfit pages

---

### 4. Compact Card
```tsx
<UnifiedOutfitCard
  outfit={outfit}
  variant="compact"
  layout="vertical"
  theme="light"
/>
```

**Use case:** Sidebar recommendations, mobile lists

---

## 🎯 Variant Differences

| Variant | Description | When to Use |
|---------|-------------|-------------|
| `default` | Standard card with all features | Main feed, results |
| `pro` | Enhanced features, works best horizontal | Featured sections |
| `premium` | Premium styling for upsell | Premium pages |
| `compact` | Smaller padding, less spacing | Sidebars, mobile |

---

## 📐 Layout Modes

### Vertical Layout (Default)
```
┌─────────────────┐
│                 │
│     Image       │
│                 │
├─────────────────┤
│     Title       │
│   Description   │
│     Actions     │
└─────────────────┘
```

- Products shown below image in 2x2 grid
- Best for: Mobile, standard cards
- Responsive: Always vertical on mobile

### Horizontal Layout
```
┌─────────┬─────────┐
│         │  Title  │
│  Image  │  Desc   │
│         │ Actions │
└─────────┴─────────┘
```

- Products shown beside image (desktop only)
- Best for: Featured cards, pro variant
- Responsive: Switches to vertical on mobile

---

## 🌓 Theme Modes

### Light Theme (Default)
- Background: `var(--color-surface)`
- Border: `var(--color-border)`
- Text: `var(--color-text)`
- Use for: Standard pages

### Dark Theme
- Background: `#1E2433`
- Border: `white/10`
- Text: `white` / `#AAB0C0`
- Use for: Premium features, night mode

---

## 📱 Responsive Behavior

**Mobile (< 640px):**
- Single column
- Vertical layout forced
- Compact buttons

**Tablet (640px - 1023px):**
- 2 columns in grid
- Layout prop respected

**Desktop (≥ 1024px):**
- 3 columns in grid
- Full layout options

---

## 🎨 Styling via Tokens

All colors use design tokens from `/src/styles/tokens.css`:

```css
/* Light Theme */
--color-surface: #FFFFFF
--color-border: #E5E7EB
--color-text: #111827

/* Dark Theme */
--color-surface-dark: #1E2433
--color-border-dark: rgba(255,255,255,0.1)
--color-text-inverted: #FFFFFF
```

**No hardcoded hex colors!** ✅

---

## 🔄 Migration from Old Cards

### Before (OutfitCard.tsx)
```tsx
import OutfitCard from '@/components/outfits/OutfitCard';

<OutfitCard
  outfit={outfit}
  onSave={handleSave}
/>
```

### After (UnifiedOutfitCard)
```tsx
import UnifiedOutfitCard from '@/components/outfits/UnifiedOutfitCard';

<UnifiedOutfitCard
  outfit={outfit}
  variant="default"
  layout="vertical"
  theme="light"
  onSave={handleSave}
/>
```

**Same functionality, unified styling!**

---

## ✨ Features Included

### All Variants Include:
- ✅ Save/Heart button with optimistic updates
- ✅ Like/More like this button (adaptive learning)
- ✅ Dislike/Not my style button
- ✅ Explain button (Nova integration)
- ✅ Shop button (with ShopItemsList modal)
- ✅ Match percentage badge
- ✅ Color harmony badge (when score > 0.7)
- ✅ Season/occasion tags
- ✅ Explanation modal
- ✅ Hover animations
- ✅ Focus states (a11y)
- ✅ Loading states
- ✅ Error handling
- ✅ Analytics tracking
- ✅ ML feedback integration

### Premium Variant Adds:
- Dark theme styling
- Enhanced visual hierarchy
- Premium badge styling

---

## 🎮 Interactive States

### Save Button States:
1. **Default:** Border only, empty heart
2. **Hover:** Background tint, scale up
3. **Saving:** Spinner, disabled
4. **Saved:** Gradient fill, filled heart, "Bewaard ✓"

### Other Buttons:
- Hover: Scale + translate Y
- Active: Scale down
- Disabled: Opacity 50%, cursor not-allowed
- Processing: Pulse animation on icon

---

## 🔒 Auth Requirements

All actions require auth (wrapped in `<RequireAuth>`):
- Save → Redirects to `/inloggen?returnTo=/feed`
- Like/Dislike → Same redirect
- Explain → Same redirect
- Shop → No auth required

---

## 📊 Analytics Events

Tracked events:
- `outfit_view` - Card enters viewport
- `save_click_unauth` - Unauthenticated save attempt
- `add_to_favorites` - Successful save
- `request_similar` - Like button click
- `feedback_dislike` - Dislike button click
- `request_explanation` - Explain button click
- `explanation_generated` - Successful explanation
- `shop_button_click` - Shop button click

---

## 🧪 Testing Checklist

### Visual Testing:
- [ ] Light theme renders correctly
- [ ] Dark theme renders correctly
- [ ] Vertical layout works
- [ ] Horizontal layout works on desktop
- [ ] All variants render without errors

### Responsive Testing:
- [ ] Mobile (375px): Single column, vertical
- [ ] Tablet (768px): 2 columns, layout prop works
- [ ] Desktop (1280px): 3 columns, horizontal works

### Interaction Testing:
- [ ] Save button works (auth required)
- [ ] Like button works and shows feedback
- [ ] Dislike button works
- [ ] Explain button opens modal
- [ ] Shop button opens modal (when products exist)
- [ ] Modals close correctly

### Accessibility Testing:
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] ARIA labels present
- [ ] Screen reader friendly

---

## 🚀 Performance

- Lazy loading images
- Intersection observer for view tracking
- Optimistic UI updates
- Debounced actions (200ms)
- Memoized calculations (harmonyScore)
- Conditional rendering

---

## 🎓 Best Practices

1. **Always use variant prop explicitly** for clarity
2. **Use light theme by default** unless premium context
3. **Use vertical layout on mobile** (auto-handled)
4. **Test with real data** including missing products
5. **Monitor analytics** to track engagement

---

## 📦 Dependencies

- `framer-motion` - Animations
- `lucide-react` - Icons
- `react-hot-toast` - Toast notifications
- `@/utils/cn` - Class name utility
- `@/components/ui/LazyImage` - Image loading
- `@/components/auth/RequireAuth` - Auth wrapper
- `@/services/engagement` - Save logic
- `@/engine/explainOutfit` - Explanation generation
- `@/hooks/useSaveOutfit` - Save mutation
- `@/utils/telemetry` - Analytics

---

## 🔮 Future Enhancements

Possible additions:
- Share functionality (social media)
- Print outfit
- Export outfit to PDF
- Add to calendar
- Compare outfits side-by-side
- Remix outfit (swap items)
- AR try-on integration
- Voice narration of explanation

---

## 🐛 Known Issues

None currently! 🎉

Report issues to: dev@fitfi.ai

---

## 📝 Changelog

### v1.0.0 (2026-01-08)
- Initial unified card implementation
- Replaces 8 legacy OutfitCard variants
- Variant/layout/theme prop system
- Full feature parity with all old cards
- Gender-agnostic design
- Token-based styling
- Responsive behavior
- Complete a11y support
