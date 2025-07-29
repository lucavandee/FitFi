# FitFi Design System

## Founders Club UI Components

### Design Tokens

#### Colors
```css
foundersGradientFrom: #6E2EB7  /* Primary violet */
foundersGradientTo: #B043FF    /* Pink-violet */
foundersCardBg: #FFFFFF        /* Light mode card background */
foundersCardBgDark: #1E1B2E    /* Dark mode card background */
```

#### Shadows
```css
shadow-founders: 0 10px 40px rgba(0, 0, 0, 0.06)      /* Light mode */
shadow-founders-dark: 0 10px 40px rgba(0, 0, 0, 0.3)  /* Dark mode */
shadow-glass: 0 8px 32px rgba(31, 38, 135, 0.37)      /* Glass effect */
```

### Component Specifications

#### FoundersBlock
- **Container**: Max-width 940px, 2-column grid on desktop
- **Card**: Rounded-3xl (24px), shadow-founders, responsive padding
- **Layout**: Progress section (left) + Leaderboard section (right)
- **Responsive**: Stacks vertically on mobile/tablet

#### Progress Ring
- **Size**: 128px (w-32 h-32)
- **Stroke**: 8px width, rounded caps
- **Animation**: 800ms ease-out fill from 0 to progress percentage
- **Colors**: Gradient from foundersGradientFrom to foundersGradientTo

#### FoundersBadge
- **Sizes**: 
  - sm: 24px (w-6 h-6)
  - md: 32px (w-8 h-8) 
  - lg: 48px (w-12 h-12)
- **Background**: Gradient from foundersGradientFrom to foundersGradientTo
- **Icon**: Crown (Lucide React)
- **Animation**: Scale 0.8→1 with spring physics on reveal

#### Leaderboard
- **Background**: Glass effect with backdrop-blur-md
- **Items**: Rounded-xl cards with hover states
- **Ranking**: 
  - #1: Gold gradient with crown icon
  - #2: Silver gradient
  - #3: Bronze gradient
  - Others: Gray background
- **Animation**: Staggered reveal with count-up effect

#### CTA Buttons
- **Primary**: Gradient background, white text, hover scale 1.02
- **Secondary**: Outline with gradient border, hover fill
- **Ghost**: Transparent with gradient border on focus
- **States**: Disabled, loading, success (with icon change)

### Animations & Motion

#### Timing Functions
- **Ease-out**: Default for most animations
- **Spring**: For badge reveals and interactive elements
- **Duration**: 
  - Micro-interactions: 200-300ms
  - Component reveals: 600-800ms
  - Progress animations: 800ms

#### Reduced Motion
- All animations respect `prefers-reduced-motion: reduce`
- Fallback to instant state changes when motion is disabled
- Maintains functionality without animation

### Accessibility

#### WCAG AA Compliance
- **Color Contrast**: Minimum 4.5:1 ratio for all text
- **Focus States**: Visible focus rings with 2px outline
- **ARIA Labels**: All interactive elements properly labeled
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Semantic HTML with proper headings

#### Interactive Elements
- **Buttons**: Clear purpose, proper states (disabled, loading, success)
- **Progress Ring**: ARIA attributes for screen readers
- **Tooltips**: Accessible with proper timing and dismissal
- **Modal**: Focus management and escape key handling

### Implementation Notes

#### Framer Motion Integration
```tsx
// Progress ring animation
<motion.circle
  strokeDashoffset={isInView ? progressOffset : 283}
  transition={{ duration: 0.8, ease: "easeOut" }}
/>

// Badge reveal animation
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: "spring", stiffness: 300 }}
>
```

#### Dark Mode Support
```tsx
// Card background
className="bg-foundersCardBg dark:bg-foundersCardBgDark"

// Text colors
className="text-gray-900 dark:text-neutral-100"

// Glass effects
className="bg-white/60 dark:bg-white/10"
```

#### Responsive Design
```tsx
// Grid layout
className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"

// Padding
className="p-6 md:p-8 xl:p-12"

// Text alignment
className="text-center lg:text-left"
```

### Quality Assurance

#### Visual Testing
- Playwright snapshots for desktop (1280px), tablet (768px), mobile (375px)
- Dark mode visual regression testing
- Animation state testing

#### Performance
- Lighthouse CLS < 0.02
- LCP unchanged from baseline
- Bundle size impact minimal

#### Accessibility Testing
- Axe-core automated testing
- Manual keyboard navigation testing
- Screen reader compatibility verification
- Color contrast validation

### Usage Examples

#### Basic Implementation
```tsx
import FoundersBlock from './components/founders/FoundersBlock';

<FoundersBlock className="my-8" />
```

#### With Badge
```tsx
import FoundersBadge from './components/founders/FoundersBadge';

<FoundersBadge size="lg" animated={true} />
```

#### Share Modal
```tsx
import ShareModal from './components/founders/ShareModal';

{showModal && (
  <ShareModal 
    referralCode="ABC12345"
    onClose={() => setShowModal(false)}
  />
)}
```