/*
  # Seed Female Mood Photos Across v2 Archetypes

  1. Goal
    - Expand female mood-photo coverage so women get gender-appropriate swipe cards
    - Align with v2 engine archetype keys (UPPERCASE):
      MINIMALIST, CLASSIC, SMART_CASUAL, STREETWEAR, AVANT_GARDE, BUSINESS
    - Include mature (45-65) segment for CLASSIC and SMART_CASUAL

  2. Coverage
    - MINIMALIST: 3 photos
    - CLASSIC: 3 photos
    - BUSINESS: 2 photos
    - SMART_CASUAL: 2 photos
    - BOHEMIAN (mapped to AVANT_GARDE with boho tags): 2 photos
    - ROMANTIC (mapped to CLASSIC with romantic tags): 2 photos
    - STREETWEAR: 2 photos
    - AVANT_GARDE: 1 photo
    - MATURE 45-65: 4 photos (2 CLASSIC, 2 SMART_CASUAL)
    Total: 21 female mood photos

  3. Data conventions
    - archetype_weights uses 0-100 scale (primary 85-95, secondary 40-70, tertiary 20-40)
    - UPPERCASE archetype keys matching src/config/archetypes.ts
    - image_url uses placeholder storage paths (mood_photos/female/{archetype}_{nn}.jpg)
      -- admin uploads real images later into the mood_photos storage bucket
    - style_attributes includes numeric formality/boldness plus silhouette/materials/vibe
    - display_order starts at 100 so these rows appear after any existing seeds without collisions

  4. Notes
    - active=true for all rows
    - gender='female' uniformly
    - Uses ON CONFLICT DO NOTHING at row level is not possible (id is serial); instead relies
      on running this migration exactly once against an environment that needs female coverage.
*/

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

-- ==========================================
-- MINIMALIST (3)
-- ==========================================

-- 1. Scandi-minimal knitwear + straight trouser — COS/Arket vibe
(
  'mood_photos/female/minimalist_01.jpg',
  ARRAY['minimalist', 'clean', 'neutral', 'refined', 'effortless'],
  '{"MINIMALIST": 92, "CLASSIC": 55, "SMART_CASUAL": 35}'::jsonb,
  ARRAY['#F5F1EB', '#D9CFC2', '#2E2B27'],
  '{"formality": 55, "boldness": 15, "structure": 60, "comfort": 80, "silhouette": "straight", "materials": ["merino", "wol", "katoen"], "vibe": "clean timeless"}'::jsonb,
  true,
  100,
  'female'
),

-- 2. Monochrome tailored — black turtleneck + tapered trouser
(
  'mood_photos/female/minimalist_02.jpg',
  ARRAY['minimalist', 'monochrome', 'architectural', 'polished'],
  '{"MINIMALIST": 90, "BUSINESS": 50, "CLASSIC": 40}'::jsonb,
  ARRAY['#1A1A1A', '#4A4A4A', '#FFFFFF'],
  '{"formality": 70, "boldness": 25, "structure": 75, "comfort": 65, "silhouette": "tailored", "materials": ["wol", "viscose", "katoen"], "vibe": "architectural"}'::jsonb,
  true,
  101,
  'female'
),

-- 3. Soft neutrals — oversize shirt + relaxed pant
(
  'mood_photos/female/minimalist_03.jpg',
  ARRAY['minimalist', 'soft', 'neutral', 'relaxed'],
  '{"MINIMALIST": 88, "SMART_CASUAL": 60, "CLASSIC": 30}'::jsonb,
  ARRAY['#E8DFD3', '#C8BBA8', '#FFFFFF'],
  '{"formality": 40, "boldness": 15, "structure": 50, "comfort": 85, "silhouette": "relaxed", "materials": ["linnen", "katoen", "tencel"], "vibe": "quiet luxury"}'::jsonb,
  true,
  102,
  'female'
),

-- ==========================================
-- CLASSIC (3)
-- ==========================================

