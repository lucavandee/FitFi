# Recommendation Engine - Next Level Improvements

## 📊 **KRITIEKE BEVINDINGEN**

### **Product Imbalance (GROOT PROBLEEM)**

| Category | Female | Male | Unisex | Female Avg € | Male Avg € |
|----------|--------|------|--------|--------------|------------|
| **Top** | 5 | 367 | 4 | €76 | €143 |
| **Bottom** | 5 | 35 | 3 | €116 | €167 |
| **Footwear** | 4 | 5 | 3 | €477 | €520 |
| **Outerwear** | 3 | 62 | 3 | €1363 | €272 |
| **Accessory** | 3 | 19 | 3 | €865 | €99 |
| **Dress** | 4 | 0 | 0 | €290 | N/A |

### **🚨 PROBLEMEN:**
1. **Female producten**: VEEL TE WEINIG (24 totaal vs 488 male)
2. **Female pricing**: VEEL TE DUUR (avg €477 shoes vs €520 male, maar weinig budget opties)
3. **Brams Fruit**: 100% male, 0% female (478 producten!)
4. **Zalando**: Slechts 24 female producten, waarvan veel luxury (€800+ schoenen)

### **Impact op UX:**
- Female users krijgen ZEER beperkte keuze
- Budget filters verwijderen bijna ALLE female products
- Outfits zijn repetitief door gebrek aan variatie
- Premium items (€1000+) maken complete outfits onrealistisch duur

---

## 🎯 **PRIORITEIT 1: PRODUCT DATA VERRIJKING**

### **1A. Intelligent Product Expansion Strategy**

**Doel**: 200+ female products binnen 3 maanden

**Aanpak**:
```typescript
// Database tracking van product gaps
CREATE TABLE product_gaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  gender text NOT NULL,
  price_range_min numeric,
  price_range_max numeric,
  desired_count int NOT NULL,
  current_count int NOT NULL,
  priority int NOT NULL, -- 1-5, 5 = highest
  notes text,
  created_at timestamptz DEFAULT now()
);

// Voorbeeld data
INSERT INTO product_gaps (category, gender, price_range_min, price_range_max, desired_count, current_count, priority, notes)
VALUES
  ('top', 'female', 30, 80, 50, 5, 5, 'Critical - only 5 affordable tops'),
  ('bottom', 'female', 40, 100, 40, 5, 5, 'Critical - very limited selection'),
  ('footwear', 'female', 50, 150, 30, 1, 5, 'Critical - only 1 shoe under €150'),
  ('accessory', 'female', 20, 60, 20, 0, 4, 'No affordable accessories');
```

**Actie Items**:
- [ ] Partner met meer female-focused retailers (Zara, H&M, Mango, COS)
- [ ] Brams Fruit: vraag naar female line (of drop volledig als single-gender)
- [ ] Import Zalando budget segment (€30-100 range)
- [ ] Add sustainable brands (Armedangels, People Tree, Mud Jeans)

### **1B. Dynamic Product Sourcing**

**Smart affiliate integration**:
```typescript
// Real-time product fetching gebaseerd op user needs
async function fetchMissingProducts(
  category: string,
  gender: string,
  priceRange: { min: number; max: number },
  count: number
) {
  // 1. Check internal database
  // 2. If insufficient, fetch from affiliate APIs
  // 3. Cache results for 24h
  // 4. Track which external products convert best
}

// Voorbeeld:
const neededShoes = await fetchMissingProducts(
  'footwear',
  'female',
  { min: 50, max: 120 },
  10
);
```

---

## 🎯 **PRIORITEIT 2: MACHINE LEARNING & PERSONALISATIE**

### **2A. User Feedback Loop (Learn from Swipes)**

**Database schema**:
```sql
-- Track elke product interactie
CREATE TABLE product_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  interaction_type text NOT NULL, -- 'view', 'like', 'dislike', 'save', 'click', 'purchase'
  context jsonb, -- { outfit_id, position, archetype, etc }
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_product_interactions_user ON product_interactions(user_id, created_at DESC);
CREATE INDEX idx_product_interactions_product ON product_interactions(product_id, interaction_type);

-- Aggregate user preferences
CREATE TABLE user_product_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_brands text[],
  disliked_brands text[],
  preferred_colors text[],
  preferred_price_range int4range,
  preferred_styles jsonb, -- { casual: 0.8, formal: 0.2, ... }
  updated_at timestamptz DEFAULT now()
);
```

