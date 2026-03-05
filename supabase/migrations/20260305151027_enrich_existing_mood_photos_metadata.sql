/*
  # Enrich Existing Mood Photos with Complete Metadata

  1. Problem
    - All 46 active mood photos have empty archetype_weights, dominant_colors, and style_attributes
    - The recommendation engine relies on these fields for accurate style profiling
    - Without this data, swipe analysis produces weak/inaccurate archetype detection

  2. Changes
    - Populates `archetype_weights` (JSONB) with weighted scores across 6 archetypes
      (MINIMALIST, CLASSIC, SMART_CASUAL, STREETWEAR, ATHLETIC, AVANT_GARDE)
    - Populates `dominant_colors` (text[]) with Dutch color names matching the ArchetypeDetector
    - Populates `style_attributes` (JSONB) with formality (0-1) and boldness (0-1)

  3. Archetype weight rules
    - Weights sum to 1.0 per photo
    - Primary archetype gets 0.5-0.8, secondary gets 0.1-0.3, tertiary gets 0.05-0.15
    - Cross-archetype photos intentionally span two styles for nuance detection

  4. Important Notes
    - Only updates rows where archetype_weights = '{}'
    - Does not modify image_url, mood_tags, gender, or active status
    - Data derived from manual analysis of existing mood_tags
*/

-- =============================================
-- MALE PHOTOS (IDs 123-147)
-- =============================================

-- ID 123: minimal, clean, monochrome, sophisticated, zwart, grijs
UPDATE mood_photos SET
  archetype_weights = '{"MINIMALIST": 0.75, "CLASSIC": 0.15, "SMART_CASUAL": 0.10}',
  dominant_colors = ARRAY['zwart', 'grijs'],
  style_attributes = '{"formality": 0.5, "boldness": 0.15}'
WHERE id = 123 AND archetype_weights = '{}';

-- ID 124: minimal, layered, urban, grijs, zwart, dutch
UPDATE mood_photos SET
  archetype_weights = '{"MINIMALIST": 0.55, "STREETWEAR": 0.25, "SMART_CASUAL": 0.20}',
  dominant_colors = ARRAY['grijs', 'zwart'],
  style_attributes = '{"formality": 0.35, "boldness": 0.25}'
WHERE id = 124 AND archetype_weights = '{}';

-- ID 125: minimal, summer, fresh, dutch, wit
UPDATE mood_photos SET
  archetype_weights = '{"MINIMALIST": 0.60, "SMART_CASUAL": 0.30, "CLASSIC": 0.10}',
  dominant_colors = ARRAY['wit'],
  style_attributes = '{"formality": 0.3, "boldness": 0.10}'
WHERE id = 125 AND archetype_weights = '{}';

-- ID 126: minimal, tonal, sophisticated, warm, beige, camel
UPDATE mood_photos SET
  archetype_weights = '{"MINIMALIST": 0.55, "CLASSIC": 0.30, "SMART_CASUAL": 0.15}',
  dominant_colors = ARRAY['beige', 'camel'],
  style_attributes = '{"formality": 0.55, "boldness": 0.10}'
WHERE id = 126 AND archetype_weights = '{}';

-- ID 128: minimal, edge, monochrome, night, zwart
UPDATE mood_photos SET
  archetype_weights = '{"MINIMALIST": 0.50, "AVANT_GARDE": 0.35, "STREETWEAR": 0.15}',
  dominant_colors = ARRAY['zwart'],
  style_attributes = '{"formality": 0.4, "boldness": 0.45}'
WHERE id = 128 AND archetype_weights = '{}';

-- ID 129: minimal, classic, refined, dutch, navy, beige
UPDATE mood_photos SET
  archetype_weights = '{"CLASSIC": 0.45, "MINIMALIST": 0.40, "SMART_CASUAL": 0.15}',
  dominant_colors = ARRAY['navy', 'beige'],
  style_attributes = '{"formality": 0.6, "boldness": 0.10}'
WHERE id = 129 AND archetype_weights = '{}';

-- ID 130: streetwear, urban, oversized, amsterdam, grijs, zwart
UPDATE mood_photos SET
  archetype_weights = '{"STREETWEAR": 0.75, "AVANT_GARDE": 0.15, "MINIMALIST": 0.10}',
  dominant_colors = ARRAY['grijs', 'zwart'],
  style_attributes = '{"formality": 0.15, "boldness": 0.55}'
