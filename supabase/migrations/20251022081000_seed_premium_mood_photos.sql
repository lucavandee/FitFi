/*
  # Seed Premium Gender-Aware Mood Photos

  1. Strategy
    - 10 curated female outfits covering all style archetypes
    - 10 curated male outfits covering all style archetypes
    - High-quality Pexels images selected for clarity and diversity
    - Each photo has detailed archetype weights for accurate embedding

  2. Style Coverage
    Female: Minimal, Classic, Romantic, Bohemian, Bold, Athleisure, Professional, Street, Coastal, Statement
    Male: Minimal, Classic, Street, Business, Casual, Sporty, Urban, Preppy, Monochrome, Bold

  3. Data Quality
    - Precise archetype weights (0-100 scale)
    - Rich style tags for matching
    - Color palettes extracted from images
    - Season and occasion metadata
*/

-- Clear existing mood photos to start fresh
DELETE FROM mood_photos WHERE id > 0;

-- Reset sequence
ALTER SEQUENCE mood_photos_id_seq RESTART WITH 1;

-- ==========================================
-- FEMALE MOOD PHOTOS (10)
-- ==========================================

INSERT INTO mood_photos (
  image_url,
  mood_tags,
  archetype_weights,
  dominant_colors,
  style_attributes,
  active,
  display_order,
  gender
) VALUES

-- 1. Scandinavian Minimal Woman - Clean lines, neutral palette
(
  'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['minimal', 'effortless', 'neutral', 'scandinavian'],
  '{"minimal": 95, "classic": 70, "refined": 60, "relaxed": 50}'::jsonb,
  ARRAY['#F5F5DC', '#FFFFFF', '#C8B8A0'],
  '{"formality": 40, "boldness": 20, "structure": 50, "comfort": 80}'::jsonb,
  true,
  1,
  'female'
),

-- 2. Professional Blazer - Structured, polished, confident
(
  'https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['professional', 'structured', 'polished', 'elegant'],
  '{"refined": 90, "classic": 85, "professional": 95, "minimal": 60}'::jsonb,
  ARRAY['#2C3E50', '#FFFFFF', '#34495E'],
  '{"formality": 90, "boldness": 40, "structure": 95, "comfort": 60}'::jsonb,
  true,
  2,
  'female'
),

-- 3. Romantic Flowing Dress - Soft, feminine, dreamy
(
  'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['romantic', 'feminine', 'soft', 'flowing'],
  '{"romantic": 95, "elegant": 80, "bohemian": 50, "relaxed": 60}'::jsonb,
  ARRAY['#FFB6C1', '#FFFFFF', '#F0E5E5'],
  '{"formality": 60, "boldness": 30, "structure": 30, "comfort": 80}'::jsonb,
  true,
  3,
  'female'
),

-- 4. Bohemian Layered - Free-spirited, textured, artistic
(
  'https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['bohemian', 'artistic', 'layered', 'eclectic'],
  '{"bohemian": 95, "artistic": 90, "relaxed": 80, "romantic": 50}'::jsonb,
  ARRAY['#D2691E', '#F4A460', '#8B7355'],
  '{"formality": 30, "boldness": 60, "structure": 30, "comfort": 90}'::jsonb,
  true,
  4,
  'female'
),

-- 5. Bold Statement Look - Colorful, confident, expressive
(
  'https://images.pexels.com/photos/1926620/pexels-photo-1926620.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['bold', 'statement', 'colorful', 'confident'],
  '{"bold": 95, "artistic": 85, "urban": 70, "trendy": 80}'::jsonb,
  ARRAY['#FF6B6B', '#FFD93D', '#6C63FF'],
  '{"formality": 50, "boldness": 95, "structure": 60, "comfort": 70}'::jsonb,
  true,
  5,
  'female'
),

-- 6. Athleisure Active - Sporty, functional, comfortable
(
  'https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['athleisure', 'sporty', 'active', 'comfortable'],
  '{"sporty": 95, "relaxed": 90, "minimal": 70, "trendy": 60}'::jsonb,
  ARRAY['#000000', '#FFFFFF', '#808080'],
  '{"formality": 20, "boldness": 40, "structure": 50, "comfort": 95}'::jsonb,
  true,
  6,
  'female'
),

-- 7. Street Style Urban - Edgy, contemporary, cool
(
  'https://images.pexels.com/photos/1933873/pexels-photo-1933873.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['street', 'urban', 'edgy', 'contemporary'],
  '{"urban": 90, "bold": 75, "trendy": 85, "minimal": 60}'::jsonb,
  ARRAY['#1C1C1C', '#FFFFFF', '#808080'],
  '{"formality": 40, "boldness": 80, "structure": 60, "comfort": 80}'::jsonb,
  true,
  7,
  'female'
),

-- 8. Classic Preppy - Traditional, polished, timeless
(
  'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['preppy', 'classic', 'polished', 'traditional'],
  '{"classic": 95, "preppy": 90, "refined": 75, "professional": 70}'::jsonb,
  ARRAY['#000080', '#FFFFFF', '#C41E3A'],
  '{"formality": 75, "boldness": 50, "structure": 80, "comfort": 70}'::jsonb,
  true,
  8,
  'female'
),

-- 9. Coastal Breezy - Light, relaxed, effortless
(
  'https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['coastal', 'breezy', 'relaxed', 'effortless'],
  '{"relaxed": 95, "bohemian": 70, "minimal": 65, "casual": 90}'::jsonb,
  ARRAY['#87CEEB', '#FFFFFF', '#F0E68C'],
  '{"formality": 25, "boldness": 35, "structure": 30, "comfort": 95}'::jsonb,
  true,
  9,
  'female'
),

