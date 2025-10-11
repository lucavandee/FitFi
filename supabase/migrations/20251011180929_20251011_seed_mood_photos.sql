/*
  # Seed Mood Photos for Visual Preference Engine

  1. Purpose
    - Populate mood_photos with 10 curated style images
    - Each photo has archetype weights for preference learning
    - Dominant colors extracted for color harmony analysis
  
  2. Photo Selection Strategy
    - Classic: Timeless, structured, neutral
    - Minimalist: Clean lines, simple, monochrome
    - Romantic: Soft, flowing, feminine
    - Bohemian: Free-spirited, layered, eclectic
    - Edgy: Bold, asymmetric, dark
    - Streetwear: Urban, casual, trendy
  
  3. Notes
    - Photos are Pexels stock images (free to use)
    - Archetype weights sum to 1.0 for each photo
    - Used for swipe-based preference discovery
*/

-- Insert 10 curated mood photos
INSERT INTO mood_photos (image_url, archetype_weights, dominant_colors, mood_tags, style_attributes)
VALUES
  (
    'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg',
    '{"classic": 0.8, "minimalist": 0.2}',
    ARRAY['#2C2C2C', '#FFFFFF', '#8B7355'],
    ARRAY['structured', 'timeless', 'professional'],
    '{"formality": 0.9, "complexity": 0.3}'
  ),
  (
    'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg',
    '{"minimalist": 0.9, "classic": 0.1}',
    ARRAY['#FFFFFF', '#E8E8E8', '#F5F5F5'],
    ARRAY['clean', 'simple', 'modern'],
    '{"formality": 0.5, "complexity": 0.1}'
  ),
  (
    'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg',
    '{"romantic": 0.7, "bohemian": 0.3}',
    ARRAY['#FFE5E5', '#FFC0CB', '#FFFFFF'],
    ARRAY['soft', 'flowing', 'feminine'],
    '{"formality": 0.3, "complexity": 0.6}'
  ),
  (
    'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg',
    '{"bohemian": 0.8, "romantic": 0.2}',
    ARRAY['#8B7355', '#D4A574', '#FFFFFF'],
    ARRAY['eclectic', 'layered', 'free-spirited'],
    '{"formality": 0.2, "complexity": 0.8}'
  ),
  (
    'https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg',
    '{"edgy": 0.8, "streetwear": 0.2}',
    ARRAY['#000000', '#2C2C2C', '#FFFFFF'],
    ARRAY['bold', 'asymmetric', 'urban'],
    '{"formality": 0.4, "complexity": 0.7}'
  ),
  (
    'https://images.pexels.com/photos/1332189/pexels-photo-1332189.jpeg',
    '{"streetwear": 0.7, "minimalist": 0.3}',
    ARRAY['#3C3C3C', '#FFFFFF', '#FF5722'],
    ARRAY['casual', 'urban', 'trendy'],
    '{"formality": 0.3, "complexity": 0.5}'
  ),
  (
    'https://images.pexels.com/photos/1926620/pexels-photo-1926620.jpeg',
    '{"classic": 0.6, "romantic": 0.4}',
    ARRAY['#2C2C2C', '#FFFFFF', '#B8860B'],
    ARRAY['elegant', 'tailored', 'refined'],
    '{"formality": 0.8, "complexity": 0.4}'
  ),
  (
    'https://images.pexels.com/photos/1848471/pexels-photo-1848471.jpeg',
    '{"minimalist": 0.6, "edgy": 0.4}',
    ARRAY['#000000', '#FFFFFF', '#808080'],
    ARRAY['monochrome', 'architectural', 'bold'],
    '{"formality": 0.6, "complexity": 0.3}'
  ),
  (
    'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg',
    '{"romantic": 0.8, "classic": 0.2}',
    ARRAY['#FFE5E5', '#FFFFFF', '#D4A574'],
    ARRAY['delicate', 'soft', 'graceful'],
    '{"formality": 0.5, "complexity": 0.5}'
  ),
  (
    'https://images.pexels.com/photos/1933873/pexels-photo-1933873.jpeg',
    '{"bohemian": 0.6, "streetwear": 0.4}',
    ARRAY['#8B7355', '#FFFFFF', '#3C3C3C'],
    ARRAY['relaxed', 'layered', 'textured'],
    '{"formality": 0.2, "complexity": 0.7}'
  )
ON CONFLICT DO NOTHING;
