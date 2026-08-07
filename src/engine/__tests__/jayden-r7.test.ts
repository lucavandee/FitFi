import { describe, it, expect } from 'vitest';
import { runEngineV2 } from '@/engine/v2';
import type { Product } from '@/engine/types';

// ─────────────────────────────────────────────────────────────────────
// FIXTURE: Realistisch streetwear-zwaar catalog met wat off-profile decoys
// om te testen of de engine Tommy Hilfiger/Ralph Lauren etc. weigert voor
// een pure streetwear user.
// ─────────────────────────────────────────────────────────────────────

const CATALOG: Product[] = [
  // ── STREETWEAR TOPS ────────────────────────────────────────────
  {
    id: 'nike_t01',
    name: 'Nike Sportswear Club Hoodie Black',
    brand: 'Nike',
    price: 64.99,
    category: 'top',
    type: 'hoodie',
    gender: 'male',
    colors: ['black'],
    color: 'black',
    materials: ['cotton', 'polyester'],
    tags: ['streetwear', 'casual', 'hoodie'],
    styleTags: ['streetwear', 'urban', 'casual'],
    description: 'Klassieke Nike hoodie in zwart katoen/polyester blend.',
    inStock: true,
  },
  {
    id: 'carhartt_t01',
    name: 'Carhartt WIP Chase Sweatshirt Black',
    brand: 'Carhartt WIP',
    price: 89.95,
    category: 'top',
    type: 'sweatshirt',
    gender: 'male',
    colors: ['black'],
    color: 'black',
    materials: ['cotton'],
    tags: ['streetwear', 'casual'],
    styleTags: ['streetwear', 'urban'],
    description: 'Carhartt WIP Chase crewneck in zware katoen.',
    inStock: true,
  },
  {
    id: 'stussy_t01',
    name: 'Stüssy Basic Stock Logo Tee White',
    brand: 'Stüssy',
    price: 54.00,
    category: 'top',
    type: 't-shirt',
    gender: 'male',
    colors: ['white'],
    color: 'white',
    materials: ['cotton'],
    tags: ['streetwear', 'casual', 'graphic'],
    styleTags: ['streetwear', 'urban', 'bold'],
    description: 'Stüssy logo tee in zwaar katoen, klassieke fit.',
    inStock: true,
  },
  {
    id: 'stussy_t02',
    name: 'Stüssy 8 Ball Fleece Crewneck Black',
    brand: 'Stüssy',
    price: 109.00,
    category: 'top',
    type: 'sweatshirt',
    gender: 'male',
    colors: ['black'],
    color: 'black',
    materials: ['cotton', 'fleece'],
    tags: ['streetwear', 'graphic'],
    styleTags: ['streetwear', 'urban', 'statement'],
    description: 'Iconische Stüssy 8 Ball crewneck met fleece binnenkant.',
    inStock: true,
  },
  {
    id: 'nike_t02',
    name: 'Nike ACG Graphic T-Shirt Neon Green',
    brand: 'Nike',
    price: 44.99,
    category: 'top',
    type: 't-shirt',
    gender: 'male',
    colors: ['green', 'white'],
    color: 'green',
    materials: ['cotton'],
    tags: ['streetwear', 'casual', 'graphic'],
    styleTags: ['streetwear', 'bold', 'statement'],
    description: 'Nike ACG statement tee met felgroen grafisch logo.',
    inStock: true,
  },
  {
    id: 'carhartt_t02',
    name: 'Carhartt WIP Script Embroidery T-Shirt White',
    brand: 'Carhartt WIP',
    price: 45.00,
    category: 'top',
    type: 't-shirt',
    gender: 'male',
    colors: ['white'],
    color: 'white',
    materials: ['cotton'],
    tags: ['streetwear', 'casual'],
    styleTags: ['streetwear', 'urban'],
    description: 'Carhartt WIP tee met borduursel op borst.',
    inStock: true,
  },
  {
    id: 'tnf_t01',
    name: 'The North Face Box Logo Tee Black',
    brand: 'The North Face',
    price: 39.99,
    category: 'top',
    type: 't-shirt',
    gender: 'male',
    colors: ['black', 'white'],
    color: 'black',
    materials: ['cotton'],
    tags: ['streetwear', 'outdoor', 'casual'],
    styleTags: ['streetwear', 'urban'],
    description: 'The North Face klassieke logo tee in zwart.',
    inStock: true,
  },

  // ── STREETWEAR BOTTOMS ─────────────────────────────────────────
  {
    id: 'carhartt_b01',
    name: 'Carhartt WIP Single Knee Pant Black',
    brand: 'Carhartt WIP',
    price: 119.00,
    category: 'bottom',
    type: 'pants',
    gender: 'male',
    colors: ['black'],
    color: 'black',
    materials: ['cotton', 'canvas'],
    tags: ['streetwear', 'workwear', 'casual'],
    styleTags: ['streetwear', 'urban', 'relaxed'],
    description: 'Carhartt WIP workwear pant, relaxte fit, iconisch silhouet.',
    inStock: true,
  },
  {
    id: 'stussy_b01',
    name: 'Stüssy Nylon Track Pant Black',
    brand: 'Stüssy',
    price: 115.00,
    category: 'bottom',
    type: 'pants',
    gender: 'male',
    colors: ['black'],
    color: 'black',
    materials: ['nylon'],
    tags: ['streetwear', 'casual', 'party'],
    styleTags: ['streetwear', 'urban', 'statement'],
    description: 'Stüssy nylon track pant in diep zwart, losse pasvorm.',
    inStock: true,
  },
  {
    id: 'nike_b01',
    name: 'Nike Tech Fleece Jogger Black',
    brand: 'Nike',
    price: 99.99,
    category: 'bottom',
    type: 'joggers',
    gender: 'male',
    colors: ['black'],
    color: 'black',
    materials: ['cotton', 'fleece', 'polyester'],
    tags: ['streetwear', 'casual'],
    styleTags: ['streetwear', 'urban', 'relaxed'],
    description: 'Nike Tech Fleece jogger — iconisch streetwear silhouet.',
    inStock: true,
  },
  {
    id: 'carhartt_b02',
    name: 'Carhartt WIP Cargo Pant Ecru',
    brand: 'Carhartt WIP',
    price: 115.00,
    category: 'bottom',
    type: 'pants',
    gender: 'male',
    colors: ['white', 'beige'],
    color: 'ecru',
    materials: ['cotton'],
    tags: ['streetwear', 'workwear', 'casual'],
    styleTags: ['streetwear', 'urban', 'relaxed'],
    description: 'Carhartt WIP cargo pant met ruime zakken, relaxed fit.',
    inStock: true,
  },
  {
    id: 'levis_b01',
    name: "Levi's 568 Loose Fit Jeans Black",
    brand: "Levi's",
    price: 95.00,
    category: 'bottom',
    type: 'jeans',
    gender: 'male',
    colors: ['black'],
    color: 'black',
    materials: ['cotton', 'denim'],
    tags: ['streetwear', 'casual'],
    styleTags: ['streetwear', 'urban', 'relaxed'],
    description: "Levi's 568 loose fit jeans in stone black.",
    inStock: true,
  },

  // ── STREETWEAR OUTERWEAR ───────────────────────────────────────
  {
    id: 'tnf_o01',
    name: 'The North Face Nuptse 1996 Puffer Jacket Black',
    brand: 'The North Face',
    price: 119.99,
    category: 'outerwear',
    type: 'puffer jacket',
    gender: 'male',
    colors: ['black'],
    color: 'black',
    materials: ['nylon', 'down'],
    tags: ['streetwear', 'outdoor'],
    styleTags: ['streetwear', 'urban', 'statement'],
    description: 'TNF iconische Nuptse puffer jas in zwart.',
    inStock: true,
  },
  {
    id: 'carhartt_o01',
    name: 'Carhartt WIP Active Jacket Black',
    brand: 'Carhartt WIP',
    price: 119.00,
    category: 'outerwear',
    type: 'jacket',
    gender: 'male',
    colors: ['black'],
    color: 'black',
    materials: ['cotton', 'canvas'],
    tags: ['streetwear', 'workwear'],
    styleTags: ['streetwear', 'urban', 'relaxed'],
    description: 'Carhartt WIP Active jacket in canvas.',
    inStock: true,
  },
  {
    id: 'nike_o01',
    name: 'Nike Windrunner Jacket Black/White',
    brand: 'Nike',
    price: 109.99,
    category: 'outerwear',
    type: 'jacket',
    gender: 'male',
    colors: ['black', 'white'],
    color: 'black',
    materials: ['nylon', 'polyester'],
    tags: ['streetwear', 'casual'],
    styleTags: ['streetwear', 'urban'],
    description: 'Nike Windrunner — iconisch streetwear silhouet.',
    inStock: true,
  },
  {
    id: 'stussy_o01',
    name: 'Stüssy Coach Jacket Black',
    brand: 'Stüssy',
    price: 119.00,
    category: 'outerwear',
    type: 'jacket',
    gender: 'male',
    colors: ['black'],
    color: 'black',
    materials: ['nylon'],
    tags: ['streetwear'],
    styleTags: ['streetwear', 'urban', 'statement'],
    description: 'Stüssy coach jacket met groot logo op achterkant.',
    inStock: true,
  },

  // ── FOOTWEAR ────────────────────────────────────────────────────
  {
    id: 'nike_f01',
    name: 'Nike Air Force 1 Low White',
    brand: 'Nike',
    price: 119.99,
    category: 'footwear',
    type: 'sneakers',
    gender: 'male',
    colors: ['white'],
    color: 'white',
    materials: ['leather'],
    tags: ['streetwear', 'casual', 'sneakers'],
    styleTags: ['streetwear', 'urban'],
    description: 'Nike Air Force 1 Low in klassiek wit.',
    inStock: true,
  },
  {
    id: 'nike_f02',
    name: 'Nike Dunk Low Retro Black/White',
    brand: 'Nike',
    price: 119.99,
    category: 'footwear',
    type: 'sneakers',
    gender: 'male',
    colors: ['black', 'white'],
    color: 'black',
    materials: ['leather'],
    tags: ['streetwear', 'sneakers'],
    styleTags: ['streetwear', 'urban', 'statement'],
    description: 'Nike Dunk Low panda colorway.',
    inStock: true,
  },
  {
    id: 'newbalance_f01',
    name: 'New Balance 530 Silver/White',
    brand: 'New Balance',
    price: 109.99,
    category: 'footwear',
    type: 'sneakers',
    gender: 'male',
    colors: ['white', 'silver'],
    color: 'white',
    materials: ['mesh', 'leather'],
    tags: ['streetwear', 'sneakers'],
    styleTags: ['streetwear', 'urban'],
    description: 'New Balance 530 retro runner.',
    inStock: true,
  },
  {
    id: 'vans_f01',
    name: 'Vans Old Skool Black/White',
    brand: 'Vans',
    price: 79.99,
    category: 'footwear',
    type: 'sneakers',
    gender: 'male',
    colors: ['black', 'white'],
    color: 'black',
    materials: ['canvas', 'suede'],
    tags: ['streetwear', 'skate', 'casual'],
    styleTags: ['streetwear', 'urban'],
    description: 'Vans Old Skool klassieker, zwart/wit.',
    inStock: true,
  },

  // ── ACCESSORIES ─────────────────────────────────────────────────
  {
    id: 'carhartt_a01',
    name: 'Carhartt WIP Acrylic Watch Hat Beanie Black',
    brand: 'Carhartt WIP',
    price: 34.95,
    category: 'accessory',
    type: 'beanie',
    gender: 'unisex',
    colors: ['black'],
    color: 'black',
    materials: ['acryl'],
    tags: ['streetwear', 'accessory', 'beanie'],
    styleTags: ['streetwear', 'urban'],
    description: 'Carhartt WIP iconische beanie in zwart.',
    inStock: true,
  },
  {
    id: 'stussy_a01',
    name: 'Stüssy Basic Logo Bucket Hat Black',
    brand: 'Stüssy',
    price: 55.00,
    category: 'accessory',
    type: 'hat',
    gender: 'unisex',
    colors: ['black'],
    color: 'black',
    materials: ['cotton'],
    tags: ['streetwear', 'accessory'],
    styleTags: ['streetwear', 'urban', 'bold'],
    description: 'Stüssy bucket hat met logo, zwart.',
    inStock: true,
  },
  {
    id: 'tnf_a01',
    name: 'The North Face Crossbody Jester Bag Black',
    brand: 'The North Face',
    price: 49.99,
    category: 'accessory',
    type: 'bag',
    gender: 'unisex',
    colors: ['black'],
    color: 'black',
    materials: ['nylon'],
    tags: ['streetwear', 'accessory', 'bag'],
    styleTags: ['streetwear', 'urban'],
    description: 'TNF Jester crossbody bag in zwart.',
    inStock: true,
  },
  {
    id: 'nike_a01',
    name: 'Nike Heritage Cap Black',
    brand: 'Nike',
    price: 29.99,
    category: 'accessory',
    type: 'cap',
    gender: 'unisex',
    colors: ['black'],
    color: 'black',
    materials: ['cotton'],
    tags: ['streetwear', 'accessory', 'cap'],
    styleTags: ['streetwear', 'urban'],
    description: 'Nike Heritage cap in zwart met wit swoosh.',
    inStock: true,
  },

  // ── DECOYS: off-profile items die NIET moeten verschijnen ──────
  {
    id: 'tommy_decoy01',
    name: 'Tommy Hilfiger Bleecker Stretch Chinos Beige',
    brand: 'Tommy Hilfiger',
    price: 89.95,
    category: 'bottom',
    type: 'chinos',
    gender: 'male',
    colors: ['beige'],
    color: 'beige',
    materials: ['cotton'],
    tags: ['classic', 'preppy', 'smart-casual'],
    styleTags: ['preppy', 'classic', 'smart-casual'],
    description: 'Klassieke chino broek in beige.',
    inStock: true,
  },
  {
    id: 'ralph_decoy01',
    name: 'Ralph Lauren Classic Fit Polo Navy',
    brand: 'Polo Ralph Lauren',
    price: 99.00,
    category: 'top',
    type: 'polo',
    gender: 'male',
    colors: ['navy'],
    color: 'navy',
    materials: ['cotton'],
    tags: ['classic', 'preppy'],
    styleTags: ['preppy', 'classic'],
    description: 'Klassieke Ralph Lauren polo in navy met pony logo.',
    inStock: true,
  },
  {
    id: 'cos_decoy01',
    name: 'COS Tapered Wool Trousers Charcoal',
    brand: 'COS',
    price: 89.00,
    category: 'bottom',
    type: 'trousers',
    gender: 'male',
    colors: ['grey'],
    color: 'charcoal',
    materials: ['wool'],
    tags: ['minimal', 'business', 'formal'],
    styleTags: ['minimal', 'business'],
    description: 'COS wollen pantalon, minimalistisch silhouet.',
    inStock: true,
  },
  {
    id: 'boss_decoy01',
    name: 'BOSS Slim Fit Wool Blazer Black',
    brand: 'BOSS',
    price: 119.00,
    category: 'outerwear',
    type: 'blazer',
    gender: 'male',
    colors: ['black'],
    color: 'black',
    materials: ['wool'],
    tags: ['business', 'formal'],
    styleTags: ['business', 'formal'],
    description: 'BOSS formele slim fit blazer in wol.',
    inStock: true,
  },
  {
    id: 'clarks_decoy01',
    name: 'Clarks Desert Boot Brown Suede',
    brand: 'Clarks',
    price: 119.99,
    category: 'footwear',
    type: 'boots',
    gender: 'male',
    colors: ['brown'],
    color: 'brown',
    materials: ['suede'],
    tags: ['smart-casual', 'classic'],
    styleTags: ['classic', 'smart-casual'],
    description: 'Clarks desert boot in bruin suède.',
    inStock: true,
  },
];

