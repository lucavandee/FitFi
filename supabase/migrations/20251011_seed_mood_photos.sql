/*
  # Seed Mood Photos Dataset

  Seeds 10 curated outfit photos representing different style archetypes.
  Each photo has:
  - Style tags (for categorization)
  - Archetype weights (for embedding calculation)
  - Color palette (for visual consistency)
  - Occasion & season metadata
*/

-- Insert 10 mood photos with diverse style representations
INSERT INTO mood_photos (
  image_url,
  style_tags,
  archetype_weights,
  color_palette,
  occasion,
  season,
  active,
  display_order
) VALUES
  -- 1. Scandinavian Minimal - Clean, neutral, effortless
  (
    'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg',
    ARRAY['scandi_minimal', 'effortless', 'neutral'],
    '{"minimal": 90, "classic": 60, "refined": 50}'::jsonb,
    ARRAY['#FFFFFF', '#F5F5DC', '#8B7355'],
    'casual',
    'all',
    true,
    1
  ),

  -- 2. Italian Smart Casual - Structured, elevated, tailored
  (
    'https://images.pexels.com/photos/2897883/pexels-photo-2897883.jpeg',
    ARRAY['italian_smart_casual', 'tailored', 'elevated'],
    '{"classic": 85, "refined": 80, "minimal": 40}'::jsonb,
    ARRAY['#2C3E50', '#ECF0F1', '#34495E'],
    'work',
    'fall',
    true,
    2
  ),

  -- 3. Street Refined - Urban, edgy, contemporary
  (
    'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
    ARRAY['street_refined', 'urban', 'contemporary'],
    '{"urban": 95, "bold": 70, "minimal": 30}'::jsonb,
    ARRAY['#1C1C1C', '#FFFFFF', '#DC143C'],
    'casual',
    'all',
    true,
    3
  ),

  -- 4. Bohemian Artistic - Free-spirited, layered, textured
  (
    'https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg',
    ARRAY['bohemian', 'artistic', 'layered'],
    '{"bohemian": 90, "artistic": 85, "relaxed": 70}'::jsonb,
    ARRAY['#D2691E', '#F4A460', '#8B4513'],
    'casual',
    'summer',
    true,
    4
  ),

  -- 5. Classic Preppy - Traditional, polished, collegiate
  (
    'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg',
    ARRAY['preppy', 'classic', 'polished'],
    '{"classic": 95, "preppy": 90, "refined": 60}'::jsonb,
    ARRAY['#000080', '#FFFFFF', '#C41E3A'],
    'work',
    'spring',
    true,
    5
  ),

  -- 6. Athleisure Comfortable - Sporty, functional, relaxed
  (
    'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg',
    ARRAY['athleisure', 'sporty', 'comfortable'],
    '{"sporty": 95, "relaxed": 85, "minimal": 50}'::jsonb,
    ARRAY['#000000', '#808080', '#00CED1'],
    'casual',
    'all',
    true,
    6
  ),

  -- 7. Romantic Feminine - Soft, flowing, delicate
  (
    'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg',
    ARRAY['romantic', 'feminine', 'soft'],
    '{"romantic": 95, "elegant": 75, "bohemian": 40}'::jsonb,
    ARRAY['#FFB6C1', '#FFFFFF', '#DDA0DD'],
    'date',
    'spring',
    true,
    7
  ),

  -- 8. Monochrome Sophisticated - Sleek, dramatic, bold
  (
    'https://images.pexels.com/photos/1933873/pexels-photo-1933873.jpeg',
    ARRAY['monochrome', 'sophisticated', 'bold'],
    '{"minimal": 85, "bold": 80, "refined": 75}'::jsonb,
    ARRAY['#000000', '#FFFFFF', '#808080'],
    'work',
    'all',
    true,
    8
  ),

  -- 9. Coastal Casual - Breezy, light, relaxed
  (
    'https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg',
    ARRAY['coastal', 'casual', 'breezy'],
    '{"relaxed": 90, "bohemian": 60, "minimal": 55}'::jsonb,
    ARRAY['#87CEEB', '#FFFFFF', '#F0E68C'],
    'casual',
    'summer',
    true,
    9
  ),

  -- 10. Bold Statement - Confident, colorful, expressive
  (
    'https://images.pexels.com/photos/1926620/pexels-photo-1926620.jpeg',
    ARRAY['bold', 'statement', 'colorful'],
    '{"bold": 95, "artistic": 80, "urban": 60}'::jsonb,
    ARRAY['#FF6347', '#FFD700', '#4169E1'],
    'date',
    'all',
    true,
    10
  )
ON CONFLICT (id) DO NOTHING;