WHERE id = 130 AND archetype_weights = '{}';

-- ID 131: streetwear, denim, casual, dutch, blauw, wit
UPDATE mood_photos SET
  archetype_weights = '{"STREETWEAR": 0.50, "SMART_CASUAL": 0.35, "CLASSIC": 0.15}',
  dominant_colors = ARRAY['blauw', 'wit'],
  style_attributes = '{"formality": 0.25, "boldness": 0.30}'
WHERE id = 131 AND archetype_weights = '{}';

-- ID 132: streetwear, tech, urban, modern, groen, zwart
UPDATE mood_photos SET
  archetype_weights = '{"STREETWEAR": 0.60, "ATHLETIC": 0.25, "MINIMALIST": 0.15}',
  dominant_colors = ARRAY['groen', 'zwart'],
  style_attributes = '{"formality": 0.15, "boldness": 0.50}'
WHERE id = 132 AND archetype_weights = '{}';

-- ID 133: streetwear, layered, grunge, oversized, zwart, grijs
UPDATE mood_photos SET
  archetype_weights = '{"STREETWEAR": 0.65, "AVANT_GARDE": 0.25, "MINIMALIST": 0.10}',
  dominant_colors = ARRAY['zwart', 'grijs'],
  style_attributes = '{"formality": 0.10, "boldness": 0.65}'
WHERE id = 133 AND archetype_weights = '{}';

-- ID 134: streetwear, vintage, sporty, refined, navy, wit
UPDATE mood_photos SET
  archetype_weights = '{"STREETWEAR": 0.40, "CLASSIC": 0.30, "ATHLETIC": 0.30}',
  dominant_colors = ARRAY['navy', 'wit'],
  style_attributes = '{"formality": 0.30, "boldness": 0.30}'
WHERE id = 134 AND archetype_weights = '{}';

-- ID 135: smart-casual, blazer, modern, versatile, navy, wit
UPDATE mood_photos SET
  archetype_weights = '{"SMART_CASUAL": 0.55, "CLASSIC": 0.30, "MINIMALIST": 0.15}',
  dominant_colors = ARRAY['navy', 'wit'],
  style_attributes = '{"formality": 0.60, "boldness": 0.15}'
WHERE id = 135 AND archetype_weights = '{}';

-- ID 136: classic, knit, sophisticated, warm, beige, grijs
UPDATE mood_photos SET
  archetype_weights = '{"CLASSIC": 0.55, "SMART_CASUAL": 0.30, "MINIMALIST": 0.15}',
  dominant_colors = ARRAY['beige', 'grijs'],
  style_attributes = '{"formality": 0.55, "boldness": 0.10}'
WHERE id = 136 AND archetype_weights = '{}';

-- ID 137: classic, preppy, layered, casual, grijs, wit
UPDATE mood_photos SET
  archetype_weights = '{"CLASSIC": 0.60, "SMART_CASUAL": 0.30, "MINIMALIST": 0.10}',
  dominant_colors = ARRAY['grijs', 'wit'],
  style_attributes = '{"formality": 0.50, "boldness": 0.15}'
WHERE id = 137 AND archetype_weights = '{}';

-- ID 138: smart-casual, layered, modern, minimal, beige, zwart
UPDATE mood_photos SET
  archetype_weights = '{"SMART_CASUAL": 0.45, "MINIMALIST": 0.40, "CLASSIC": 0.15}',
  dominant_colors = ARRAY['beige', 'zwart'],
  style_attributes = '{"formality": 0.45, "boldness": 0.15}'
WHERE id = 138 AND archetype_weights = '{}';

-- ID 139: classic, oxford, timeless, preppy, blauw, beige
UPDATE mood_photos SET
  archetype_weights = '{"CLASSIC": 0.70, "SMART_CASUAL": 0.20, "MINIMALIST": 0.10}',
  dominant_colors = ARRAY['blauw', 'beige'],
  style_attributes = '{"formality": 0.65, "boldness": 0.10}'
WHERE id = 139 AND archetype_weights = '{}';

-- ID 140: athletic, tech, minimal, urban, zwart, wit
UPDATE mood_photos SET
  archetype_weights = '{"ATHLETIC": 0.55, "MINIMALIST": 0.25, "STREETWEAR": 0.20}',
  dominant_colors = ARRAY['zwart', 'wit'],
  style_attributes = '{"formality": 0.15, "boldness": 0.30}'
WHERE id = 140 AND archetype_weights = '{}';