**Real-time learning**:
```typescript
// Elke keer dat user interacteert met product
async function recordInteraction(
  userId: string,
  productId: string,
  interactionType: 'like' | 'dislike' | 'save' | 'click'
) {
  // Log interaction
  await supabase.from('product_interactions').insert({
    user_id: userId,
    product_id: productId,
    interaction_type: interactionType,
    context: { /* ... */ }
  });

  // Update user preferences (background job)
  await updateUserPreferences(userId);
}

// Calculate weighted preferences
async function updateUserPreferences(userId: string) {
  const interactions = await getRecentInteractions(userId, 100);

  const preferences = {
    brands: calculateBrandAffinity(interactions),
    colors: calculateColorPreference(interactions),
    priceRange: calculatePricePreference(interactions),
    styles: calculateStylePreference(interactions)
  };

  await supabase.from('user_product_preferences')
    .upsert({ user_id: userId, ...preferences });
}
```

### **2B. Collaborative Filtering**

**"Users like you also liked..."**:
```typescript
// Find similar users based on style profiles
async function findSimilarUsers(userId: string, limit = 50) {
  const userProfile = await getUserStyleProfile(userId);

  // Users with similar archetype, color profile, and budget
  const similar = await supabase.rpc('find_similar_users', {
    user_id: userId,
    archetype: userProfile.archetype,
    color_season: userProfile.color_season,
    budget_range: userProfile.budget_range,
    limit
  });

  return similar;
}

// Recommend products that similar users liked
async function getCollaborativeRecommendations(
  userId: string,
  count = 20
) {
  const similarUsers = await findSimilarUsers(userId);
  const userIds = similarUsers.map(u => u.id);

  // Products liked by similar users, but not yet seen by this user
  const recommendations = await supabase
    .from('product_interactions')
    .select('product_id, COUNT(*) as like_count')
    .in('user_id', userIds)
    .eq('interaction_type', 'like')
    .not('product_id', 'in', await getSeenProducts(userId))
    .group('product_id')
    .order('like_count', { ascending: false })
    .limit(count);

  return recommendations;
}
```

---

## 🎯 **PRIORITEIT 3: SMART OUTFIT COMPOSITION**

### **3A. Color Harmony Rules**

**Basis kleurtheorie**:
```typescript
const COLOR_HARMONY_RULES = {
  complementary: {
    blue: ['orange', 'rust', 'copper'],
    red: ['green', 'mint', 'olive'],
    yellow: ['purple', 'lavender', 'plum']
  },
  analogous: {
    blue: ['teal', 'navy', 'cyan'],
    red: ['pink', 'burgundy', 'orange'],
    green: ['lime', 'olive', 'teal']
  },
  triadic: {
    blue: ['red', 'yellow'],
    red: ['blue', 'yellow'],
    yellow: ['blue', 'red']
  },
  neutral_with: {
    any: ['black', 'white', 'grey', 'beige', 'navy', 'cream']
  }
};

function calculateColorHarmonyScore(
  product1Colors: string[],
  product2Colors: string[]
): number {
  let score = 0;

  // Check complementary
  for (const c1 of product1Colors) {
    const complements = COLOR_HARMONY_RULES.complementary[c1] || [];
    if (product2Colors.some(c2 => complements.includes(c2))) {
      score += 0.4; // High harmony
    }
  }

  // Check neutrals
  const neutrals = COLOR_HARMONY_RULES.neutral_with.any;
  const hasNeutral1 = product1Colors.some(c => neutrals.includes(c));
  const hasNeutral2 = product2Colors.some(c => neutrals.includes(c));

  if (hasNeutral1 || hasNeutral2) {
    score += 0.3; // Neutrals go with everything
  }

  // Check analogous
  for (const c1 of product1Colors) {
    const similar = COLOR_HARMONY_RULES.analogous[c1] || [];
    if (product2Colors.some(c2 => similar.includes(c2))) {
      score += 0.2; // Subtle harmony
    }
  }

  return Math.min(score, 1.0);
}
```

### **3B. Occasion-Aware Matching**

```typescript
const OCCASION_RULES = {
  work: {
    requiredFormality: 0.7,
    avoidCategories: ['dress'], // Unless business dress
    preferredStyles: ['klassiek', 'minimal', 'sophisticated'],
    colorRestrictions: {
      avoid: ['neon', 'bright_pink'],
      prefer: ['navy', 'black', 'grey', 'white', 'beige']
    }
  },
  casual: {
    requiredFormality: 0.3,
    allowedStyles: 'all',
    colorRestrictions: {
      prefer: ['any']
    }
  },
  formal: {
    requiredFormality: 0.9,
    requiredCategories: ['dress'] // OR suit components
  }
};

function calculateOccasionMatch(
  outfit: Outfit,
  occasion: string
): number {
  const rules = OCCASION_RULES[occasion];
  let score = 1.0;

  // Check formality
  const outfitFormality = calculateFormality(outfit);
  const formalityDiff = Math.abs(outfitFormality - rules.requiredFormality);
  score -= formalityDiff * 0.5;

  // Check colors
  const outfitColors = getAllColors(outfit);
  const avoidColors = rules.colorRestrictions?.avoid || [];
  const hasAvoidedColor = outfitColors.some(c => avoidColors.includes(c));
  if (hasAvoidedColor) {
    score -= 0.3;
  }

  return Math.max(score, 0);
}
```