-- 4. Navy-camel timeless — trenchcoat + loafer
(
  'mood_photos/female/classic_01.jpg',
  ARRAY['classic', 'timeless', 'preppy', 'refined', 'heritage'],
  '{"CLASSIC": 93, "MINIMALIST": 55, "BUSINESS": 40}'::jsonb,
  ARRAY['#2C3E50', '#C8A678', '#FFFFFF'],
  '{"formality": 70, "boldness": 30, "structure": 75, "comfort": 70, "silhouette": "tailored", "materials": ["wol", "katoen", "leer"], "vibe": "tijdloos"}'::jsonb,
  true,
  103,
  'female'
),

-- 5. Massimo Dutti polished — crisp white shirt + wool trouser
(
  'mood_photos/female/classic_02.jpg',
  ARRAY['classic', 'polished', 'refined', 'feminine'],
  '{"CLASSIC": 90, "BUSINESS": 55, "MINIMALIST": 45}'::jsonb,
  ARRAY['#FFFFFF', '#8A7760', '#2C3E50'],
  '{"formality": 75, "boldness": 25, "structure": 80, "comfort": 70, "silhouette": "tailored", "materials": ["katoen", "wol", "zijde"], "vibe": "verzorgd"}'::jsonb,
  true,
  104,
  'female'
),

-- 6. Equestrian-inspired — knit + midi-skirt + riding boot
(
  'mood_photos/female/classic_03.jpg',
  ARRAY['classic', 'heritage', 'equestrian', 'elegant'],
  '{"CLASSIC": 88, "SMART_CASUAL": 50, "MINIMALIST": 30}'::jsonb,
  ARRAY['#6B4E3B', '#F5E6D3', '#1A1A1A'],
  '{"formality": 65, "boldness": 35, "structure": 70, "comfort": 75, "silhouette": "tailored", "materials": ["wol", "leer", "kasjmier"], "vibe": "heritage"}'::jsonb,
  true,
  105,
  'female'
),

-- ==========================================
-- BUSINESS (2)
-- ==========================================

-- 7. Mantelpak — structured blazer + matching trouser
(
  'mood_photos/female/business_01.jpg',
  ARRAY['business', 'formal', 'professional', 'structured', 'power'],
  '{"BUSINESS": 94, "CLASSIC": 60, "MINIMALIST": 40}'::jsonb,
  ARRAY['#1C1E26', '#FFFFFF', '#6B6B6B'],
  '{"formality": 92, "boldness": 45, "structure": 95, "comfort": 55, "silhouette": "tailored", "materials": ["wol", "viscose", "polyester"], "vibe": "executive"}'::jsonb,
  true,
  106,
  'female'
),

-- 8. Blazer + kokerrok — boardroom ready
(
  'mood_photos/female/business_02.jpg',
  ARRAY['business', 'professional', 'formal', 'polished'],
  '{"BUSINESS": 92, "CLASSIC": 65, "MINIMALIST": 35}'::jsonb,
  ARRAY['#2C3E50', '#E8E8E8', '#1A1A1A'],
  '{"formality": 90, "boldness": 40, "structure": 92, "comfort": 60, "silhouette": "tailored", "materials": ["wol", "katoen", "leer"], "vibe": "formeel zakelijk"}'::jsonb,
  true,
  107,
  'female'
),

-- ==========================================
-- SMART_CASUAL (2)
-- ==========================================

-- 9. Blazer + rauwe denim — casual maar verzorgd
(
  'mood_photos/female/smart_casual_01.jpg',
  ARRAY['smart_casual', 'elevated', 'versatile', 'polished'],
  '{"SMART_CASUAL": 90, "CLASSIC": 55, "MINIMALIST": 40}'::jsonb,
  ARRAY['#2C3E50', '#C8B89A', '#1A3A5C'],
  '{"formality": 55, "boldness": 35, "structure": 65, "comfort": 75, "silhouette": "tailored", "materials": ["wol", "denim", "katoen"], "vibe": "gepolijst"}'::jsonb,
  true,
  108,
  'female'
),

-- 10. Overshirt + wijde broek + loafer
(
  'mood_photos/female/smart_casual_02.jpg',
  ARRAY['smart_casual', 'relaxed', 'refined', 'effortless'],
  '{"SMART_CASUAL": 88, "MINIMALIST": 55, "CLASSIC": 40}'::jsonb,
  ARRAY['#A8926D', '#F0E8DC', '#3D3D3D'],
  '{"formality": 50, "boldness": 30, "structure": 55, "comfort": 85, "silhouette": "relaxed", "materials": ["linnen", "katoen", "leer"], "vibe": "toegankelijk"}'::jsonb,
  true,
  109,
  'female'
),