-- ID 141: athletic, athleisure, minimal, tonal, grijs
UPDATE mood_photos SET
  archetype_weights = '{"ATHLETIC": 0.50, "MINIMALIST": 0.35, "SMART_CASUAL": 0.15}',
  dominant_colors = ARRAY['grijs'],
  style_attributes = '{"formality": 0.15, "boldness": 0.15}'
WHERE id = 141 AND archetype_weights = '{}';

-- ID 142: athletic, vintage, streetwear, retro, navy, wit
UPDATE mood_photos SET
  archetype_weights = '{"ATHLETIC": 0.40, "STREETWEAR": 0.40, "CLASSIC": 0.20}',
  dominant_colors = ARRAY['navy', 'wit'],
  style_attributes = '{"formality": 0.20, "boldness": 0.35}'
WHERE id = 142 AND archetype_weights = '{}';

-- ID 143: athletic, performance, minimal, sleek, zwart, wit
UPDATE mood_photos SET
  archetype_weights = '{"ATHLETIC": 0.65, "MINIMALIST": 0.25, "STREETWEAR": 0.10}',
  dominant_colors = ARRAY['zwart', 'wit'],
  style_attributes = '{"formality": 0.10, "boldness": 0.20}'
WHERE id = 143 AND archetype_weights = '{}';

-- ID 144: rugged, denim, workwear, sustainable, indigo
UPDATE mood_photos SET
  archetype_weights = '{"CLASSIC": 0.40, "STREETWEAR": 0.35, "SMART_CASUAL": 0.25}',
  dominant_colors = ARRAY['blauw'],
  style_attributes = '{"formality": 0.25, "boldness": 0.35}'
WHERE id = 144 AND archetype_weights = '{}';

-- ID 145: rugged, utility, vintage, masculine, groen, wit
UPDATE mood_photos SET
  archetype_weights = '{"STREETWEAR": 0.40, "CLASSIC": 0.35, "SMART_CASUAL": 0.25}',
  dominant_colors = ARRAY['groen', 'wit'],
  style_attributes = '{"formality": 0.20, "boldness": 0.35}'
WHERE id = 145 AND archetype_weights = '{}';

-- ID 146: rugged, wool, heritage, autumn, grijs, zwart
UPDATE mood_photos SET
  archetype_weights = '{"CLASSIC": 0.50, "SMART_CASUAL": 0.30, "MINIMALIST": 0.20}',
  dominant_colors = ARRAY['grijs', 'zwart'],
  style_attributes = '{"formality": 0.45, "boldness": 0.25}'
WHERE id = 146 AND archetype_weights = '{}';

-- ID 147: avant-garde, architectural, dramatic, fashion, zwart
UPDATE mood_photos SET
  archetype_weights = '{"AVANT_GARDE": 0.80, "MINIMALIST": 0.15, "STREETWEAR": 0.05}',
  dominant_colors = ARRAY['zwart'],
  style_attributes = '{"formality": 0.40, "boldness": 0.85}'
WHERE id = 147 AND archetype_weights = '{}';

-- =============================================
-- FEMALE PHOTOS (IDs 148-170)
-- =============================================

-- ID 148: minimal, power, sophisticated, clean, wit, zwart
UPDATE mood_photos SET
  archetype_weights = '{"MINIMALIST": 0.65, "CLASSIC": 0.25, "SMART_CASUAL": 0.10}',
  dominant_colors = ARRAY['wit', 'zwart'],
  style_attributes = '{"formality": 0.60, "boldness": 0.20}'
WHERE id = 148 AND archetype_weights = '{}';

-- ID 149: minimal, tonal, elegant, warm, beige, camel
UPDATE mood_photos SET
  archetype_weights = '{"MINIMALIST": 0.55, "CLASSIC": 0.30, "SMART_CASUAL": 0.15}',
  dominant_colors = ARRAY['beige', 'camel'],
  style_attributes = '{"formality": 0.55, "boldness": 0.10}'
WHERE id = 149 AND archetype_weights = '{}';

-- ID 150: minimal, casual, effortless, chic, zwart, wit
UPDATE mood_photos SET
  archetype_weights = '{"MINIMALIST": 0.55, "SMART_CASUAL": 0.35, "CLASSIC": 0.10}',
  dominant_colors = ARRAY['zwart', 'wit'],
  style_attributes = '{"formality": 0.35, "boldness": 0.15}'
