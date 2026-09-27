import { describe, expect, it } from 'vitest';
import { classifyCategory } from '../productFilter';

// Fixronde 1, bevinding 3: classifyCategory riep classifyProductDetailed aan
// zonder brand, terwijl de aanroeper (outfitComposer.ts:370) row.brand al
// klaar had liggen. Dit pad loopt buiten get_kandidaten om (composeOutfits
// -> outfitService.ts -> DataRouter.ts -> useOutfits -> EnhancedResultsPage/
// DashboardPage), dus zonder deze fix bleef het merknaam-defect intact op
// het pad dat een bezoeker daadwerkelijk ziet.
describe('classifyCategory geeft het merk door', () => {
  it('laat een trui van een "Jeans"-merk niet meer als bottom classificeren', () => {
    const row = { name: 'Sweater TOMMY JEANS Men color Navy', brand: 'Tommy Jeans', category: 'bottom' };
    expect(classifyCategory(row)).toBe('top');
  });

  it('laat Moon Boot footwear houden ook zonder ander kledingstukwoord in de naam', () => {
    const row = {
      name: 'Ballet Flat MOON BOOT Woman color Black',
      description: 'Ballet Flat MOON BOOT Woman color Black',
      brand: 'Moon Boot',
      category: 'footwear',
    };
    expect(classifyCategory(row)).toBe('footwear');
  });

  it('werkt nog steeds zonder brand-veld op de rij (bestaand gedrag voor rijen zonder merk)', () => {
    const row = { name: 'Nike Sportswear Club T-Shirt' };
    expect(classifyCategory(row)).toBe('top');
  });
});