### **3C. Weather-Aware Recommendations**

```typescript
interface WeatherContext {
  temp: number; // Celsius
  condition: 'sunny' | 'rainy' | 'snowy' | 'cloudy';
  windSpeed: number; // km/h
}

async function getWeatherAwareRecommendations(
  userId: string,
  weather: WeatherContext
) {
  let products = await getFilteredProducts(userId);

  // Temperature filtering
  if (weather.temp < 10) {
    products = products.filter(p =>
      p.category === 'outerwear' ||
      p.tags?.includes('warm') ||
      p.tags?.includes('winter')
    );
  } else if (weather.temp > 25) {
    products = products.filter(p =>
      !p.tags?.includes('warm') &&
      (p.tags?.includes('light') || p.tags?.includes('summer'))
    );
  }

  // Rain filtering
  if (weather.condition === 'rainy') {
    // Boost waterproof items
    products = products.map(p => ({
      ...p,
      matchScore: p.tags?.includes('waterproof')
        ? (p.matchScore || 0.5) * 1.3
        : p.matchScore
    }));
  }

  return products;
}

// Integration met weather API
async function getTodayWeather(location: string): Promise<WeatherContext> {
  // OpenWeatherMap API call
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric`
  );
  const data = await response.json();

  return {
    temp: data.main.temp,
    condition: mapWeatherCondition(data.weather[0].main),
    windSpeed: data.wind.speed * 3.6 // m/s to km/h
  };
}
```

---

## 🎯 **PRIORITEIT 4: PERFORMANCE & CACHING**

### **4A. Smart Product Caching**

```typescript
// Multi-level cache strategy
class ProductCacheService {
  private memoryCache = new Map<string, { data: Product[]; timestamp: number }>();
  private readonly MEMORY_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly SUPABASE_TTL = 30 * 60 * 1000; // 30 minutes

  async getProducts(criteria: FilterCriteria): Promise<Product[]> {
    const cacheKey = this.getCacheKey(criteria);

    // Level 1: Memory cache (fastest)
    const memCached = this.memoryCache.get(cacheKey);
    if (memCached && Date.now() - memCached.timestamp < this.MEMORY_TTL) {
      console.log('[Cache] HIT - Memory');
      return memCached.data;
    }

    // Level 2: Supabase cache table
    const dbCached = await this.getFromCacheTable(cacheKey);
    if (dbCached) {
      console.log('[Cache] HIT - Database');
      this.memoryCache.set(cacheKey, { data: dbCached, timestamp: Date.now() });
      return dbCached;
    }

    // Level 3: Full query (slowest)
    console.log('[Cache] MISS - Full query');
    const products = await this.queryProducts(criteria);

    // Store in all cache levels
    await this.storeCached(cacheKey, products);
    this.memoryCache.set(cacheKey, { data: products, timestamp: Date.now() });

    return products;
  }

  private getCacheKey(criteria: FilterCriteria): string {
    return `products:${criteria.gender}:${criteria.budget?.max}:${criteria.budget?.min}`;
  }
}

// Supabase cache table
CREATE TABLE product_cache (
  cache_key text PRIMARY KEY,
  products jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX idx_product_cache_expires ON product_cache(expires_at);

-- Auto-cleanup expired cache
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM product_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;
```

### **4B. Precomputed Outfit Combinations**

```typescript
// Background job: Pre-generate popular outfit combinations
CREATE TABLE precomputed_outfits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  archetype text NOT NULL,
  gender text NOT NULL,
  budget_tier text NOT NULL, -- 'budget', 'mid', 'premium'
  occasion text NOT NULL,
  outfit_data jsonb NOT NULL,
  popularity_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  last_served_at timestamptz
);

CREATE INDEX idx_precomputed_outfits_lookup
  ON precomputed_outfits(archetype, gender, budget_tier, occasion);

// Worker job (runs every 6 hours)
async function precomputePopularOutfits() {
  const combinations = [
    { archetype: 'casual_chic', gender: 'female', budget: 'budget', occasion: 'casual' },
    { archetype: 'casual_chic', gender: 'female', budget: 'mid', occasion: 'work' },
    // ... all common combinations
  ];

  for (const combo of combinations) {
    const outfits = await generateOutfits(combo, 10);
    await storePrecomputedOutfits(combo, outfits);
  }
}