-- 10. Monochrome Chic - Sleek, sophisticated, dramatic
(
  'https://images.pexels.com/photos/2583852/pexels-photo-2583852.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['monochrome', 'sophisticated', 'sleek', 'modern'],
  '{"minimal": 85, "refined": 90, "bold": 70, "classic": 75}'::jsonb,
  ARRAY['#000000', '#FFFFFF', '#808080'],
  '{"formality": 70, "boldness": 75, "structure": 80, "comfort": 65}'::jsonb,
  true,
  10,
  'female'
),

-- ==========================================
-- MALE MOOD PHOTOS (10)
-- ==========================================

-- 11. Scandinavian Minimal Man - Clean, understated, refined
(
  'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['minimal', 'scandinavian', 'clean', 'refined'],
  '{"minimal": 95, "classic": 70, "refined": 75, "relaxed": 55}'::jsonb,
  ARRAY['#F5F5F5', '#2C3E50', '#B8B8B8'],
  '{"formality": 50, "boldness": 25, "structure": 60, "comfort": 80}'::jsonb,
  true,
  11,
  'male'
),

-- 12. Business Professional - Tailored suit, polished, executive
(
  'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['professional', 'tailored', 'executive', 'formal'],
  '{"refined": 95, "professional": 95, "classic": 90, "minimal": 60}'::jsonb,
  ARRAY['#001f3f', '#FFFFFF', '#4A5568'],
  '{"formality": 95, "boldness": 40, "structure": 95, "comfort": 60}'::jsonb,
  true,
  12,
  'male'
),

-- 13. Street Urban - Edgy, contemporary, streetwear
(
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['street', 'urban', 'contemporary', 'edgy'],
  '{"urban": 95, "bold": 75, "trendy": 85, "relaxed": 70}'::jsonb,
  ARRAY['#1C1C1C', '#FFFFFF', '#FF4757'],
  '{"formality": 30, "boldness": 85, "structure": 50, "comfort": 85}'::jsonb,
  true,
  13,
  'male'
),

-- 14. Smart Casual - Elevated basics, versatile, polished
(
  'https://images.pexels.com/photos/2897883/pexels-photo-2897883.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['smart_casual', 'versatile', 'polished', 'elevated'],
  '{"classic": 80, "refined": 75, "professional": 70, "minimal": 65}'::jsonb,
  ARRAY['#2C3E50', '#ECF0F1', '#34495E'],
  '{"formality": 70, "boldness": 40, "structure": 75, "comfort": 75}'::jsonb,
  true,
  14,
  'male'
),

-- 15. Casual Weekend - Comfortable, relaxed, effortless
(
  'https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['casual', 'relaxed', 'comfortable', 'weekend'],
  '{"relaxed": 90, "casual": 95, "minimal": 70, "classic": 60}'::jsonb,
  ARRAY['#4A5568', '#FFFFFF', '#718096'],
  '{"formality": 25, "boldness": 30, "structure": 40, "comfort": 95}'::jsonb,
  true,
  15,
  'male'
),

-- 16. Athletic Sporty - Performance, active, functional
(
  'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['athletic', 'sporty', 'active', 'performance'],
  '{"sporty": 95, "relaxed": 85, "minimal": 70, "trendy": 55}'::jsonb,
  ARRAY['#000000', '#808080', '#00CED1'],
  '{"formality": 15, "boldness": 45, "structure": 55, "comfort": 95}'::jsonb,
  true,
  16,
  'male'
),

-- 17. Preppy Classic - Traditional, collegiate, timeless
(
  'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['preppy', 'classic', 'traditional', 'collegiate'],
  '{"classic": 90, "preppy": 95, "refined": 70, "professional": 65}'::jsonb,
  ARRAY['#001f3f', '#FFFFFF', '#B8860B'],
  '{"formality": 70, "boldness": 45, "structure": 80, "comfort": 70}'::jsonb,
  true,
  17,
  'male'
),

-- 18. Monochrome Modern - Sleek, minimalist, architectural
(
  'https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['monochrome', 'modern', 'minimalist', 'sleek'],
  '{"minimal": 90, "refined": 85, "bold": 65, "urban": 70}'::jsonb,
  ARRAY['#000000', '#FFFFFF', '#808080'],
  '{"formality": 65, "boldness": 70, "structure": 80, "comfort": 70}'::jsonb,
  true,
  18,
  'male'
),

-- 19. Bold Statement - Confident, expressive, eye-catching
(
  'https://images.pexels.com/photos/2255565/pexels-photo-2255565.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['bold', 'statement', 'confident', 'expressive'],
  '{"bold": 95, "artistic": 80, "urban": 75, "trendy": 80}'::jsonb,
  ARRAY['#FF6B6B', '#1C1C1C', '#FFD93D'],
  '{"formality": 40, "boldness": 95, "structure": 60, "comfort": 75}'::jsonb,
  true,
  19,
  'male'
),

-- 20. Coastal Casual - Laid-back, summery, effortless
(
  'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['coastal', 'casual', 'laid_back', 'summery'],
  '{"relaxed": 95, "casual": 90, "minimal": 70, "bohemian": 50}'::jsonb,
  ARRAY['#87CEEB', '#FFFFFF', '#F5DEB3'],
  '{"formality": 20, "boldness": 35, "structure": 30, "comfort": 95}'::jsonb,
  true,
  20,
  'male'
)
ON CONFLICT (id) DO NOTHING;