-- ==========================================
-- BOHEMIAN (2) — mapped to AVANT_GARDE primary with boho tags
-- ==========================================

-- 11. Flowing printed maxi + layered jewelry
(
  'mood_photos/female/bohemian_01.jpg',
  ARRAY['bohemian', 'flowing', 'earthy', 'artistic', 'free_spirited'],
  '{"AVANT_GARDE": 85, "SMART_CASUAL": 45, "CLASSIC": 25}'::jsonb,
  ARRAY['#A0522D', '#E8C89C', '#5D4037'],
  '{"formality": 30, "boldness": 65, "structure": 30, "comfort": 90, "silhouette": "relaxed", "materials": ["viscose", "linnen", "katoen"], "vibe": "boho eclectic"}'::jsonb,
  true,
  110,
  'female'
),

-- 12. Crochet top + wide corduroy pant
(
  'mood_photos/female/bohemian_02.jpg',
  ARRAY['bohemian', 'textured', 'natural', 'artisan'],
  '{"AVANT_GARDE": 80, "SMART_CASUAL": 50, "STREETWEAR": 25}'::jsonb,
  ARRAY['#C8A678', '#8B6F47', '#F5E6D3'],
  '{"formality": 25, "boldness": 55, "structure": 35, "comfort": 92, "silhouette": "relaxed", "materials": ["katoen", "ribstof", "wol"], "vibe": "artisan craft"}'::jsonb,
  true,
  111,
  'female'
),

-- ==========================================
-- ROMANTIC (2) — mapped to CLASSIC primary with romantic/feminine tags
-- ==========================================

-- 13. Pastel midi + delicate knit
(
  'mood_photos/female/romantic_01.jpg',
  ARRAY['romantic', 'feminine', 'soft', 'pastel', 'delicate'],
  '{"CLASSIC": 85, "SMART_CASUAL": 50, "AVANT_GARDE": 30}'::jsonb,
  ARRAY['#F8D7D7', '#E8C8D4', '#FFFFFF'],
  '{"formality": 55, "boldness": 25, "structure": 45, "comfort": 80, "silhouette": "feminine", "materials": ["zijde", "katoen", "kasjmier"], "vibe": "zacht romantisch"}'::jsonb,
  true,
  112,
  'female'
),

-- 14. Ruffle blouse + high-waist trouser
(
  'mood_photos/female/romantic_02.jpg',
  ARRAY['romantic', 'feminine', 'ruffle', 'elegant'],
  '{"CLASSIC": 82, "BUSINESS": 45, "AVANT_GARDE": 30}'::jsonb,
  ARRAY['#F2E8E0', '#C9A6A0', '#5D4037'],
  '{"formality": 65, "boldness": 35, "structure": 55, "comfort": 75, "silhouette": "feminine", "materials": ["zijde", "viscose", "wol"], "vibe": "verfijnd vrouwelijk"}'::jsonb,
  true,
  113,
  'female'
),

-- ==========================================
-- STREETWEAR (2)
-- ==========================================

-- 15. Oversized hoodie + wide jeans + chunky sneaker
(
  'mood_photos/female/streetwear_01.jpg',
  ARRAY['streetwear', 'urban', 'oversized', 'relaxed', 'expressive'],
  '{"STREETWEAR": 92, "AVANT_GARDE": 45, "SMART_CASUAL": 30}'::jsonb,
  ARRAY['#1A1A1A', '#E8E8E8', '#B8B8B8'],
  '{"formality": 20, "boldness": 70, "structure": 40, "comfort": 95, "silhouette": "oversized", "materials": ["katoen", "denim", "fleece"], "vibe": "urban"}'::jsonb,
  true,
  114,
  'female'
),