WHERE id = 150 AND archetype_weights = '{}';

-- ID 151: minimal, cozy, knit, sophisticated, grijs, zwart
UPDATE mood_photos SET
  archetype_weights = '{"MINIMALIST": 0.50, "SMART_CASUAL": 0.30, "CLASSIC": 0.20}',
  dominant_colors = ARRAY['grijs', 'zwart'],
  style_attributes = '{"formality": 0.40, "boldness": 0.10}'
WHERE id = 151 AND archetype_weights = '{}';

-- ID 152: minimal, summer, fresh, power, wit
UPDATE mood_photos SET
  archetype_weights = '{"MINIMALIST": 0.60, "CLASSIC": 0.25, "SMART_CASUAL": 0.15}',
  dominant_colors = ARRAY['wit'],
  style_attributes = '{"formality": 0.45, "boldness": 0.15}'
WHERE id = 152 AND archetype_weights = '{}';

-- ID 153: minimal, classic, stripes, dutch, navy, wit
UPDATE mood_photos SET
  archetype_weights = '{"CLASSIC": 0.45, "MINIMALIST": 0.40, "SMART_CASUAL": 0.15}',
  dominant_colors = ARRAY['navy', 'wit'],
  style_attributes = '{"formality": 0.50, "boldness": 0.15}'
WHERE id = 153 AND archetype_weights = '{}';

-- ID 154: romantic, feminine, flowing, soft, roze, goud
UPDATE mood_photos SET
  archetype_weights = '{"CLASSIC": 0.40, "SMART_CASUAL": 0.30, "AVANT_GARDE": 0.30}',
  dominant_colors = ARRAY['roze', 'goud'],
  style_attributes = '{"formality": 0.55, "boldness": 0.30}'
WHERE id = 154 AND archetype_weights = '{}';

-- ID 155: romantic, elegant, evening, feminine, burgundy, nude
UPDATE mood_photos SET
  archetype_weights = '{"CLASSIC": 0.50, "AVANT_GARDE": 0.30, "SMART_CASUAL": 0.20}',
  dominant_colors = ARRAY['bordeaux', 'nude'],
  style_attributes = '{"formality": 0.75, "boldness": 0.35}'
WHERE id = 155 AND archetype_weights = '{}';

-- ID 156: romantic, knit, casual, soft, blush, wit
UPDATE mood_photos SET
  archetype_weights = '{"SMART_CASUAL": 0.45, "CLASSIC": 0.35, "MINIMALIST": 0.20}',
  dominant_colors = ARRAY['roze', 'wit'],
  style_attributes = '{"formality": 0.30, "boldness": 0.10}'
WHERE id = 156 AND archetype_weights = '{}';

-- ID 157: classic, professional, tailored, power, navy, wit
UPDATE mood_photos SET
  archetype_weights = '{"CLASSIC": 0.65, "SMART_CASUAL": 0.20, "MINIMALIST": 0.15}',
  dominant_colors = ARRAY['navy', 'wit'],
  style_attributes = '{"formality": 0.75, "boldness": 0.15}'
WHERE id = 157 AND archetype_weights = '{}';

-- ID 158: classic, preppy, knit, refined, cream, camel
UPDATE mood_photos SET
  archetype_weights = '{"CLASSIC": 0.60, "SMART_CASUAL": 0.25, "MINIMALIST": 0.15}',
  dominant_colors = ARRAY['creme', 'camel'],
  style_attributes = '{"formality": 0.55, "boldness": 0.10}'
WHERE id = 158 AND archetype_weights = '{}';

-- ID 159: classic, tailored, sophisticated, minimal, zwart, grijs
UPDATE mood_photos SET
  archetype_weights = '{"CLASSIC": 0.50, "MINIMALIST": 0.40, "SMART_CASUAL": 0.10}',
  dominant_colors = ARRAY['zwart', 'grijs'],
  style_attributes = '{"formality": 0.65, "boldness": 0.15}'
WHERE id = 159 AND archetype_weights = '{}';

-- ID 160: classic, oxford, relaxed, preppy, blauw, beige
UPDATE mood_photos SET
  archetype_weights = '{"CLASSIC": 0.55, "SMART_CASUAL": 0.35, "MINIMALIST": 0.10}',
  dominant_colors = ARRAY['blauw', 'beige'],
  style_attributes = '{"formality": 0.45, "boldness": 0.10}'
WHERE id = 160 AND archetype_weights = '{}';