describe('FitFi R7 Engine — Jayden (22, streetwear man)', () => {
  it('generates streetwear-coherent outfits', () => {
    const answers = {
      gender: 'male',
      stylePreferences: ['streetwear'],
      occasions: ['casual', 'party'],
      budget: { min: 30, max: 120 },
      neutrals: ['zwart', 'wit', 'koel'],
      colorProfile: { temperature: 'koel' },
      materials: ['katoen', 'nylon', 'fleece'],
      brandPreferences: ['Nike', 'Carhartt WIP', 'Stüssy', 'The North Face'],
      goals: ['express', 'minimal'],
      fit: 'relaxed',
      prints: 'gemengd',
      sizes: { tops: 'L', bottoms: '32/32', shoes: '43' },
    };

    const result = runEngineV2(answers, CATALOG, { count: 6, debug: true });

    // ─ HEADER ───────────────────────────────────────────────────
    console.log('\n════════════════════════════════════════════════════════');
    console.log('  FitFi R7 Engine — Jayden Test Output');
    console.log('════════════════════════════════════════════════════════\n');

    console.log('── PROFILE ──');
    console.log('primary archetype:    ', result.profile.primaryArchetype);
    console.log('secondary archetype:  ', result.profile.secondaryArchetype);
    console.log('archetypes:           ', result.profile.archetypes);
    console.log('occasions:            ', result.profile.occasions);
    console.log('budget (perItem):     ', result.profile.budget);
    console.log('preferred brands:     ', result.profile.preferredBrands);
    console.log('materials preferred:  ', result.profile.materials.preferred);
    console.log('color.temperature:    ', result.profile.color.temperature);
    console.log('goals:                ', result.profile.goals);
    console.log('fit:                  ', result.profile.fit);
    console.log();

    console.log('── STATS ──');
    console.log(result.stats);
    console.log();

    // ─ OUTFITS ─────────────────────────────────────────────────
    result.outfits.forEach((outfit, i) => {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━ OUTFIT #${i + 1} ━━━━━━━━━━━━━━━━━━━━`);
      console.log(`title:     ${outfit.title}`);
      console.log(`occasion:  ${outfit.occasion}`);
      console.log(`match:     ${outfit.matchPercentage}%`);
      console.log(`completeness: ${outfit.completeness}%`);
      console.log(`explanation: ${outfit.explanation}`);
      console.log(`tags:      ${outfit.tags.slice(0, 6).join(', ')}`);
      console.log(`structure: ${outfit.structure?.join(' + ')}`);
      console.log('  ── items:');
      outfit.products.forEach((p) => {
        const price = typeof p.price === 'number' ? `€${p.price.toFixed(2)}` : '?';
        console.log(
          `    • [${p.category}] ${p.brand} — ${p.name}  (${price})  match=${p.matchScore}`
        );
      });
    });

    // ─ SUMMARY ─────────────────────────────────────────────────
    console.log('\n═══════════ BRAND FREQUENCY ACROSS ALL OUTFITS ═══════════');
    const brandFreq = new Map<string, number>();
    result.outfits.forEach((o) =>
      o.products.forEach((p) => {
        const b = p.brand || 'unknown';
        brandFreq.set(b, (brandFreq.get(b) ?? 0) + 1);
      })
    );
    [...brandFreq.entries()]
      .sort(([, a], [, b]) => b - a)
      .forEach(([brand, n]) => console.log(`  ${brand.padEnd(22)} ${n}`));

    console.log('\n═══════════ CATEGORY DISTRIBUTION ═══════════');
    const catFreq = new Map<string, number>();
    result.outfits.forEach((o) =>
      o.products.forEach((p) => {
        catFreq.set(p.category!, (catFreq.get(p.category!) ?? 0) + 1);
      })
    );
    [...catFreq.entries()].forEach(([c, n]) =>
      console.log(`  ${c.padEnd(12)} ${n}`)
    );

    console.log('\n═══════════ UNIQUE TITLES ═══════════');
    const titles = new Set(result.outfits.map((o) => o.title));
    console.log(`  ${titles.size} unique titles out of ${result.outfits.length} outfits`);

    console.log('\n═══════════ UNIQUE EXPLANATIONS ═══════════');
    const expls = new Set(result.outfits.map((o) => o.explanation));
    console.log(`  ${expls.size} unique explanations out of ${result.outfits.length} outfits`);

    console.log('\n═══════════ PRICES ═══════════');
    const prices = result.outfits.flatMap((o) =>
      o.products.map((p) => (typeof p.price === 'number' ? p.price : 0))
    );
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    console.log(`  min=€${min.toFixed(2)}  max=€${max.toFixed(2)}  avg=€${avg.toFixed(2)}`);

    // basic sanity
    expect(result.outfits.length).toBeGreaterThan(0);
  });
});