-- 16. Cargo + cropped tee + high-top sneaker
(
  'mood_photos/female/streetwear_02.jpg',
  ARRAY['streetwear', 'utility', 'cropped', 'bold'],
  '{"STREETWEAR": 90, "AVANT_GARDE": 40, "SMART_CASUAL": 25}'::jsonb,
  ARRAY['#3D3D3D', '#6B6B6B', '#FFFFFF'],
  '{"formality": 20, "boldness": 75, "structure": 45, "comfort": 90, "silhouette": "relaxed", "materials": ["canvas", "katoen", "denim"], "vibe": "utility street"}'::jsonb,
  true,
  115,
  'female'
),

-- ==========================================
-- AVANT_GARDE (1)
-- ==========================================

-- 17. Asymmetric dark drape + architectural boot
(
  'mood_photos/female/avant_garde_01.jpg',
  ARRAY['avant_garde', 'experimental', 'asymmetric', 'dark', 'architectural'],
  '{"AVANT_GARDE": 94, "STREETWEAR": 50, "MINIMALIST": 35}'::jsonb,
  ARRAY['#0A0A0A', '#2C2C2C', '#6B6B6B'],
  '{"formality": 55, "boldness": 90, "structure": 70, "comfort": 60, "silhouette": "asymmetric", "materials": ["wol", "leer", "technische stof"], "vibe": "experimenteel donker"}'::jsonb,
  true,
  116,
  'female'
),

-- ==========================================
-- MATURE 45-65 — CLASSIC (2)
-- ==========================================

-- 18. Kasjmier twinset + tailored trouser
(
  'mood_photos/female/classic_mature_01.jpg',
  ARRAY['classic', 'mature', 'elegant', 'refined', 'timeless'],
  '{"CLASSIC": 92, "BUSINESS": 55, "MINIMALIST": 40}'::jsonb,
  ARRAY['#8A7760', '#F5E6D3', '#2C3E50'],
  '{"formality": 75, "boldness": 25, "structure": 75, "comfort": 80, "silhouette": "tailored", "materials": ["kasjmier", "wol", "zijde"], "vibe": "mature elegant", "age_group": "45-65"}'::jsonb,
  true,
  117,
  'female'
),

-- 19. Trenchcoat + wol rok + loafer
(
  'mood_photos/female/classic_mature_02.jpg',
  ARRAY['classic', 'mature', 'timeless', 'heritage', 'refined'],
  '{"CLASSIC": 90, "BUSINESS": 50, "MINIMALIST": 45}'::jsonb,
  ARRAY['#C8A678', '#2C3E50', '#FFFFFF'],
  '{"formality": 72, "boldness": 30, "structure": 78, "comfort": 75, "silhouette": "tailored", "materials": ["wol", "katoen", "leer"], "vibe": "mature heritage", "age_group": "45-65"}'::jsonb,
  true,
  118,
  'female'
),

-- ==========================================
-- MATURE 45-65 — SMART_CASUAL (2)
-- ==========================================

-- 20. Linnen broek + zijde blouse + suède loafer
(
  'mood_photos/female/smart_casual_mature_01.jpg',
  ARRAY['smart_casual', 'mature', 'refined', 'elegant', 'timeless'],
  '{"SMART_CASUAL": 88, "CLASSIC": 60, "MINIMALIST": 40}'::jsonb,
  ARRAY['#E8DFD3', '#A8926D', '#3D3D3D'],
  '{"formality": 55, "boldness": 25, "structure": 55, "comfort": 85, "silhouette": "relaxed", "materials": ["linnen", "zijde", "suède"], "vibe": "mature refined", "age_group": "45-65"}'::jsonb,
  true,
  119,
  'female'
),

-- 21. Kasjmier trui + chino + suède boot
(
  'mood_photos/female/smart_casual_mature_02.jpg',
  ARRAY['smart_casual', 'mature', 'cozy', 'refined', 'timeless'],
  '{"SMART_CASUAL": 85, "CLASSIC": 65, "MINIMALIST": 45}'::jsonb,
  ARRAY['#C8B89A', '#6B4E3B', '#F5F1EB'],
  '{"formality": 50, "boldness": 30, "structure": 50, "comfort": 88, "silhouette": "relaxed", "materials": ["kasjmier", "katoen", "suède"], "vibe": "mature cozy", "age_group": "45-65"}'::jsonb,
  true,
  120,
  'female'
);