-- ID 161: streetwear, oversized, athletic, urban, grijs, zwart
UPDATE mood_photos SET
  archetype_weights = '{"STREETWEAR": 0.55, "ATHLETIC": 0.30, "MINIMALIST": 0.15}',
  dominant_colors = ARRAY['grijs', 'zwart'],
  style_attributes = '{"formality": 0.10, "boldness": 0.50}'
WHERE id = 161 AND archetype_weights = '{}';

-- ID 162: streetwear, utility, cargo, wit, groen
UPDATE mood_photos SET
  archetype_weights = '{"STREETWEAR": 0.60, "SMART_CASUAL": 0.25, "ATHLETIC": 0.15}',
  dominant_colors = ARRAY['wit', 'groen'],
  style_attributes = '{"formality": 0.15, "boldness": 0.40}'
WHERE id = 162 AND archetype_weights = '{}';

-- ID 163: streetwear, bomber, vintage, casual, groen, wit
UPDATE mood_photos SET
  archetype_weights = '{"STREETWEAR": 0.55, "CLASSIC": 0.25, "SMART_CASUAL": 0.20}',
  dominant_colors = ARRAY['groen', 'wit'],
  style_attributes = '{"formality": 0.20, "boldness": 0.35}'
WHERE id = 163 AND archetype_weights = '{}';

-- ID 164: streetwear, bomber, vintage, casual, groen, wit (duplicate tags)
UPDATE mood_photos SET
  archetype_weights = '{"STREETWEAR": 0.55, "CLASSIC": 0.25, "SMART_CASUAL": 0.20}',
  dominant_colors = ARRAY['groen', 'wit'],
  style_attributes = '{"formality": 0.20, "boldness": 0.35}'
WHERE id = 164 AND archetype_weights = '{}';

-- ID 165: streetwear, leather, edge, urban, zwart, wit
UPDATE mood_photos SET
  archetype_weights = '{"STREETWEAR": 0.50, "AVANT_GARDE": 0.35, "MINIMALIST": 0.15}',
  dominant_colors = ARRAY['zwart', 'wit'],
  style_attributes = '{"formality": 0.20, "boldness": 0.60}'
WHERE id = 165 AND archetype_weights = '{}';

-- ID 166: boho, flowy, earthy, free-spirited, terracotta, tan
UPDATE mood_photos SET
  archetype_weights = '{"AVANT_GARDE": 0.40, "SMART_CASUAL": 0.35, "CLASSIC": 0.25}',
  dominant_colors = ARRAY['terracotta', 'bruin'],
  style_attributes = '{"formality": 0.25, "boldness": 0.40}'
WHERE id = 166 AND archetype_weights = '{}';

-- ID 167: boho, crochet, summer, sustainable, cream, beige
UPDATE mood_photos SET
  archetype_weights = '{"SMART_CASUAL": 0.40, "AVANT_GARDE": 0.35, "CLASSIC": 0.25}',
  dominant_colors = ARRAY['creme', 'beige'],
  style_attributes = '{"formality": 0.25, "boldness": 0.30}'
WHERE id = 167 AND archetype_weights = '{}';

-- ID 168: boho, vintage, eclectic, floral, multi, tan
UPDATE mood_photos SET
  archetype_weights = '{"AVANT_GARDE": 0.50, "SMART_CASUAL": 0.25, "CLASSIC": 0.25}',
  dominant_colors = ARRAY['bruin', 'groen'],
  style_attributes = '{"formality": 0.20, "boldness": 0.55}'
WHERE id = 168 AND archetype_weights = '{}';

-- ID 169: athletic, sleek, minimal, performance, zwart, wit
UPDATE mood_photos SET
  archetype_weights = '{"ATHLETIC": 0.60, "MINIMALIST": 0.30, "STREETWEAR": 0.10}',
  dominant_colors = ARRAY['zwart', 'wit'],
  style_attributes = '{"formality": 0.10, "boldness": 0.20}'
WHERE id = 169 AND archetype_weights = '{}';

-- ID 170: athletic, tech, premium, sporty, grijs, wit
UPDATE mood_photos SET
  archetype_weights = '{"ATHLETIC": 0.55, "MINIMALIST": 0.25, "SMART_CASUAL": 0.20}',
  dominant_colors = ARRAY['grijs', 'wit'],
  style_attributes = '{"formality": 0.15, "boldness": 0.20}'
WHERE id = 170 AND archetype_weights = '{}';