// Fast retrieval
async function getPrecomputedOutfits(criteria: OutfitCriteria) {
  const cached = await supabase
    .from('precomputed_outfits')
    .select('outfit_data')
    .match(criteria)
    .limit(6);

  if (cached.data && cached.data.length >= 3) {
    // Update last_served_at for analytics
    await trackOutfitServing(cached.data.map(o => o.id));
    return cached.data.map(o => o.outfit_data);
  }

  // Fallback to real-time generation
  return null;
}
```

---

## 🎯 **PRIORITEIT 5: NOVA AI INTEGRATION**

### **5A. AI-Powered Outfit Explanations**

```typescript
// Replace generic explanations with AI-generated insights
async function generateNovaExplanation(
  outfit: Outfit,
  userProfile: UserProfile
): Promise<string> {
  const context = {
    outfit: {
      products: outfit.products.map(p => ({
        name: p.name,
        brand: p.brand,
        category: p.category,
        colors: p.colors,
        price: p.price
      })),
      totalPrice: outfit.products.reduce((sum, p) => sum + (p.price || 0), 0)
    },
    user: {
      archetype: userProfile.archetype,
      colorProfile: userProfile.colorProfile,
      budget: userProfile.budget,
      preferences: userProfile.preferences
    }
  };

  const prompt = `
Je bent een persoonlijke stylist. Leg uit waarom deze outfit perfect is voor deze gebruiker.

Outfit:
${JSON.stringify(context.outfit, null, 2)}

Gebruiker:
- Stijl: ${context.user.archetype}
- Kleurenprofiel: ${context.user.colorProfile}
- Budget: €${context.user.budget?.max || 'geen limiet'}

Schrijf een persoonlijke, warme uitleg in 2-3 zinnen die:
1. Specifiek ingaat op de producten
2. Uitlegt waarom het bij de gebruiker past
3. Styling tips geeft

Antwoord in Nederlands, friendly en professioneel.
  `;

  // Call Nova AI (via edge function or direct API)
  const explanation = await callNovaAI(prompt);

  return explanation;
}
```

### **5B. Conversational Outfit Refinement**

```typescript
// User: "Ik vind die schoenen te duur"
// Nova: "Begrijp ik! Ik heb een alternatief voor je..."

interface OutfitRefinementRequest {
  outfitId: string;
  feedback: string; // "too expensive", "different color", "more casual"
  specificProduct?: string; // Which product to replace
}

async function refineOutfitWithNova(
  request: OutfitRefinementRequest,
  userId: string
): Promise<Outfit> {
  const originalOutfit = await getOutfit(request.outfitId);
  const userProfile = await getUserProfile(userId);

  // Parse feedback with Nova
  const intent = await parseUserIntent(request.feedback);

  // Generate refined outfit
  const refined = await generateRefinedOutfit(
    originalOutfit,
    intent,
    userProfile
  );

  return refined;
}

// Voorbeeld intents:
// "te duur" → reduce budget for specific category
// "andere kleur" → swap product with different color
// "casual" → lower formality score
// "voor werk" → increase formality, adjust occasion
```

---

## 📈 **IMPACT ANALYSE**

### **Before vs After (Projected)**

| Metric | Current | With Improvements |
|--------|---------|-------------------|
| Female products | 24 | 200+ |
| Budget female options (<€100) | ~8 | 100+ |
| Outfit variety (unique combinations) | ~50 | 1000+ |
| Personalization accuracy | 60% | 85%+ |
| Cache hit rate | 0% | 80%+ |
| Load time (outfit generation) | 2-3s | 0.3-0.5s |
| User satisfaction (estimated) | 65% | 90%+ |

---

## 🛠️ **IMPLEMENTATION ROADMAP**

### **Phase 1 (Week 1-2): Data Foundation**
- [ ] Create product_gaps table
- [ ] Audit current product quality
- [ ] Setup product_interactions tracking
- [ ] Implement basic user preferences

### **Phase 2 (Week 3-4): ML Foundations**
- [ ] Collaborative filtering system
- [ ] User similarity algorithm
- [ ] Preference learning from interactions

### **Phase 3 (Week 5-6): Smart Matching**
- [ ] Color harmony rules
- [ ] Occasion matching
- [ ] Weather integration

### **Phase 4 (Week 7-8): Performance**
- [ ] Multi-level caching
- [ ] Precomputed outfits
- [ ] Database indexes optimization

### **Phase 5 (Week 9-10): Nova AI**
- [ ] AI-powered explanations
- [ ] Conversational refinement
- [ ] Smart suggestions

### **Phase 6 (Week 11-12): Product Expansion**
- [ ] Partner with 3-5 new retailers
- [ ] Import 200+ female products
- [ ] Balance price ranges

---

**Wil je dat ik een van deze prioriteiten direct implementeer?** 🚀
